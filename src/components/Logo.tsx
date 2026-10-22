// Logo de TERC (identidad V1, concepto 4a), copiado del archivo oficial TERC_HORIZONTAL_COLOR.svg.
// Las letras usan Montserrat SemiBold, que la página ya carga.
// "light" es para fondos oscuros, como el pie de página (TERC_HORIZONTAL_FONDO_OSCURO.svg).
// En el encabezado el anillo va con grosor 3 para que no se pierda (norma del archivo maestro).
export function Logo({ className, variant = "dark" }: { className?: string; variant?: "dark" | "light" }) {
  const c =
    variant === "light"
      ? { ring: "#b3a26a", leaf: "#3db585", ink: "#ffffff", endorse: "#b3a26a" }
      : { ring: "#b3a26a", leaf: "#288868", ink: "#0a2a2a", endorse: "#288868" };
  const montserrat = "var(--font-montserrat), Montserrat, sans-serif";
  return (
    <svg viewBox="-6 0 240 112" className={className} role="img" aria-label="TERC, de Wiremax">
      <path
        d="M19 38.8 A37 37 0 0 1 84.8 46.3 M84.8 71.7 A37 37 0 0 1 13.05 60.9"
        fill="none"
        stroke={c.ring}
        strokeWidth="3"
      />
      <text x="50" y="82" textAnchor="middle" fontFamily={montserrat} fontWeight="600" fontSize="66" fill={c.ink}>
        T
      </text>
      <path d="M0 0 Q-10 -10 -24 -7 Q-13 6 0 0 Z" transform="translate(25,52)" fill={c.leaf} />
      <text
        x="86"
        y="82"
        fontFamily={montserrat}
        fontWeight="600"
        fontSize="66"
        letterSpacing="1"
        fill={c.ink}
      >
        ERC
      </text>
      <text
        x="228"
        y="106"
        textAnchor="end"
        fontFamily="var(--font-inter), Inter, sans-serif"
        fontWeight="500"
        fontSize="12"
        fill={c.endorse}
      >
        de Wiremax
      </text>
    </svg>
  );
}
