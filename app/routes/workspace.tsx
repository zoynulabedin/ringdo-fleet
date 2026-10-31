import type { Route } from "./+types/workspace";
import { workspaceLoader } from "../lib/loaders.server";
import { WorkspaceShell } from "../components/shell";
export const loader = ({ request }: Route.LoaderArgs) =>
  workspaceLoader(request);
export const headers = () => ({ "Cache-Control": "private, no-store" });
export default function Workspace({ loaderData }: Route.ComponentProps) {
  return <WorkspaceShell data={loaderData} />;
}
