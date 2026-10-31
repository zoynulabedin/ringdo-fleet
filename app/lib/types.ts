export interface PageData {
  section: string;
  preview: boolean;
  filters: {
    query: string;
    category: string;
    radius: number;
    point: { lat: number; lng: number } | null;
  };
  entries: Record<string, unknown>[];
  detail: Record<string, unknown>;
  error: string;
  connected: boolean;
  pending: boolean;
}
