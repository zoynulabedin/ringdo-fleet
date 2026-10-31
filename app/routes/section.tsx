import type { Route } from "./+types/section";
import { portal } from "../config";
import { pageLoader } from "../lib/loaders.server";
import { PortalPage } from "../views/page";
export const meta = () => [
  { title: portal.name + " · Workspace" },
  { name: "robots", content: "noindex" },
];
export const loader = ({ request, params }: Route.LoaderArgs) =>
  pageLoader(request, params.section);
export const headers = () => ({ "Cache-Control": "private, no-store" });
export default function Section({ loaderData }: Route.ComponentProps) {
  return <PortalPage data={loaderData} />;
}
