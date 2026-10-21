import Link from "next/link";
import { formatCLP } from "@/lib/format";

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  children,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 pb-6 mb-2 border-b border-[#e4e2dc]">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-tight text-[#14201f] first-letter:uppercase">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-[#6b716f] mt-1.5 max-w-2xl">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}

export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-white rounded-xl border border-[#e4e2dc] p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          {title && <h2 className="text-[15px] font-semibold text-[#14201f]">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

type Tone = "neutral" | "good" | "bad" | "brand";

export function Stat({
  label,
  value,
  note,
  tone = "neutral",
  href,
}: {
  label: string;
  value: string;
  note?: string;
  tone?: Tone;
  href?: string;
}) {
  const brand = tone === "brand";
  const valueColor = tone === "good" ? "text-[#0a6b38]" : tone === "bad" ? "text-[#b3362a]" : "";
  const body = (
    <>
      <p className={`eyebrow ${brand ? "!text-white/60" : ""}`}>{label}</p>
      <p
        className={`text-[26px] sm:text-[30px] leading-tight font-semibold tracking-tight tabular-nums mt-2 ${valueColor}`}
      >
        {tone === "good" && <span className="text-lg align-middle mr-1">▲</span>}
        {tone === "bad" && <span className="text-lg align-middle mr-1">▼</span>}
        {value}
      </p>
      {note && (
        <p className={`text-xs mt-1.5 ${brand ? "text-white/60" : "text-[#6b716f]"}`}>{note}</p>
      )}
    </>
  );
  const className = `block rounded-xl p-5 ${
    brand ? "bg-[#0c2f2c] text-white" : "bg-white border border-[#e4e2dc] text-[#14201f]"
  } ${href ? "transition hover:border-[#b5b2a8]" : ""}`;
  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

// Monto con signo y color: verde si ganas, rojo si pierdes.
export function Result({ value, className = "" }: { value: number; className?: string }) {
  const color = value > 0 ? "text-[#0a6b38]" : value < 0 ? "text-[#b3362a]" : "text-[#6b716f]";
  return (
    <span className={`tabular-nums ${color} ${className}`}>
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
    good: "bg-[#e6f2ea] text-[#0a5c2e] border-[#c7e3d1]",
    warn: "bg-[#fbf3e0] text-[#734d00] border-[#f0dfb4]",
    bad: "bg-[#fbe9e6] text-[#8f2318] border-[#f2cbc5]",
    muted: "bg-[#f3f2ee] text-[#5b625f] border-[#e4e2dc]",
  }[tone];
  const icon = { good: "✓", warn: "!", bad: "✕", muted: "•" }[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles}`}
    >
      <span aria-hidden>{icon}</span>
      {children}
    </span>
  );
}

// Recuadro de ayuda para explicar algo en lenguaje simple.
export function Tip({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-lg border border-[#e4e2dc] bg-[#f8f7f3] p-4 text-sm text-[#3b4442]">
      <span
        aria-hidden
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0f5f59] text-[11px] font-bold text-white"
      >
        i
      </span>
      <div className="space-y-1">
        {title && <p className="font-semibold text-[#14201f]">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}

export function Icon({ path, className = "w-5 h-5" }: { path: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={path} />
    </svg>
  );
}
