import type { CSSProperties } from "react";
const paths: Record<string, string> = {
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  compass: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M16 8l-3 5-5 3 3-5z",
  radar:
    "M21 12a9 9 0 1 1-9-9 M16 12a4 4 0 1 1-4-4 M12 12l8-8 M20 4v5 M20 4h-5",
  layers: "M12 3l10 6-10 6L2 9z M2 14l10 6 10-6 M2 19l10 6 10-6",
  message: "M21 11a9 9 0 0 1-9 9H4l-3 2 2-6a9 9 0 1 1 18-5 M8 11h8 M8 15h4",
  heart: "M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-5 5 3 10 8 15 5-5 13-10 8-15",
  wallet: "M20 7H5a2 2 0 0 1 0-4h13v4 M5 7H3v13h17V7 M20 12h-6v5h6 M16 14.5h.1",
  headphones: "M3 14v-3a9 9 0 0 1 18 0v3 M3 13h4v8H3z M17 13h4v8h-4z",
  settings:
    "M9 3h6l1 3 3 1 2 5-2 3-3 1-1 5H9l-1-5-3-1-2-3 2-5 3-1z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  store:
    "M3 9l2-6h14l2 6 M3 9v3a3 3 0 0 0 5 1 3 3 0 0 0 5 0 3 3 0 0 0 5 0 3 3 0 0 0 3-1V9H3 M5 14v7h14v-7 M10 21v-6h4v6",
  bag: "M5 7h14l2 14H3z M8 8V6a4 4 0 0 1 8 0v2",
  box: "M12 2l10 5v10l-10 5-10-5V7z M2 7l10 5 10-5 M12 12v10 M7 4.5l10 5",
  users:
    "M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3 M13 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M17 3a4 4 0 0 1 0 8 M22 21v-3a4 4 0 0 0-3-3.9",
  sparkles:
    "M12 2l2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8z M20 2v4 M18 4h4",
  tool: "M14 3a6 6 0 0 0-7 8L2 17a3 3 0 0 0 5 5l6-6a6 6 0 0 0 8-7l-4 4-4-4z",
  sun: "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M12 1v3 M12 20v3 M1 12h3 M20 12h3 M4 4l2 2 M18 18l2 2 M4 20l2-2 M18 6l2-2",
  briefcase: "M3 7h18v14H3z M8 7V3h8v4 M3 12a24 24 0 0 0 18 0 M10 12h4v4h-4z",
  calendar: "M4 5h16v17H4z M8 2v6 M16 2v6 M4 11h16 M8 15h2 M14 15h2 M8 18h2",
  shield: "M12 2l9 4v6c0 6-9 10-9 10S3 18 3 12V6z M8 12l3 3 5-6",
  car: "M3 11l3-7h12l3 7v8h-3v-3H6v3H3z M3 11h18 M6 14h2 M16 14h2",
  route:
    "M6 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6 M18 15a3 3 0 1 1 0 6 3 3 0 0 1 0-6 M9 6h5a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8h6",
  truck:
    "M1 4h13v13H1z M14 9h5l4 5v3h-9 M8 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0 M22 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  chart: "M4 21V3 M4 21h18 M8 17v-5 M13 17V8 M18 17V5",
  inbox: "M4 4h16l2 12v5H2v-5z M2 16h6l2 3h4l2-3h6",
  book: "M12 5C8 2 4 2 2 3v16c4-1 7 0 10 2 3-2 6-3 10-2V3c-2-1-6-1-10 2z M12 5v16",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 7v5l3 2",
  building:
    "M5 22V3h14v19 M2 22h20 M9 7h1 M14 7h1 M9 11h1 M14 11h1 M9 15h1 M14 15h1 M10 22v-4h4v4",
  "check-circle": "M21 12a9 9 0 1 1-5-8 M8 11l4 4 9-10",
  check: "M5 12l4 4L20 5",
  file: "M5 2h9l5 5v15H5z M14 2v6h5 M9 12h6 M9 16h6",
  arrow: "M4 12h16 M14 6l6 6-6 6",
  down: "M6 9l6 6 6-6",
  plus: "M12 4v16 M4 12h16",
  search: "M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0 M15 15l6 6",
  bell: "M18 8a6 6 0 0 0-12 0c0 8-3 8-3 10h18c0-2-3-2-3-10 M9 21h6",
  location:
    "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0 M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  close: "M5 5l14 14 M19 5L5 19",
  moon: "M21 13A9 9 0 0 1 11 3 9 9 0 1 0 21 13",
  logout: "M10 3H3v18h7 M10 12h12 M17 7l5 5-5 5",
  menu: "M3 6h18 M3 12h18 M3 18h18",
  zap: "M13 2L4 14h7l-1 8L21 9h-8z",
  drop: "M12 2C8 8 4 11 4 15a8 8 0 0 0 16 0c0-4-4-7-8-13",
  utensils: "M4 2v8c0 4 6 4 6 0V2 M7 2v20 M18 2c-4 5-4 11 1 11V2v20",
  wheat:
    "M12 22V4 M12 8C5 8 3 5 4 2c5 0 8 2 8 6 M12 14C5 14 3 11 4 8c5 0 8 2 8 6 M12 11c7 0 9-3 8-6-5 0-8 2-8 6 M12 18c7 0 9-3 8-6-5 0-8 2-8 6",
  egg: "M20 14c0 5-3.5 8-8 8s-8-3-8-8S8 2 12 2s8 7 8 12",
  milk: "M8 2h8v4l3 5v11H5V11l3-5z M8 6h8 M5 11h14 M9 15h6",
  apple:
    "M12 6c-9-7-13 8-6 14 3 3 4 0 6 0s3 3 6 0c7-6 3-21-6-14 M12 6c0-3 1-5 4-5",
  star: "M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z",
  filter: "M3 5h18 M6 12h12 M9 19h6",
  refresh: "M20 7a9 9 0 1 0 1 9 M20 3v5h-5",
  lock: "M5 10h14v12H5z M8 10V6a4 4 0 0 1 8 0v4",
  send: "M22 2L9 15 M22 2l-7 20-6-7-7-6z",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  link: "M10 14l4-4 M8 16l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0 M16 8l2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0",
  warning: "M12 2L1 21h22z M12 8v6 M12 18h.01",
  external: "M14 3h7v7 M21 3l-9 9 M10 3H3v18h18v-7",
  target:
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0 M12 1v5 M12 18v5 M1 12h5 M18 12h5",
};
export function Icon({
  name,
  size = 20,
  className = "",
  style,
}: {
  name: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path d={paths[name] ?? paths.grid} />
    </svg>
  );
}
