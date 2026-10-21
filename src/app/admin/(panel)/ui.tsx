import { formatCLP } from "@/lib/format";

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-black/60 mt-1">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}

export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-white rounded-2xl border border-black/5 shadow-sm p-5 ${className}`}>
      {title && <h2 className="font-semibold mb-4">{title}</h2>}
      {children}
    </section>
  );
}

type Tone = "neutral" | "good" | "bad" | "brand";

const TONES: Record<Tone, string> = {
  neutral: "bg-white",
  brand: "bg-[#0b3d3a] text-white",
  good: "bg-white",
  bad: "bg-white",
};

export function Stat({
  label,
  value,
  note,
  tone = "neutral",
}: {
  label: string;
  value: string;
  note?: string;
  tone?: Tone;
}) {
  const valueColor = tone === "good" ? "text-[#0a7a3c]" : tone === "bad" ? "text-[#c0392b]" : "";
  const muted = tone === "brand" ? "text-white/70" : "text-black/55";
  return (
    <div className={`${TONES[tone]} rounded-2xl border border-black/5 shadow-sm p-5 space-y-1`}>
      <p className={`text-sm ${muted}`}>{label}</p>
      <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${valueColor}`}>
        {tone === "good" && "▲ "}
        {tone === "bad" && "▼ "}
        {value}
      </p>
      {note && <p className={`text-xs ${muted}`}>{note}</p>}
    </div>
  );
}

// Monto con signo y color: verde si ganas, rojo si pierdes.
export function Result({ value, className = "" }: { value: number; className?: string }) {
  const color = value > 0 ? "text-[#0a7a3c]" : value < 0 ? "text-[#c0392b]" : "text-black/60";
  return (
    <span className={`${color} ${className}`}>
      {value > 0 ? "+" : value < 0 ? "−" : ""}
      {formatCLP(Math.abs(value))}
    </span>
  );
}

export function Badge({
  tone,
  children,
}: {
  tone: "good" | "warn" | "bad" | "muted";
  children: React.ReactNode;
}) {
  const styles = {
    good: "bg-[#e3f4e9] text-[#0a5c2e]",
    warn: "bg-[#fdf1d6] text-[#7a5200]",
    bad: "bg-[#fbe4e1] text-[#8f2318]",
    muted: "bg-black/5 text-black/60",
  }[tone];
  const icon = { good: "✓", warn: "!", bad: "✕", muted: "•" }[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}
    >
      <span aria-hidden>{icon}</span>
      {children}
    </span>
  );
}
