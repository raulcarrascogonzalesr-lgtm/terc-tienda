// Símbolo de TERC (anillo, T y hoja) para usar como adorno.
export function Mark({
  className,
  ring = "#c9b98c",
  leaf = "#7fc4a8",
  ink = "#0c2f2c",
  stroke = 4,
}: {
  className?: string;
  ring?: string;
  leaf?: string;
  ink?: string;
  stroke?: number;
}) {
  return (
    <svg viewBox="-46 -46 124 92" className={className} aria-hidden>
      <circle
        r="40"
        fill="none"
        stroke={ring}
        strokeWidth={stroke}
        strokeDasharray="215 37"
        strokeLinecap="round"
        transform="rotate(26)"
      />
      <path d="M38 1C44-11 58-18 72-16 68-4 56 4 38 1Z" fill={leaf} />
      <path d="M-22-18H22M0-18V28" fill="none" stroke={ink} strokeWidth="10" />
    </svg>
  );
}
