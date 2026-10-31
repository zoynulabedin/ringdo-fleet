import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useWorkspace } from "../components/shell";
import { Icon } from "../components/icon";
import { Badge, Empty, Modal, SectionTitle } from "../components/ui";
import { LivingMap } from "../components/living-map";
import {
  sellers as examples,
  categoryOptions,
  type Seller,
} from "../data/preview";
import { eligibleSeller, money, RADAR_METRES, validPoint } from "../lib/domain";
import type { PageData } from "../lib/types";
import { PageIntro, ConnectionState, RecordsTable, useRows } from "./common";

export function CustomerExplore({ data }: { data: PageData }) {
  const { t, language, preview, href, notify, setRows } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState<Seller | null>(null);
  const [panel, setPanel] = useState<"details" | "booking" | "store" | "cart">(
    "details",
  );
  const [cart, setCart] = useState<Record<string, number>>({});
  const [locationModal, setLocationModal] = useState(false);
  const [view, setView] = useState<"map" | "list">("map");
  const [address, setAddress] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const { products } = useWorkspace();
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next);
  };
  const liveSellers: Seller[] = data.entries.map((p, i) => ({
    id: String(p.user_id ?? p.id ?? i),
    name: {
      en: String(p.name ?? "Service professional"),
      bn: String(p.name ?? "সেবাদাতা"),
    },
    category: String(
      p.category ?? p.primary_category ?? p.service_name_key ?? "service",
    ),
    kind: "professional",
    icon: "tool",
    detail: {
      en: String(
        p.service_name_key ?? p.category ?? "Local service",
      ).replaceAll("_", " "),
      bn: String(p.service_name_key ?? p.category ?? "এলাকার সেবা").replaceAll(
        "_",
        " ",
      ),
    },
    distance: Number(p.distance_km ?? Infinity) * 1000,
    rating: Number(p.rating ?? 0),
    reviews: Number(p.total_reviews ?? 0),
    price: 0,
    available: true,
    covered: true,
    x: 50,
    y: 50,
    color: "#a6b5a5",
    ...(validPoint(p.lat, p.lng) ?? {}),
  }));
  const candidates = (preview ? examples : liveSellers)
    .filter((s) =>
      eligibleSeller(s.distance, data.filters.radius, s.covered, s.available),
    )
    .filter(
      (s) =>
        data.filters.category === "all" ||
        s.category.toLowerCase().includes(data.filters.category.toLowerCase()),
    )
    .filter((s) =>
      (s.name.en + " " + s.name.bn + " " + s.detail.en + " " + s.detail.bn)
        .toLowerCase()
        .includes(data.filters.query.toLowerCase()),
    );
  const pick = (seller: Seller) => {
    setSelected(seller);
    setPanel("details");
    setConfirmed(false);
    setAddress("");
  };
  const nextRadar = RADAR_METRES.find((r) => r > data.filters.radius);
  const cartTotal = products.reduce(
    (n, p) => n + p.price * (cart[p.id] ?? 0),
    0,
  );
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const finish = () => {
    if (!preview) return;
    const shop = panel === "cart";
    const total = shop ? cartTotal : (selected?.price ?? 0);
    const id = `DEMO-${Date.now().toString().slice(-5)}`;
    setRows((rows) => [
      {
        id,
        title: shop
          ? "Neighbourhood shop order"
          : (selected?.detail.en ?? "Service request"),
        subtitle: selected?.name.en ?? "",
        status: shop ? "new" : "pending",
        amount: total,
        time: "Just now · preview",
        person: "Sample customer",
        category: shop ? "Shop order" : "Service booking",
        payment: shop ? "unpaid" : undefined,
      },
      ...rows,
    ]);
    notify(
      t(
        "Preview request created. No real booking, payment or order was sent.",
        "প্রিভিউ অনুরোধ তৈরি হয়েছে। বাস্তব বুকিং, পেমেন্ট বা অর্ডার পাঠানো হয়নি।",
      ),
    );
    setSelected(null);
    setCart({});
  };
  return (
    <>
      <PageIntro />
      <ConnectionState data={data} />
      <div className="explore-search">
        <button
          className="location-select"
          onClick={() => setLocationModal(true)}
        >
          <span className="location-icon">
            <Icon name="location" size={20} />
          </span>
          <span>
            <small>{t("LOOKING AROUND", "খোঁজার এলাকা")}</small>
            <strong>
              {preview
                ? t("Sample area · Pabna", "নমুনা এলাকা · পাবনা")
                : data.filters.point
                  ? t("Selected search area", "নির্বাচিত খোঁজার এলাকা")
                  : t("Choose your location", "আপনার জায়গা নির্বাচন করুন")}
            </strong>
          </span>
          <Icon name="down" size={15} />
        </button>
        <label className="explore-query">
          <Icon name="search" size={22} />
          <input
            aria-label={t(
              "Search nearby services and shops",
              "কাছাকাছি সেবা ও দোকান খুঁজুন",
            )}
            placeholder={t("What do you need nearby?", "কাছাকাছি কী খুঁজছেন?")}
            value={data.filters.query}
            onChange={(e) => update("q", e.target.value)}
          />
        </label>
        <button
          className="button secondary filter-button"
          onClick={() => setView(view === "map" ? "list" : "map")}
        >
          <Icon name={view === "map" ? "layers" : "compass"} size={18} />
          {t(
            view === "map" ? "List view" : "Map view",
            view === "map" ? "তালিকা" : "ম্যাপ",
          )}
        </button>
      </div>
      <div
        className="category-row"
        role="group"
        aria-label="Service categories"
      >
        {categoryOptions.map((c) => (
          <button
            key={c.id}
            className={`category-chip ${data.filters.category === c.id ? "selected" : ""}`}
            onClick={() => update("category", c.id)}
          >
            <Icon name={c.icon} size={17} />
            {c.title[language]}
          </button>
        ))}
        <span className="category-divider" />
        <span className="muted-text category-hint">
          {t(
            "One neighbourhood. Many possibilities.",
            "এক এলাকায় অসংখ্য সম্ভাবনা।",
          )}
        </span>
      </div>
      <section
        className={`explore-layout ${view === "list" ? "list-mode" : ""}`}
      >
        <div className="nearby-panel">
          <div className="nearby-heading">
            <div>
              <h2>{t("Good finds, close by", "কাছের ভালো ঠিকানা")}</h2>
              <span>
                {candidates.length}{" "}
                {t("matches in your radar", "টি ঠিকানা আপনার রাডারে")}
              </span>
            </div>
            <Icon name="filter" size={19} />
          </div>
          <div className="radar-picker">
            <span>
              <Icon name="radar" size={15} />
              {t("Your radar", "আপনার রাডার")}
            </span>
            <div>
              {RADAR_METRES.map((r) => (
                <button
                  key={r}
                  className={r === data.filters.radius ? "active" : ""}
                  onClick={() => update("radius", String(r))}
                  aria-pressed={r === data.filters.radius}
                >
                  {r === 500 ? "500m" : r / 1000 + "km"}
                </button>
              ))}
            </div>
          </div>
          <div className="seller-list">
            {candidates.length ? (
              candidates.map((s) => (
                <button
                  className={`seller-card ${selected?.id === s.id ? "seller-selected" : ""}`}
                  key={s.id}
                  onClick={() => pick(s)}
                >
                  <span
                    className="seller-avatar"
                    style={{ background: s.color + "25", color: s.color }}
                  >
                    <Icon name={s.icon} size={27} />
                  </span>
                  <span className="seller-info">
                    <span className="seller-heading">
                      <strong>{s.name[language]}</strong>
                      {preview && <Icon name="shield" size={14} />}
                    </span>
                    <span>{s.detail[language]}</span>
                    <span className="seller-meta">
                      {s.reviews > 0 && (
                        <>
                          <Icon name="star" size={12} />
                          <b>{s.rating.toFixed(1)}</b>
                          <small>({s.reviews})</small>
                          <i />
                        </>
                      )}
                      {s.distance < 1000
                        ? s.distance + "m"
                        : (s.distance / 1000).toFixed(1) + "km"}
                      <i />
                      <span className="seller-open">
                        {t("Available", "পাওয়া যাচ্ছে")}
                      </span>
                    </span>
                    {s.price > 0 && (
                      <span className="seller-price">
                        {money(s.price)}{" "}
                        <small>
                          {t(
                            s.category === "plumbing"
                              ? "inspection fee"
                              : "starting labour price",
                            s.category === "plumbing"
                              ? "পরিদর্শন ফি"
                              : "প্রাথমিক মজুরি",
                          )}
                        </small>
                      </span>
                    )}
                  </span>
                  <Icon name="arrow" size={15} />
                </button>
              ))
            ) : (
              <Empty
                icon="radar"
                title={t(
                  "Nothing within this radar yet",
                  "এই রাডারে এখনো কাউকে পাওয়া যায়নি",
                )}
                description={t(
                  "Try a different category or expand the radar yourself. Your search never expands automatically.",
                  "অন্য বিভাগ দেখুন অথবা নিজেই রাডার বাড়ান। আপনার অনুমতি ছাড়া রাডার বাড়বে না।",
                )}
                action={
                  nextRadar ? (
                    <button
                      className="button primary"
                      onClick={() => update("radius", String(nextRadar))}
                    >
                      {t(
                        `Expand to ${nextRadar / 1000} km`,
                        `${nextRadar / 1000} কিমি পর্যন্ত বাড়ান`,
                      )}
                    </button>
                  ) : (
                    <button
                      className="button secondary"
                      onClick={() => update("category", "all")}
                    >
                      {t("Show all categories", "সব বিভাগ দেখুন")}
                    </button>
                  )
                }
              />
            )}
          </div>
          <div className="nearby-footnote">
            <Icon name="shield" size={15} />
            {t(
              "Your radar, your control. Travel coverage is checked separately.",
              "রাডারের নিয়ন্ত্রণ আপনার হাতে। সেবা দেওয়ার এলাকা আলাদাভাবে যাচাই হয়।",
            )}
          </div>
        </div>
        {view === "map" && (
          <LivingMap
            sellers={candidates}
            selected={selected?.id ?? null}
            onSelect={pick}
            radius={data.filters.radius}
            point={data.filters.point}
            onPoint={(p) => {
              if (preview) {
                setLocationModal(true);
                return;
              }
              const q = new URLSearchParams(params);
              q.set("lat", String(p.lat));
              q.set("lng", String(p.lng));
              setParams(q);
            }}
          />
        )}
      </section>
      <div className="benefits-row">
        <div>
          <span>
            <Icon name="location" />
          </span>
          <strong>{t("Truly local", "সত্যিই আপনার এলাকার")}</strong>
          <p>
            {t(
              "Discover within the distance you choose.",
              "আপনার নির্ধারিত দূরত্বের মধ্যেই খুঁজুন।",
            )}
          </p>
        </div>
        <div>
          <span>
            <Icon name="shield" />
          </span>
          <strong>{t("Clear from the start", "শুরু থেকেই স্বচ্ছ")}</strong>
          <p>
            {t(
              "Understand the scope and price before you agree.",
              "সম্মতির আগেই কাজ ও খরচ বুঝে নিন।",
            )}
          </p>
        </div>
        <div>
          <span>
            <Icon name="message" />
          </span>
          <strong>{t("A little more human", "মানুষের পাশে মানুষ")}</strong>
          <p>
            {t(
              "Conversations and support when you need them.",
              "প্রয়োজনে যোগাযোগ ও সহায়তা পান।",
            )}
          </p>
        </div>
      </div>
      {selected && (
        <Modal
          title={selected.name[language]}
          onClose={() => setSelected(null)}
          wide={panel === "store"}
        >
          {panel === "details" ? (
            <>
              <div className="provider-detail-hero">
                <span
                  style={{
                    background: selected.color + "25",
                    color: selected.color,
                  }}
                >
                  <Icon name={selected.icon} size={38} />
                </span>
                <div>
                  <Badge tone="green">
                    {t(
                      preview ? "Sample verified profile" : "Local service",
                      preview ? "নমুনা যাচাইকৃত প্রোফাইল" : "এলাকার সেবা",
                    )}
                  </Badge>
                  <h3>{selected.detail[language]}</h3>
                  <p>
                    {selected.distance}m ·{" "}
                    {selected.reviews
                      ? `${selected.rating} / 5 · ${selected.reviews} reviews`
                      : t(
                          "Review information unavailable",
                          "রিভিউয়ের তথ্য পাওয়া যায়নি",
                        )}
                  </p>
                </div>
              </div>
              <div className="scope-box">
                <Icon name="check-circle" />
                <div>
                  <strong>
                    {t("Agree on the details first", "আগেই বিস্তারিত ঠিক করুন")}
                  </strong>
                  <p>
                    {t(
                      "Ordinary travel within committed home-service coverage is included. Extra materials or work need your approval.",
                      "সেবাদাতার নির্ধারিত এলাকার সাধারণ যাতায়াত মজুরির অন্তর্ভুক্ত। বাড়তি উপকরণ বা কাজের জন্য আপনার অনুমোদন লাগবে।",
                    )}
                  </p>
                </div>
              </div>
              <div className="modal-actions">
                <button
                  className="button primary"
                  onClick={() =>
                    setPanel(
                      selected.kind === "professional" ? "booking" : "store",
                    )
                  }
                >
                  {t(
                    selected.kind === "professional"
                      ? "Review service request"
                      : "Open storefront",
                    selected.kind === "professional"
                      ? "সেবার অনুরোধ দেখুন"
                      : "দোকান খুলুন",
                  )}
                  <Icon name="arrow" size={17} />
                </button>
              </div>
            </>
          ) : panel === "store" ? (
            <>
              <div className="storefront-intro">
                <span>
                  <Badge tone="green">
                    {t("Open in preview", "প্রিভিউতে খোলা")}
                  </Badge>
                  <h3>
                    {t(
                      "Everyday essentials, thoughtfully local.",
                      "প্রতিদিনের প্রয়োজন, পাড়ার দোকান থেকেই।",
                    )}
                  </h3>
                  <p>
                    {t(
                      "Pay this merchant directly. Ringdo does not hold your shop payment.",
                      "সরাসরি দোকানিকে পেমেন্ট করুন। রিংডো দোকানের পেমেন্ট নিজের কাছে রাখে না।",
                    )}
                  </p>
                </span>
                <Icon name="store" size={70} />
              </div>
              <div className="product-grid customer-products">
                {(preview ? products : []).map((p) => (
                  <div key={p.id} className="product-card">
                    <div
                      className="product-art"
                      style={{ background: p.color }}
                    >
                      <Icon name={p.icon} size={46} />
                    </div>
                    <small>{p.unit}</small>
                    <h3>{p.name}</h3>
                    <div>
                      <strong>{money(p.price)}</strong>
                      <button
                        className="add-product"
                        aria-label={`Add ${p.name}`}
                        onClick={() =>
                          setCart((c) => ({ ...c, [p.id]: (c[p.id] ?? 0) + 1 }))
                        }
                      >
                        <Icon name="plus" size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {!preview && (
                <Empty
                  title={t(
                    "Store catalogue is being prepared",
                    "দোকানের তালিকা প্রস্তুত হচ্ছে",
                  )}
                  description={t(
                    "Products appear after this merchant is connected.",
                    "দোকান সংযুক্ত হলে পণ্য দেখা যাবে।",
                  )}
                />
              )}
              <div className="modal-actions">
                <button
                  className="button primary"
                  disabled={!count}
                  onClick={() => setPanel("cart")}
                >
                  <Icon name="bag" size={18} />
                  {t(
                    `Review basket (${count})`,
                    `ঝুড়ি দেখুন (${count})`,
                  )} · {money(cartTotal)}
                </button>
              </div>
            </>
          ) : panel === "cart" ? (
            <>
              <div className="checkout-lines">
                {products
                  .filter((p) => cart[p.id])
                  .map((p) => (
                    <div key={p.id}>
                      <span>
                        {p.name} × {cart[p.id]}
                      </span>
                      <strong>{money(p.price * cart[p.id])}</strong>
                      <button
                        className="icon-button"
                        aria-label={`Remove ${p.name}`}
                        onClick={() =>
                          setCart((c) => {
                            const n = { ...c };
                            delete n[p.id];
                            return n;
                          })
                        }
                      >
                        <Icon name="close" size={15} />
                      </button>
                    </div>
                  ))}
                <div className="checkout-total">
                  <span>{t("Product total", "পণ্যের মোট মূল্য")}</span>
                  <strong>{money(cartTotal)}</strong>
                </div>
              </div>
              <label className="field">
                <span>{t("Fulfilment", "পণ্য গ্রহণ")}</span>
                <select>
                  <option>
                    {t("Pickup from merchant", "দোকান থেকে সংগ্রহ")}
                  </option>
                  <option>
                    {t(
                      "Local delivery · confirm with merchant",
                      "লোকাল ডেলিভারি · দোকানির সঙ্গে নিশ্চিত করুন",
                    )}
                  </option>
                </select>
              </label>
              <label className="field">
                <span>
                  {t("Pay merchant directly", "সরাসরি দোকানিকে পেমেন্ট")}
                </span>
                <select>
                  <option>
                    {t("Cash on delivery / pickup", "পণ্য পাওয়ার সময় নগদ")}
                  </option>
                  <option>
                    {t(
                      "Merchant-owned QR · verify recipient first",
                      "দোকানির নিজস্ব কিউআর · আগে প্রাপকের পরিচয় যাচাই করুন",
                    )}
                  </option>
                </select>
              </label>
              <p className="form-note">
                {t(
                  "Payment remains unpaid until separately confirmed. Tapping this button does not transfer money.",
                  "আলাদা নিশ্চিতকরণের আগ পর্যন্ত পেমেন্ট অপরিশোধিত থাকবে। এই বোতামে চাপলে টাকা পাঠানো হয় না।",
                )}
              </p>
              <button
                className="button primary full"
                disabled={!preview || count === 0}
                onClick={finish}
              >
                {t("Place preview order", "প্রিভিউ অর্ডার দিন")}
              </button>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                finish();
              }}
            >
              <div className="checkout-lines">
                <div>
                  <span>{selected.detail[language]}</span>
                  <strong>{money(selected.price)}</strong>
                </div>
                <div>
                  <span>
                    {t(
                      "Travel within agreed coverage",
                      "নির্ধারিত এলাকার যাতায়াত",
                    )}
                  </span>
                  <strong>{t("Included", "অন্তর্ভুক্ত")}</strong>
                </div>
                <div className="checkout-total">
                  <span>{t("Preview estimate", "প্রিভিউ আনুমানিক মূল্য")}</span>
                  <strong>{money(selected.price)}</strong>
                </div>
              </div>
              <p className="form-note">
                {t(
                  selected.category === "plumbing"
                    ? "This covers inspection only. Repair or parts require a separate itemized quote and your approval."
                    : "Published scope applies. Any additional materials or work require your separate approval.",
                  selected.category === "plumbing"
                    ? "এটি শুধু পরিদর্শনের মূল্য। মেরামত বা যন্ত্রাংশের জন্য আলাদা প্রস্তাব ও অনুমোদন লাগবে।"
                    : "প্রকাশিত কাজের সীমা প্রযোজ্য। বাড়তি উপকরণ বা কাজের জন্য আলাদা অনুমোদন লাগবে।",
                )}
              </p>
              <label className="field">
                <span>{t("Service address", "সেবা নেওয়ার ঠিকানা")}</span>
                <input
                  required
                  minLength={8}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t(
                    "Enter a sample address for this preview",
                    "এই প্রিভিউয়ের জন্য নমুনা ঠিকানা লিখুন",
                  )}
                />
              </label>
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  required
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                <span>
                  {t(
                    "I have reviewed the scope, service address and displayed price.",
                    "আমি কাজের সীমা, ঠিকানা ও দেখানো মূল্য দেখেছি।",
                  )}
                </span>
              </label>
              {!preview && (
                <p className="notice">
                  {t(
                    "Booking becomes available when a verified service offer and server price quote are ready.",
                    "যাচাইকৃত অফার ও নিশ্চিত মূল্য পাওয়া গেলে বুকিং করা যাবে।",
                  )}
                </p>
              )}
              <button
                className="button primary full"
                disabled={!preview || !confirmed || address.trim().length < 8}
              >
                {t(
                  "Send preview service request",
                  "প্রিভিউ সেবার অনুরোধ পাঠান",
                )}
              </button>
            </form>
          )}
        </Modal>
      )}
      {locationModal && (
        <Modal
          title={t("Choose your search location", "কোথায় খুঁজতে চান?")}
          onClose={() => setLocationModal(false)}
        >
          <p className="muted-text">
            {t(
              "Search location and the final service address are separate. Coverage is checked again before booking.",
              "খোঁজার জায়গা ও সেবা নেওয়ার ঠিকানা আলাদা। বুকিংয়ের আগে এলাকা আবার যাচাই করা হয়।",
            )}
          </p>
          <button
            className="button secondary full"
            onClick={() => {
              if (!navigator.geolocation) {
                notify(
                  t(
                    "Location is unavailable in this browser.",
                    "এই ব্রাউজারে লোকেশন পাওয়া যাচ্ছে না।",
                  ),
                );
                return;
              }
              navigator.geolocation.getCurrentPosition(
                (p) => {
                  const q = new URLSearchParams(params);
                  q.set("lat", String(p.coords.latitude));
                  q.set("lng", String(p.coords.longitude));
                  setParams(q);
                  setLocationModal(false);
                },
                () =>
                  notify(
                    t(
                      "Location permission was not granted. You can enter a point manually.",
                      "লোকেশনের অনুমতি পাওয়া যায়নি। আপনি নিজে অবস্থান দিতে পারেন।",
                    ),
                  ),
              );
            }}
          >
            <Icon name="target" />
            {t("Use my current location", "আমার বর্তমান অবস্থান ব্যবহার করুন")}
          </button>
          <div className="form-divider">
            {t("or enter a verified search point", "অথবা খোঁজার অবস্থান লিখুন")}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const q = new URLSearchParams(params);
              q.set("lat", String(f.get("lat")));
              q.set("lng", String(f.get("lng")));
              setParams(q);
              setLocationModal(false);
            }}
          >
            <div className="form-grid">
              <label className="field">
                <span>{t("Latitude", "অক্ষাংশ")}</span>
                <input
                  name="lat"
                  required
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  defaultValue={data.filters.point?.lat}
                />
              </label>
              <label className="field">
                <span>{t("Longitude", "দ্রাঘিমাংশ")}</span>
                <input
                  name="lng"
                  required
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  defaultValue={data.filters.point?.lng}
                />
              </label>
            </div>
            <button className="button primary full">
              {t("Use this search point", "এই জায়গায় খুঁজুন")}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
export function CustomerActivity({ data }: { data: PageData }) {
  const { t } = useWorkspace();
  const rows = useRows(data);
  return (
    <>
      <SectionTitle
        title={t("Your activity, all together", "আপনার সব কার্যক্রম এক জায়গায়")}
        subtitle={t(
          "Service bookings and merchant orders keep their own clear timelines.",
          "সেবার বুকিং ও দোকানের অর্ডারের আলাদা অবস্থা দেখা যাবে।",
        )}
      />
      <ConnectionState data={data} />
      <RecordsTable
        rows={rows}
        title={t("Recent activity", "সাম্প্রতিক কার্যক্রম")}
      />
    </>
  );
}
