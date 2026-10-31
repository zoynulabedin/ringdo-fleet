import {
  createContext,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useRevalidator,
  useSearchParams,
} from "react-router";
import { portal } from "../config";
import type { Language } from "../portal";
import type { PortalUser } from "../lib/session.server";
import {
  records as samples,
  products as sampleProducts,
  offers,
  type RecordItem,
  type Product,
} from "../data/preview";
import { initials, unwrap } from "../lib/domain";
import { Icon } from "./icon";
import { Badge, Modal, Empty } from "./ui";

export interface WorkspaceData {
  user: PortalUser | null;
  configured: boolean;
  preview: boolean;
  mapStyle: string;
  portalId: string;
}
interface Context {
  language: Language;
  t: (en: string, bn: string) => string;
  preview: boolean;
  user: PortalUser | null;
  configured: boolean;
  mapStyle: string;
  rows: RecordItem[];
  setRows: React.Dispatch<React.SetStateAction<RecordItem[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  notify: (message: string) => void;
  href: (path: string) => string;
  call: (
    path: string,
    method?: string,
    body?: unknown,
    headers?: Record<string, string>,
  ) => Promise<Record<string, unknown>>;
  refresh: () => void;
}
const WorkspaceContext = createContext<Context | null>(null);
export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("Workspace provider missing");
  return value;
}
export function WorkspaceShell({ data }: { data: WorkspaceData }) {
  const [language, setLanguage] = useState<Language>(
    data.user?.language === "bn" ? "bn" : "en",
  );
  const [dark, setDark] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [toast, setToast] = useState("");
  const [notifications, setNotifications] = useState(false);
  const [rows, setRows] = useState<RecordItem[]>(
    data.preview ? samples[portal.id] : [],
  );
  const [products, setProducts] = useState<Product[]>(
    data.preview
      ? portal.id === "professional"
        ? offers
        : sampleProducts
      : [],
  );
  const [params] = useSearchParams();
  const revalidator = useRevalidator();
  const t = (en: string, bn: string) => (language === "bn" ? bn : en);
  useEffect(() => {
    try {
      const l = localStorage.getItem("ringdo-language");
      if (l === "bn" || l === "en") setLanguage(l);
      setDark(localStorage.getItem("ringdo-appearance") === "dark");
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem("ringdo-language", language);
      localStorage.setItem("ringdo-appearance", dark ? "dark" : "light");
    } catch {}
  }, [language, dark]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 6500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    setRows(data.preview ? samples[portal.id] : []);
    setProducts(
      data.preview
        ? portal.id === "professional"
          ? offers
          : sampleProducts
        : [],
    );
  }, [data.preview]);
  const href = (path: string) =>
    path +
    (data.preview ? (path.includes("?") ? "&preview=1" : "?preview=1") : "");
  const call = async (
    path: string,
    method = "GET",
    body?: unknown,
    headers: Record<string, string> = {},
  ) => {
    if (data.preview)
      throw new Error("Preview actions cannot contact the live service.");
    const response = await fetch("/api/backend" + path, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Please try again.");
    return unwrap<Record<string, unknown>>(result);
  };
  const value: Context = {
    language,
    t,
    preview: data.preview,
    user: data.user,
    configured: data.configured,
    mapStyle: data.mapStyle,
    rows,
    setRows,
    products,
    setProducts,
    notify: setToast,
    href,
    call,
    refresh: () => revalidator.revalidate(),
  };
  return (
    <WorkspaceContext.Provider value={value}>
      <div
        className={`portal-app portal-${portal.id}`}
        data-theme={dark ? "dark" : "light"}
        style={{ "--accent": portal.accent } as CSSProperties}
      >
        <a href="#main-content" className="skip-link">
          {t("Skip to content", "মূল বিষয়ে যান")}
        </a>
        {mobile && (
          <button
            className="sidebar-backdrop"
            onClick={() => setMobile(false)}
            aria-label="Close navigation"
          />
        )}
        <aside className={`sidebar ${mobile ? "sidebar-open" : ""}`}>
          <Link to={href("/")} className="brand" aria-label={portal.name}>
            <span className="brand-mark">
              <i />
              <i />
              <i />
            </span>
            <span>
              {portal.id === "customer" ? (
                "ringdo"
              ) : (
                <>
                  ringdo
                  <span className="brand-product">
                    {portal.id === "professional" ? "pro" : portal.id}
                  </span>
                </>
              )}
            </span>
          </Link>
          <div className="workspace-identity">
            <div className="workspace-symbol">
              <Icon name={portal.icon} />
            </div>
            <div>
              <strong>
                {portal.id === "customer"
                  ? t("Personal workspace", "ব্যক্তিগত ওয়ার্কস্পেস")
                  : portal.name.replace("Ringdo ", "")}
              </strong>
              <span>
                {data.user && data.user.country_code !== "BD"
                  ? `${data.user.country_code} workspace`
                  : t("Bangladesh workspace", "বাংলাদেশ ওয়ার্কস্পেস")}
              </span>
            </div>
            <Icon name="down" size={14} />
          </div>
          <span className="nav-caption">{t("WORKSPACE", "ওয়ার্কস্পেস")}</span>
          <nav aria-label={t("Main navigation", "মূল মেনু")}>
            {portal.nav.map((item) => (
              <NavLink
                end
                to={href(item.id === "home" ? "/" : "/workspace/" + item.id)}
                key={item.id}
                onClick={() => setMobile(false)}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <Icon name={item.icon} size={19} />
                <span>{item.title[language]}</span>
                {data.preview &&
                  ["orders", "jobs", "inbox", "approvals"].includes(
                    item.id,
                  ) && <small>{item.id === "inbox" ? 3 : 2}</small>}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="local-note">
              <span className="small-spark">✦</span>
              <strong>
                {t("Good things happen locally.", "পাড়াতেই ভালো কিছু হোক।")}
              </strong>
              <p>{portal.descriptor[language]}</p>
            </div>
            <div className="profile-mini">
              <span className="avatar">
                {initials(
                  data.user?.name ??
                    (data.preview ? "Preview Member" : "Ringdo"),
                )}
              </span>
              <div>
                <strong>
                  {data.user?.name ||
                    t(
                      data.preview ? "Preview workspace" : "Welcome to Ringdo",
                      data.preview ? "প্রিভিউ ওয়ার্কস্পেস" : "রিংডোতে স্বাগতম",
                    )}
                </strong>
                <span>
                  {data.user
                    ? t("Signed in", "সাইন ইন করা আছে")
                    : t(
                        data.preview
                          ? "Sample account · no real data"
                          : "Sign in to your account",
                        data.preview
                          ? "নমুনা অ্যাকাউন্ট · বাস্তব তথ্য নয়"
                          : "আপনার অ্যাকাউন্টে সাইন ইন করুন",
                      )}
                </span>
              </div>
              {data.user ? (
                <Form action="/logout" method="post">
                  <button className="icon-button" aria-label="Sign out">
                    <Icon name="logout" size={17} />
                  </button>
                </Form>
              ) : (
                <Link to="/login" className="icon-button" aria-label="Sign in">
                  <Icon name="arrow" size={18} />
                </Link>
              )}
            </div>
          </div>
        </aside>
        <div className="main-column">
          <header className="topbar">
            <div className="topbar-left">
              <button
                className="icon-button mobile-menu"
                onClick={() => setMobile(true)}
                aria-label="Open navigation"
              >
                <Icon name="menu" />
              </button>
              <span className="breadcrumb">
                {portal.name}
                <span>/</span>
                <strong>{t("Workspace", "ওয়ার্কস্পেস")}</strong>
              </span>
            </div>
            <div className="topbar-actions">
              <span className="country-pill">
                {(!data.user || data.user.country_code === "BD") && (
                  <span className="country-flag" />
                )}{" "}
                {data.user?.country_code ?? "BD"}
                {(!data.user || data.user.country_code === "BD") && (
                  <span className="country-currency">· BDT</span>
                )}
              </span>
              <button
                className="language-button"
                onClick={() => setLanguage(language === "en" ? "bn" : "en")}
              >
                {language === "en" ? "বাংলা" : "EN"}
              </button>
              <button
                className="icon-button"
                onClick={() => setDark(!dark)}
                aria-label={
                  dark ? "Use light appearance" : "Use dark appearance"
                }
              >
                <Icon name={dark ? "sun" : "moon"} size={18} />
              </button>
              <button
                className="icon-button notification-button"
                onClick={() => setNotifications(true)}
                aria-label={t("Notifications", "বিজ্ঞপ্তি")}
              >
                <Icon name="bell" size={19} />
                {data.preview && <i />}
              </button>
            </div>
          </header>
          {data.preview ? (
            <div className="mode-banner">
              <span>
                <Badge tone="amber">
                  {t("INTERACTIVE PREVIEW", "ইন্টার‌্যাক্টিভ প্রিভিউ")}
                </Badge>
                {t(
                  "Sample data. Changes stay in this preview; no orders, payments or messages are sent.",
                  "নমুনা তথ্য। এখানকার পরিবর্তনে কোনো বাস্তব অর্ডার, পেমেন্ট বা বার্তা পাঠানো হয় না।",
                )}
              </span>
              <Link to="/">
                {t("Exit preview", "প্রিভিউ বন্ধ করুন")}
                <Icon name="external" size={13} />
              </Link>
            </div>
          ) : (
            <div className="connection-strip">
              <span
                className={`status-dot ${data.user && data.configured ? "online" : ""}`}
              />
              {data.user && data.configured
                ? t(
                    "Signed in to your workspace",
                    "আপনার ওয়ার্কস্পেসে সাইন ইন করা আছে",
                  )
                : t("Your Ringdo workspace", "আপনার রিংডো ওয়ার্কস্পেস")}
              <Link to="/?preview=1">
                {t("Explore the preview", "প্রিভিউ দেখুন")}
                <Icon name="arrow" size={13} />
              </Link>
            </div>
          )}
          <main id="main-content" className="content">
            <Outlet />
          </main>
          <footer className="workspace-footer">
            <span>© 2026 Ringdo</span>
            <span>
              {t(
                "Closer to the people who make your day.",
                "আপনার প্রয়োজনের মানুষের আরও কাছে।",
              )}
            </span>
            <Link to={href("/workspace/settings")}>
              {t("Preferences", "পছন্দসমূহ")}
            </Link>
          </footer>
        </div>
        {toast && (
          <div className="toast" role="status">
            <Icon name="check-circle" />
            <span>{toast}</span>
            <button
              className="icon-button"
              onClick={() => setToast("")}
              aria-label="Dismiss notification"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        )}
        {notifications && (
          <Modal
            title={t("Notifications", "বিজ্ঞপ্তি")}
            onClose={() => setNotifications(false)}
          >
            {data.preview ? (
              <div className="notification-list">
                {samples[portal.id].slice(0, 3).map((r) => (
                  <div key={r.id}>
                    <span className="notification-symbol">
                      <Icon name="bell" />
                    </span>
                    <div>
                      <strong>{r.title}</strong>
                      <p>{r.subtitle}</p>
                      <small>
                        {r.time} · {t("Sample notification", "নমুনা বিজ্ঞপ্তি")}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                icon="bell"
                title={t("Your notifications", "আপনার বিজ্ঞপ্তি")}
                description={t(
                  "New updates appear when your account is connected and notifications are loaded.",
                  "অ্যাকাউন্ট সংযুক্ত হলে আপনার নতুন বিজ্ঞপ্তি এখানে পাওয়া যাবে।",
                )}
              />
            )}
          </Modal>
        )}
      </div>
    </WorkspaceContext.Provider>
  );
}
