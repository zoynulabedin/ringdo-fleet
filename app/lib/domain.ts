export const RADAR_METRES = [500, 1000, 2000, 5000] as const;
export type RadarMetres = (typeof RADAR_METRES)[number];
export function radar(value: unknown): RadarMetres {
  const n = Number(value);
  return RADAR_METRES.includes(n as RadarMetres) ? (n as RadarMetres) : 1000;
}
export function isInRadar(distance: number, range: number): boolean {
  return (
    Number.isFinite(distance) &&
    distance >= 0 &&
    Number.isFinite(range) &&
    distance <= range
  );
}
export function eligibleSeller(
  distance: number,
  range: number,
  addressCovered: boolean,
  available: boolean,
): boolean {
  return isInRadar(distance, range) && addressCovered && available;
}
export function safeReturnPath(input: unknown): string {
  if (
    typeof input !== "string" ||
    !input.startsWith("/") ||
    input.startsWith("//") ||
    /[\\\r\n]/.test(input)
  )
    return "/";
  try {
    const url = new URL(input, "https://ringdo.invalid");
    return url.origin === "https://ringdo.invalid"
      ? url.pathname + url.search
      : "/";
  } catch {
    return "/";
  }
}
export function validPoint(
  lat: unknown,
  lng: unknown,
): { lat: number; lng: number } | null {
  if (lat === null || lng === null || lat === "" || lng === "") return null;
  const a = Number(lat),
    b = Number(lng);
  return Number.isFinite(a) &&
    Number.isFinite(b) &&
    Math.abs(a) <= 90 &&
    Math.abs(b) <= 180
    ? { lat: a, lng: b }
    : null;
}
export function money(
  minor: number,
  currency = "BDT",
  locale = "en-BD",
): string {
  const decimals =
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).resolvedOptions().maximumFractionDigits ?? 2;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: decimals,
  }).format(minor / 10 ** decimals);
}
export function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0])
      .join("")
      .toUpperCase() || "R"
  );
}
export const orderTransitions: Record<string, string[]> = {
  new: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready: ["delivering", "collected"],
  delivering: ["delivered"],
  delivered: [],
  collected: [],
  cancelled: [],
};
export function canTransition(from: string, to: string): boolean {
  return orderTransitions[from]?.includes(to) ?? false;
}
export function directPaymentLabel(
  buyerReported: boolean,
  merchantConfirmed: boolean,
): string {
  return merchantConfirmed
    ? "merchant_confirmed"
    : buyerReported
      ? "buyer_reported"
      : "unpaid";
}
export function unwrap<T = unknown>(body: unknown): T {
  if (body && typeof body === "object" && "success" in body && "data" in body)
    return (body as { data: T }).data;
  return body as T;
}
export function asRecords(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value))
    return value.filter((x) => x && typeof x === "object") as Record<
      string,
      unknown
    >[];
  if (value && typeof value === "object")
    for (const k of [
      "providers",
      "bookings",
      "tickets",
      "vehicles",
      "messages",
      "items",
      "data",
    ]) {
      const nested = (value as Record<string, unknown>)[k];
      if (Array.isArray(nested)) return asRecords(nested);
    }
  return [];
}
