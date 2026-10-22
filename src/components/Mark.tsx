// Isotipo de TERC (identidad V1): anillo dorado abierto, la T y la hoja.
// Geometría copiada del archivo oficial TERC_ISOTIPO_COLOR.svg; no recomponer.
// "technical" es la variante para tamaños chicos (bajo 48 px): anillo y T más gruesos.
export function Mark({
  className,
  ring = "#b3a26a",
  leaf,
  ink = "#0a2a2a",
  technical = false,
}: {
  className?: string;
  ring?: string;
  leaf?: string;
  ink?: string;
  technical?: boolean;
}) {
  // Sobre fondo oscuro (T blanca) la hoja usa el verde claro de la marca.
  leaf ??= ink === "#ffffff" ? "#3db585" : "#288868";
  return (
    <svg viewBox="-4 5 108 108" className={className} aria-hidden>
      <path
        d="M19 38.8 A37 37 0 0 1 84.8 46.3 M84.8 71.7 A37 37 0 0 1 13.05 60.9"
        fill="none"
        stroke={ring}
        strokeWidth={technical ? 6 : 2.3}
      />
      <text
        x="50"
        y={technical ? 84 : 82}
        textAnchor="middle"
        fontFamily="var(--font-montserrat), Montserrat, sans-serif"
        fontWeight={technical ? 700 : 600}
        fontSize={technical ? 70 : 66}
        fill={ink}
      >
        T
      </text>
      <path
        d="M0 0 Q-10 -10 -24 -7 Q-13 6 0 0 Z"
        transform={technical ? "translate(27,52) scale(1.25)" : "translate(25,52)"}
        fill={leaf}
      />
    </svg>
  );
}
