import test from "node:test";
import assert from "node:assert/strict";
import {
  radar,
  eligibleSeller,
  isInRadar,
  safeReturnPath,
  validPoint,
  canTransition,
  directPaymentLabel,
  money,
  unwrap,
} from "../app/lib/domain";
import { allowedEndpoint, safeOrigin, previewEnabled } from "../app/lib/policy";
import { portals } from "../app/portal";

test("strict buyer radar cannot be overridden by seller willingness", () => {
  assert.equal(eligibleSeller(4000, 1000, true, true), false);
  assert.equal(eligibleSeller(1000, 1000, true, true), true);
  assert.equal(eligibleSeller(450, 500, true, true), true);
  assert.equal(eligibleSeller(700, 500, true, true), false);
  assert.equal(eligibleSeller(450, 1000, false, true), false);
  assert.equal(eligibleSeller(450, 1000, true, false), false);
  assert.equal(isInRadar(NaN, 1000), false);
  assert.equal(isInRadar(-1, 1000), false);
  assert.equal(radar("500"), 500);
  assert.equal(radar("10000"), 1000);
});
test("no missing coordinate or default location becomes a discovery point", () => {
  assert.equal(validPoint(null, null), null);
  assert.equal(validPoint("", ""), null);
  assert.deepEqual(validPoint("0", "0"), { lat: 0, lng: 0 });
  assert.equal(validPoint("91", "0"), null);
  assert.equal(validPoint("23", "Infinity"), null);
});
test("merchant acknowledgement never pretends to verify a gateway payment", () => {
  assert.equal(directPaymentLabel(true, false), "buyer_reported");
  assert.equal(directPaymentLabel(true, true), "merchant_confirmed");
  assert.equal(directPaymentLabel(false, false), "unpaid");
  assert.equal(canTransition("new", "accepted"), true);
  assert.equal(canTransition("new", "delivered"), false);
  assert.equal(canTransition("delivered", "preparing"), false);
});
test("navigation has no external login redirect", () => {
  for (const path of [
    "https://evil.invalid",
    "//evil.invalid",
    "/\\evil.invalid",
    "/\nevil.invalid",
    null,
  ])
    assert.equal(safeReturnPath(path), "/");
  assert.equal(
    safeReturnPath("/workspace/jobs?status=pending"),
    "/workspace/jobs?status=pending",
  );
});
test("BFF rejects cross-role routes, traversal, merchant wallets and administration", () => {
  const id = "11111111-1111-4111-8111-111111111111";
  assert.equal(allowedEndpoint("customer", "GET", "/users/me/wallet"), true);
  assert.equal(allowedEndpoint("merchant", "GET", "/users/me/wallet"), false);
  assert.equal(allowedEndpoint("merchant", "POST", "/wallet/withdraw"), false);
  assert.equal(
    allowedEndpoint("professional", "PUT", `/bookings/${id}/accept`),
    true,
  );
  assert.equal(
    allowedEndpoint("customer", "PUT", `/bookings/${id}/accept`),
    false,
  );
  assert.equal(allowedEndpoint("team", "GET", "/admin/users"), false);
  assert.equal(allowedEndpoint("customer", "GET", "/users/../admin"), false);
  assert.equal(
    allowedEndpoint("customer", "GET", "/users/%2e%2e/admin"),
    false,
  );
  assert.equal(
    allowedEndpoint(
      "team",
      "GET",
      "/admin/countries/IN/capability-applications",
      "BD",
    ),
    false,
  );
  assert.equal(
    allowedEndpoint(
      "team",
      "GET",
      "/admin/countries/BD/capability-applications",
      "BD",
    ),
    true,
  );
});
test("unsafe requests require the same origin and previews are explicit", () => {
  assert.equal(
    safeOrigin(
      new Request("https://ringdo.invalid/action", {
        headers: { Origin: "https://attacker.invalid" },
      }),
    ),
    false,
  );
  assert.equal(
    safeOrigin(
      new Request("https://ringdo.invalid/action", {
        headers: { Origin: "https://ringdo.invalid" },
      }),
    ),
    true,
  );
  assert.equal(previewEnabled(new Request("https://ringdo.invalid/")), false);
  assert.equal(
    previewEnabled(new Request("https://ringdo.invalid/?preview=1")),
    true,
  );
  assert.equal(
    previewEnabled(new Request("https://ringdo.invalid/?preview=1"), false),
    false,
  );
});
test("currency formatting respects minor units and envelope shapes", () => {
  assert.match(money(12345, "BDT"), /123/);
  assert.match(money(123, "JPY"), /123/);
  assert.deepEqual(unwrap({ success: true, data: { id: 1 } }), { id: 1 });
  assert.deepEqual(unwrap({ tickets: [] }), { tickets: [] });
});
test("seven workspaces have distinct, valid navigation and scoped roles", () => {
  assert.equal(Object.keys(portals).length, 7);
  for (const p of Object.values(portals)) {
    assert.equal(p.nav[0].id, "home");
    assert.equal(new Set(p.nav.map((n) => n.id)).size, p.nav.length);
    assert.ok(p.roles.length > 0);
  }
  assert.equal(
    portals.customer.nav.some((n) => n.id === "products"),
    false,
  );
  assert.equal(
    portals.merchant.nav.some((n) => n.id === "wallet"),
    false,
  );
  assert.ok(portals.team.nav.some((n) => n.id === "inbox"));
});
