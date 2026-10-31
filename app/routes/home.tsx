import type { Route } from "./+types/home";
import { portal } from "../config";
import { pageLoader } from "../lib/loaders.server";
import { PortalPage } from "../views/page";
export const meta = () => [
  { title: `${portal.name} · ${portal.descriptor.en}` },
  { name: "description", content: portal.subtitle.en },
  { name: "robots", content: "noindex" },
];
export const loader = ({ request }: Route.LoaderArgs) => pageLoader(request);
export const headers = () => ({ "Cache-Control": "private, no-store" });
export default function Home({ loaderData }: Route.ComponentProps) {
  return <PortalPage data={loaderData} />;
}
