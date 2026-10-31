import { useState } from "react";
import { portal } from "../config";
import { useWorkspace } from "../components/shell";
import { Icon } from "../components/icon";
import { Badge, Empty, SectionTitle } from "../components/ui";
import { ConnectionState, RecordsTable, useRows } from "./common";
import type { PageData } from "../lib/types";
import { money } from "../lib/domain";

export function SettingsView({ data }: { data: PageData }) {
  const { t, preview, user, notify, call, refresh } = useWorkspace();
  const [name, setName] = useState(
    user?.name ?? (preview ? "Preview Member" : ""),
  );
  const [busy, setBusy] = useState(false);
  return (
    <>
      <SectionTitle
        title={t("Make this workspace yours.", "ওয়ার্কস্পেস হোক আপনার মতো।")}
        subtitle={t(
          "Your profile and personal preferences stay separate from business approvals.",
          "আপনার প্রোফাইল ও ব্যক্তিগত পছন্দ ব্যবসার অনুমোদন থেকে আলাদা থাকে।",
        )}
      />
      <ConnectionState data={data} />
      <div className="settings-layout">
        <section className="panel settings-form">
          <div className="panel-heading">
            <h2>{t("Profile details", "প্রোফাইলের তথ্য")}</h2>
            <Icon name="users" />
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                if (preview)
                  notify(
                    t(
                      "Preview profile updated.",
                      "প্রিভিউ প্রোফাইল বদলানো হয়েছে।",
                    ),
                  );
                else {
                  await call("/users/me", "PUT", { name });
                  refresh();
                  notify(t("Profile saved.", "প্রোফাইল সংরক্ষণ হয়েছে।"));
                }
              } catch (e) {
                notify((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="field">
              <span>{t("Your name", "আপনার নাম")}</span>
              <input
                required
                minLength={2}
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <div className="form-grid">
              <label className="field">
                <span>{t("Country workspace", "দেশের ওয়ার্কস্পেস")}</span>
                <input value={user?.country_code ?? "BD"} readOnly />
              </label>
              <label className="field">
                <span>{t("Workspace type", "ওয়ার্কস্পেসের ধরন")}</span>
                <input value={portal.name} readOnly />
              </label>
            </div>
            <p className="form-note">
              {t(
                "Changing a country, business category or privileged role requires its own authorized process.",
                "দেশ, ব্যবসার বিভাগ বা বিশেষ দায়িত্ব পরিবর্তনের জন্য আলাদা অনুমোদনের নিয়ম প্রযোজ্য।",
              )}
            </p>
            <button
              className="button primary"
              disabled={busy || (!preview && !user)}
            >
              {t(
                busy
                  ? "Saving…"
                  : preview
                    ? "Save preview profile"
                    : "Save profile",
                busy
                  ? "সংরক্ষণ হচ্ছে…"
                  : preview
                    ? "প্রিভিউ প্রোফাইল সংরক্ষণ"
                    : "প্রোফাইল সংরক্ষণ",
              )}
            </button>
          </form>
        </section>
        <section className="panel preferences-card">
          <span className="preference-art">
            <Icon name="settings" size={50} />
          </span>
          <h2>{t("Comfortably familiar.", "আপনার পছন্দমতো।")}</h2>
          <p>
            {t(
              "Use the language and appearance controls in the top bar to switch Bengali / English and light / dark views. Preferences are kept on this device.",
              "উপরের মেনু থেকে বাংলা / ইংরেজি ও হালকা / গাঢ় থিম বদলান। পছন্দ এই ডিভাইসে থাকে।",
            )}
          </p>
          <div className="scope-box">
            <Icon name="shield" />
            <span>
              {t(
                "Global brand themes and country policies are managed by authorized Ringdo administrators.",
                "বৈশ্বিক ব্র্যান্ড থিম ও দেশের নীতি অনুমোদিত প্রশাসকেরা পরিচালনা করেন।",
              )}
            </span>
          </div>
        </section>
      </div>
    </>
  );
}
export function StorefrontView({ data }: { data: PageData }) {
  const { t, preview, notify } = useWorkspace();
  return (
    <>
      <SectionTitle
        title={t(
          "A welcoming front door for your business.",
          "আপনার ব্যবসার আন্তরিক পরিচয়।",
        )}
        subtitle={t(
          "Help local customers understand your store and opening hours.",
          "দোকান ও খোলার সময় সম্পর্কে ক্রেতাকে জানাতে সাহায্য করুন।",
        )}
      />
      <ConnectionState data={data} />
      <div className="storefront-preview">
        <div className="storefront-canopy">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="storefront-sign">
          <span>
            <Icon name="store" size={50} />
          </span>
          <div>
            <Badge tone="green">{t("SAMPLE STOREFRONT", "নমুনা দোকান")}</Badge>
            <h2>Neighbourhood Fresh</h2>
            <p>
              {t(
                "Everyday essentials, right around the corner.",
                "দৈনন্দিন প্রয়োজন, পাড়ার দোকানেই।",
              )}
            </p>
          </div>
        </div>
      </div>
      <section className="panel settings-form">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            notify(
              t(
                "Preview storefront saved. No live store was changed.",
                "প্রিভিউ দোকান সংরক্ষিত। বাস্তব দোকান বদলানো হয়নি।",
              ),
            );
          }}
        >
          <div className="form-grid">
            <label className="field">
              <span>{t("Store name", "দোকানের নাম")}</span>
              <input
                required
                defaultValue={preview ? "Neighbourhood Fresh" : ""}
              />
            </label>
            <label className="field">
              <span>
                {t("Public business address", "দোকানের প্রকাশযোগ্য ঠিকানা")}
              </span>
              <input
                required
                defaultValue={preview ? "Sample market area · Pabna" : ""}
              />
            </label>
          </div>
          <label className="field">
            <span>{t("Store description", "দোকানের বিবরণ")}</span>
            <textarea
              defaultValue={
                preview
                  ? "Fresh essentials, friendly service and a little local care."
                  : ""
              }
              maxLength={1000}
            />
          </label>
          <div className="form-grid">
            <label className="field">
              <span>{t("Opens at", "খোলার সময়")}</span>
              <input type="time" defaultValue="08:00" />
            </label>
            <label className="field">
              <span>{t("Closes at", "বন্ধের সময়")}</span>
              <input type="time" defaultValue="21:00" />
            </label>
          </div>
          <button className="button primary" disabled={!preview}>
            {t("Save preview storefront", "প্রিভিউ দোকান সংরক্ষণ")}
          </button>
        </form>
      </section>
    </>
  );
}
export function ScheduleView({ data }: { data: PageData }) {
  const { t, preview, href } = useWorkspace();
  const rows = useRows(data);
  return (
    <>
      <SectionTitle
        title={t(
          "A little structure for a better day.",
          "পরিকল্পনায় সহজ হোক দিন।",
        )}
        subtitle={t(
          "Review confirmed work before making availability commitments.",
          "সময় দেওয়ার আগে নিশ্চিত কাজগুলো দেখুন।",
        )}
      />
      <ConnectionState data={data} />
      <div className="week-strip">
        {["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => (
          <div key={day} className={i === 2 ? "today" : ""}>
            <small>{day}</small>
            <strong>{preview ? 25 + i : "—"}</strong>
            <span>{preview && i === 2 ? <i /> : null}</span>
          </div>
        ))}
      </div>
      <RecordsTable
        rows={rows}
        title={t("Your upcoming work", "আপনার আসন্ন কাজ")}
      />
    </>
  );
}
export function VerificationView({ data }: { data: PageData }) {
  const { t, preview } = useWorkspace();
  return (
    <>
      <SectionTitle
        title={t(
          "Trust starts with the right details.",
          "সঠিক তথ্য থেকেই বিশ্বাসের শুরু।",
        )}
        subtitle={t(
          "Requirements depend on your country, category and approved workspace.",
          "দেশ, কাজের বিভাগ ও ওয়ার্কস্পেস অনুযায়ী শর্ত আলাদা।",
        )}
      />
      <ConnectionState data={data} />
      <div className="verification-grid">
        {[
          ["users", "Identity review", "পরিচয় যাচাই"],
          [
            portal.id === "driver" ? "car" : "tool",
            portal.id === "driver"
              ? "Vehicle and driving eligibility"
              : "Primary category and skills",
            portal.id === "driver"
              ? "গাড়ি ও চালনার যোগ্যতা"
              : "মূল পেশা ও দক্ষতা",
          ],
          ["file", "Country-specific documents", "দেশ অনুযায়ী কাগজপত্র"],
          ["shield", "Independent approval", "স্বাধীন অনুমোদন"],
        ].map(([icon, en, bn], i) => (
          <section className="panel verification-card" key={en}>
            <span className="verification-icon">
              <Icon name={icon} size={30} />
            </span>
            <Badge tone={preview && i === 0 ? "green" : "amber"}>
              {t(
                preview && i === 0 ? "Sample complete" : "Review required",
                preview && i === 0 ? "নমুনা সম্পন্ন" : "যাচাই প্রয়োজন",
              )}
            </Badge>
            <h2>{t(en, bn)}</h2>
            <p>
              {t(
                "Sensitive evidence is submitted only through an approved secure process.",
                "সংবেদনশীল কাগজপত্র শুধু অনুমোদিত নিরাপদ ব্যবস্থায় জমা দিতে হবে।",
              )}
            </p>
          </section>
        ))}
      </div>
      <div className="scope-box">
        <Icon name="lock" />
        <p>
          {t(
            "A preview is not verification. Documents, skills and permitted categories must be independently reviewed before work is enabled.",
            "প্রিভিউ মানেই যাচাইকরণ নয়। কাজ চালুর আগে কাগজপত্র, দক্ষতা ও বিভাগের অনুমতি আলাদাভাবে যাচাই করতে হবে।",
          )}
        </p>
      </div>
    </>
  );
}
export function WalletView({ data }: { data: PageData }) {
  const { t, preview } = useWorkspace();
  const balance = preview
    ? 245000
    : typeof data.detail.balance === "number"
      ? Math.round(data.detail.balance * 100)
      : null;
  return (
    <>
      <SectionTitle
        title={t("Your service wallet", "আপনার সার্ভিস ওয়ালেট")}
        subtitle={t(
          "For supported service payments only. Shop orders are paid directly to merchants.",
          "অনুমোদিত সেবার পেমেন্টের জন্য। দোকানের অর্ডারের টাকা সরাসরি দোকানিকে দিন।",
        )}
      />
      <ConnectionState data={data} />
      <section className="wallet-hero">
        <div>
          <span>
            {t("Available service balance", "সেবার জন্য থাকা ব্যালেন্স")}
          </span>
          <strong>{balance === null ? "—" : money(balance)}</strong>
          <p>
            {t(
              "Only server-confirmed funds appear as available.",
              "শুধু সার্ভার নিশ্চিত করা টাকা ব্যালেন্সে দেখায়।",
            )}
          </p>
        </div>
        <Icon name="wallet" size={90} />
      </section>
      <div className="scope-box">
        <Icon name="shield" />
        <p>
          {t(
            "Top-ups, payouts and refunds require the approved payment provider and country policy. No money is transferred from this preview.",
            "টাকা যোগ, উত্তোলন ও ফেরতে অনুমোদিত পেমেন্ট মাধ্যম এবং দেশের নীতি প্রযোজ্য। এই প্রিভিউ থেকে টাকা পাঠানো হয় না।",
          )}
        </p>
      </div>
    </>
  );
}
export function InformationalView({ data }: { data: PageData }) {
  const { t, language, preview, notify } = useWorkspace();
  const title =
    portal.nav.find((n) => n.id === data.section)?.title[language] ??
    t("Workspace", "ওয়ার্কস্পেস");
  return (
    <>
      <SectionTitle
        title={title}
        subtitle={t(
          "The right information, within your workspace.",
          "আপনার ওয়ার্কস্পেসের প্রয়োজনীয় তথ্য।",
        )}
      />
      <ConnectionState data={data} />
      {data.section === "knowledge" ? (
        <div className="knowledge-grid">
          {[
            [
              "Clear service pricing",
              "How to explain fixed prices, diagnosis and approved extras.",
            ],
            [
              "Merchant-direct payments",
              "Recognising buyer reports and merchant confirmations.",
            ],
            [
              "Case privacy and access",
              "Keep customer information within an authorized case.",
            ],
          ].map(([name, detail]) => (
            <button
              className="panel knowledge-card"
              key={name}
              onClick={() =>
                notify(
                  t(
                    preview
                      ? `${name} — sample guidance. Always follow the approved country policy.`
                      : "Your authorized knowledge article will open once available.",
                    preview
                      ? `${name} — নমুনা নির্দেশনা। অনুমোদিত দেশের নীতি অনুসরণ করুন।`
                      : "অনুমোদিত সহায়িকা পাওয়া গেলে খোলা যাবে।",
                  ),
                )
              }
            >
              <Icon name="book" size={25} />
              <h2>{name}</h2>
              <p>{detail}</p>
              <span className="text-button">
                {t("Read guidance", "নির্দেশনা পড়ুন")}
                <Icon name="arrow" size={15} />
              </span>
            </button>
          ))}
        </div>
      ) : data.section === "safety" ? (
        <div className="safety-panel panel">
          <Icon name="shield" size={60} />
          <h2>
            {t(
              "Safety comes before the next trip.",
              "পরের ট্রিপের আগে নিরাপত্তা।",
            )}
          </h2>
          <p>
            {t(
              "Review the approved local incident and emergency process. An alert is successful only after acknowledged delivery; this preview never dispatches emergency help.",
              "অনুমোদিত স্থানীয় জরুরি সহায়তা ও ঘটনার নিয়ম দেখুন। নিশ্চিত পৌঁছানোর পরেই সতর্কবার্তা সফল বলা যায়; এই প্রিভিউ জরুরি সহায়তা পাঠায় না।",
            )}
          </p>
        </div>
      ) : (
        <Empty
          icon={portal.nav.find((n) => n.id === data.section)?.icon ?? "layers"}
          title={t("Room for what comes next", "পরবর্তী কার্যক্রমের জায়গা")}
          description={t(
            "Authorized records and actions will appear here when your workspace is connected.",
            "ওয়ার্কস্পেস সংযুক্ত হলে অনুমোদিত তথ্য ও কার্যক্রম এখানে দেখা যাবে।",
          )}
        />
      )}
    </>
  );
}
