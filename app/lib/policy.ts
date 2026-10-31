import type { PortalId } from "../portal";

const uuid = "[a-fA-F0-9-]{36}";
const commonReads = [
  /^\/users\/me$/,
  /^\/users\/me\/notifications$/,
  /^\/support\/tickets$/,
  new RegExp(`^/support/tickets/${uuid}(/messages)?$`),
  /^\/support\/knowledge$/,
];
export function allowedEndpoint(
  portal: PortalId,
  method: string,
  path: string,
  country = "",
  superAdmin = false,
): boolean {
  if (
    !path.startsWith("/") ||
    /[.%\\?#\u0000-\u0020]/.test(path) ||
    path.includes("//")
  )
    return false;
  if (method === "GET" && commonReads.some((x) => x.test(path))) return true;
  if (method === "PUT" && path === "/users/me") return true;
  if (
    method === "POST" &&
    (path === "/support/tickets" ||
      new RegExp(`^/support/tickets/${uuid}/messages$`).test(path))
  )
    return true;
  if (portal === "customer") {
    if (
      method === "GET" &&
      [
        /^\/services\/(groups|categories|coverage)$/,
        /^\/search\/providers$/,
        /^\/bookings$/,
        new RegExp(`^/bookings/${uuid}$`),
        new RegExp(`^/providers/${uuid}(/packages|/reviews)?$`),
        /^\/users\/me\/wallet(\/transactions)?$/,
        new RegExp(`^/chat/${uuid}/messages$`),
      ].some((x) => x.test(path))
    )
      return true;
    if (method === "POST" && path === "/bookings") return true;
  }
  if (portal === "professional") {
    if (
      method === "GET" &&
      [
        /^\/provider\/(profile|earnings|stats|reviews|capabilities)$/,
        /^\/bookings$/,
        new RegExp(`^/bookings/${uuid}$`),
      ].some((x) => x.test(path))
    )
      return true;
    if (
      method === "PUT" &&
      (path === "/provider/availability" ||
        new RegExp(`^/bookings/${uuid}/(accept|reject|en-route|arrive)$`).test(
          path,
        ))
    )
      return true;
  }
  if (
    portal === "driver" &&
    method === "GET" &&
    [/^\/provider\/vehicles$/, /^\/transport\/readiness$/].some((x) =>
      x.test(path),
    )
  )
    return true;
  if (portal === "team") {
    if (
      method === "GET" &&
      [
        /^\/admin\/support\/(tickets|metrics|agents|knowledge)$/,
        new RegExp(`^/admin/support/tickets/${uuid}(/messages)?$`),
      ].some((x) => x.test(path))
    )
      return true;
    if (
      method === "POST" &&
      new RegExp(
        `^/admin/support/tickets/${uuid}/(messages|escalate|ai-draft)$`,
      ).test(path)
    )
      return true;
    if (
      method === "PATCH" &&
      new RegExp(`^/admin/support/tickets/${uuid}$`).test(path)
    )
      return true;
    const match = path.match(
      /^\/admin\/countries\/([A-Z]{2})\/(vehicle-applications|capability-applications)$/,
    );
    if (method === "GET" && match && (superAdmin || match[1] === country))
      return true;
  }
  return false;
}
export function safeOrigin(request: Request): boolean {
  return request.headers.get("Origin") === new URL(request.url).origin;
}
export function previewEnabled(request: Request, enabled = true): boolean {
  return enabled && new URL(request.url).searchParams.get("preview") === "1";
}
