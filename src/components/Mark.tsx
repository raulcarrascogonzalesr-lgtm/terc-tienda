// Símbolo de TERC (anillo, T y hoja) para usar como adorno.
export function Mark({
  className,
  ring = "#b3a26a",
  leaf,
  ink = "#0a2a2a",
  stroke = 4,
}: {
  className?: string;
  ring?: string;
  leaf?: string;
  ink?: string;
  stroke?: number;
}) {
  // Sobre fondo oscuro (letras blancas) la hoja usa el verde claro de la marca.
  leaf ??= ink === "#ffffff" ? "#3db585" : "#288868";
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
