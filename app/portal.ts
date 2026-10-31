export type PortalId =
  | "customer"
  | "merchant"
  | "professional"
  | "driver"
  | "fleet"
  | "team"
  | "business";
export type Language = "en" | "bn";
export type Label = { en: string; bn: string };
export const label = (en: string, bn: string): Label => ({ en, bn });
export interface NavItem {
  id: string;
  title: Label;
  icon: string;
  group?: string;
}
export interface Portal {
  id: PortalId;
  name: string;
  descriptor: Label;
  eyebrow: Label;
  title: Label;
  subtitle: Label;
  icon: string;
  accent: string;
  roles: string[];
  nav: NavItem[];
  primary: Label;
}
const n = (id: string, en: string, bn: string, icon: string): NavItem => ({
  id,
  title: label(en, bn),
  icon,
});
export const portals: Record<PortalId, Portal> = {
  customer: {
    id: "customer",
    name: "Ringdo",
    descriptor: label("Your neighbourhood, connected", "আপনার এলাকার সব সেবা"),
    eyebrow: label("GOOD THINGS ARE CLOSE BY", "প্রয়োজনের সবকিছু কাছেই"),
    title: label("A little closer to everything.", "সবকিছু এখন আরও কাছে।"),
    subtitle: label(
      "Find trusted people, everyday essentials and a helping hand nearby.",
      "কাছের বিশ্বস্ত মানুষ, দোকান আর প্রয়োজনীয় সেবা খুঁজে নিন।",
    ),
    icon: "radar",
    accent: "#ef6b3f",
    roles: ["customer"],
    primary: label("Explore nearby", "কাছাকাছি খুঁজুন"),
    nav: [
      n("home", "Explore", "খুঁজুন", "compass"),
      n("activity", "My activity", "আমার কার্যক্রম", "layers"),
      n("messages", "Messages", "বার্তা", "message"),
      n("saved", "Saved places", "পছন্দের ঠিকানা", "heart"),
      n("wallet", "Service wallet", "সার্ভিস ওয়ালেট", "wallet"),
      n("support", "Help & support", "সাহায্য ও সহায়তা", "headphones"),
      n("settings", "My account", "আমার অ্যাকাউন্ট", "settings"),
    ],
  },
  merchant: {
    id: "merchant",
    name: "Ringdo Merchant",
    descriptor: label("Make local business thrive", "এলাকার ব্যবসা এগিয়ে নিন"),
    eyebrow: label("YOUR STORE, AT A GLANCE", "এক নজরে আপনার দোকান"),
    title: label("A good day for your business.", "আজকের ব্যবসার খবর।"),
    subtitle: label(
      "Keep your shelves stocked, your orders moving and your customers happy.",
      "পণ্যের মজুত, নতুন অর্ডার আর ক্রেতার খবর—এক জায়গায়।",
    ),
    icon: "store",
    accent: "#db653b",
    roles: ["merchant", "merchant_owner", "merchant_staff"],
    primary: label("Add product", "পণ্য যোগ করুন"),
    nav: [
      n("home", "Overview", "এক নজরে", "grid"),
      n("orders", "Orders", "অর্ডার", "bag"),
      n("products", "Products & stock", "পণ্য ও মজুত", "box"),
      n("storefront", "My storefront", "আমার দোকান", "store"),
      n("customers", "Customers", "ক্রেতা", "users"),
      n("subscription", "Subscription", "সাবস্ক্রিপশন", "sparkles"),
      n("settings", "Store settings", "দোকানের সেটিংস", "settings"),
    ],
  },
  professional: {
    id: "professional",
    name: "Ringdo Professional",
    descriptor: label("Do great work. Grow locally.", "ভালো কাজে এগিয়ে যান"),
    eyebrow: label("YOUR WORKDAY, SIMPLIFIED", "সহজ হোক আপনার কর্মদিন"),
    title: label(
      "Ready for your next good job?",
      "পরবর্তী কাজের জন্য প্রস্তুত?",
    ),
    subtitle: label(
      "Manage your availability, meet your customers and keep your work on track.",
      "সময় ঠিক করুন, ক্রেতার সঙ্গে যোগাযোগ রাখুন, কাজ গুছিয়ে নিন।",
    ),
    icon: "tool",
    accent: "#e36c41",
    roles: ["provider"],
    primary: label("Manage services", "সেবা পরিচালনা করুন"),
    nav: [
      n("home", "My day", "আমার দিন", "sun"),
      n("jobs", "Job requests", "কাজের অনুরোধ", "briefcase"),
      n("services", "My services", "আমার সেবা", "tool"),
      n("schedule", "Schedule", "কাজের সময়সূচি", "calendar"),
      n("earnings", "Earnings", "আয়", "wallet"),
      n("messages", "Messages", "বার্তা", "message"),
      n("verification", "Verification", "যাচাইকরণ", "shield"),
      n("settings", "Profile & settings", "প্রোফাইল ও সেটিংস", "settings"),
    ],
  },
  driver: {
    id: "driver",
    name: "Ringdo Driver",
    descriptor: label("Every journey matters", "প্রতিটি যাত্রা গুরুত্বপূর্ণ"),
    eyebrow: label("YOUR DRIVER WORKSPACE", "আপনার ড্রাইভার ওয়ার্কস্পেস"),
    title: label("Your next chapter on the road.", "পথচলার নতুন অধ্যায়।"),
    subtitle: label(
      "Keep your documents ready and manage journeys when your market is approved.",
      "কাগজপত্র প্রস্তুত রাখুন; অনুমোদিত এলাকায় যাত্রা পরিচালনা করুন।",
    ),
    icon: "car",
    accent: "#247b70",
    roles: ["provider", "driver"],
    primary: label("View vehicle", "গাড়ির তথ্য দেখুন"),
    nav: [
      n("home", "Driver home", "ড্রাইভার হোম", "compass"),
      n("trips", "My trips", "আমার ট্রিপ", "route"),
      n("vehicle", "Vehicle & documents", "গাড়ি ও কাগজপত্র", "car"),
      n("earnings", "Earnings", "আয়", "wallet"),
      n("safety", "Safety centre", "নিরাপত্তা কেন্দ্র", "shield"),
      n("settings", "My account", "আমার অ্যাকাউন্ট", "settings"),
    ],
  },
  fleet: {
    id: "fleet",
    name: "Ringdo Fleet",
    descriptor: label("Keep your operation moving", "পরিকল্পিত ফ্লিট পরিচালনা"),
    eyebrow: label("FLEET OPERATIONS", "ফ্লিট পরিচালনা"),
    title: label("The whole operation. One view.", "পুরো কার্যক্রম এক নজরে।"),
    subtitle: label(
      "See your vehicles, coordinate your people and plan the next movement.",
      "গাড়ির খবর রাখুন, দল সমন্বয় করুন, পরের কাজ পরিকল্পনা করুন।",
    ),
    icon: "truck",
    accent: "#5176bb",
    roles: ["fleet_owner", "fleet_manager", "fleet_dispatcher"],
    primary: label("Plan assignment", "কাজ বরাদ্দ করুন"),
    nav: [
      n("home", "Operations", "কার্যক্রম", "grid"),
      n("dispatch", "Dispatch board", "ডিসপ্যাচ বোর্ড", "route"),
      n("vehicles", "Vehicles", "গাড়ি", "truck"),
      n("drivers", "Drivers & team", "ড্রাইভার ও দল", "users"),
      n("maintenance", "Maintenance", "রক্ষণাবেক্ষণ", "tool"),
      n("reports", "Reports", "প্রতিবেদন", "chart"),
      n("settings", "Fleet settings", "ফ্লিট সেটিংস", "settings"),
    ],
  },
  team: {
    id: "team",
    name: "Ringdo Team",
    descriptor: label(
      "Care that makes a difference",
      "যত্নে বদলে যায় অভিজ্ঞতা",
    ),
    eyebrow: label("CUSTOMER EXPERIENCE", "ক্রেতার অভিজ্ঞতা"),
    title: label(
      "A better day starts with you.",
      "ভালো অভিজ্ঞতা শুরু হোক আপনার হাতে।",
    ),
    subtitle: label(
      "Bring clarity to every case and help people get back to their day.",
      "প্রতিটি সমস্যা বুঝে সহায়তা করুন, দ্রুত সঠিক সমাধান দিন।",
    ),
    icon: "headphones",
    accent: "#8c6bd1",
    roles: [
      "super_admin",
      "country_admin",
      "support_admin",
      "verification_admin",
      "finance_admin",
      "content_admin",
      "admin",
    ],
    primary: label("Open support inbox", "সহায়তা ইনবক্স খুলুন"),
    nav: [
      n("home", "My workspace", "আমার ওয়ার্কস্পেস", "grid"),
      n("inbox", "Support inbox", "সহায়তা ইনবক্স", "inbox"),
      n("cases", "Assigned cases", "দায়িত্বপ্রাপ্ত কেস", "layers"),
      n("verification", "Verification queue", "যাচাইয়ের তালিকা", "shield"),
      n("knowledge", "Knowledge base", "সহায়িকা", "book"),
      n("activity", "Activity log", "কার্যক্রমের ইতিহাস", "clock"),
      n("settings", "My preferences", "আমার পছন্দ", "settings"),
    ],
  },
  business: {
    id: "business",
    name: "Ringdo Business",
    descriptor: label(
      "A better way to work together",
      "দলের জন্য সহজ ব্যবস্থাপনা",
    ),
    eyebrow: label("YOUR BUSINESS WORKSPACE", "আপনার ব্যবসার ওয়ার্কস্পেস"),
    title: label(
      "Small details. Better workdays.",
      "পরিকল্পিত খরচ, সহজ কর্মদিন।",
    ),
    subtitle: label(
      "Arrange services, manage approvals and keep your company spending clear.",
      "সেবা বুক করুন, অনুমোদন দিন, প্রতিষ্ঠানের খরচের হিসাব রাখুন।",
    ),
    icon: "building",
    accent: "#4267b4",
    roles: [
      "corporate_admin",
      "corporate_employee",
      "business_admin",
      "business_employee",
    ],
    primary: label("Request a service", "সেবার অনুরোধ করুন"),
    nav: [
      n("home", "Overview", "এক নজরে", "grid"),
      n("requests", "Service requests", "সেবার অনুরোধ", "briefcase"),
      n("approvals", "Approvals", "অনুমোদন", "check-circle"),
      n("people", "People & teams", "কর্মী ও দল", "users"),
      n("budgets", "Budgets", "বাজেট", "wallet"),
      n("invoices", "Invoices", "চালান", "file"),
      n("settings", "Company settings", "প্রতিষ্ঠানের সেটিংস", "settings"),
    ],
  },
};
