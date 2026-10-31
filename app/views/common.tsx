import { useState } from "react";
import { Link } from "react-router";
import { portal } from "../config";
import { useWorkspace } from "../components/shell";
import { Icon } from "../components/icon";
import { Badge, Empty, MiniChart, Modal } from "../components/ui";
import type { PageData } from "../lib/types";
import type { RecordItem } from "../data/preview";
import { initials, money } from "../lib/domain";
import { sectionSamples } from "../data/sections";

export function PageIntro({
  action,
  onAction,
}: {
  action?: string;
  onAction?: () => void;
}) {
  const { t, language } = useWorkspace();
  return (
    <div className="page-intro">
      <div>
        <div className="eyebrow">
          <span />
          {portal.eyebrow[language]}
        </div>
        <h1>{portal.title[language]}</h1>
        <p>{portal.subtitle[language]}</p>
      </div>
      {action && (
        <button className="button primary" onClick={onAction}>
          <Icon name="plus" size={17} />
          {action}
        </button>
      )}
    </div>
  );
}
export function ConnectionState({ data }: { data: PageData }) {
  const { t, user, configured, href, refresh } = useWorkspace();
  if (data.preview) return null;
  if (data.error)
    return (
      <div className="notice error" role="alert">
        <Icon name="warning" />
        <span>{data.error}</span>
        <button className="text-button" onClick={refresh}>
          {t("Try again", "আবার চেষ্টা করুন")}
        </button>
      </div>
    );
  if (!user)
    return (
      <div className="welcome-banner">
        <span className="welcome-icon">
          <Icon name={portal.icon} size={28} />
        </span>
        <div>
          <h3>
            {t(
              "Your next good day starts here.",
              "সুন্দর একটি দিন এখান থেকেই শুরু হোক।",
            )}
          </h3>
          <p>
            {t(
              "Sign in to see your own workspace, or take a look around with sample data.",
              "আপনার ওয়ার্কস্পেস দেখতে সাইন ইন করুন, অথবা নমুনা তথ্য দিয়ে ঘুরে দেখুন।",
            )}
          </p>
        </div>
        <Link className="button primary" to="/login">
          {t("Sign in", "সাইন ইন")}
        </Link>
        <Link className="button secondary" to="/?preview=1">
          {t("View preview", "প্রিভিউ দেখুন")}
        </Link>
      </div>
    );
  if (data.pending)
    return (
      <div className="notice">
        <Icon name="clock" />
        <span>
          {t(
            "This workspace is being prepared. Your existing records are kept safe; new actions become available after your organisation is connected.",
            "এই ওয়ার্কস্পেস প্রস্তুত হচ্ছে। প্রতিষ্ঠান সংযুক্ত হলে নতুন কার্যক্রম চালু হবে।",
          )}
        </span>
      </div>
    );
  if (!configured)
    return (
      <div className="notice">
        <Icon name="link" />
        <span>
          {t(
            "Your workspace connection is being prepared. Please contact your Ringdo administrator.",
            "ওয়ার্কস্পেসের সংযোগ প্রস্তুত হচ্ছে। রিংডো প্রশাসকের সঙ্গে যোগাযোগ করুন।",
          )}
        </span>
      </div>
    );
  return null;
}
export function Status({ status }: { status: string }) {
  const { t } = useWorkspace();
  const names: Record<string, [string, string]> = {
    new: ["New order", "নতুন অর্ডার"],
    pending: ["Awaiting approval", "অনুমোদনের অপেক্ষায়"],
    confirmed: ["Confirmed", "নিশ্চিত"],
    accepted: ["Accepted", "গৃহীত"],
    preparing: ["Preparing", "প্রস্তুত হচ্ছে"],
    ready: ["Ready", "প্রস্তুত"],
    delivering: ["On the way", "পথে আছে"],
    delivered: ["Delivered", "পৌঁছে গেছে"],
    collected: ["Collected", "সংগ্রহ করা হয়েছে"],
    completed: ["Completed", "সম্পন্ন"],
    cancelled: ["Cancelled", "বাতিল"],
    open: ["Open", "চলমান"],
    resolved: ["Resolved", "সমাধান হয়েছে"],
    approved: ["Approved", "অনুমোদিত"],
    available: ["Available", "খালি আছে"],
    maintenance: ["Maintenance", "রক্ষণাবেক্ষণ"],
    sandbox: ["Sandbox only", "শুধু পরীক্ষামূলক"],
    provider_en_route: ["On the way", "পথে আছেন"],
    arrived: ["Arrived", "পৌঁছেছেন"],
    in_progress: ["In progress", "কাজ চলছে"],
  };
  const name = names[status] ?? [
    status.replaceAll("_", " "),
    status.replaceAll("_", " "),
  ];
  const tone = [
    "completed",
    "delivered",
    "collected",
    "approved",
    "available",
    "resolved",
  ].includes(status)
    ? "green"
    : ["new", "pending", "maintenance", "preparing"].includes(status)
      ? "amber"
      : ["cancelled"].includes(status)
        ? "red"
        : ["sandbox"].includes(status)
          ? "neutral"
          : "blue";
  return (
    <Badge tone={tone} dot>
      {t(...name)}
    </Badge>
  );
}
export function toRow(raw: Record<string, unknown>): RecordItem {
  const string = (...keys: string[]) =>
    keys.map((k) => raw[k]).find((v) => typeof v === "string") as
      string | undefined;
  return {
    id: String(raw.id ?? ""),
    title:
      string("subject", "description", "name", "registration_number") ??
      "Ringdo record",
    subtitle: string("category_name", "category", "country_code") ?? "",
    status: string("status", "verification_status") ?? "pending",
    amount: Math.round(
      Number(raw.customer_fee ?? raw.base_amount ?? raw.amount ?? 0) * 100,
    ),
    time: string("created_at", "updated_at")
      ? new Date(String(raw.created_at ?? raw.updated_at)).toLocaleDateString(
          "en-GB",
          { day: "numeric", month: "short" },
        )
      : "—",
    person:
      string("customer_name", "requester_name", "provider_name") ??
      "Ringdo account",
    category: string("category_name", "category", "vehicle_type") ?? "Service",
  };
}
export function useRows(data: PageData) {
  const { preview, rows } = useWorkspace();
  if (!preview) return data.entries.map(toRow);
  const section = sectionSamples[portal.id]?.[data.section];
  const added = rows.filter((row) => row.section === data.section);
  return section
    ? [
        ...added.filter((row) => !section.some((item) => item.id === row.id)),
        ...section.map(
          (item) => added.find((row) => row.id === item.id) ?? item,
        ),
      ]
    : rows.filter(
        (row) =>
          !row.section ||
          row.section === data.section ||
          (portal.id === "business" &&
            data.section === "approvals" &&
            row.section === "requests"),
      );
}
export interface Stat {
  label: [string, string];
  value: string;
  note: [string, string];
  trend?: string;
  icon: string;
  values: number[];
}
export function Stats({ items }: { items: Stat[] }) {
  const { t, preview } = useWorkspace();
  return (
    <div className="stats-grid">
      {items.map((s, i) => (
        <article className="stat-card" key={i}>
          <div className="stat-label">
            {t(...s.label)}
            <span className="stat-icon">
              <Icon name={s.icon} size={18} />
            </span>
          </div>
          <div className="stat-value">
            {preview ? s.value : "—"}
            {preview && s.trend && (
              <span className="trend">
                <Icon name="arrow" size={12} />
                {s.trend}
              </span>
            )}
          </div>
          <div className="stat-bottom">
            <span>
              {preview
                ? t(...s.note)
                : t("Awaiting verified data", "যাচাইকৃত তথ্যের অপেক্ষায়")}
            </span>
            <MiniChart values={preview ? s.values : [0, 0, 0, 0, 0, 0, 0]} />
          </div>
        </article>
      ))}
    </div>
  );
}
export function RecordsTable({
  rows,
  title,
  action,
  onOpen,
  filter = true,
}: {
  rows: RecordItem[];
  title: string;
  action?: React.ReactNode;
  onOpen?: (row: RecordItem) => void;
  filter?: boolean;
}) {
  const { t, language } = useWorkspace();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<RecordItem | null>(null);
  const visible = rows.filter(
    (r) =>
      (status === "all" || r.status === status) &&
      `${r.id} ${r.title} ${r.person}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <section className="panel records-panel">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p>
            {t(
              "The details that keep your day moving",
              "দিনের প্রয়োজনীয় সব খবর",
            )}
          </p>
        </div>
        {action}
      </div>
      {filter && (
        <div className="table-toolbar">
          <label className="search-input">
            <Icon name="search" size={17} />
            <input
              placeholder={t(
                "Search name, ID or service…",
                "নাম, নম্বর বা সেবা খুঁজুন…",
              )}
              aria-label={t("Search records", "তালিকায় খুঁজুন")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select
            aria-label={t("Filter by status", "অবস্থা অনুযায়ী দেখুন")}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">{t("All statuses", "সব অবস্থা")}</option>
            {[...new Set(rows.map((r) => r.status))].map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
      )}
      {visible.length ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{t("REFERENCE / DETAILS", "নম্বর / বিবরণ")}</th>
                <th>{t("CUSTOMER / TEAM", "ক্রেতা / দল")}</th>
                <th>{t("STATUS", "অবস্থা")}</th>
                <th>{t("AMOUNT", "মূল্য")}</th>
                <th>{t("WHEN", "সময়")}</th>
                <th>
                  <span className="sr-only">
                    {t("Open record", "বিস্তারিত দেখুন")}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id}>
                  <td>
                    <button
                      className="table-record"
                      onClick={() => (onOpen ? onOpen(row) : setSelected(row))}
                    >
                      <span className="record-icon">
                        <Icon name={portal.icon} size={18} />
                      </span>
                      <span>
                        <strong>{row.title}</strong>
                        <small>
                          {row.id.slice(0, 12)} · {row.subtitle}
                        </small>
                      </span>
                    </button>
                  </td>
                  <td>
                    <span className="person-cell">
                      <span className="avatar avatar-small">
                        {initials(row.person)}
                      </span>
                      {row.person}
                    </span>
                  </td>
                  <td>
                    <Status status={row.status} />
                  </td>
                  <td className="amount-cell">
                    {row.amount
                      ? money(
                          row.amount,
                          "BDT",
                          language === "bn" ? "bn-BD" : "en-BD",
                        )
                      : "—"}
                  </td>
                  <td className="muted-cell">{row.time}</td>
                  <td>
                    <button
                      className="icon-button"
                      aria-label={`${t("View", "দেখুন")} ${row.id}`}
                      onClick={() => (onOpen ? onOpen(row) : setSelected(row))}
                    >
                      <Icon name="arrow" size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty
          title={t("A clear view of your day", "আপনার দিনের পরিষ্কার চিত্র")}
          description={
            query
              ? t(
                  "No matching records. Try another search.",
                  "কোনো মিল পাওয়া যায়নি। অন্যভাবে খুঁজুন।",
                )
              : t(
                  "Your recent activity will appear here.",
                  "আপনার সাম্প্রতিক কার্যক্রম এখানে দেখা যাবে।",
                )
          }
        />
      )}
      <div className="table-footer">
        <span>
          {t(
            `Showing ${visible.length} recent records`,
            `${visible.length}টি সাম্প্রতিক তথ্য দেখানো হচ্ছে`,
          )}
        </span>
        <span>{t("Updated from this workspace", "এই ওয়ার্কস্পেসের তথ্য")}</span>
      </div>
      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <RecordDetails row={selected} />
        </Modal>
      )}
    </section>
  );
}
export function RecordDetails({ row }: { row: RecordItem }) {
  const { t, preview, language } = useWorkspace();
  return (
    <div className="record-details">
      <div className="detail-hero">
        <span className="detail-icon">
          <Icon name={portal.icon} size={32} />
        </span>
        <Status status={row.status} />
      </div>
      <dl>
        <div>
          <dt>{t("Reference", "নম্বর")}</dt>
          <dd>{row.id}</dd>
        </div>
        <div>
          <dt>{t("Customer / team", "ক্রেতা / দল")}</dt>
          <dd>{row.person}</dd>
        </div>
        <div>
          <dt>{t("Details", "বিবরণ")}</dt>
          <dd>{row.subtitle}</dd>
        </div>
        <div>
          <dt>{t("Amount", "মূল্য")}</dt>
          <dd>
            {row.amount
              ? money(row.amount, "BDT", language === "bn" ? "bn-BD" : "en-BD")
              : "—"}
          </dd>
        </div>
        <div>
          <dt>{t("When", "সময়")}</dt>
          <dd>{row.time}</dd>
        </div>
      </dl>
      {preview && (
        <p className="form-note">
          {t(
            "Sample record for this interactive preview.",
            "ইন্টার‌্যাক্টিভ প্রিভিউয়ের নমুনা তথ্য।",
          )}
        </p>
      )}
    </div>
  );
}
