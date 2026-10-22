// Terqui, la mascota de TERC: un celular reacondicionado al que le brota la hoja del logo.
// Dibujado en SVG con los colores de la marca. Lleva un borde blanco para verse también sobre fondos oscuros.
// Las animaciones viven en globals.css (clases terqui-*) y se apagan con "reducir movimiento".

const INK = "#0a2a2a";
const LEAF = "#288868";
const LEAF_LIGHT = "#3db585";
const GOLD = "#b3a26a";

export type TerquiPose = "hola" | "apunta" | "listo" | "cargando" | "sentado" | "colgando" | "duda";

type Point = [number, number];

const ARMS: Record<TerquiPose, [Point[], Point[]]> = {
  hola: [
    [[70, 118], [56, 136], [52, 150]],
    [[130, 112], [148, 100], [152, 78]],
  ],
  apunta: [
    [[70, 118], [58, 138], [62, 152]],
    [[130, 110], [152, 104], [172, 92]],
  ],
  listo: [
    [[70, 112], [52, 100], [46, 78]],
    [[130, 112], [148, 100], [154, 78]],
  ],
  cargando: [
    [[70, 118], [58, 136], [60, 150]],
    [[130, 118], [142, 136], [140, 150]],
  ],
  sentado: [
    [[70, 122], [60, 150], [64, 172]],
    [[130, 122], [140, 150], [136, 172]],
  ],
  colgando: [
    [[70, 76], [56, 46], [62, 14]],
    [[130, 120], [144, 140], [142, 158]],
  ],
  duda: [
    [[70, 118], [58, 138], [62, 152]],
    [[130, 108], [152, 94], [137, 74]],
  ],
};

const LEAN: Record<TerquiPose, number> = {
  hola: -4,
  apunta: 5,
  listo: 0,
  cargando: 0,
  sentado: 0,
  colgando: 10,
  duda: -8,
};

// Cada trazo se dibuja dos veces: blanco grueso debajo (el borde) y oscuro encima.
function Stroke({ d, width = 4.5, color = INK }: { d: string; width?: number; color?: string }) {
  const common = { strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;
  return (
    <>
      <path d={d} {...common} stroke="#fff" strokeWidth={width + 4} />
      <path d={d} {...common} stroke={color} strokeWidth={width} />
    </>
  );
}

function Arm({ points, className }: { points: Point[]; className?: string }) {
  const [hx, hy] = points[points.length - 1];
  return (
    <g className={className}>
      <Stroke d={`M${points.map((p) => p.join(" ")).join(" L")}`} />
      <circle cx={hx} cy={hy} r={7} fill="#fff" />
      <circle cx={hx} cy={hy} r={5} fill={INK} />
    </g>
  );
}

function Leg({ side, className }: { side: "l" | "r"; className?: string }) {
  const [hip, foot] = side === "l" ? [88, 86] : [112, 114];
  const shoe = side === "l" ? 82 : 118;
  return (
    <g className={className}>
      <Stroke d={`M${hip} 176 L${foot} 190`} />
      <ellipse cx={shoe} cy="191" rx="9" ry="5.5" fill="#fff" />
      <ellipse cx={shoe} cy="191" rx="7" ry="3.5" fill={INK} />
    </g>
  );
}

function Face({ pose, look }: { pose: TerquiPose; look: number }) {
  const happy = pose === "listo" || pose === "colgando";
  const eyeY = happy ? 102 : 103;
  const brows = {
    listo: "M81 92 L93 90 M107 90 L119 92",
    colgando: "M81 92 L93 90 M107 90 L119 92",
    apunta: "M81 96 L94 95 M106 92 L118 89",
    duda: "M81 97 L94 97 M106 90 L118 93",
  }[pose as string] ?? "M81 95 L94 94 M106 94 L119 95";
  return (
    <>
      <g className="terqui-blink">
        <rect x={84 + look} y={eyeY} width="7" height="13" rx="3.5" fill={INK} />
        <rect x={108 + look} y={eyeY} width="7" height="13" rx="3.5" fill={INK} />
      </g>
      <path d={brows} stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
      {happy ? (
        <path d="M90 122 Q100 134 111 121 Z" fill={INK} />
      ) : pose === "duda" ? (
        <path d="M92 125 Q100 122 109 125" stroke={INK} strokeWidth={3.2} strokeLinecap="round" fill="none" />
      ) : (
        <path d="M91 124 Q100 130 110 123" stroke={INK} strokeWidth={3.2} strokeLinecap="round" fill="none" />
      )}
    </>
  );
}

// "asoma" recorta el dibujo para que solo se vea desde la cintura hacia arriba, como asomándose.
const VIEWBOX = { full: "0 0 200 200", asoma: "40 8 145 130" };

export function Terqui({
  pose = "hola",
  className = "w-40 h-40",
  title,
  look = "center",
  crop = "full",
}: {
  pose?: TerquiPose;
  className?: string;
  title?: string; // si se indica, el dibujo se anuncia a lectores de pantalla
  look?: "left" | "center" | "right";
  crop?: keyof typeof VIEWBOX;
}) {
  const loading = pose === "cargando";
  const [left, right] = ARMS[pose];
  const motion = { cargando: "terqui-bob", colgando: "terqui-swing", duda: "terqui-tilt" }[pose as string] ?? "";
  return (
    <svg
      viewBox={VIEWBOX[crop]}
      className={`${crop === "full" ? "overflow-visible" : ""} ${motion} ${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {pose !== "colgando" && pose !== "sentado" && crop === "full" && (
        <ellipse cx="100" cy="194" rx="34" ry="4" fill={INK} opacity=".08" />
      )}
      <Leg side="l" className={pose === "sentado" ? "terqui-kick-l" : pose === "colgando" ? "terqui-dangle" : undefined} />
      <Leg side="r" className={pose === "sentado" ? "terqui-kick-r" : pose === "colgando" ? "terqui-dangle" : undefined} />
      <Arm points={left} />
      <Arm points={right} className={pose === "hola" ? "terqui-wave" : undefined} />
      {/* el brote */}
      <g transform={`rotate(${LEAN[pose]} 100 58)`}>
        <path d="M100 58 C100 50 98 44 101 34" stroke={LEAF} strokeWidth={4} strokeLinecap="round" fill="none" />
        <path className={loading ? "terqui-leaf-l" : undefined} d="M100 44 Q84 24 64 30 Q76 50 100 44Z" fill={LEAF} />
        <path className={loading ? "terqui-leaf-r" : undefined} d="M101 37 Q116 14 138 20 Q126 42 101 37Z" fill={LEAF_LIGHT} />
      </g>
      {/* cuerpo y pantalla */}
      <rect x="68" y="56" width="64" height="122" rx="15" fill="#fff" />
      <rect x="70" y="58" width="60" height="118" rx="13" fill={INK} />
      <rect x="75.5" y="69" width="49" height="96" rx="7" fill="#eaf5f0" />
      <rect x="93" y="62.5" width="14" height="3" rx="1.5" fill="#fff" opacity=".35" />
      <Face pose={pose} look={look === "left" ? -3 : look === "right" ? 3 : 0} />
      {/* detalles de cada pose */}
      {loading && (
        <>
          <rect x="84" y="142" width="32" height="5" rx="2.5" fill={INK} opacity=".12" />
          <rect className="terqui-bar" x="84" y="142" width="32" height="5" rx="2.5" fill={LEAF} />
        </>
      )}
      {pose === "apunta" && <Stroke d="M176 80 l6 -4 M180 90 l7 0 M176 100 l6 4" width={3} color={GOLD} />}
      {pose === "listo" && <Stroke d="M40 64 l-4 -7 M50 60 l0 -8 M160 60 l0 -8 M170 64 l4 -7" width={3} color={GOLD} />}
      {pose === "duda" && (
        <text x="150" y="60" fontFamily="var(--font-montserrat), Montserrat, sans-serif" fontWeight={800} fontSize={30} fill={GOLD} stroke="#fff" strokeWidth={3} paintOrder="stroke">
          ?
        </text>
      )}
    </svg>
  );
}

// Terqui cargando, con frases que van cambiando. Aparece con un pequeño retraso
// para que no parpadee cuando la página carga rápido.
export function TerquiLoader({
  messages = ["Revisando la batería…", "Probando la pantalla…", "Casi listo"],
  overlay = false,
}: {
  messages?: [string, string, string];
  overlay?: boolean;
}) {
  return (
    <div
      role="status"
      className={`terqui-loader flex flex-col items-center justify-center gap-3 ${
        overlay ? "fixed inset-0 z-50 bg-paper/95 backdrop-blur-sm" : "min-h-[60vh]"
      }`}
    >
      <Terqui pose="cargando" className="w-36 h-36" />
      <p className="terqui-msgs relative h-6 w-64 text-center text-[15px] text-muted">
        {messages.map((m) => (
          <span key={m} className="absolute inset-x-0">
            {m}
          </span>
        ))}
      </p>
    </div>
  );
}
