// Terqui articulado. Dibuja a Terqui en SVG a partir de un "estado" con articulaciones:
// manos (con codo calculado), pies, inclinación, aplastado/estirado, ojos, cejas, boca y hoja.
// No usa imágenes: cada cuadro se vuelve a calcular, así puede caminar, hablar y pestañear.
// Coordenadas internas: caja de 200 x 200. Los pies tocan el suelo en y = 194.
const INK = "#0a2a2a", LEAF = "#288868", LEAF_LIGHT = "#3db585", GOLD = "#b3a26a", CORAL = "#e5566b", KRAFT = "#d8ad73";
const NS = "http://www.w3.org/2000/svg";
const SHOULDER = { l: [70, 118], r: [130, 118] };
const HIP = { l: [88, 176], r: [112, 176] };
const UPPER = 22, FORE = 17;
let uid = 0;

const el = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};
// Trazo con borde blanco: dos paths, devuelve una función que actualiza ambos.
const stroke = (parent, width = 4.5, color = INK) => {
  const c = { "stroke-linecap": "round", "stroke-linejoin": "round", fill: "none" };
  const a = el("path", { ...c, stroke: "#fff", "stroke-width": width + 4 }, parent);
  const b = el("path", { ...c, stroke: color, "stroke-width": width }, parent);
  return (d) => { a.setAttribute("d", d); b.setAttribute("d", d); };
};
const dot = (parent, r1 = 7, r2 = 5) => {
  const a = el("circle", { r: r1, fill: "#fff" }, parent), b = el("circle", { r: r2, fill: INK }, parent);
  return (x, y) => { for (const c of [a, b]) { c.setAttribute("cx", x); c.setAttribute("cy", y); } };
};

// Codo por cinemática inversa de dos huesos. Si la mano queda lejos, el brazo se estira (estilo dibujo animado).
function elbow(s, h, outward) {
  const dx = h[0] - s[0], dy = h[1] - s[1];
  let d = Math.hypot(dx, dy) || 0.001;
  let L1 = UPPER, L2 = FORE;
  if (d > L1 + L2 - 0.5) { const k = d / (L1 + L2 - 0.5); L1 *= k; L2 *= k; }
  d = Math.max(d, Math.abs(L1 - L2) + 0.5);
  const a = Math.acos(Math.min(1, Math.max(-1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
  const th = Math.atan2(dy, dx);
  const c1 = [s[0] + L1 * Math.cos(th + a), s[1] + L1 * Math.sin(th + a)];
  const c2 = [s[0] + L1 * Math.cos(th - a), s[1] + L1 * Math.sin(th - a)];
  // el codo va hacia afuera del cuerpo (o hacia adentro si se pide)
  const out = (p) => Math.abs(p[0] - 100);
  return (out(c1) > out(c2)) === (outward !== false) ? c1 : c2;
}

const DEFAULT = {
  lean: 0, squash: 0, bodyY: 0, sit: 0,
  handL: [58, 150], handR: [142, 150], elbowOutL: true, elbowOutR: true,
  footL: [86, 190], footR: [114, 190],
  look: [0, 0], eyeL: 1, eyeR: 1, eyeArc: 1,
  browL: [0, 0], browR: [0, 0], // [subir, preocupación]
  mouth: { w: 9.5, open: 0, smile: 1.5 },
  sprout: 0, flutter: 0, sproutGrow: 1,
  prop: null, propAngle: 0, armsFront: false, shadow: 1, gloss: 0,
};

export function TerquiRig(host, size = 560) {
  const id = "tq" + uid++;
  const svg = el("svg", { viewBox: "0 0 200 200", width: size, height: size, overflow: "visible" });
  svg.style.overflow = "visible";
  host.appendChild(svg);
  const shadow = el("ellipse", { cx: 100, cy: 194, rx: 34, ry: 4, fill: INK, opacity: 0.08 }, svg);
  const all = el("g", {}, svg);
  const legs = el("g", {}, all);
  const leg = {};
  for (const s of ["l", "r"]) {
    const g = el("g", {}, legs);
    leg[s] = {
      line: stroke(g),
      shoeW: el("ellipse", { rx: 9, ry: 5.5, fill: "#fff" }, g),
      shoe: el("ellipse", { rx: 7, ry: 3.5, fill: INK }, g),
    };
  }
  const body = el("g", {}, all);
  const armsBack = el("g", {}, body);
  const sprout = el("g", {}, body);
  const sproutIn = el("g", {}, sprout);
  el("path", { d: "M100 58 C100 50 98 44 101 34", stroke: LEAF, "stroke-width": 4, "stroke-linecap": "round", fill: "none" }, sproutIn);
  const leafL = el("path", { d: "M100 44 Q84 24 64 30 Q76 50 100 44Z", fill: LEAF }, sproutIn);
  const leafR = el("path", { d: "M101 37 Q116 14 138 20 Q126 42 101 37Z", fill: LEAF_LIGHT }, sproutIn);
  el("rect", { x: 68, y: 56, width: 64, height: 122, rx: 15, fill: "#fff" }, body);
  const defs = el("defs", {}, svg);
  // "gloss": versión con luz y volumen (pantalla con degradado y reflejo de vidrio)
  defs.innerHTML = `<linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14403d"/><stop offset="1" stop-color="#061e1e"/></linearGradient>
<linearGradient id="${id}g" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#fbfffd"/><stop offset="1" stop-color="#d3eadf"/></linearGradient>
<clipPath id="${id}s"><rect x="75.5" y="69" width="49" height="96" rx="7"/></clipPath>`;
  const bodyRect = el("rect", { x: 70, y: 58, width: 60, height: 118, rx: 13, fill: INK }, body);
  const screen = el("rect", { x: 75.5, y: 69, width: 49, height: 96, rx: 7, fill: "#eaf5f0" }, body);
  const glare = el("g", { "clip-path": `url(#${id}s)` }, body);
  el("path", { d: "M70 64 L108 64 L70 128 Z", fill: "#fff", opacity: 0.55 }, glare);
  el("path", { d: "M116 64 L124 64 L70 156 L70 142 Z", fill: "#fff", opacity: 0.4 }, glare);
  const rim = el("path", { d: "M128 74 L128 162", stroke: "#3db585", "stroke-width": 1.6, "stroke-linecap": "round", opacity: 0.5 }, body);
  el("rect", { x: 93, y: 62.5, width: 14, height: 3, rx: 1.5, fill: "#fff", opacity: 0.35 }, body);
  // cara
  const face = el("g", {}, body);
  const eye = {};
  for (const s of ["l", "r"]) {
    eye[s] = {
      rect: el("rect", { width: 7, height: 13, rx: 3.5, fill: INK }, face),
      arc: el("path", { stroke: INK, "stroke-width": 3.2, "stroke-linecap": "round", fill: "none" }, face),
    };
  }
  const brows = el("path", { stroke: INK, "stroke-width": 3, "stroke-linecap": "round", fill: "none" }, face);
  const clip = el("clipPath", { id: id + "m" }, defs);
  const clipPath = el("path", {}, clip);
  const mouthFill = el("path", { fill: INK, stroke: INK, "stroke-width": 2.4, "stroke-linejoin": "round" }, face);
  const tongue = el("ellipse", { fill: CORAL, "clip-path": `url(#${id}m)` }, face);
  const mouthLine = el("path", { stroke: INK, "stroke-width": 3.2, "stroke-linecap": "round", fill: "none" }, face);
  const armsFront = el("g", {}, body);
  const arm = {};
  for (const s of ["l", "r"]) {
    const g = el("g", {}, armsBack);
    arm[s] = { g, line: stroke(g), hand: dot(g) };
  }
  const props = el("g", {}, body);
  const P = buildProps(props);

  function draw(input) {
    const st = { ...DEFAULT, ...input, mouth: { ...DEFAULT.mouth, ...(input.mouth || {}) } };
    // aplastar/estirar desde los pies; "sit" baja todo para que la base del cuerpo toque el asiento
    const k = st.squash, sx = 1 + k * 0.6, sy = 1 - k;
    all.setAttribute("transform", `translate(0 ${st.sit * 16}) translate(100 194) scale(${sx} ${sy}) translate(-100 -194)`);
    shadow.setAttribute("opacity", 0.08 * st.shadow);
    const gl = st.gloss || 0;
    bodyRect.setAttribute("fill", gl ? `url(#${id}b)` : INK);
    screen.setAttribute("fill", gl ? `url(#${id}g)` : "#eaf5f0");
    glare.style.display = rim.style.display = gl ? "" : "none";
    shadow.setAttribute("rx", 34 * (1 + k * 0.4));
    // cuerpo: sube/baja y se inclina sobre la base
    const rad = (st.lean * Math.PI) / 180, cs = Math.cos(rad), sn = Math.sin(rad);
    body.setAttribute("transform", `translate(0 ${-st.bodyY}) rotate(${st.lean} 100 178)`);
    const toWorld = ([x, y]) => [100 + (x - 100) * cs - (y - 178) * sn, 178 + (x - 100) * sn + (y - 178) * cs - st.bodyY];
    for (const s of ["l", "r"]) {
      const hip = toWorld(HIP[s]);
      const f = s === "l" ? st.footL : st.footR;
      leg[s].line(`M${hip[0]} ${hip[1]} L${f[0]} ${f[1]}`);
      const shoeX = f[0] + (s === "l" ? -4 : 4);
      for (const e of [leg[s].shoeW, leg[s].shoe]) { e.setAttribute("cx", shoeX); e.setAttribute("cy", f[1] + 1); }
    }
    // brazos
    for (const s of ["l", "r"]) {
      const sh = SHOULDER[s], h = s === "l" ? st.handL : st.handR;
      const e = elbow(sh, h, s === "l" ? st.elbowOutL : st.elbowOutR);
      arm[s].line(`M${sh[0]} ${sh[1]} L${e[0]} ${e[1]} L${h[0]} ${h[1]}`);
      arm[s].hand(h[0], h[1]);
      (st.armsFront ? armsFront : armsBack).appendChild(arm[s].g);
    }
    // hoja: se inclina con el cuerpo y tiembla
    sprout.setAttribute("transform", `rotate(${st.sprout} 100 58) translate(100 58) scale(${st.sproutGrow}) translate(-100 -58)`);
    sprout.style.display = st.sproutGrow < 0.01 ? "none" : "";
    leafL.setAttribute("transform", `rotate(${st.flutter * 10} 100 44)`);
    leafR.setAttribute("transform", `rotate(${-st.flutter * 12} 101 37)`);
    // ojos
    const [lx, ly] = st.look;
    for (const s of ["l", "r"]) {
      const open = s === "l" ? st.eyeL : st.eyeR;
      const x = (s === "l" ? 84 : 108) + lx, y = 103 + ly;
      const { rect, arc } = eye[s];
      if (open > 0.22) {
        const h = 13 * open;
        rect.setAttribute("x", x); rect.setAttribute("y", y + (13 - h) / 2);
        rect.setAttribute("height", h); rect.setAttribute("rx", Math.min(3.5, h / 2));
        rect.style.display = ""; arc.style.display = "none";
      } else {
        rect.style.display = "none"; arc.style.display = "";
        const c = st.eyeArc; // 1: ojo cerrado contento, -1: ojo feliz hacia arriba
        arc.setAttribute("d", `M${x - 1.5} ${y + 7} Q${x + 3.5} ${y + 7 + 4 * c} ${x + 8.5} ${y + 7}`);
      }
    }
    const [lr, lt] = st.browL, [rr, rt] = st.browR;
    brows.setAttribute("d", `M${81 + lx * 0.5} ${95 - lr + lt} L${94 + lx * 0.5} ${94 - lr - lt} M${106 + lx * 0.5} ${94 - rr - rt} L${119 + lx * 0.5} ${95 - rr + rt}`);
    // boca: ancho, apertura y sonrisa
    const m = st.mouth, cx = 100.5 + lx * 0.6, cy = 124 + ly * 0.4;
    const L = [cx - m.w, cy - m.smile], R = [cx + m.w, cy - m.smile];
    if (m.open < 0.6) {
      mouthLine.style.display = ""; mouthFill.style.display = tongue.style.display = "none";
      mouthLine.setAttribute("d", `M${L[0]} ${L[1]} Q${cx} ${cy + m.smile * 1.2} ${R[0]} ${R[1]}`);
    } else {
      mouthLine.style.display = "none"; mouthFill.style.display = tongue.style.display = "";
      const top = cy + m.smile * 0.6 - m.open * 0.25, bot = cy + m.smile * 1.2 + m.open * 1.6;
      const d = `M${L[0]} ${L[1]} Q${cx} ${top} ${R[0]} ${R[1]} Q${cx} ${bot} ${L[0]} ${L[1]}Z`;
      mouthFill.setAttribute("d", d); clipPath.setAttribute("d", d);
      const bm = (L[1] + bot) / 2;
      tongue.setAttribute("cx", cx); tongue.setAttribute("cy", bm - 0.5);
      tongue.setAttribute("rx", m.w * 0.55); tongue.setAttribute("ry", Math.max(1, m.open * 0.35));
    }
    P.draw(st);
  }
  return { svg, draw, size };
}

// Objetos que Terqui sostiene. Se dibujan en su posición original y se mueven hasta la mano.
function buildProps(root) {
  const make = (svg) => { const g = el("g", {}, root); g.innerHTML = svg; g.style.display = "none"; return g; };
  const W = (d, w, c) => `<path d="${d}" stroke="#fff" stroke-width="${w + 4}" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="${d}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const HEART = "M100 166 C80 152 74 140 82 132 C88 126 96 128 100 135 C104 128 112 126 118 132 C126 140 120 152 100 166Z";
  const grip = (x, y) => `<circle cx="${x}" cy="${y}" r="7" fill="#fff"/><circle cx="${x}" cy="${y}" r="5" fill="${INK}"/>`;
  const items = {
    heart: { anchor: [100, 146], two: true, g: make(`<path d="${HEART}" fill="#fff" stroke="#fff" stroke-width="6" stroke-linejoin="round"/><path d="${HEART}" fill="${CORAL}"/><path d="M86 138 Q88 133 93 133" stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".7"/>`) },
    box: { anchor: [100, 152], two: true, g: make(`<rect x="58" y="136" width="84" height="44" rx="5" fill="#fff"/><rect x="60" y="138" width="80" height="40" rx="4" fill="${KRAFT}"/><rect x="60" y="138" width="80" height="9" rx="3" fill="#c39257"/><rect x="95" y="138" width="10" height="40" fill="#efe3c8" opacity=".75"/><path d="M100 162 Q91 152 82 156 Q89 165 100 162Z" fill="${LEAF}"/><path d="M101 158 Q109 147 120 150 Q113 161 101 158Z" fill="${LEAF_LIGHT}"/>`) },
    lupa: { anchor: [150, 92], g: make(`${W("M150 92 L158 82", 6, INK)}<circle cx="167" cy="70" r="17" fill="#fff"/><circle cx="167" cy="70" r="13" fill="#dff1fa" opacity=".9" stroke="${INK}" stroke-width="4.5"/><path d="M160 63 Q163 59 168 59" stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none"/>`) },
    mug: { anchor: [150, 146], g: make(`<path d="M176 132 q12 0 12 9 q0 9 -12 9" stroke="#fff" stroke-width="9" fill="none"/><path d="M176 132 q12 0 12 9 q0 9 -12 9" stroke="${INK}" stroke-width="4.5" fill="none"/><path d="M144 126 L178 126 L174 159 Q173 164 168 164 L154 164 Q149 164 148 159 Z" fill="${CORAL}" stroke="#fff" stroke-width="3"/><rect x="144" y="126" width="34" height="6" rx="2" fill="#7a4a2a"/>`) },
    star: { anchor: [178, 85], g: make(`<path d="M178 70 L182 81 L193 85 L182 89 L178 100 L174 89 L163 85 L174 81Z" fill="${GOLD}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>`) },
  };
  const grips = el("g", {}, root);
  grips.innerHTML = grip(0, 0) + grip(0, 0);
  return {
    draw(st) {
      for (const [k, it] of Object.entries(items)) {
        const on = st.prop === k;
        it.g.style.display = on ? "" : "none";
        if (!on) continue;
        const h = it.two ? [(st.handL[0] + st.handR[0]) / 2, (st.handL[1] + st.handR[1]) / 2] : st.handR;
        const s = k === "heart" ? 1 + (st.pulse || 0) * 0.1 : 1;
        it.g.setAttribute("transform", `translate(${h[0]} ${h[1]}) rotate(${st.propAngle}) scale(${s}) translate(${-it.anchor[0]} ${-it.anchor[1]})`);
      }
      // las manos se dibujan otra vez encima del objeto
      const show = st.prop && st.prop !== "star";
      const cs = grips.querySelectorAll("circle");
      const two = st.prop && items[st.prop] && items[st.prop].two;
      [[st.handL, 0], [st.handR, 2]].forEach(([h, i]) => {
        const vis = show && (two || i === 2);
        for (const c of [cs[i], cs[i + 1]]) { c.setAttribute("cx", h[0]); c.setAttribute("cy", h[1]); c.style.display = vis ? "" : "none"; }
      });
    },
  };
}

