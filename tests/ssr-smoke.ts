import assert from "node:assert/strict";
import {createRequestHandler} from "react-router";
import {portal} from "../app/config";

// Exercise the built production handler, including every sidebar destination.
// No live API credentials or external network are used.
const buildPath = new URL("../build/server/index.js",import.meta.url).href;
const build = await import(buildPath);
const handle = createRequestHandler(build,"production");
const paths = ["/","/login",...portal.nav.map(item=>item.id==="home"?"/?preview=1":`/workspace/${item.id}?preview=1`)];
for (const path of paths) {
  const response = await handle(new Request(`https://portal.example.invalid${path}`));
  assert.equal(response.status,200,`${portal.id} ${path} should render`);
  const html = await response.text();
  assert.equal(html.includes("Oops!"),false,`${portal.id} ${path} must not hit the error boundary`);
  assert.match(response.headers.get("Cache-Control")??"",/no-store/,`${path} must not cache a signed-in workspace`);
  if (path.includes("preview=1")) assert.ok(html.includes("INTERACTIVE PREVIEW"),`${path} should clearly label sample data`);
}
const anonymous = await handle(new Request("https://portal.example.invalid/api/backend/users/me"));
assert.equal(anonymous.status,401);
console.log(`${portal.name}: ${paths.length} production routes rendered; anonymous API access denied.`);
