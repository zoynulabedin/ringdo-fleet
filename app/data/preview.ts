import { label, type Label, type PortalId } from "../portal";
export interface Seller {
  id: string;
  name: Label;
  category: string;
  kind: "professional" | "shop" | "food";
  icon: string;
  detail: Label;
  distance: number;
  rating: number;
  reviews: number;
  price: number;
  available: boolean;
  covered: boolean;
  x: number;
  y: number;
  color: string;
  lat?: number;
  lng?: number;
}
export const sellers: Seller[] = [
  {
    id: "demo-electrician",
    name: label("Rahim Electric Works", "রহিম ইলেকট্রিক ওয়ার্কস"),
    category: "electrician",
    kind: "professional",
    icon: "zap",
    detail: label(
      "Fan installation · Fixed labour price",
      "ফ্যান লাগানো · নির্ধারিত মজুরি",
    ),
    distance: 450,
    rating: 4.9,
    reviews: 128,
    price: 35000,
    available: true,
    covered: true,
    x: 57,
    y: 34,
    color: "#f1ac4d",
  },
  {
    id: "demo-grocery",
    name: label("Neighbourhood Fresh", "পাড়ার ফ্রেশ বাজার"),
    category: "grocery",
    kind: "shop",
    icon: "store",
    detail: label(
      "Fresh essentials, from your local shop",
      "পাড়ার দোকান থেকে নিত্যপ্রয়োজনীয় পণ্য",
    ),
    distance: 680,
    rating: 4.8,
    reviews: 246,
    price: 0,
    available: true,
    covered: true,
    x: 37,
    y: 57,
    color: "#77a586",
  },
  {
    id: "demo-cleaner",
    name: label("Sparkle Home Care", "স্পার্কল হোম কেয়ার"),
    category: "cleaning",
    kind: "professional",
    icon: "sparkles",
    detail: label(
      "Home cleaning · Clear package pricing",
      "ঘর পরিষ্কার · নির্ধারিত প্যাকেজ",
    ),
    distance: 950,
    rating: 4.8,
    reviews: 85,
    price: 90000,
    available: true,
    covered: true,
    x: 68,
    y: 66,
    color: "#9e92c8",
  },
  {
    id: "demo-food",
    name: label("The Little Kitchen", "ছোট্ট রান্নাঘর"),
    category: "food",
    kind: "food",
    icon: "utensils",
    detail: label(
      "Freshly made local favourites",
      "পছন্দের খাবার, তাজা রান্না",
    ),
    distance: 1800,
    rating: 4.7,
    reviews: 196,
    price: 22000,
    available: true,
    covered: true,
    x: 20,
    y: 29,
    color: "#c28568",
  },
  {
    id: "demo-plumber",
    name: label("Hasan Plumbing", "হাসান প্লাম্বিং"),
    category: "plumbing",
    kind: "professional",
    icon: "drop",
    detail: label(
      "Inspection followed by an approved quote",
      "পরিদর্শনের পর অনুমোদিত খরচের প্রস্তাব",
    ),
    distance: 3600,
    rating: 4.9,
    reviews: 64,
    price: 20000,
    available: true,
    covered: true,
    x: 81,
    y: 27,
    color: "#7c9dbb",
  },
];
export interface RecordItem {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  amount: number;
  time: string;
  person: string;
  category: string;
  payment?: string;
  quantity?: number;
  section?: string;
  currency?: string;
}
export interface Product {
  id: string;
  name: string;
  unit: string;
  price: number;
  stock: number;
  category: string;
  icon: string;
  color: string;
}
export const products: Product[] = [
  {
    id: "p-rice",
    name: "Miniket rice",
    unit: "5 kg bag",
    price: 39000,
    stock: 24,
    category: "Pantry",
    icon: "wheat",
    color: "#eee6d3",
  },
  {
    id: "p-eggs",
    name: "Farm fresh eggs",
    unit: "12 pieces",
    price: 15000,
    stock: 48,
    category: "Fresh",
    icon: "egg",
    color: "#f5eadc",
  },
  {
    id: "p-milk",
    name: "Fresh whole milk",
    unit: "1 litre",
    price: 9500,
    stock: 16,
    category: "Dairy",
    icon: "milk",
    color: "#e4edf0",
  },
  {
    id: "p-tomato",
    name: "Local tomatoes",
    unit: "1 kg",
    price: 6500,
    stock: 30,
    category: "Fresh",
    icon: "apple",
    color: "#f5dfd7",
  },
  {
    id: "p-oil",
    name: "Soybean oil",
    unit: "1 litre",
    price: 17500,
    stock: 8,
    category: "Pantry",
    icon: "drop",
    color: "#f4e9c6",
  },
  {
    id: "p-lentil",
    name: "Red lentils",
    unit: "1 kg",
    price: 13000,
    stock: 21,
    category: "Pantry",
    icon: "wheat",
    color: "#eddcc9",
  },
];
export const offers: Product[] = [
  {
    id: "s-fan",
    name: "Ceiling fan installation",
    unit: "Per installation",
    price: 35000,
    stock: 1,
    category: "FIXED",
    icon: "zap",
    color: "#f4e5cb",
  },
  {
    id: "s-inspect",
    name: "Electrical fault inspection",
    unit: "Inspection only",
    price: 20000,
    stock: 1,
    category: "DIAGNOSIS_QUOTE",
    icon: "search",
    color: "#dce8e0",
  },
  {
    id: "s-switch",
    name: "Switch replacement",
    unit: "Per switch · labour",
    price: 18000,
    stock: 1,
    category: "FIXED",
    icon: "tool",
    color: "#e5e0ee",
  },
];
export const records: Record<PortalId, RecordItem[]> = {
  customer: [
    {
      id: "RD-1042",
      title: "Fan installation",
      subtitle: "Rahim Electric Works",
      status: "confirmed",
      amount: 35000,
      time: "Today · 11:30",
      person: "Rahim Uddin",
      category: "Home services",
    },
    {
      id: "RD-1036",
      title: "Everyday essentials",
      subtitle: "Neighbourhood Fresh · 4 items",
      status: "delivering",
      amount: 81000,
      time: "Today · 10:20",
      person: "Neighbourhood Fresh",
      category: "Shop order",
      payment: "buyer_reported",
    },
    {
      id: "RD-1021",
      title: "Home cleaning",
      subtitle: "Sparkle Home Care",
      status: "completed",
      amount: 90000,
      time: "28 Oct · 09:00",
      person: "Ayesha Akter",
      category: "Home services",
    },
  ],
  merchant: [
    {
      id: "OR-2048",
      title: "Rice, eggs & fresh milk",
      subtitle: "3 items · Local delivery",
      status: "new",
      amount: 63500,
      time: "4 min ago",
      person: "Nusrat Jahan",
      category: "COD",
      payment: "unpaid",
    },
    {
      id: "OR-2047",
      title: "Weekly kitchen essentials",
      subtitle: "5 items · Store pickup",
      status: "accepted",
      amount: 124000,
      time: "12 min ago",
      person: "Arif Hossain",
      category: "Merchant QR",
      payment: "buyer_reported",
    },
    {
      id: "OR-2046",
      title: "Fresh vegetables & eggs",
      subtitle: "4 items · Local delivery",
      status: "preparing",
      amount: 42000,
      time: "24 min ago",
      person: "Rumana Akter",
      category: "COD",
      payment: "unpaid",
    },
    {
      id: "OR-2045",
      title: "Rice & cooking oil",
      subtitle: "2 items · Store pickup",
      status: "ready",
      amount: 56500,
      time: "42 min ago",
      person: "Sajid Ahmed",
      category: "Merchant QR",
      payment: "merchant_confirmed",
    },
  ],
  professional: [
    {
      id: "JB-3042",
      title: "Ceiling fan installation",
      subtitle: "Installation only · parts supplied",
      status: "pending",
      amount: 35000,
      time: "Today · 11:30",
      person: "Nusrat Jahan",
      category: "Fixed price",
    },
    {
      id: "JB-3041",
      title: "Electrical fault inspection",
      subtitle: "Inspection first · repair needs approval",
      status: "confirmed",
      amount: 20000,
      time: "Today · 14:00",
      person: "Arif Hossain",
      category: "Diagnosis + quote",
    },
    {
      id: "JB-3038",
      title: "Replace two switches",
      subtitle: "Labour and agreed materials",
      status: "completed",
      amount: 48000,
      time: "Yesterday",
      person: "Rumana Akter",
      category: "Fixed price",
    },
  ],
  driver: [
    {
      id: "TR-4012",
      title: "Sample city journey",
      subtitle: "Sample pickup → sample destination",
      status: "sandbox",
      amount: 24000,
      time: "Demo only",
      person: "Sample passenger",
      category: "Car · Sandbox",
    },
    {
      id: "TR-4011",
      title: "Sample parcel trip",
      subtitle: "Documented pickup and handover",
      status: "sandbox",
      amount: 18000,
      time: "Demo only",
      person: "Sample sender",
      category: "Parcel · Sandbox",
    },
  ],
  fleet: [
    {
      id: "VH-001",
      title: "Dhaka Metro TA 12-3456",
      subtitle: "Light pickup · 1,000 kg",
      status: "available",
      amount: 0,
      time: "Documents under review",
      person: "Shahidul Islam",
      category: "Pickup",
    },
    {
      id: "VH-002",
      title: "Pabna TA 11-2034",
      subtitle: "Delivery van · 750 kg",
      status: "maintenance",
      amount: 0,
      time: "Service due 4 Nov",
      person: "Rafiqul Islam",
      category: "Van",
    },
    {
      id: "VH-003",
      title: "Dhaka Metro GA 34-5521",
      subtitle: "Sedan · 4 seats",
      status: "available",
      amount: 0,
      time: "Documents under review",
      person: "Mahmud Hasan",
      category: "Car",
    },
  ],
  team: [
    {
      id: "CS-5024",
      title: "Need an update on my service",
      subtitle: "Booking RD-1042 · Home service",
      status: "open",
      amount: 35000,
      time: "8 min ago",
      person: "Nusrat Jahan",
      category: "Booking",
    },
    {
      id: "CS-5023",
      title: "Merchant payment confirmation",
      subtitle: "Order OR-2047 · Merchant-direct payment",
      status: "pending",
      amount: 124000,
      time: "24 min ago",
      person: "Arif Hossain",
      category: "Payment",
    },
    {
      id: "CS-5020",
      title: "Update my service location",
      subtitle: "Address verification",
      status: "resolved",
      amount: 0,
      time: "48 min ago",
      person: "Rumana Akter",
      category: "Account",
    },
  ],
  business: [
    {
      id: "BQ-6012",
      title: "Office deep cleaning",
      subtitle: "Main office · Operations team",
      status: "pending",
      amount: 450000,
      time: "2 Nov · 09:00",
      person: "Nusrat Jahan",
      category: "Facilities",
    },
    {
      id: "BQ-6011",
      title: "Air conditioner inspection",
      subtitle: "Meeting room · Admin team",
      status: "approved",
      amount: 120000,
      time: "3 Nov · 11:00",
      person: "Arif Hossain",
      category: "Maintenance",
    },
    {
      id: "BQ-6009",
      title: "Weekly pantry restock",
      subtitle: "Main office · 12 items",
      status: "completed",
      amount: 620000,
      time: "28 Oct",
      person: "Rumana Akter",
      category: "Pantry",
    },
  ],
};
export const categoryOptions = [
  { id: "all", title: label("Everything", "সবকিছু"), icon: "grid" },
  { id: "grocery", title: label("Shops", "দোকান"), icon: "store" },
  {
    id: "electrician",
    title: label("Electrician", "ইলেকট্রিশিয়ান"),
    icon: "zap",
  },
  { id: "cleaning", title: label("Cleaning", "পরিচ্ছন্নতা"), icon: "sparkles" },
  { id: "food", title: label("Food", "খাবার"), icon: "utensils" },
  { id: "plumbing", title: label("Plumbing", "প্লাম্বিং"), icon: "drop" },
];
export const messages = [
  {
    id: "m1",
    from: "customer",
    body: "Hello, could you confirm when the service professional will arrive?",
    time: "10:24",
  },
  {
    id: "m2",
    from: "agent",
    body: "I can help with that. Let me check the details linked to this booking.",
    time: "10:26",
  },
];
export const fieldLabels: Record<string, Label> = {
  name: label("Name", "নাম"),
  description: label("Description", "বিবরণ"),
  price: label("Price (BDT)", "মূল্য (টাকা)"),
  stock: label("Stock quantity", "মজুতের পরিমাণ"),
  email: label("Email address", "ইমেইল ঠিকানা"),
  phone: label("Phone number", "ফোন নম্বর"),
  address: label("Address", "ঠিকানা"),
  reason: label("Reason / notes", "কারণ / মন্তব্য"),
  amount: label("Budget (BDT)", "বাজেট (টাকা)"),
  date: label("Preferred date", "পছন্দের তারিখ"),
};
