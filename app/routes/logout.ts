import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { readSession } from "../lib/session.server";
import { rawBackend } from "../lib/api.server";
import { safeOrigin } from "../lib/policy";
export async function action({ request }: Route.ActionArgs) {
  if (!safeOrigin(request))
    throw new Response("Request origin denied", { status: 403 });
  const { storage, session } = await readSession(request);
  const token = session?.get("refreshToken");
  if (token)
    try {
      await rawBackend("/auth/logout", "POST", { refresh_token: token });
    } catch {
      /* local session must still end */
    }
  return redirect("/login", {
    status: 303,
    headers: {
      ...(storage && session
        ? { "Set-Cookie": await storage.destroySession(session) }
        : {}),
      "Cache-Control": "no-store",
    },
  });
}
export function loader() {
  return redirect("/login");
}
