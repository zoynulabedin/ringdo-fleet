import { useEffect, useState } from "react";
import { Link } from "react-router";
import { portal } from "../config";
import { useWorkspace } from "../components/shell";
import { Icon } from "../components/icon";
import {
  Badge,
  Empty,
  Modal,
  SectionTitle,
  TrendChart,
} from "../components/ui";
import { LivingMap } from "../components/living-map";
import type { PageData } from "../lib/types";
import type { RecordItem, Product } from "../data/preview";
import { money, canTransition, initials } from "../lib/domain";
import {
  ConnectionState,
  PageIntro,
  RecordsTable,
  RecordDetails,
  Stats,
  Status,
  useRows,
  type Stat,
} from "./common";

const stats: Record<string, Stat[]> = {
  merchant: [
    {
      label: ["Today’s sales", "আজকের বিক্রি"],
      value: "৳12,840",
      note: ["Sample merchant-direct sales", "নমুনা সরাসরি দোকানের বিক্রি"],
      trend: "+12.8%",
      icon: "chart",
      values: [3, 5, 4, 6, 5, 8, 9],
    },
    {
      label: ["Orders today", "আজকের অর্ডার"],
      value: "24",
      note: ["4 need your attention", "৪টিতে আপনার নজর প্রয়োজন"],
      trend: "+4",
      icon: "bag",
      values: [3, 4, 4, 2, 5, 7, 6],
    },
    {
      label: ["Products in stock", "মজুতে থাকা পণ্য"],
      value: "128",
      note: ["3 low-stock items", "৩টি পণ্যের মজুত কম"],
      icon: "box",
      values: [5, 7, 6, 7, 8, 7, 8],
    },
    {
      label: ["Store rating", "দোকানের রেটিং"],
      value: "4.8",
      note: ["246 sample reviews", "২৪৬টি নমুনা রিভিউ"],
      icon: "star",
      values: [5, 5, 6, 6, 7, 7, 8],
    },
  ],
  professional: [
    {
      label: ["Upcoming jobs", "সামনের কাজ"],
      value: "3",
      note: ["Your sample workday", "আপনার নমুনা কর্মদিন"],
      icon: "briefcase",
      values: [2, 3, 2, 3, 4, 2, 3],
    },
    {
      label: ["This week’s earnings", "এই সপ্তাহের আয়"],
      value: "৳8,450",
      note: ["After sample deductions", "নমুনা কাটার পর"],
      trend: "+18%",
      icon: "wallet",
      values: [2, 3, 2, 5, 6, 4, 8],
    },
    {
      label: ["Completed jobs", "সম্পন্ন কাজ"],
      value: "128",
      note: ["Across sample history", "নমুনা কাজের ইতিহাসে"],
      icon: "check-circle",
      values: [3, 4, 5, 6, 5, 7, 8],
    },
    {
      label: ["Customer rating", "ক্রেতার রেটিং"],
      value: "4.9",
      note: ["128 sample verified reviews", "১২৮টি নমুনা যাচাইকৃত রিভিউ"],
      icon: "star",
      values: [6, 6, 7, 7, 8, 7, 9],
    },
  ],
  fleet: [
    {
      label: ["Fleet vehicles", "ফ্লিটের গাড়ি"],
      value: "12",
      note: ["Sample registered vehicles", "নমুনা নিবন্ধিত গাড়ি"],
      icon: "truck",
      values: [5, 5, 7, 7, 8, 8, 8],
    },
    {
      label: ["Ready for assignment", "কাজের জন্য প্রস্তুত"],
      value: "8",
      note: ["Preview availability", "প্রিভিউয়ের প্রাপ্যতা"],
      icon: "route",
      values: [4, 5, 4, 6, 7, 6, 8],
    },
    {
      label: ["Team members", "দলের সদস্য"],
      value: "14",
      note: ["Sample driver roster", "নমুনা ড্রাইভারের তালিকা"],
      icon: "users",
      values: [5, 6, 6, 7, 7, 8, 8],
    },
    {
      label: ["Maintenance due", "সার্ভিসিং প্রয়োজন"],
      value: "2",
      note: ["Plan the next service", "পরবর্তী সার্ভিসিং পরিকল্পনা করুন"],
      icon: "tool",
      values: [4, 3, 3, 2, 3, 2, 2],
    },
  ],
  business: [
    {
      label: ["This month’s spend", "এই মাসের খরচ"],
      value: "৳64,200",
      note: ["Sample company spending", "প্রতিষ্ঠানের নমুনা খরচ"],
      icon: "wallet",
      values: [2, 3, 3, 4, 3, 6, 7],
    },
    {
      label: ["Pending approvals", "অপেক্ষমাণ অনুমোদন"],
      value: "2",
      note: ["Review your team’s requests", "দলের অনুরোধগুলো দেখুন"],
      icon: "check-circle",
      values: [2, 4, 3, 4, 3, 2, 2],
    },
    {
      label: ["Team members", "দলের সদস্য"],
      value: "18",
      note: ["Across 3 sample teams", "৩টি নমুনা দলে"],
      icon: "users",
      values: [4, 5, 5, 6, 6, 7, 8],
    },
    {
      label: ["Budget remaining", "অবশিষ্ট বাজেট"],
      value: "৳35,800",
      note: ["Of ৳100,000 sample budget", "১ লাখ টাকার নমুনা বাজেটের"],
      icon: "chart",
      values: [9, 8, 8, 7, 7, 6, 4],
    },
  ],
};

export function OperationsOverview({ data }: { data: PageData }) {
  const { t, preview, href, notify, call, refresh, user } = useWorkspace();
  const rows = useRows(data);
  const profile = data.detail.provider_profile as
    Record<string, unknown> | undefined;
  const [available, setAvailable] = useState<boolean | null>(
    preview
      ? false
      : typeof profile?.is_available === "boolean"
        ? profile.is_available
        : null,
  );
  useEffect(() => {
    if (!preview)
      setAvailable(
        typeof profile?.is_available === "boolean"
          ? profile.is_available
          : null,
      );
  }, [preview, profile?.is_available]);
  const [busy, setBusy] = useState(false);
  const [request, setRequest] = useState(false);
  const target =
    portal.id === "merchant"
      ? "products"
      : portal.id === "professional"
        ? "services"
        : portal.id === "fleet"
          ? "dispatch"
          : "requests";
  const toggle = async () => {
    if (preview) {
      setAvailable(!available);
      notify(
        t("Preview availability updated.", "প্রিভিউতে প্রাপ্যতা বদলানো হয়েছে।"),
      );
      return;
    }
    setBusy(true);
    try {
      const current = await call("/provider/profile");
      if (
        typeof current.is_available !== "boolean" ||
        typeof current.is_emergency_available !== "boolean"
      )
        throw new Error(
          t(
            "Availability could not be verified. Please try again.",
            "প্রাপ্যতা যাচাই করা যায়নি। আবার চেষ্টা করুন।",
          ),
        );
      await call("/provider/availability", "PUT", {
        is_available: !current.is_available,
        is_emergency_available: current.is_emergency_available,
      });
      setAvailable(!current.is_available);
      notify(
        t(
          "Availability confirmed by Ringdo.",
          "রিংডো প্রাপ্যতা নিশ্চিত করেছে।",
        ),
      );
      refresh();
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageIntro />
      <ConnectionState data={data} />
      {portal.id === "professional" && (
        <div className="availability-panel">
          <div>
            <span
              className={`availability-light ${available ? "is-online" : ""}`}
            />
            <span>
              <strong>
                {t(
                  available === null
                    ? "Availability is not loaded yet"
                    : available
                      ? "You’re available for eligible requests"
                      : "You’re currently offline",
                  available === null
                    ? "প্রাপ্যতার তথ্য এখনো আসেনি"
                    : available
                      ? "আপনি উপযুক্ত অনুরোধ নিতে প্রস্তুত"
                      : "আপনি এখন অফলাইনে আছেন",
                )}
              </strong>
              <small>
                {t(
                  "Your service coverage and the buyer’s radar are checked independently.",
                  "আপনার সেবার এলাকা ও ক্রেতার রাডার আলাদাভাবে যাচাই হয়।",
                )}
              </small>
            </span>
          </div>
          <button
            className={`toggle-control ${available ? "on" : ""}`}
            role="switch"
            aria-checked={available ?? false}
            onClick={() => void toggle()}
            disabled={busy || (!preview && (!user || available === null))}
          >
            <span />
            {t(
              available ? "Online" : "Go online",
              available ? "অনলাইন" : "অনলাইনে যান",
            )}
          </button>
        </div>
      )}
      <Stats items={stats[portal.id] ?? stats.merchant} />
      <div className="overview-grid">
        <section className="panel analytics-panel">
          <div className="panel-heading">
            <div>
              <h2>
                {t(
                  portal.id === "fleet"
                    ? "Your fleet, at a glance"
                    : portal.id === "business"
                      ? "Spending with a clear picture"
                      : portal.id === "professional"
                        ? "Great work adds up"
                        : "A little growth, every day",
                  portal.id === "fleet"
                    ? "এক নজরে ফ্লিটের অবস্থা"
                    : portal.id === "business"
                      ? "খরচের পরিষ্কার চিত্র"
                      : portal.id === "professional"
                        ? "ভালো কাজের ফল"
                        : "প্রতিদিন একটু করে অগ্রগতি",
                )}
              </h2>
              <p>
                {t(
                  preview
                    ? "A sample view of the last seven days"
                    : "Your verified reporting will appear here",
                  preview
                    ? "গত সাত দিনের নমুনা চিত্র"
                    : "যাচাইকৃত প্রতিবেদন এখানে পাওয়া যাবে",
                )}
              </p>
            </div>
            <Badge>{t("Last 7 days", "গত ৭ দিন")}</Badge>
          </div>
          {preview ? (
            <TrendChart
              title="Sample seven-day activity"
              values={
                portal.id === "business"
                  ? [15, 18, 16, 25, 20, 30, 26]
                  : [12, 20, 16, 28, 24, 37, 42]
              }
              labels={["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]}
            />
          ) : (
            <Empty
              icon="chart"
              title={t(
                "A clearer view over time",
                "সময়ের সঙ্গে পরিষ্কার চিত্র",
              )}
              description={t(
                "Reporting uses confirmed records from your workspace.",
                "আপনার ওয়ার্কস্পেসের নিশ্চিত তথ্য দিয়ে প্রতিবেদন তৈরি হবে।",
              )}
            />
          )}
        </section>
        <section className="panel quick-panel">
          <span className="quick-art">
            <Icon name={portal.icon} size={48} />
            <i />
            <b />
          </span>
          <div className="eyebrow">
            {t("A LITTLE HEAD START", "এক ধাপ এগিয়ে")}
          </div>
          <h2>
            {t(
              portal.id === "merchant"
                ? "A well-stocked shop is a happy shop."
                : portal.id === "professional"
                  ? "Let your best work speak."
                  : portal.id === "fleet"
                    ? "Stay a step ahead of your next trip."
                    : "A good plan goes a long way.",
              portal.id === "merchant"
                ? "পণ্যে ভরা দোকান, সন্তুষ্ট ক্রেতা।"
                : portal.id === "professional"
                  ? "ভালো কাজই আপনার পরিচয়।"
                  : portal.id === "fleet"
                    ? "পরবর্তী ট্রিপের আগে প্রস্তুত থাকুন।"
                    : "ভালো পরিকল্পনায় অনেক দূর।",
            )}
          </h2>
          <p>
            {t(
              portal.id === "merchant"
                ? "Check your catalogue and keep stock information accurate."
                : portal.id === "professional"
                  ? "Describe your services clearly, with scope and upfront pricing."
                  : portal.id === "fleet"
                    ? "Review vehicle documents and maintenance before assigning work."
                    : "Give every team clear budgets and approval rules.",
              portal.id === "merchant"
                ? "পণ্যের তালিকা ও মজুতের তথ্য হালনাগাদ রাখুন।"
                : portal.id === "professional"
                  ? "কাজের সীমা ও মূল্যসহ সেবা পরিষ্কারভাবে লিখুন।"
                  : portal.id === "fleet"
                    ? "কাজ দেওয়ার আগে কাগজপত্র ও সার্ভিসিং দেখুন।"
                    : "প্রতিটি দলের বাজেট ও অনুমোদনের নিয়ম স্পষ্ট রাখুন।",
            )}
          </p>
          <Link className="text-button" to={href("/workspace/" + target)}>
            {portal.primary[t("en", "bn") as "en" | "bn"]}
            <Icon name="arrow" size={16} />
          </Link>
        </section>
      </div>
      <div className="section-action-row">
        <h2>
          {t(
            portal.id === "merchant"
              ? "Orders to keep an eye on"
              : portal.id === "professional"
                ? "Your next jobs"
                : portal.id === "fleet"
                  ? "Vehicles in your operation"
                  : "Your team’s latest requests",
            portal.id === "merchant"
              ? "নজর রাখুন এই অর্ডারগুলোতে"
              : portal.id === "professional"
                ? "আপনার পরবর্তী কাজ"
                : portal.id === "fleet"
                  ? "আপনার কার্যক্রমের গাড়ি"
                  : "দলের সাম্প্রতিক অনুরোধ",
          )}
        </h2>
        <Link
          className="text-button"
          to={href(
            "/workspace/" +
              (portal.id === "merchant"
                ? "orders"
                : portal.id === "professional"
                  ? "jobs"
                  : portal.id === "fleet"
                    ? "vehicles"
                    : "requests"),
          )}
        >
          {t("View all", "সব দেখুন")}
          <Icon name="arrow" size={15} />
        </Link>
      </div>
      <RecordsTable
        rows={rows}
        title={t("Recent updates", "সাম্প্রতিক খবর")}
        filter={false}
      />
    </>
  );
}

export function CatalogView({ data }: { data: PageData }) {
  const { t, preview, products, setProducts, notify } = useWorkspace();
  const professional = portal.id === "professional";
  const [query, setQuery] = useState("");
  const [edit, setEdit] = useState<Product | null | "new">(null);
  const visible = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <SectionTitle
        title={t(
          professional
            ? "Your services, clearly explained"
            : "A shelf for every essential",
          professional
            ? "পরিষ্কারভাবে সাজানো আপনার সেবা"
            : "প্রয়োজনীয় পণ্যের সাজানো তালিকা",
        )}
        subtitle={t(
          professional
            ? "Publish clear scopes and prices. Travel within your coverage is included."
            : "Keep products, unit prices and stock accurate for your customers.",
          professional
            ? "কাজের সীমা ও মূল্য লিখুন। নির্ধারিত এলাকার সাধারণ যাতায়াত অন্তর্ভুক্ত।"
            : "ক্রেতার জন্য পণ্য, একক মূল্য ও মজুত ঠিক রাখুন।",
        )}
        action={
          <button className="button primary" onClick={() => setEdit("new")}>
            <Icon name="plus" size={17} />
            {t(
              professional ? "Add service" : "Add product",
              professional ? "সেবা যোগ করুন" : "পণ্য যোগ করুন",
            )}
          </button>
        }
      />
      <ConnectionState data={data} />
      <div className="catalog-toolbar">
        <label className="search-input">
          <Icon name="search" size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Find in your catalogue…", "তালিকায় খুঁজুন…")}
            aria-label="Find catalogue item"
          />
        </label>
        <Badge tone="neutral">
          {visible.length} {t("items", "টি আইটেম")}
        </Badge>
      </div>
      {visible.length ? (
        <div className="product-grid">
          {visible.map((p) => (
            <article className="product-card managed-product" key={p.id}>
              <div className="product-art" style={{ background: p.color }}>
                <Icon name={p.icon} size={54} />
                <Badge
                  tone={
                    professional ? "blue" : p.stock < 10 ? "amber" : "green"
                  }
                >
                  {professional
                    ? p.category === "FIXED"
                      ? t("Fixed price", "নির্ধারিত মূল্য")
                      : t("Diagnosis + quote", "পরিদর্শন + প্রস্তাব")
                    : t(
                        p.stock < 10 ? "Low stock" : "In stock",
                        p.stock < 10 ? "মজুত কম" : "মজুতে আছে",
                      )}
                </Badge>
              </div>
              <span className="product-category">
                {professional
                  ? t("YOUR SERVICE OFFER", "আপনার সেবার অফার")
                  : p.category}
              </span>
              <h3>{p.name}</h3>
              <p>{p.unit}</p>
              <div>
                <strong>{money(p.price)}</strong>
                {!professional && (
                  <small>
                    {p.stock} {t("in stock", "টি মজুতে")}
                  </small>
                )}
                <button
                  className="icon-button"
                  aria-label={`Edit ${p.name}`}
                  onClick={() => setEdit(p)}
                >
                  <Icon name="settings" size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          icon={professional ? "tool" : "box"}
          title={t(
            "Make room for your first listing",
            "প্রথম আইটেমের জন্য জায়গা তৈরি",
          )}
          description={t(
            "Your approved catalogue will appear here.",
            "আপনার অনুমোদিত তালিকা এখানে পাওয়া যাবে।",
          )}
        />
      )}{" "}
      {edit && (
        <Modal
          title={t(
            edit === "new"
              ? professional
                ? "Add a service"
                : "Add a product"
              : "Edit catalogue item",
            edit === "new"
              ? professional
                ? "সেবা যোগ করুন"
                : "পণ্য যোগ করুন"
              : "তালিকার আইটেম বদলান",
          )}
          onClose={() => setEdit(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!preview) return;
              const f = new FormData(e.currentTarget);
              const price = String(f.get("price"));
              if (!/^\d+(\.\d{1,2})?$/.test(price)) {
                notify(
                  t(
                    "Enter a valid BDT amount with at most two decimals.",
                    "সর্বোচ্চ দুই দশমিকসহ সঠিক টাকার পরিমাণ লিখুন।",
                  ),
                );
                return;
              }
              const item: Product = {
                id: edit === "new" ? "demo-" + crypto.randomUUID() : edit.id,
                name: String(f.get("name")).trim(),
                unit: String(f.get("unit")).trim(),
                price: Math.round(Number(price) * 100),
                stock: professional ? 1 : Number(f.get("stock")),
                category: String(f.get("category")),
                icon: professional ? "tool" : "box",
                color: professional ? "#e3e9df" : "#efe7d7",
              };
              setProducts((items) =>
                edit === "new"
                  ? [item, ...items]
                  : items.map((x) => (x.id === item.id ? item : x)),
              );
              setEdit(null);
              notify(
                t(
                  "Preview catalogue updated. No live listing was changed.",
                  "প্রিভিউয়ের তালিকা বদলানো হয়েছে। বাস্তব তালিকায় পরিবর্তন হয়নি।",
                ),
              );
            }}
          >
            <label className="field">
              <span>{t("Listing name", "আইটেমের নাম")}</span>
              <input
                name="name"
                required
                minLength={3}
                maxLength={120}
                defaultValue={edit === "new" ? "" : edit.name}
              />
            </label>
            <div className="form-grid">
              <label className="field">
                <span>{t("Price (BDT)", "মূল্য (টাকা)")}</span>
                <input
                  name="price"
                  required
                  type="number"
                  step=".01"
                  min=".01"
                  max="1000000"
                  defaultValue={edit === "new" ? "" : edit.price / 100}
                />
              </label>
              <label className="field">
                <span>
                  {t(
                    professional ? "Pricing type" : "Stock quantity",
                    professional ? "মূল্যের ধরন" : "মজুতের পরিমাণ",
                  )}
                </span>
                {professional ? (
                  <select
                    name="category"
                    defaultValue={edit === "new" ? "FIXED" : edit.category}
                  >
                    <option value="FIXED">Fixed price</option>
                    <option value="DIAGNOSIS_QUOTE">Diagnosis + quote</option>
                  </select>
                ) : (
                  <input
                    name="stock"
                    required
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={edit === "new" ? 0 : edit.stock}
                  />
                )}
              </label>
            </div>
            <label className="field">
              <span>
                {t(
                  professional ? "Scope / unit" : "Product unit",
                  professional ? "কাজের সীমা / একক" : "পণ্যের একক",
                )}
              </span>
              <input
                name="unit"
                required
                minLength={3}
                defaultValue={edit === "new" ? "" : edit.unit}
              />
            </label>
            {!professional && (
              <label className="field">
                <span>{t("Category", "বিভাগ")}</span>
                <select name="category">
                  <option>Pantry</option>
                  <option>Fresh</option>
                  <option>Dairy</option>
                  <option>Household</option>
                </select>
              </label>
            )}
            <p className="form-note">
              {t(
                professional
                  ? "The published scope must be clear. Additional parts or work always need customer approval."
                  : "Product money goes directly to your business. This catalogue never creates a Ringdo merchant wallet.",
                professional
                  ? "প্রকাশিত কাজের সীমা পরিষ্কার হতে হবে। বাড়তি যন্ত্রাংশ বা কাজের জন্য ক্রেতার সম্মতি লাগবে।"
                  : "পণ্যের টাকা সরাসরি আপনার ব্যবসায় যাবে। এখানে রিংডোর মার্চেন্ট ওয়ালেট তৈরি হয় না।",
              )}
            </p>
            {!preview && (
              <p className="notice">
                {t(
                  "Catalogue editing becomes available after your verified business is connected.",
                  "যাচাইকৃত ব্যবসা সংযুক্ত হলে তালিকা সম্পাদনা চালু হবে।",
                )}
              </p>
            )}
            <button className="button primary full" disabled={!preview}>
              {t("Save in preview", "প্রিভিউতে সংরক্ষণ করুন")}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}

export function OrdersView({ data }: { data: PageData }) {
  const { t, preview, setRows, notify } = useWorkspace();
  const rows = useRows(data);
  const [selected, setSelected] = useState<RecordItem | null>(null);
  const [received, setReceived] = useState(false);
  const [tab, setTab] = useState("all");
  const stages = ["all", "new", "accepted", "preparing", "ready", "delivering"];
  const next: Record<string, string> = {
    new: "accepted",
    accepted: "preparing",
    preparing: "ready",
    ready: "delivering",
    delivering: "delivered",
  };
  const change = (to: string) => {
    if (!preview || !selected || !canTransition(selected.status, to)) return;
    const updated = { ...selected, status: to };
    setRows((r) => r.map((x) => (x.id === selected.id ? updated : x)));
    setSelected(updated);
    notify(
      t(
        "Preview order status updated.",
        "প্রিভিউ অর্ডারের অবস্থা বদলানো হয়েছে।",
      ),
    );
  };
  return (
    <>
      <SectionTitle
        title={t(
          "Every order deserves a good experience.",
          "প্রতিটি অর্ডারে ভালো অভিজ্ঞতা।",
        )}
        subtitle={t(
          "Fulfilment and merchant-direct payment are tracked separately.",
          "পণ্য পাঠানো ও সরাসরি দোকানের পেমেন্ট আলাদাভাবে দেখা হয়।",
        )}
      />
      <ConnectionState data={data} />
      <div className="segmented-tabs">
        {stages.map((s) => (
          <button
            className={s === tab ? "active" : ""}
            onClick={() => setTab(s)}
            key={s}
          >
            {s === "all"
              ? t("All orders", "সব অর্ডার")
              : s.replaceAll("_", " ")}
            <small>
              {rows.filter((r) => s === "all" || r.status === s).length}
            </small>
          </button>
        ))}
      </div>
      <RecordsTable
        rows={rows.filter((r) => tab === "all" || r.status === tab)}
        title={t("Order queue", "অর্ডারের তালিকা")}
        onOpen={(r) => {
          setSelected(r);
          setReceived(false);
        }}
      />
      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <RecordDetails row={selected} />
          <div className="payment-state">
            <Icon name="wallet" />
            <div>
              <strong>
                {t("Merchant-direct payment", "সরাসরি দোকানের পেমেন্ট")}
              </strong>
              <p>
                {selected.payment === "merchant_confirmed"
                  ? t("Confirmed by merchant", "দোকানি নিশ্চিত করেছেন")
                  : selected.payment === "buyer_reported"
                    ? t(
                        "Buyer reported paid · awaiting merchant confirmation",
                        "ক্রেতা পরিশোধের কথা জানিয়েছেন · দোকানির নিশ্চিতকরণ বাকি",
                      )
                    : t("Not yet confirmed", "এখনো নিশ্চিত হয়নি")}
              </p>
            </div>
          </div>
          {selected.payment !== "merchant_confirmed" && (
            <>
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={received}
                  onChange={(e) => setReceived(e.target.checked)}
                />
                <span>
                  {t(
                    "I independently checked that this merchant received the payment.",
                    "আমি আলাদাভাবে যাচাই করেছি, দোকানি টাকা পেয়েছেন।",
                  )}
                </span>
              </label>
              <button
                className="button secondary full"
                disabled={!preview || !received}
                onClick={() => {
                  if (!preview) return;
                  const update = { ...selected, payment: "merchant_confirmed" };
                  setRows((r) =>
                    r.map((x) => (x.id === selected.id ? update : x)),
                  );
                  setSelected(update);
                  notify(
                    t(
                      "Preview merchant confirmation recorded. This is not gateway verification.",
                      "প্রিভিউতে দোকানির নিশ্চিতকরণ লেখা হয়েছে। এটি গেটওয়ের যাচাই নয়।",
                    ),
                  );
                }}
              >
                {t(
                  "Record merchant confirmation · preview",
                  "দোকানির নিশ্চিতকরণ লিখুন · প্রিভিউ",
                )}
              </button>
            </>
          )}
          <div className="modal-actions">
            {next[selected.status] && (
              <button
                className="button primary"
                disabled={!preview}
                onClick={() => change(next[selected.status])}
              >
                {t("Move to", "পরের ধাপ")}: {next[selected.status]}
                <Icon name="arrow" size={16} />
              </button>
            )}
            {["new", "accepted"].includes(selected.status) && (
              <button
                className="button danger-soft"
                disabled={!preview}
                onClick={() => change("cancelled")}
              >
                {t("Cancel order", "অর্ডার বাতিল")}
              </button>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}

export function ProfessionalJobs({ data }: { data: PageData }) {
  const { t, preview, setRows, notify, call, refresh } = useWorkspace();
  const rows = useRows(data);
  const [selected, setSelected] = useState<RecordItem | null>(null);
  const [busy, setBusy] = useState(false);
  const action = async (status: string, endpoint: string) => {
    if (!selected) return;
    if (preview) {
      const row = { ...selected, status };
      setRows((r) => r.map((x) => (x.id === row.id ? row : x)));
      setSelected(row);
      notify(
        t(
          "Preview job updated. No real customer was notified.",
          "প্রিভিউ কাজ বদলানো হয়েছে। বাস্তব ক্রেতাকে বিজ্ঞপ্তি দেওয়া হয়নি।",
        ),
      );
      return;
    }
    setBusy(true);
    try {
      await call(`/bookings/${selected.id}/${endpoint}`, "PUT", {});
      notify(t("Job update confirmed.", "কাজের পরিবর্তন নিশ্চিত হয়েছে।"));
      refresh();
      setSelected(null);
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <SectionTitle
        title={t(
          "Good work starts with a clear request.",
          "পরিষ্কার অনুরোধ থেকে ভালো কাজের শুরু।",
        )}
        subtitle={t(
          "Review the agreed scope, address and price before accepting.",
          "গ্রহণের আগে কাজের সীমা, ঠিকানা ও নির্ধারিত মূল্য দেখুন।",
        )}
      />
      <ConnectionState data={data} />
      <RecordsTable
        rows={rows}
        title={t("Your job requests", "আপনার কাজের অনুরোধ")}
        onOpen={setSelected}
      />
      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <RecordDetails row={selected} />
          <div className="scope-box">
            <Icon name="shield" />
            <p>
              {t(
                "No hidden travel charge within your committed coverage. Ask the buyer to approve any additional materials or scope before work.",
                "আপনার নির্ধারিত এলাকার মধ্যে গোপন যাতায়াত খরচ নেই। বাড়তি উপকরণ বা কাজের আগে ক্রেতার অনুমোদন নিন।",
              )}
            </p>
          </div>
          <div className="modal-actions">
            {selected.status === "pending" ? (
              <>
                <button
                  className="button primary"
                  disabled={busy}
                  onClick={() => void action("confirmed", "accept")}
                >
                  {t("Accept request", "অনুরোধ গ্রহণ")}
                </button>
                <button
                  className="button secondary"
                  disabled={busy}
                  onClick={() => void action("cancelled", "reject")}
                >
                  {t("Decline", "গ্রহণ না করা")}
                </button>
              </>
            ) : selected.status === "confirmed" ? (
              <button
                className="button primary"
                disabled={busy}
                onClick={() => void action("provider_en_route", "en-route")}
              >
                {t("I’m on my way", "আমি রওনা হয়েছি")}
              </button>
            ) : selected.status === "provider_en_route" ? (
              <button
                className="button primary"
                disabled={busy}
                onClick={() => void action("arrived", "arrive")}
              >
                {t("Mark arrival", "পৌঁছেছি")}
              </button>
            ) : (
              <p className="form-note">
                {t(
                  "Follow the customer-confirmed start and completion workflow.",
                  "ক্রেতা নিশ্চিত করা শুরু ও কাজ শেষ করার নিয়ম অনুসরণ করুন।",
                )}
              </p>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}

export function DriverOverview({ data }: { data: PageData }) {
  const { t, preview, href } = useWorkspace();
  return (
    <>
      <PageIntro />
      <ConnectionState data={data} />
      <div className="notice transport-notice">
        <Icon name="shield" size={23} />
        <div>
          <strong>
            {t(
              "Preparation today. Approved journeys tomorrow.",
              "আজ প্রস্তুতি, অনুমোদনের পর যাত্রা।",
            )}
          </strong>
          <p>
            {t(
              "Public rides and cargo are not enabled in this workspace. A preview trip is not a live request.",
              "এই ওয়ার্কস্পেসে পাবলিক রাইড বা কার্গো চালু নেই। প্রিভিউ ট্রিপ বাস্তব অনুরোধ নয়।",
            )}
          </p>
        </div>
        <Badge tone="amber">
          {t("PUBLIC BOOKING OFF", "পাবলিক বুকিং বন্ধ")}
        </Badge>
      </div>
      <div className="driver-layout">
        <section className="panel driver-map">
          <LivingMap
            sellers={[]}
            selected={null}
            onSelect={() => {}}
            radius={1000}
            point={null}
            onPoint={() => {}}
          />
          <div className="driver-map-card">
            <Icon name="car" size={30} />
            <div>
              <strong>
                {t("Your driver workspace", "আপনার ড্রাইভার ওয়ার্কস্পেস")}
              </strong>
              <span>
                {t(
                  "Account and vehicle approval required",
                  "অ্যাকাউন্ট ও গাড়ির অনুমোদন প্রয়োজন",
                )}
              </span>
            </div>
            <Badge>{t("Offline", "অফলাইন")}</Badge>
          </div>
        </section>
        <div className="driver-steps panel">
          <div className="panel-heading">
            <div>
              <h2>{t("Get road-ready", "যাত্রার প্রস্তুতি নিন")}</h2>
              <p>
                {t(
                  "Every step supports a safer journey.",
                  "প্রতিটি ধাপ নিরাপদ যাত্রার জন্য।",
                )}
              </p>
            </div>
          </div>
          {[
            ["users", "Identity and eligibility", "পরিচয় ও যোগ্যতা"],
            ["car", "Vehicle registration", "গাড়ির নিবন্ধন"],
            ["file", "Permits and insurance", "অনুমতিপত্র ও বিমা"],
            ["shield", "Country / area release", "দেশ / এলাকার অনুমোদন"],
          ].map(([icon, en, bn], i) => (
            <div className="readiness-step" key={en}>
              <span>
                <Icon name={icon} size={21} />
              </span>
              <div>
                <strong>{t(en, bn)}</strong>
                <small>
                  {t(
                    preview && i < 2
                      ? "Sample review in progress"
                      : "Requires independent verification",
                    preview && i < 2
                      ? "নমুনা যাচাই চলছে"
                      : "আলাদা যাচাই প্রয়োজন",
                  )}
                </small>
              </div>
              <Icon name="clock" size={17} />
            </div>
          ))}
          <Link className="button primary full" to={href("/workspace/vehicle")}>
            {t("Review vehicle & documents", "গাড়ি ও কাগজপত্র দেখুন")}
          </Link>
        </div>
      </div>
      <RecordsTable
        rows={useRows(data)}
        title={t("Sandbox trip examples", "পরীক্ষামূলক ট্রিপের উদাহরণ")}
      />
    </>
  );
}

export function RecordWorkspace({ data }: { data: PageData }) {
  const { t, preview, setRows, notify } = useWorkspace();
  const rows = useRows(data);
  const [add, setAdd] = useState(false);
  const [chosen, setChosen] = useState<RecordItem | null>(null);
  const title = portal.nav.find((n) => n.id === data.section)?.title;
  return (
    <>
      <SectionTitle
        title={
          title?.[t("en", "bn") as "en" | "bn"] ??
          t("Workspace records", "ওয়ার্কস্পেসের তথ্য")
        }
        subtitle={t(
          "Keep the right details with the right people.",
          "সঠিক তথ্য থাকুক দায়িত্বপ্রাপ্ত মানুষের কাছে।",
        )}
        action={
          <button className="button primary" onClick={() => setAdd(true)}>
            <Icon name="plus" size={16} />
            {t(
              portal.id === "business"
                ? "New request"
                : portal.id === "fleet"
                  ? "Add to fleet"
                  : "Add details",
              portal.id === "business"
                ? "নতুন অনুরোধ"
                : portal.id === "fleet"
                  ? "ফ্লিটে যোগ করুন"
                  : "তথ্য যোগ করুন",
            )}
          </button>
        }
      />
      <ConnectionState data={data} />
      <RecordsTable
        rows={rows.filter(
          (r) => data.section !== "approvals" || r.status === "pending",
        )}
        title={title?.[t("en", "bn") as "en" | "bn"] ?? "Records"}
        onOpen={setChosen}
      />
      {chosen && (
        <Modal title={chosen.title} onClose={() => setChosen(null)}>
          <RecordDetails row={chosen} />
          {preview &&
            ["requests", "approvals"].includes(data.section) &&
            portal.id === "business" &&
            chosen.status === "pending" && (
              <div className="modal-actions">
                <button
                  className="button primary"
                  onClick={() => {
                    setRows((r) =>
                      r.map((x) =>
                        x.id === chosen.id ? { ...x, status: "approved" } : x,
                      ),
                    );
                    setChosen(null);
                    notify(
                      t(
                        "Preview approval recorded. No real request was approved.",
                        "প্রিভিউ অনুমোদন লেখা হয়েছে। বাস্তব অনুরোধ অনুমোদন হয়নি।",
                      ),
                    );
                  }}
                >
                  {t("Approve in preview", "প্রিভিউতে অনুমোদন")}
                </button>
                <button
                  className="button secondary"
                  onClick={() => {
                    setRows((r) =>
                      r.map((x) =>
                        x.id === chosen.id ? { ...x, status: "cancelled" } : x,
                      ),
                    );
                    setChosen(null);
                    notify(
                      t(
                        "Preview request declined.",
                        "প্রিভিউ অনুরোধ নাকচ হয়েছে।",
                      ),
                    );
                  }}
                >
                  {t("Decline in preview", "প্রিভিউতে নাকচ")}
                </button>
              </div>
            )}
          {portal.id === "fleet" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!preview) return;
                const fields = new FormData(e.currentTarget);
                setRows((rows) => [
                  {
                    ...chosen,
                    person: String(fields.get("assignee")),
                    subtitle: String(fields.get("notes")),
                    section: data.section,
                  },
                  ...rows.filter((row) => row.id !== chosen.id),
                ]);
                notify(
                  t(
                    "Preview assignment saved. No driver or vehicle was dispatched.",
                    "প্রিভিউ বরাদ্দ লেখা হয়েছে। বাস্তবে গাড়ি বা ড্রাইভার পাঠানো হয়নি।",
                  ),
                );
                setChosen(null);
              }}
            >
              <label className="field">
                <span>{t("Assign to", "দায়িত্ব দিন")}</span>
                <select name="assignee">
                  <option>Shahidul Islam · Sample driver</option>
                  <option>Mahmud Hasan · Sample driver</option>
                </select>
              </label>
              <label className="field">
                <span>{t("Assignment notes", "দায়িত্বের বিবরণ")}</span>
                <textarea name="notes" required minLength={8} />
              </label>
              <button className="button primary full" disabled={!preview}>
                {t("Save preview assignment", "প্রিভিউ বরাদ্দ সংরক্ষণ")}
              </button>
            </form>
          )}
        </Modal>
      )}
      {add && (
        <Modal
          title={t("Add workspace details", "ওয়ার্কস্পেসে তথ্য যোগ করুন")}
          onClose={() => setAdd(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!preview) return;
              const f = new FormData(e.currentTarget);
              const row: RecordItem = {
                id: "DEMO-" + crypto.randomUUID().slice(0, 6),
                title: String(f.get("name")),
                subtitle: String(f.get("notes")),
                status:
                  portal.id === "fleet"
                    ? "pending"
                    : portal.id === "driver"
                      ? "pending"
                      : "pending",
                amount: Math.round(Number(f.get("amount") ?? 0) * 100),
                time: "Just now · preview",
                person: "Sample team member",
                category: data.section,
                section: data.section,
              };
              setRows((r) => [row, ...r]);
              setAdd(false);
              notify(
                t(
                  "Preview record created. No real request was submitted.",
                  "প্রিভিউ তথ্য তৈরি হয়েছে। বাস্তব অনুরোধ জমা হয়নি।",
                ),
              );
            }}
          >
            <label className="field">
              <span>
                {t(
                  portal.id === "fleet"
                    ? "Vehicle / assignment name"
                    : portal.id === "driver"
                      ? "Vehicle registration"
                      : "Request / team member name",
                  portal.id === "fleet"
                    ? "গাড়ি / বরাদ্দের নাম"
                    : portal.id === "driver"
                      ? "গাড়ির নিবন্ধন"
                      : "অনুরোধ / দলের সদস্যের নাম",
                )}
              </span>
              <input name="name" required minLength={3} maxLength={120} />
            </label>
            <label className="field">
              <span>{t("Details", "বিবরণ")}</span>
              <textarea name="notes" required minLength={8} maxLength={1000} />
            </label>
            {portal.id === "business" && (
              <label className="field">
                <span>
                  {t("Estimated budget (BDT)", "আনুমানিক বাজেট (টাকা)")}
                </span>
                <input
                  name="amount"
                  required
                  type="number"
                  min="1"
                  step=".01"
                />
              </label>
            )}
            <p className="form-note">
              {t(
                "Records require the relevant workspace membership and independent approvals before use.",
                "কার্যক্রম চালুর আগে সংশ্লিষ্ট সদস্যপদ ও আলাদা অনুমোদন প্রয়োজন।",
              )}
            </p>
            <button className="button primary full" disabled={!preview}>
              {t("Create in preview", "প্রিভিউতে তৈরি করুন")}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}

export function EarningsView({ data }: { data: PageData }) {
  const { t, preview } = useWorkspace();
  return (
    <>
      <SectionTitle
        title={t(
          "A clear picture of your earnings",
          "আপনার আয়ের পরিষ্কার হিসাব",
        )}
        subtitle={t(
          "Service earnings, disclosed deductions and settlement status stay itemized.",
          "সেবার আয়, প্রকাশিত কাটার পরিমাণ ও পেমেন্টের অবস্থা আলাদাভাবে দেখুন।",
        )}
      />
      <ConnectionState data={data} />
      <Stats items={stats.professional} />
      <section className="panel">
        <div className="panel-heading">
          <h2>{t("Earnings over time", "সময় অনুযায়ী আয়")}</h2>
          <Badge>{t("This week", "এই সপ্তাহ")}</Badge>
        </div>
        {preview ? (
          <TrendChart
            title="Sample weekly earnings in BDT"
            values={[800, 1250, 650, 1700, 1350, 1200, 1500]}
            labels={["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]}
          />
        ) : (
          <Empty
            icon="wallet"
            title={t("Your confirmed earnings", "আপনার নিশ্চিত আয়")}
            description={t(
              "Use the approved payout and settlement process for your country.",
              "আপনার দেশের অনুমোদিত পেমেন্ট ও উত্তোলনের নিয়ম প্রযোজ্য।",
            )}
          />
        )}
      </section>
      <div className="scope-box">
        <Icon name="shield" />
        <p>
          {t(
            "Buyer totals, platform fees, applicable taxes and your net amount must match the accepted server quote. Merchant shop proceeds are separate and never use this wallet.",
            "ক্রেতার মোট খরচ, প্ল্যাটফর্ম ফি, প্রযোজ্য কর ও আপনার প্রাপ্তি অনুমোদিত খরচের সঙ্গে মিলতে হবে। দোকানের বিক্রির টাকা এই ওয়ালেটে আসে না।",
          )}
        </p>
      </div>
    </>
  );
}

export function SubscriptionView({ data }: { data: PageData }) {
  const { t, preview, notify } = useWorkspace();
  const [annual, setAnnual] = useState(false);
  return (
    <>
      <SectionTitle
        title={t(
          "Your store. Your sales. Your growth.",
          "আপনার দোকান, আপনার বিক্রি, আপনার অগ্রগতি।",
        )}
        subtitle={t(
          "A clear subscription for the platform. Zero Ringdo commission on product orders.",
          "প্ল্যাটফর্মের জন্য পরিষ্কার সাবস্ক্রিপশন। পণ্যের অর্ডারে রিংডোর কমিশন শূন্য।",
        )}
      />
      <ConnectionState data={data} />
      <div className="subscription-layout">
        <section className="plan-card">
          <Badge tone="green">{t("SAMPLE PLAN", "নমুনা প্ল্যান")}</Badge>
          <Icon name="store" size={42} />
          <h2>{t("Neighbourhood Store", "এলাকার দোকান")}</h2>
          <p>
            {t(
              "Room for your catalogue, orders and local customers.",
              "আপনার পণ্য, অর্ডার আর এলাকার ক্রেতাদের জন্য।",
            )}
          </p>
          <div className="plan-price">
            {annual ? "৳4,990" : "৳499"}
            <small>
              /{t(annual ? "year" : "month", annual ? "বছর" : "মাস")}
            </small>
          </div>
          <div className="segmented-tabs">
            <button
              className={!annual ? "active" : ""}
              onClick={() => setAnnual(false)}
            >
              {t("Monthly", "মাসিক")}
            </button>
            <button
              className={annual ? "active" : ""}
              onClick={() => setAnnual(true)}
            >
              {t("Annual", "বার্ষিক")}
            </button>
          </div>
          {[
            "Product catalogue & stock",
            "Order and fulfilment tools",
            "Merchant-direct payments",
            "0% marketplace order commission",
          ].map((v) => (
            <div className="plan-feature" key={v}>
              <Icon name="check" size={17} />
              {v}
            </div>
          ))}
          <button
            className="button primary full"
            disabled={!preview}
            onClick={() =>
              notify(
                t(
                  "Preview plan selected. No subscription was purchased.",
                  "প্রিভিউ প্ল্যান বেছে নেওয়া হয়েছে। সাবস্ক্রিপশন কেনা হয়নি।",
                ),
              )
            }
          >
            {t("Select preview plan", "প্রিভিউ প্ল্যান বেছে নিন")}
          </button>
          <small className="form-note">
            {t(
              "Illustrative pricing only. Your country plan and billing terms must be confirmed before purchase.",
              "মূল্য শুধু নমুনা। কেনার আগে দেশের প্ল্যান ও বিলের শর্ত নিশ্চিত হতে হবে।",
            )}
          </small>
        </section>
        <section className="panel payment-explainer">
          <span className="big-zero">
            0<span>%</span>
          </span>
          <h2>
            {t("Your product sales stay yours.", "পণ্যের বিক্রির টাকা আপনারই।")}
          </h2>
          <p>
            {t(
              "Customers pay your business directly by COD, merchant-owned QR or a supported merchant payment method. Ringdo records order and payment acknowledgments separately.",
              "ক্রেতা নগদ, দোকানির নিজস্ব কিউআর বা অনুমোদিত মাধ্যমে সরাসরি আপনার ব্যবসায় পেমেন্ট করেন। অর্ডার ও পেমেন্টের নিশ্চিতকরণ আলাদা থাকে।",
            )}
          </p>
          <div className="scope-box">
            <Icon name="lock" />
            <span>
              {t(
                "No Ringdo merchant wallet, shop escrow or product-proceeds withdrawal.",
                "রিংডোর মার্চেন্ট ওয়ালেট, দোকানের এসক্রো বা বিক্রির টাকা উত্তোলন নেই।",
              )}
            </span>
          </div>
        </section>
      </div>
    </>
  );
}
