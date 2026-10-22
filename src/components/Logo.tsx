// Logo de TERC: la T dentro del anillo dorado es la primera letra de "TERC".
// Las letras son trazos (no texto) para que se vean iguales en cualquier equipo.
// "light" es para fondos oscuros, como el pie de página.
export function Logo({ className, variant = "dark" }: { className?: string; variant?: "dark" | "light" }) {
  const c =
    variant === "light"
      ? { ring: "#b3a26a", leaf: "#3db585", ink: "#ffffff" }
      : { ring: "#b3a26a", leaf: "#288868", ink: "#0a2a2a" };
  return (
    <svg
      viewBox="-46 -46 296 96"
      className={className}
      role="img"
      aria-label="TERC, de Wiremax"
    >
      <defs>
        <clipPath id={`terc-logo-cap-${variant}`}>
          <rect x="80" y="-23" width="170" height="51" />
        </clipPath>
      </defs>
      <circle
        r="40"
        fill="none"
        stroke={c.ring}
        strokeWidth="4"
        strokeDasharray="215 37"
        strokeLinecap="round"
        transform="rotate(26)"
      />
      <path d="M38 1C44-11 58-18 72-16 68-4 56 4 38 1Z" fill={c.leaf} />
      <g fill="none" stroke={c.ink} strokeWidth="10">
        <path d="M-22-18H22M0-18V28" />
        <g clipPath={`url(#terc-logo-cap-${variant})`}>
          <path d="M91-23V28M86-18H124M86 2.5H120M86 23H124" />
          <path d="M147-23V28M142-18H160A10.25 10.25 0 0 1 160 2.5H142M158 2.5L177 28" />
          <path d="M230.2-12A20.5 20.5 0 1 0 230.2 17" />
        </g>
      </g>
      <text
        x="86"
        y="47"
        fontSize="20"
        letterSpacing="2.5"
        fill={c.ink}
        fillOpacity=".55"
      >
        de Wiremax
      </text>
    </svg>
  );
}
