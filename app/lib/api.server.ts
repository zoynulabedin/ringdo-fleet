import { createHash } from "node:crypto";
import { portal } from "../config";
import { allowedEndpoint } from "./policy";
import { unwrap } from "./domain";
import type { PortalSession } from "./session.server";

export class APIError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
export function apiBase(): URL | null {
  const value = process.env.API_BASE_URL;
  if (!value) return null;
  try {
    const u = new URL(value);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname);
    if (
      u.username ||
      u.password ||
      u.search ||
      u.hash ||
      (u.protocol !== "https:" && !(local && u.protocol === "http:"))
    )
      return null;
    u.pathname = u.pathname.replace(/\/$/, "");
    return u;
  } catch {
    return null;
  }
}
export async function rawBackend(
  path: string,
  method = "GET",
  body?: unknown,
  token?: string,
  extra: Record<string, string> = {},
) {
  const base = apiBase();
  if (!base)
    throw new APIError(503, "Your workspace connection is being prepared.");
  const response = await fetch(base.toString().replace(/\/$/, "") + path, {
    method,
    redirect: "error",
    signal: AbortSignal.timeout(12000),
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  }).catch(() => {
    throw new APIError(
      503,
      "Ringdo is temporarily unavailable. Please try again.",
    );
  });
  const text = await response.text();
  if (text.length > 2_000_000)
    throw new APIError(502, "The response could not be loaded.");
  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new APIError(502, "Ringdo returned an unexpected response.");
  }
  if (!response.ok) {
    const p = payload as Record<string, unknown>;
    const m =
      typeof p.error === "string"
        ? p.error
        : typeof p.message === "string"
          ? p.message
          : "This action could not be completed.";
    throw new APIError(
      response.status,
      response.status >= 500
        ? "Ringdo could not complete this request. Please try again."
        : m.slice(0, 400),
    );
  }
  return unwrap<Record<string, unknown>>(payload);
}
const refreshes = new Map<string, Promise<Record<string, unknown>>>();
async function refresh(token: string) {
  const key = createHash("sha256").update(token).digest("hex");
  let promise = refreshes.get(key);
  if (!promise) {
    promise = rawBackend("/auth/refresh", "POST", { refresh_token: token });
    refreshes.set(key, promise);
    void promise
      .finally(() => setTimeout(() => refreshes.delete(key), 2000))
      .catch(() => {});
  }
  return promise;
}
export async function backend(
  session: PortalSession,
  path: string,
  method = "GET",
  body?: unknown,
  extra: Record<string, string> = {},
) {
  const pathname = path.split("?")[0];
  const user = session.get("user");
  if (
    !user ||
    !portal.roles.includes(user.role) ||
    !allowedEndpoint(
      portal.id,
      method,
      pathname,
      user.country_code,
      user.role === "super_admin",
    )
  )
    throw new APIError(403, "This action is not available in your workspace.");
  let token = session.get("accessToken");
  if (!token) throw new APIError(401, "Please sign in to continue.");
  try {
    return await rawBackend(path, method, body, token, extra);
  } catch (e) {
    const refreshToken = session.get("refreshToken");
    if (!(e instanceof APIError) || e.status !== 401 || !refreshToken) throw e;
    const result = await refresh(refreshToken);
    if (typeof result.access_token !== "string")
      throw new APIError(401, "Please sign in again.");
    token = result.access_token;
    session.set("accessToken", token);
    if (typeof result.refresh_token === "string")
      session.set("refreshToken", result.refresh_token);
    return rawBackend(path, method, body, token, extra);
  }
}
