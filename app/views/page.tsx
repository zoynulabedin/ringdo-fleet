import { portal } from "../config";
import type { PageData } from "../lib/types";
import { CustomerExplore, CustomerActivity } from "./customer";
import {
  OperationsOverview,
  CatalogView,
  OrdersView,
  ProfessionalJobs,
  DriverOverview,
  RecordWorkspace,
  EarningsView,
  SubscriptionView,
} from "./operations";
import { SupportInbox, TeamOverview } from "./support";
import {
  SettingsView,
  StorefrontView,
  ScheduleView,
  VerificationView,
  WalletView,
  InformationalView,
} from "./settings";
export function PortalPage({ data }: { data: PageData }) {
  const s = data.section;
  if (s === "home")
    return portal.id === "customer" ? (
      <CustomerExplore data={data} />
    ) : portal.id === "team" ? (
      <TeamOverview data={data} />
    ) : portal.id === "driver" ? (
      <DriverOverview data={data} />
    ) : (
      <OperationsOverview data={data} />
    );
  if (s === "settings") return <SettingsView data={data} />;
  if (["messages", "support", "inbox", "cases"].includes(s))
    return <SupportInbox data={data} />;
  if (s === "activity" && portal.id === "customer")
    return <CustomerActivity data={data} />;
  if (["products", "services"].includes(s)) return <CatalogView data={data} />;
  if (s === "orders") return <OrdersView data={data} />;
  if (s === "jobs") return <ProfessionalJobs data={data} />;
  if (s === "schedule") return <ScheduleView data={data} />;
  if (s === "earnings") return <EarningsView data={data} />;
  if (s === "subscription") return <SubscriptionView data={data} />;
  if (s === "storefront") return <StorefrontView data={data} />;
  if (s === "verification") return <VerificationView data={data} />;
  if (s === "wallet") return <WalletView data={data} />;
  if (
    [
      "dispatch",
      "vehicles",
      "drivers",
      "maintenance",
      "requests",
      "approvals",
      "people",
      "budgets",
      "invoices",
      "trips",
      "vehicle",
      "customers",
    ].includes(s)
  )
    return <RecordWorkspace data={data} />;
  return <InformationalView data={data} />;
}
