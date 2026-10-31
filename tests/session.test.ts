import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { sessionStorage, publicUser } from "../app/lib/session.server";
import { apiBase, backend, APIError } from "../app/lib/api.server";
import { portal } from "../app/config";

test("sessions fail closed without a signing secret; safe user data excludes tokens", async () => {
  const saved = process.env.SESSION_SECRET;
  delete process.env.SESSION_SECRET;
  assert.equal(sessionStorage(), null);
  process.env.SESSION_SECRET = "test-session-secret-at-least-32-characters";
  const storage = sessionStorage()!;
  const session = await storage.getSession();
  session.set("accessToken", "private-access-token");
  const cookie = await storage.commitSession(session);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/i);
  const read = await storage.getSession(cookie);
  assert.equal(read.get("accessToken"), "private-access-token");
  const tampered = await storage.getSession(
    cookie.replace(/=([^;])/, (_, char) => "=" + (char === "a" ? "b" : "a")),
  );
  assert.equal(tampered.get("accessToken"), undefined);
  const user = publicUser({
    id: "u",
    name: "A",
    role: "customer",
    country_code: "BD",
    access_token: "secret",
  } as never);
  assert.equal("access_token" in user!, false);
  if (saved === undefined) delete process.env.SESSION_SECRET;
  else process.env.SESSION_SECRET = saved;
});
test("trusted API configuration rejects credentials and remote plain HTTP", () => {
  const saved = process.env.API_BASE_URL;
  for (const u of [
    "http://api.example.invalid/api/v1",
    "https://user:pass@api.example.invalid/api/v1",
    "javascript:alert(1)",
  ]) {
    process.env.API_BASE_URL = u;
    assert.equal(apiBase(), null);
  }
  process.env.API_BASE_URL = "https://api.example.invalid/api/v1";
  assert.ok(apiBase());
  if (saved === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = saved;
});
test("BFF session refresh retries once and never exposes tokens in returned data", async () => {
  const savedBase = process.env.API_BASE_URL,
    savedSecret = process.env.SESSION_SECRET;
  process.env.SESSION_SECRET = "test-session-secret-at-least-32-characters";
  let refreshCalls = 0;
  let resourceCalls = 0;
  const server = createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    if (req.url === "/api/v1/auth/refresh") {
      refreshCalls++;
      res.end(
        JSON.stringify({
          success: true,
          data: { access_token: "fresh", refresh_token: "replacement" },
        }),
      );
      return;
    }
    resourceCalls++;
    if (req.headers.authorization !== "Bearer fresh") {
      res.writeHead(401);
      res.end(JSON.stringify({ error: "Expired" }));
      return;
    }
    res.end(JSON.stringify({ success: true, data: { name: "Test user" } }));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Missing test server");
  process.env.API_BASE_URL = `http://127.0.0.1:${address.port}/api/v1`;
  try {
    const session = await sessionStorage()!.getSession();
    session.set("user", {
      id: "u",
      name: "Test",
      role: portal.roles[0],
      country_code: "BD",
    });
    session.set("accessToken", "expired");
    session.set("refreshToken", "old-refresh");
    const result = await backend(session, "/users/me");
    assert.deepEqual(result, { name: "Test user" });
    assert.equal(refreshCalls, 1);
    assert.equal(resourceCalls, 2);
    assert.equal(session.get("accessToken"), "fresh");
    await assert.rejects(() => backend(session, "/admin/users"), APIError);
    assert.equal(resourceCalls, 2);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    if (savedBase === undefined) delete process.env.API_BASE_URL;
    else process.env.API_BASE_URL = savedBase;
    if (savedSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = savedSecret;
  }
});
