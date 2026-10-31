import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/workspace.tsx", [
    index("routes/home.tsx"),
    route("workspace/:section", "routes/section.tsx"),
  ]),
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.ts"),
  route("api/backend/*", "routes/backend.ts"),
] satisfies RouteConfig;
