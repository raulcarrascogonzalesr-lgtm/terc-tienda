// Terqui, la mascota de TERC: un celular reacondicionado al que le brota la hoja del logo.
// Dibujado en SVG con los colores de la marca. Lleva un borde blanco para verse también sobre fondos oscuros.
// Las animaciones viven en globals.css (clases terqui-*) y se apagan con "reducir movimiento".

const INK = "#0a2a2a";
const LEAF = "#288868";
const LEAF_LIGHT = "#3db585";
const GOLD = "#b3a26a";
const CORAL = "#e5566b";
const KRAFT = "#d8ad73";

export type TerquiPose =
  | "hola"
  | "apunta"
  | "listo"
  | "cargando"
  | "sentado"
  | "colgando"
  | "duda"
  | "carrito" // confundido con un carrito vacío
  | "celebra" // saltando de alegría, con papel picado
  | "caja" // corriendo con un paquete
  | "corazon" // con un corazón en las manos
  | "lupa" // revisando con una lupa
  | "guino"; // guiñando un ojo

export const TERQUI_POSES: TerquiPose[] = [
  "hola",
  "apunta",
  "listo",
  "cargando",
  "sentado",
  "colgando",
  "duda",
  "carrito",
  "celebra",
  "caja",
  "corazon",
  "lupa",
  "guino",
];

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
  carrito: [
    [[70, 110], [52, 96], [62, 72]],
    [[130, 118], [140, 124], [149, 126]],
  ],
  celebra: [
    [[70, 108], [50, 88], [40, 64]],
    [[130, 108], [150, 88], [160, 64]],
  ],
  caja: [
    [[70, 120], [58, 136], [62, 152]],
    [[130, 120], [142, 136], [138, 152]],
  ],
  corazon: [
    [[72, 118], [76, 140], [86, 146]],
    [[128, 118], [124, 140], [114, 146]],
  ],
  lupa: [
    [[70, 118], [58, 136], [60, 150]],
    [[130, 112], [146, 104], [150, 92]],
  ],
  guino: [
    [[70, 118], [58, 136], [56, 150]],
    [[130, 112], [150, 106], [160, 94]],
  ],
};

// Poses que sostienen algo delante: los brazos van por encima del cuerpo.
const ARMS_FRONT: TerquiPose[] = ["corazon"];

const LEAN: Record<TerquiPose, number> = {
  hola: -4,
  apunta: 5,
  listo: 0,
  cargando: 0,
  sentado: 0,
  colgando: 10,
  duda: -8,
  carrito: -10,
  celebra: 0,
  caja: 8,
  corazon: -3,
  lupa: 4,
  guino: -5,
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
  const happy = pose === "listo" || pose === "colgando" || pose === "caja" || pose === "celebra" || pose === "corazon";
  const eyeY = happy ? 102 : 103;
  const brows =
    {
      listo: "M81 92 L93 90 M107 90 L119 92",
      colgando: "M81 92 L93 90 M107 90 L119 92",
      celebra: "M81 90 L93 87 M107 87 L119 90",
      corazon: "M81 93 L93 91 M107 91 L119 93",
      apunta: "M81 96 L94 95 M106 92 L118 89",
      duda: "M81 97 L94 97 M106 90 L118 93",
      carrito: "M81 96 L94 96 M106 91 L118 86",
      lupa: "M81 96 L94 96 M106 91 L118 91",
      guino: "M81 93 L93 92 M107 96 L119 96",
      caja: "M81 94 L93 91 M107 91 L119 94",
    }[pose as string] ?? "M81 95 L94 94 M106 94 L119 95";
  return (
    <>
      {pose === "guino" ? (
        <>
          <g className="terqui-blink">
            <rect x={84 + look} y={eyeY} width="7" height="13" rx="3.5" fill={INK} />
          </g>
          <path d={`M${106 + look} 110 Q${111.5 + look} 114 ${117 + look} 110`} stroke={INK} strokeWidth={3.2} strokeLinecap="round" fill="none" />
        </>
      ) : (
        <g className="terqui-blink">
          <rect x={84 + look} y={eyeY} width="7" height="13" rx="3.5" fill={INK} />
          <rect x={108 + look} y={eyeY} width="7" height="13" rx="3.5" fill={INK} />
        </g>
      )}
      <path d={brows} stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
      {pose === "celebra" ? (
        <path d="M88 120 Q100 140 112 120 Z" fill={INK} />
      ) : happy || pose === "guino" ? (
        <path d="M90 122 Q100 134 111 121 Z" fill={INK} />
      ) : pose === "carrito" ? (
        <ellipse cx="101" cy="126" rx="4" ry="5" fill={INK} />
      ) : pose === "duda" ? (
        <path d="M92 125 Q100 122 109 125" stroke={INK} strokeWidth={3.2} strokeLinecap="round" fill="none" />
      ) : pose === "lupa" ? (
        <path d="M93 125 L108 124" stroke={INK} strokeWidth={3.2} strokeLinecap="round" fill="none" />
      ) : (
        <path d="M91 124 Q100 130 110 123" stroke={INK} strokeWidth={3.2} strokeLinecap="round" fill="none" />
      )}
    </>
  );
}

// Mano dibujada otra vez encima de un objeto que Terqui sostiene.
function Grip({ at }: { at: Point }) {
  return (
    <>
      <circle cx={at[0]} cy={at[1]} r={7} fill="#fff" />
      <circle cx={at[0]} cy={at[1]} r={5} fill={INK} />
    </>
  );
}

function QuestionMark({ x, y, size, className }: { x: number; y: number; size: number; className?: string }) {
  return (
    <text
      x={x}
      y={y}
      className={className}
      fontFamily="var(--font-montserrat), Montserrat, sans-serif"
      fontWeight={800}
      fontSize={size}
      fill={GOLD}
      stroke="#fff"
      strokeWidth={3}
      paintOrder="stroke"
    >
      ?
    </text>
  );
}

// Objetos y detalles de cada pose nueva.
function Props({ pose }: { pose: TerquiPose }) {
  switch (pose) {
    case "carrito":
      return (
        <>
          <g className="terqui-wobble">
            <path d="M162 134 L204 134 L197 170 L168 170Z" fill="#fff" opacity=".9" />
            <Stroke d="M147 126 L157 126 L162 134 L204 134 L197 170 L168 170 L162 134" width={4} />
            <Stroke d="M166 152 L200 152 M182 134 L182 170" width={2.4} />
            <Stroke d="M168 170 L165 178 L198 178" width={4} />
            <circle cx="171" cy="187" r="7.5" fill="#fff" />
            <circle cx="171" cy="187" r="5" fill={INK} />
            <circle cx="194" cy="187" r="7.5" fill="#fff" />
            <circle cx="194" cy="187" r="5" fill={INK} />
          </g>
          <Grip at={[149, 126]} />
          <QuestionMark x={24} y={60} size={32} className="terqui-pop" />
          <QuestionMark x={176} y={124} size={24} className="terqui-pop terqui-pop-2" />
        </>
      );
    case "celebra": {
      const bits: [number, number, string, number][] = [
        [30, 40, LEAF, 0],
        [168, 34, GOLD, 0.3],
        [52, 20, CORAL, 0.6],
        [150, 14, LEAF_LIGHT, 0.9],
        [20, 90, GOLD, 1.2],
        [182, 80, CORAL, 0.45],
        [120, 6, "#6bb4e8", 0.75],
        [76, 4, GOLD, 1.05],
      ];
      return (
        <>
          {bits.map(([x, y, color, delay], i) => (
            <rect
              key={i}
              x={x}
              y={y}
              width={i % 2 ? 7 : 5}
              height={i % 2 ? 4 : 9}
              rx={1.5}
              fill={color}
              className="terqui-confetti"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </>
      );
    }
    case "caja":
      return (
        <>
          <Stroke d="M14 112 L40 112 M8 128 L36 128 M18 144 L42 144" width={3} color="#c9cfcc" />
          <rect x="58" y="136" width="84" height="44" rx="5" fill="#fff" />
          <rect x="60" y="138" width="80" height="40" rx="4" fill={KRAFT} />
          <rect x="60" y="138" width="80" height="9" rx="3" fill="#c39257" />
          <rect x="95" y="138" width="10" height="40" fill="#efe3c8" opacity=".75" />
          <path d="M100 170 C100 165 99 162 101 157" stroke={LEAF} strokeWidth={2.4} strokeLinecap="round" fill="none" />
          <path d="M100 162 Q91 152 82 156 Q89 165 100 162Z" fill={LEAF} />
          <path d="M101 158 Q109 147 120 150 Q113 161 101 158Z" fill={LEAF_LIGHT} />
          <Grip at={[62, 152]} />
          <Grip at={[138, 152]} />
        </>
      );
    case "corazon":
      return (
        <>
          <g className="terqui-pulse">
            <path
              d="M100 166 C80 152 74 140 82 132 C88 126 96 128 100 135 C104 128 112 126 118 132 C126 140 120 152 100 166Z"
              fill="#fff"
              stroke="#fff"
              strokeWidth={6}
              strokeLinejoin="round"
            />
            <path
              d="M100 166 C80 152 74 140 82 132 C88 126 96 128 100 135 C104 128 112 126 118 132 C126 140 120 152 100 166Z"
              fill={CORAL}
            />
            <path d="M86 138 Q88 133 93 133" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" fill="none" opacity=".7" />
          </g>
          <path className="terqui-float" d="M158 70 c-5 -4 -6 -8 -3 -10 c2 -1 3 0 3 1 c0 -1 1 -2 3 -1 c3 2 2 6 -3 10z" fill={CORAL} />
          <path
            className="terqui-float terqui-float-2"
            d="M42 84 c-4 -3 -5 -6 -2.5 -8 c1.5 -1 2.5 0 2.5 1 c0 -1 1 -2 2.5 -1 c2.5 1.5 1.5 5 -2.5 8z"
            fill={CORAL}
          />
        </>
      );
    case "lupa":
      return (
        <g className="terqui-scan">
          <Stroke d="M150 92 L158 82" width={6} />
          <circle cx="167" cy="70" r="17" fill="#fff" />
          <circle cx="167" cy="70" r="13" fill="#dff1fa" opacity=".9" stroke={INK} strokeWidth={4.5} />
          <path d="M160 63 Q163 59 168 59" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <Grip at={[150, 92]} />
        </g>
      );
    case "guino":
      return (
        <path
          className="terqui-twinkle"
          d="M178 70 L182 81 L193 85 L182 89 L178 100 L174 89 L163 85 L174 81Z"
          fill={GOLD}
          stroke="#fff"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      );
    default:
      return null;
  }
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
  const front = ARMS_FRONT.includes(pose);
  const motion =
    {
      cargando: "terqui-bob",
      colgando: "terqui-swing",
      duda: "terqui-tilt",
      listo: "terqui-hop",
      celebra: "terqui-jump",
      caja: "terqui-run",
      carrito: "terqui-tilt",
      corazon: "terqui-sway",
      guino: "terqui-sway",
    }[pose as string] ?? "";
  const legs = {
    sentado: ["terqui-kick-l", "terqui-kick-r"],
    colgando: ["terqui-dangle", "terqui-dangle"],
    caja: ["terqui-step-l", "terqui-step-r"],
  }[pose as string];
  const rightArm = { hola: "terqui-wave", apunta: "terqui-nudge", guino: "terqui-wave" }[pose as string];
  const arms = (
    <>
      <Arm points={left} className={pose === "carrito" ? "terqui-scratch" : undefined} />
      {pose !== "lupa" && <Arm points={right} className={rightArm} />}
      {pose === "lupa" && <Arm points={right} className="terqui-scan" />}
    </>
  );
  return (
    <svg
      viewBox={VIEWBOX[crop]}
      className={`${crop === "full" ? "overflow-visible" : ""} ${motion} ${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {pose !== "colgando" && pose !== "sentado" && crop === "full" && (
        <ellipse className={pose === "celebra" ? "terqui-shadow" : undefined} cx="100" cy="194" rx="34" ry="4" fill={INK} opacity=".08" />
      )}
      <Leg side="l" className={legs?.[0]} />
      <Leg side="r" className={legs?.[1]} />
      {!front && arms}
      {/* el brote */}
      <g transform={`rotate(${LEAN[pose]} 100 58)`}>
        <g className={pose === "celebra" || pose === "caja" ? "terqui-flutter" : undefined}>
          <path d="M100 58 C100 50 98 44 101 34" stroke={LEAF} strokeWidth={4} strokeLinecap="round" fill="none" />
          <path className={loading ? "terqui-leaf-l" : undefined} d="M100 44 Q84 24 64 30 Q76 50 100 44Z" fill={LEAF} />
          <path className={loading ? "terqui-leaf-r" : undefined} d="M101 37 Q116 14 138 20 Q126 42 101 37Z" fill={LEAF_LIGHT} />
        </g>
      </g>
      {/* cuerpo y pantalla */}
      <rect x="68" y="56" width="64" height="122" rx="15" fill="#fff" />
      <rect x="70" y="58" width="60" height="118" rx="13" fill={INK} />
      <rect x="75.5" y="69" width="49" height="96" rx="7" fill="#eaf5f0" />
      <rect x="93" y="62.5" width="14" height="3" rx="1.5" fill="#fff" opacity=".35" />
      <Face pose={pose} look={look === "left" ? -3 : look === "right" || pose === "carrito" || pose === "lupa" ? 3 : 0} />
      {front && arms}
      {/* detalles de cada pose */}
      {loading && (
        <>
          <rect x="84" y="142" width="32" height="5" rx="2.5" fill={INK} opacity=".12" />
          <rect className="terqui-bar" x="84" y="142" width="32" height="5" rx="2.5" fill={LEAF} />
        </>
      )}
      {pose === "apunta" && <Stroke d="M176 80 l6 -4 M180 90 l7 0 M176 100 l6 4" width={3} color={GOLD} />}
      {pose === "listo" && <Stroke d="M40 64 l-4 -7 M50 60 l0 -8 M160 60 l0 -8 M170 64 l4 -7" width={3} color={GOLD} />}
      {pose === "duda" && <QuestionMark x={150} y={60} size={30} />}
      <Props pose={pose} />
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
