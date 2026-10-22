// Terqui, la mascota de TERC: un celular reacondicionado al que le brota la hoja del logo.
// Dibujado en SVG con los colores de la marca. Las animaciones viven en globals.css (clases terqui-*).

const INK = "#0a2a2a";
const LEAF = "#288868";
const LEAF_LIGHT = "#3db585";
const GOLD = "#b3a26a";

export type TerquiPose = "hola" | "apunta" | "listo" | "cargando";

const line = { stroke: INK, strokeWidth: 4.5, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;

// Brazo con codo: hombro, codo y mano.
function Arm({ points }: { points: [number, number][] }) {
  const [hx, hy] = points[points.length - 1];
  return (
    <>
      <polyline points={points.map((p) => p.join(",")).join(" ")} {...line} />
      <circle cx={hx} cy={hy} r={5} fill={INK} />
    </>
  );
}

const ARMS: Record<TerquiPose, [number, number][][]> = {
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
};

const LEAN: Record<TerquiPose, number> = { hola: -4, apunta: 5, listo: 0, cargando: 0 };

export function Terqui({
  pose = "hola",
  className = "w-40 h-40",
  title,
}: {
  pose?: TerquiPose;
  className?: string;
  title?: string; // si se indica, el dibujo se anuncia a lectores de pantalla
}) {
  const loading = pose === "cargando";
  const happy = pose === "listo";
  const smirk = pose === "apunta";
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${loading ? "terqui-bob" : ""} ${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <ellipse cx="100" cy="193" rx="34" ry="4" fill={INK} opacity=".08" />
      {/* piernas */}
      <path d="M88 176 L86 190 M112 176 L114 190" {...line} />
      <ellipse cx="82" cy="191" rx="7" ry="3.5" fill={INK} />
      <ellipse cx="118" cy="191" rx="7" ry="3.5" fill={INK} />
      {ARMS[pose].map((points, i) => (
        <Arm key={i} points={points} />
      ))}
      {/* el brote */}
      <g transform={`rotate(${LEAN[pose]} 100 58)`}>
        <path d="M100 58 C100 50 98 44 101 34" stroke={LEAF} strokeWidth={4} strokeLinecap="round" fill="none" />
        <path className={loading ? "terqui-leaf-l" : undefined} d="M100 44 Q84 24 64 30 Q76 50 100 44Z" fill={LEAF} />
        <path className={loading ? "terqui-leaf-r" : undefined} d="M101 37 Q116 14 138 20 Q126 42 101 37Z" fill={LEAF_LIGHT} />
      </g>
      {/* cuerpo y pantalla */}
      <rect x="70" y="58" width="60" height="118" rx="13" fill={INK} />
      <rect x="75.5" y="69" width="49" height="96" rx="7" fill="#eaf5f0" />
      <rect x="93" y="62.5" width="14" height="3" rx="1.5" fill="#fff" opacity=".35" />
      {/* cara: ojos de pantalla y cejas */}
      <g className="terqui-blink">
        <rect x="84" y={happy ? 102 : 103} width="7" height="13" rx="3.5" fill={INK} />
        <rect x="108" y={happy ? 102 : 103} width="7" height="13" rx="3.5" fill={INK} />
      </g>
      {happy ? (
        <path d="M81 92 L93 90 M107 90 L119 92" {...line} strokeWidth={3} />
      ) : smirk ? (
        <path d="M81 96 L94 95 M106 92 L118 89" {...line} strokeWidth={3} />
      ) : (
        <path d="M81 95 L94 94 M106 94 L119 95" {...line} strokeWidth={3} />
      )}
      {happy ? (
        <path d="M90 122 Q100 134 111 121 Z" fill={INK} />
      ) : (
        <path d="M91 124 Q100 130 110 123" {...line} strokeWidth={3.2} />
      )}
      {/* detalles de cada pose */}
      {loading && (
        <>
          <rect x="84" y="142" width="32" height="5" rx="2.5" fill={INK} opacity=".12" />
          <rect className="terqui-bar" x="84" y="142" width="32" height="5" rx="2.5" fill={LEAF} />
        </>
      )}
      {smirk && <path d="M176 80 l6 -4 M180 90 l7 0 M176 100 l6 4" {...line} stroke={GOLD} strokeWidth={3} />}
      {happy && <path d="M40 64 l-4 -7 M50 60 l0 -8 M160 60 l0 -8 M170 64 l4 -7" {...line} stroke={GOLD} strokeWidth={3} />}
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
