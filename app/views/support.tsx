import { Link } from "react-router";
import { useEffect, useState } from "react";
import { portal } from "../config";
import { useWorkspace } from "../components/shell";
import { Icon } from "../components/icon";
import { Badge, Empty, Modal, SectionTitle } from "../components/ui";
import { messages as previewMessages } from "../data/preview";
import { asRecords, initials } from "../lib/domain";
import type { PageData } from "../lib/types";
import { ConnectionState, PageIntro, Stats, Status, useRows } from "./common";

interface Message {
  id: string;
  from: string;
  body: string;
  time: string;
  internal?: boolean;
}
export function SupportInbox({ data }: { data: PageData }) {
  const { t, preview, call, notify, refresh } = useWorkspace();
  const rows = useRows(data);
  const [selected, setSelected] = useState(rows[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [compose, setCompose] = useState("");
  const [internal, setInternal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [thread, setThread] = useState<Message[]>([]);
  const [access, setAccess] = useState(false);
  const [purpose, setPurpose] = useState("");
  const team = portal.id === "team";
  const current = rows.find((r) => r.id === selected);
  const prefix = team ? "/admin/support/tickets" : "/support/tickets";
  useEffect(() => {
    if (!selected && rows.length) setSelected(rows[0].id);
  }, [rows, selected]);
  useEffect(() => {
    let active = true;
    setCompose("");
    setError("");
    setThread([]);
    if (!current) return;
    if (preview) {
      setThread(previewMessages);
      return;
    }
    setBusy(true);
    void call(`${prefix}/${current.id}/messages`)
      .then((result) => {
        if (!active) return;
        setThread(
          asRecords(result).map((m) => ({
            id: String(m.id),
            from: String(m.sender_type ?? "user"),
            body: String(m.body ?? ""),
            time:
              typeof m.created_at === "string"
                ? new Date(m.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "",
            internal: Boolean(m.internal_note),
          })),
        );
      })
      .catch((e) => {
        if (active) setError((e as Error).message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [selected, preview]);
  const send = async () => {
    if (!current || compose.trim().length < 1) return;
    setBusy(true);
    setError("");
    try {
      if (preview) {
        setThread((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            from: "agent",
            body: compose.trim(),
            time: "Preview",
            internal,
          },
        ]);
        notify(
          t(
            "Preview message added. Nothing was sent to a real person.",
            "প্রিভিউ বার্তা যোগ হয়েছে। বাস্তব কাউকে পাঠানো হয়নি।",
          ),
        );
      } else {
        await call(`${prefix}/${current.id}/messages`, "POST", {
          body: compose.trim(),
          internal_note: team && internal,
        });
        const result = await call(`${prefix}/${current.id}/messages`);
        setThread(
          asRecords(result).map((m) => ({
            id: String(m.id),
            from: String(m.sender_type ?? "user"),
            body: String(m.body ?? ""),
            time: String(m.created_at ?? ""),
            internal: Boolean(m.internal_note),
          })),
        );
        refresh();
      }
      setCompose("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const aiDraft = async () => {
    if (!current) return;
    setBusy(true);
    try {
      if (preview)
        setCompose(
          "Thank you for reaching out. I’m reviewing the details linked to your case and will help you understand the next step.",
        );
      else {
        const result = await call(
          `/admin/support/tickets/${current.id}/ai-draft`,
          "POST",
          {},
        );
        setCompose(String(result.draft ?? ""));
      }
      notify(
        t(
          "Draft only. Review and edit before sending.",
          "এটি খসড়া। পাঠানোর আগে যাচাই ও সম্পাদনা করুন।",
        ),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <SectionTitle
        title={t(
          team
            ? "Every conversation is a chance to help."
            : "A conversation makes things easier.",
          team ? "প্রতিটি কথোপকথন সহায়তার সুযোগ।" : "কথা বললেই অনেকটা সহজ হয়।",
        )}
        subtitle={t(
          team
            ? "Case-focused support with a human touch."
            : "Keep your questions and support conversations together.",
          team
            ? "নির্দিষ্ট কেসের তথ্য নিয়ে আন্তরিক সহায়তা।"
            : "আপনার প্রশ্ন ও সহায়তার কথোপকথন একসঙ্গে রাখুন।",
        )}
      />
      <ConnectionState data={data} />
      <div className={`inbox-layout ${team ? "inbox-with-context" : ""}`}>
        <section className="inbox-list panel">
          <div className="inbox-list-header">
            <h2>
              {t(
                team ? "Support inbox" : "Conversations",
                team ? "সহায়তা ইনবক্স" : "কথোপকথন",
              )}
              <Badge>{rows.length}</Badge>
            </h2>
            <label className="search-input">
              <Icon name="search" size={17} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("Search conversations…", "কথোপকথন খুঁজুন…")}
                aria-label="Search conversations"
              />
            </label>
          </div>
          <div className="inbox-threads">
            {rows
              .filter((r) =>
                (r.title + " " + r.person)
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((r) => (
                <button
                  className={`thread-preview ${selected === r.id ? "selected" : ""}`}
                  onClick={() => setSelected(r.id)}
                  key={r.id}
                >
                  <span className="avatar">{initials(r.person)}</span>
                  <span>
                    <span>
                      <strong>{r.person}</strong>
                      <small>{r.time}</small>
                    </span>
                    <b>{r.title}</b>
                    <span>
                      <small>{r.id.slice(0, 10)}</small>
                      <Status status={r.status} />
                    </span>
                  </span>
                </button>
              ))}
            {rows.length === 0 && (
              <Empty
                icon="message"
                title={t("A quieter inbox", "আপনার ইনবক্স")}
                description={t(
                  "Your authorized conversations appear here.",
                  "আপনার অনুমোদিত কথোপকথন এখানে দেখা যাবে।",
                )}
              />
            )}
          </div>
          <div className="inbox-list-footer">
            <Icon name="lock" size={13} />
            {t(
              "Access stays within this workspace",
              "তথ্য এই ওয়ার্কস্পেসের মধ্যে সীমিত",
            )}
          </div>
        </section>
        <section className="conversation-panel panel">
          {current ? (
            <>
              <header className="conversation-header">
                <span className="avatar avatar-large">
                  {initials(current.person)}
                </span>
                <div>
                  <h2>{current.person}</h2>
                  <span>{current.title}</span>
                </div>
                <Status status={current.status} />
              </header>
              <div className="conversation-reference">
                <Icon name="briefcase" size={15} />
                <span>
                  {current.id} · {current.subtitle}
                </span>
                {team && (
                  <button
                    className="text-button"
                    onClick={() => setAccess(true)}
                  >
                    <Icon name="shield" size={14} />
                    {t("Case access", "কেসের অনুমতি")}
                  </button>
                )}
              </div>
              <div className="message-thread" aria-live="polite">
                <div className="conversation-day">
                  {t(
                    preview ? "SAMPLE CONVERSATION" : "CASE CONVERSATION",
                    preview ? "নমুনা কথোপকথন" : "কেসের কথোপকথন",
                  )}
                </div>
                {busy && thread.length === 0 && (
                  <div className="loading-line">
                    {t("Loading messages…", "বার্তা লোড হচ্ছে…")}
                  </div>
                )}
                {thread.map((m) => (
                  <div
                    key={m.id}
                    className={`message-bubble ${["agent", "admin", "master_admin"].includes(m.from) ? "from-agent" : "from-customer"} ${m.internal ? "internal-message" : ""}`}
                  >
                    {m.internal && (
                      <strong>
                        <Icon name="lock" size={12} />
                        {t("Internal note", "অভ্যন্তরীণ নোট")}
                      </strong>
                    )}
                    <p>{m.body}</p>
                    <small>
                      {m.time}
                      {["agent", "admin"].includes(m.from) && (
                        <Icon name="check" size={12} />
                      )}
                    </small>
                  </div>
                ))}
                {!busy && !thread.length && !error && (
                  <Empty
                    icon="message"
                    title={t(
                      "Start with a helpful message",
                      "সহায়ক বার্তা দিয়ে শুরু করুন",
                    )}
                    description={t(
                      "Messages are shown only for the selected case.",
                      "শুধু নির্বাচিত কেসের বার্তা দেখানো হয়।",
                    )}
                  />
                )}
              </div>
              <div className="composer">
                {error && (
                  <div className="notice error" role="alert">
                    {error}
                  </div>
                )}
                {team && (
                  <div className="composer-tools">
                    <button
                      className="text-button"
                      disabled={busy}
                      onClick={() => void aiDraft()}
                    >
                      <Icon name="sparkles" size={15} />
                      {t("Draft with AI", "এআই দিয়ে খসড়া")}
                    </button>
                    <label className="checkbox-inline">
                      <input
                        type="checkbox"
                        checked={internal}
                        onChange={(e) => setInternal(e.target.checked)}
                      />
                      {t("Internal note", "অভ্যন্তরীণ নোট")}
                    </label>
                    <span>
                      {t("Human review required", "মানুষের যাচাই প্রয়োজন")}
                    </span>
                  </div>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void send();
                  }}
                >
                  <textarea
                    value={compose}
                    onChange={(e) => setCompose(e.target.value)}
                    placeholder={t(
                      "Write a thoughtful reply…",
                      "আপনার উত্তর লিখুন…",
                    )}
                    maxLength={4000}
                    aria-label={t("Your message", "আপনার বার্তা")}
                  />
                  <button
                    className="button primary"
                    disabled={busy || !compose.trim()}
                  >
                    <Icon name="send" size={17} />
                    {t(
                      busy
                        ? "Sending…"
                        : preview
                          ? "Add preview reply"
                          : "Send reply",
                      busy
                        ? "পাঠানো হচ্ছে…"
                        : preview
                          ? "প্রিভিউ উত্তর দিন"
                          : "উত্তর পাঠান",
                    )}
                  </button>
                </form>
                <p>
                  {t(
                    preview
                      ? "Preview only · no real message will be delivered."
                      : "Replies are sent only after Ringdo confirms the selected case and your permission.",
                    preview
                      ? "শুধু প্রিভিউ · বাস্তবে কোনো বার্তা পৌঁছাবে না।"
                      : "নির্বাচিত কেস ও আপনার অনুমতি নিশ্চিত হলে উত্তর পাঠানো হবে।",
                  )}
                </p>
              </div>
            </>
          ) : (
            <Empty
              icon="message"
              title={t("Choose a conversation", "একটি কথোপকথন বেছে নিন")}
              description={t(
                "The details and messages will open here.",
                "বিবরণ ও বার্তাগুলো এখানে খুলবে।",
              )}
            />
          )}
        </section>
        {team && (
          <aside className="case-context panel">
            <div className="panel-heading">
              <h2>{t("Case context", "কেসের বিবরণ")}</h2>
              <Icon name="shield" size={17} />
            </div>
            {current ? (
              <>
                <div className="case-person">
                  <span className="avatar avatar-large">
                    {initials(current.person)}
                  </span>
                  <h3>{current.person}</h3>
                  <Badge tone="neutral">
                    {t("Case-linked requester", "কেস-সংযুক্ত আবেদনকারী")}
                  </Badge>
                </div>
                <dl className="context-fields">
                  <div>
                    <dt>{t("Reference", "নম্বর")}</dt>
                    <dd>{current.id.slice(0, 12)}</dd>
                  </div>
                  <div>
                    <dt>{t("Category", "বিভাগ")}</dt>
                    <dd>{current.category}</dd>
                  </div>
                  <div>
                    <dt>{t("Contact information", "যোগাযোগের তথ্য")}</dt>
                    <dd>
                      <Icon name="lock" size={12} />
                      {preview
                        ? "+880 17•• ••••64"
                        : t("Restricted", "সীমিত প্রবেশাধিকার")}
                    </dd>
                  </div>
                  <div>
                    <dt>{t("Exact location", "সঠিক অবস্থান")}</dt>
                    <dd>
                      <Icon name="lock" size={12} />
                      {t("Separate access required", "আলাদা অনুমতি প্রয়োজন")}
                    </dd>
                  </div>
                </dl>
                <div className="context-privacy">
                  <Icon name="lock" size={20} />
                  <strong>
                    {t("Private by design", "গোপনীয়তা বজায় রাখুন")}
                  </strong>
                  <p>
                    {t(
                      "Assigned cases, a valid purpose and independent permission protect customer information.",
                      "দায়িত্বপ্রাপ্ত কেস, সঠিক উদ্দেশ্য ও আলাদা অনুমতি ক্রেতার তথ্য সুরক্ষিত রাখে।",
                    )}
                  </p>
                  <button
                    className="button secondary full"
                    onClick={() => setAccess(true)}
                  >
                    {t("View access requirements", "অনুমতির নিয়ম দেখুন")}
                  </button>
                </div>
              </>
            ) : (
              <Empty
                title={t("No case selected", "কেস নির্বাচন করা হয়নি")}
                description={t(
                  "Choose a case to see its permitted context.",
                  "অনুমোদিত বিবরণ দেখতে একটি কেস বেছে নিন।",
                )}
              />
            )}
          </aside>
        )}
      </div>
      {access && (
        <Modal
          title={t("Case-scoped access", "নির্দিষ্ট কেসে প্রবেশাধিকার")}
          onClose={() => setAccess(false)}
        >
          <div className="scope-box">
            <Icon name="shield" />
            <p>
              {t(
                "Private profile, location and buyer–seller conversations require an independent, time-limited grant and a recorded purpose. Your supervisor must authorize the relevant scope.",
                "ব্যক্তিগত প্রোফাইল, অবস্থান এবং ক্রেতা–বিক্রেতার কথোপকথন দেখতে সময়সীমাসহ আলাদা অনুমোদন ও উদ্দেশ্য দরকার। দায়িত্বপ্রাপ্ত সুপারভাইজার অনুমতি দেবেন।",
              )}
            </p>
          </div>
          <label className="field">
            <span>{t("Case access purpose", "কেস দেখার উদ্দেশ্য")}</span>
            <textarea
              value={purpose}
              minLength={12}
              maxLength={500}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </label>
          <button
            className="button secondary full"
            disabled={!preview || purpose.trim().length < 12}
            onClick={() => {
              notify(
                t(
                  "Preview purpose recorded. No private data access was granted.",
                  "প্রিভিউতে উদ্দেশ্য লেখা হয়েছে। ব্যক্তিগত তথ্যে প্রবেশাধিকার দেওয়া হয়নি।",
                ),
              );
              setAccess(false);
            }}
          >
            {t("Record preview purpose", "প্রিভিউ উদ্দেশ্য লিখুন")}
          </button>
        </Modal>
      )}
    </>
  );
}
export function TeamOverview({ data }: { data: PageData }) {
  const { t, href, preview } = useWorkspace();
  return (
    <>
      <PageIntro />
      <ConnectionState data={data} />
      <Stats
        items={[
          {
            label: ["Open cases", "চলমান কেস"],
            value: "12",
            note: ["4 assigned to you", "৪টি আপনার দায়িত্বে"],
            icon: "inbox",
            values: [6, 4, 5, 3, 4, 2, 3],
          },
          {
            label: ["Awaiting a reply", "উত্তরের অপেক্ষায়"],
            value: "3",
            note: ["Keep the conversation moving", "যোগাযোগ চালিয়ে যান"],
            icon: "message",
            values: [4, 3, 2, 3, 2, 1, 3],
          },
          {
            label: ["Resolved this week", "সপ্তাহে সমাধান"],
            value: "48",
            note: ["Sample team activity", "দলের নমুনা কার্যক্রম"],
            trend: "+16%",
            icon: "check-circle",
            values: [3, 4, 4, 5, 6, 7, 8],
          },
          {
            label: ["First response", "প্রথম উত্তর"],
            value: "4 min",
            note: ["Sample response time", "উত্তরের নমুনা সময়"],
            icon: "clock",
            values: [8, 7, 8, 6, 5, 6, 4],
          },
        ]}
      />
      <div className="team-welcome panel">
        <span className="team-art">
          <Icon name="headphones" size={68} />
          <i />
          <b />
        </span>
        <div>
          <Badge tone="purple">
            {t("A LITTLE CARE GOES A LONG WAY", "একটু যত্নেই অনেক পরিবর্তন")}
          </Badge>
          <h2>
            {t(
              "Behind every case is someone’s day.",
              "প্রতিটি কেসের পেছনে একজন মানুষের দিন।",
            )}
          </h2>
          <p>
            {t(
              "See the relevant context, listen carefully and help people move forward.",
              "প্রয়োজনীয় তথ্য দেখুন, মন দিয়ে শুনুন, সমাধানে এগিয়ে নিন।",
            )}
          </p>
          <Link to={href("/workspace/inbox")} className="button primary">
            {t("Go to support inbox", "সহায়তা ইনবক্সে যান")}
            <Icon name="arrow" size={16} />
          </Link>
        </div>
      </div>
      <SupportInbox data={data} />
    </>
  );
}
