import { data } from "react-router";
import { portal } from "../config";
import { apiBase, backend, APIError } from "./api.server";
import { readSession, publicUser } from "./session.server";
import { previewEnabled } from "./policy";
import { validPoint, radar, asRecords } from "./domain";

export async function workspaceLoader(request: Request) {
  const { session } = await readSession(request);
  const user = publicUser(session?.get("user"));
  return data(
    {
      user: user && portal.roles.includes(user.role) ? user : null,
      configured: !!apiBase(),
      preview: previewEnabled(
        request,
        process.env.PORTAL_ENABLE_PREVIEW !== "false",
      ),
      mapStyle: process.env.PUBLIC_MAP_STYLE_URL ?? "",
      portalId: portal.id,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
export async function pageLoader(request: Request, section = "home") {
  if (section !== "home" && !portal.nav.some((n) => n.id === section))
    throw new Response("Page not found", { status: 404 });
  const url = new URL(request.url);
  const preview = previewEnabled(
    request,
    process.env.PORTAL_ENABLE_PREVIEW !== "false",
  );
  const filters = {
    query: url.searchParams.get("q") ?? "",
    category: url.searchParams.get("category") ?? "all",
    radius: radar(url.searchParams.get("radius")),
    point: validPoint(url.searchParams.get("lat"), url.searchParams.get("lng")),
  };
  const { storage, session } = await readSession(request);
  const user = session?.get("user");
  let entries: Record<string, unknown>[] = [];
  let detail: Record<string, unknown> = {};
  let error = "";
  let connected = false;
  let pending = false;
  if (!preview && apiBase() && user && session) {
    if (!portal.roles.includes(user.role))
      throw new Response("Workspace access denied", { status: 403 });
    let path: string | undefined;
    switch (portal.id) {
      case "customer":
        path =
          section === "home" && filters.point
            ? `/search/providers?lat=${filters.point.lat}&lng=${filters.point.lng}&radius=${filters.radius / 1000}&country=${encodeURIComponent(user.country_code)}`
            : section === "activity"
              ? "/bookings"
              : section === "wallet"
                ? "/users/me/wallet"
                : ["support", "messages"].includes(section)
                  ? "/support/tickets"
                  : undefined;
        break;
      case "professional":
        path = ["home", "jobs", "schedule"].includes(section)
          ? "/bookings"
          : section === "earnings"
            ? "/provider/earnings"
            : section === "verification"
              ? "/provider/capabilities"
              : section === "settings"
                ? "/provider/profile"
                : section === "messages"
                  ? "/support/tickets"
                  : undefined;
        break;
      case "driver":
        path =
          section === "vehicle"
            ? "/provider/vehicles"
            : section === "home"
              ? `/transport/readiness?country=${encodeURIComponent(user.country_code)}`
              : undefined;
        break;
      case "team":
        path = ["home", "inbox", "cases"].includes(section)
          ? "/admin/support/tickets"
          : section === "knowledge"
            ? "/admin/support/knowledge"
            : section === "verification"
              ? `/admin/countries/${encodeURIComponent(user.country_code)}/capability-applications`
              : undefined;
        break;
    }
    pending = !path && portal.id !== "customer" && portal.id !== "professional";
    if (path)
      try {
        detail = await backend(session, path);
        entries = asRecords(detail);
        if (portal.id === "professional" && section === "home") {
          detail = {
            ...detail,
            provider_profile: await backend(session, "/provider/profile"),
          };
        }
        connected = true;
      } catch (e) {
        error =
          e instanceof APIError
            ? e.message
            : "Could not load your workspace. Please try again.";
      }
  }
  if (!preview && ["merchant", "fleet", "business"].includes(portal.id))
    pending = true;
  const headers = new Headers({ "Cache-Control": "private, no-store" });
  if (storage && session && user)
    headers.set("Set-Cookie", await storage.commitSession(session));
  return data(
    { section, preview, filters, entries, detail, error, connected, pending },
    { headers },
  );
}
