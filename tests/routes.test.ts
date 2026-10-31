import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { workspaceLoader, pageLoader } from "../app/lib/loaders.server";
import {
  loader as proxyRead,
  action as proxyWrite,
} from "../app/routes/backend";
import { sessionStorage } from "../app/lib/session.server";
import { portal } from "../app/config";

test("independent route guards, preview isolation and profile writes use server sessions", async () => {
  const oldSecret = process.env.SESSION_SECRET,
    oldBase = process.env.API_BASE_URL;
  let calls = 0;
  const server = createServer((req, res) => {
    calls++;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({ success: true, data: { name: "Updated member" } }),
    );
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Test listener unavailable");
  process.env.API_BASE_URL = `http://127.0.0.1:${address.port}/api/v1`;
  process.env.SESSION_SECRET = "test-session-secret-for-route-guards-32-plus";
  const origin = "https://portal.example.invalid";
  const storage = sessionStorage()!;
  const session = await storage.getSession();
  session.set("user", {
    id: "test-member",
    name: "Test member",
    country_code: "BD",
    role: portal.roles[0],
  });
  session.set("accessToken", "private-token");
  session.set("refreshToken", "private-refresh");
  const cookie = await storage.commitSession(session);
  const request = (
    path: string,
    method = "GET",
    authenticated = false,
    source = origin,
  ) =>
    new Request(origin + path, {
      method,
      headers: {
        ...(authenticated ? { Cookie: cookie } : {}),
        ...(method !== "GET"
          ? { Origin: source, "Content-Type": "application/json" }
          : {}),
      },
      ...(method !== "GET"
        ? { body: JSON.stringify({ name: "Updated member" }) }
        : {}),
    });
  try {
    const anonymous = await pageLoader(request("/"));
    assert.equal(anonymous.data.connected, false);
    assert.deepEqual(anonymous.data.entries, []);
    const preview = await pageLoader(request("/?preview=1", "GET", true));
    assert.equal(preview.data.preview, true);
    assert.equal(calls, 0);
    const workspace = await workspaceLoader(request("/", "GET", true));
    const publicData = JSON.stringify(workspace.data);
    assert.equal(publicData.includes("private-token"), false);
    assert.equal(publicData.includes("private-refresh"), false);
    await assert.rejects(
      () => pageLoader(request("/workspace/no-such-page"), "no-such-page"),
      (error: unknown) => error instanceof Response && error.status === 404,
    );
    const denied = await proxyWrite({
      request: request(
        "/api/backend/users/me",
        "PUT",
        true,
        "https://other.example.invalid",
      ),
      params: { "*": "users/me" },
    } as never);
    assert.equal(denied.init?.status, 403);
    assert.equal(calls, 0);
    const unsigned = await proxyRead({
      request: request("/api/backend/users/me"),
      params: { "*": "users/me" },
    } as never);
    assert.equal(unsigned.init?.status, 401);
    assert.equal(calls, 0);
    const outside = await proxyRead({
      request: request("/api/backend/admin/users", "GET", true),
      params: { "*": "admin/users" },
    } as never);
    assert.equal(outside.init?.status, 403);
    assert.equal(calls, 0);
    const saved = await proxyWrite({
      request: request("/api/backend/users/me", "PUT", true),
      params: { "*": "users/me" },
    } as never);
    assert.ok("success" in saved.data && saved.data.success);
    assert.equal(calls, 1);
    const refreshed = await storage.getSession(
      new Headers(saved.init?.headers).get("Set-Cookie"),
    );
    assert.equal(refreshed.get("user")?.name, "Updated member");
    assert.equal(refreshed.get("user")?.role, portal.roles[0]);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    if (oldSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = oldSecret;
    if (oldBase === undefined) delete process.env.API_BASE_URL;
    else process.env.API_BASE_URL = oldBase;
  }
});
