import type { Route } from "./+types/backend";
import { data } from "react-router";
import { backend, APIError } from "../lib/api.server";
import { readSession } from "../lib/session.server";
import { safeOrigin } from "../lib/policy";

async function proxy(request: Request, splat: string | undefined) {
  const method = request.method;
  if (method !== "GET" && !safeOrigin(request))
    return data({ error: "Request origin denied." }, { status: 403 });
  const { storage, session } = await readSession(request);
  if (!storage || !session?.get("user"))
    return data({ error: "Please sign in to continue." }, { status: 401 });
  if (Number(request.headers.get("Content-Length") ?? 0) > 32_768)
    return data({ error: "Request too large." }, { status: 413 });
  let body: unknown;
  if (method !== "GET") {
    const raw = await request.text();
    if (raw.length > 32_768)
      return data({ error: "Request too large." }, { status: 413 });
    try {
      body = raw ? JSON.parse(raw) : undefined;
    } catch {
      return data({ error: "Invalid request." }, { status: 400 });
    }
  }
  const extras: Record<string, string> = {};
  for (const name of [
    "Idempotency-Key",
    "If-Match",
    "X-Access-Purpose",
    "X-TOTP-Code",
  ]) {
    const value = request.headers.get(name);
    if (value) extras[name] = value;
  }
  const url = new URL(request.url);
  const query = new URLSearchParams();
  for (const [key, value] of url.searchParams)
    if (
      [
        "country",
        "lang",
        "group",
        "lat",
        "lng",
        "radius",
        "category_id",
        "page",
        "limit",
        "status",
        "q",
      ].includes(key)
    )
      query.append(key, value);
  try {
    const result = await backend(
      session,
      "/" + (splat ?? "") + (query.size ? "?" + query.toString() : ""),
      method,
      body,
      extras,
    );
    if (method === "PUT" && splat === "users/me") {
      const user = session.get("user");
      if (user)
        session.set("user", {
          ...user,
          ...(typeof result.name === "string" ? { name: result.name } : {}),
          ...(result.language === "bn" || result.language === "en"
            ? { language: result.language }
            : {}),
        });
    }
    return data(
      { success: true, data: result },
      {
        headers: {
          "Cache-Control": "private, no-store",
          "Set-Cookie": await storage.commitSession(session),
        },
      },
    );
  } catch (e) {
    return data(
      {
        error:
          e instanceof APIError ? e.message : "Could not complete the request.",
      },
      {
        status: e instanceof APIError ? e.status : 503,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }
}
export const loader = ({ request, params }: Route.LoaderArgs) =>
  proxy(request, params["*"]);
export const action = ({ request, params }: Route.ActionArgs) =>
  proxy(request, params["*"]);
