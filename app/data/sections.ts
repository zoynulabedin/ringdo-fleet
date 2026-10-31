import type { PortalId } from "../portal";
import type { RecordItem } from "./preview";

const row = (
  id: string,
  title: string,
  subtitle: string,
  status: string,
  person: string,
  category: string,
  amount = 0,
  time = "Sample record",
): RecordItem => ({
  id,
  title,
  subtitle,
  status,
  person,
  category,
  amount,
  time,
});
// These records are read only in explicitly selected preview mode.
export const sectionSamples: Partial<
  Record<PortalId, Record<string, RecordItem[]>>
> = {
  customer: {
    support: [
      row(
        "CS-1042",
        "Arrival time for my booking",
        "Booking RD-1042 · Home service",
        "open",
        "Ringdo support",
        "Booking",
      ),
    ],
    messages: [
      row(
        "CS-1042",
        "Arrival time for my booking",
        "Booking RD-1042 · Support conversation",
        "open",
        "Ringdo support",
        "Booking",
      ),
    ],
  },
  merchant: {
    customers: [
      row(
        "CU-01",
        "Nusrat Jahan",
        "3 sample orders · Last order today",
        "available",
        "Neighbourhood Fresh",
        "Customer",
        0,
        "Today",
      ),
      row(
        "CU-02",
        "Arif Hossain",
        "5 sample orders · Store pickup",
        "available",
        "Neighbourhood Fresh",
        "Customer",
        0,
        "Yesterday",
      ),
    ],
  },
  professional: {
    messages: [
      row(
        "CS-3042",
        "Question about an assigned job",
        "Job JB-3042 · Support conversation",
        "open",
        "Ringdo support",
        "Booking",
      ),
    ],
  },
  driver: {
    vehicle: [
      row(
        "VH-D01",
        "Dhaka Metro GA 34-5521",
        "Sedan · Registration and insurance review",
        "pending",
        "Sample vehicle owner",
        "Vehicle",
        0,
        "Not approved for public trips",
      ),
    ],
  },
  fleet: {
    dispatch: [
      row(
        "DS-01",
        "Office delivery assignment",
        "Pickup VH-001 · Awaiting dispatch approval",
        "pending",
        "Shahidul Islam",
        "Dispatch",
        0,
        "2 Nov · 09:00",
      ),
    ],
    drivers: [
      row(
        "DR-01",
        "Shahidul Islam",
        "Pickup driver · Documents under review",
        "pending",
        "Fleet operations",
        "Driver",
      ),
      row(
        "DR-02",
        "Mahmud Hasan",
        "Car driver · Eligibility review pending",
        "pending",
        "Fleet operations",
        "Driver",
      ),
    ],
    maintenance: [
      row(
        "MT-01",
        "Delivery van scheduled service",
        "VH-002 · Oil, brakes and tyre inspection",
        "maintenance",
        "Rafiqul Islam",
        "Maintenance",
        0,
        "4 Nov · 10:00",
      ),
    ],
  },
  business: {
    people: [
      row(
        "MB-01",
        "Nusrat Jahan",
        "Operations team · Requester",
        "available",
        "Main office",
        "Member",
      ),
      row(
        "MB-02",
        "Arif Hossain",
        "Admin team · Approver",
        "available",
        "Main office",
        "Member",
      ),
      row(
        "MB-03",
        "Rumana Akter",
        "Finance team · Invoice reviewer",
        "available",
        "Main office",
        "Member",
      ),
    ],
    budgets: [
      row(
        "BG-01",
        "Facilities budget",
        "Sample monthly limit · ৳28,000 remaining",
        "open",
        "Operations team",
        "Budget",
        5000000,
        "October 2026",
      ),
      row(
        "BG-02",
        "Pantry budget",
        "Sample monthly limit · ৳7,800 remaining",
        "open",
        "Admin team",
        "Budget",
        5000000,
        "October 2026",
      ),
    ],
    invoices: [
      row(
        "INV-01",
        "Office cleaning invoice",
        "BQ-6008 · Reconciliation pending",
        "pending",
        "Finance team",
        "Invoice",
        450000,
        "28 Oct",
      ),
      row(
        "INV-02",
        "Pantry restock invoice",
        "BQ-6009 · Sample completed purchase",
        "completed",
        "Finance team",
        "Invoice",
        620000,
        "28 Oct",
      ),
    ],
  },
};
