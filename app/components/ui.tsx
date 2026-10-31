import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./icon";
export function Badge({
  children,
  tone = "neutral",
  dot = false,
}: {
  children: ReactNode;
  tone?: string;
  dot?: boolean;
}) {
  return (
    <span className={`badge badge-${tone}`}>
      {dot && <span className="status-dot" />}
      {children}
    </span>
  );
}
export function Empty({
  icon = "inbox",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={28} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    const focus = document.activeElement as HTMLElement | null;
    el?.showModal();
    return () => {
      el?.close();
      focus?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "modal-wide" : ""}`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="modal-title"
    >
      <div className="modal-header">
        <h2 id="modal-title">{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="modal-body">{children}</div>
    </dialog>
  );
}
export function MiniChart({
  values,
  color = "var(--accent)",
}: {
  values: number[];
  color?: string;
}) {
  const max = Math.max(...values, 1);
  return (
    <div className="mini-chart" aria-hidden="true">
      {values.map((v, i) => (
        <i
          key={i}
          style={{
            height: `${15 + (v / max) * 85}%`,
            background: color,
            opacity:
              i === values.length - 1 ? 1 : 0.25 + (i / values.length) * 0.5,
          }}
        />
      ))}
    </div>
  );
}
export function TrendChart({
  title,
  values,
  labels,
}: {
  title: string;
  values: number[];
  labels: string[];
}) {
  const max = Math.max(...values, 1);
  const points = values
    .map(
      (n, i) =>
        `${30 + i * (600 / (values.length - 1))},${170 - (n / max) * 130}`,
    )
    .join(" ");
  return (
    <div className="trend-chart">
      <svg viewBox="0 0 660 210" role="img" aria-label={title}>
        <defs>
          <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity=".22" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[40, 85, 130, 175].map((y) => (
          <path
            key={y}
            d={`M20 ${y}H640`}
            stroke="var(--border)"
            strokeDasharray="4 6"
          />
        ))}
        <polygon points={`30,175 ${points} 630,175`} fill="url(#chart-fill)" />
        <polyline
          points={points}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {values.map((n, i) => (
          <g key={i}>
            <circle
              cx={30 + (i * 600) / (values.length - 1)}
              cy={170 - (n / max) * 130}
              r="4"
              fill="var(--surface)"
              stroke="var(--accent)"
              strokeWidth="2"
            />
            <text
              x={30 + (i * 600) / (values.length - 1)}
              y="202"
              textAnchor="middle"
              fill="var(--muted)"
              fontSize="12"
            >
              {labels[i]}
            </text>
          </g>
        ))}
      </svg>
      <span className="sr-only">
        {values.map((v, i) => `${labels[i]}: ${v}`).join("; ")}
      </span>
    </div>
  );
}
