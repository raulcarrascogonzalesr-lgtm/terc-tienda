// El banner de la portada: Terqui presenta los equipos del catálogo y entre medio cuenta
// la garantía, la revisión y el envío. Todo se calcula a partir del tiempo t (en segundos),
// así cada cuadro sale igual y los botones de anterior/siguiente solo cambian t.
// El guion es largo (unos 6 minutos) y cada vuelta parte en otro equipo, para que no se note el loop.
// El sonido parte apagado: música suave y la voz y efectos de Terqui, hechos en vivo con WebAudio.
import { TerquiRig } from "./rig";
import { performer, place } from "./motion";

const LINES = {
  notebook: ["¡Mira este notebook!", "Liviano y listo para la pega", "Este es de los buenos"],
  aio: ["Todo en uno, cero enredos", "Pantalla grande, escritorio ordenado"],
  desktop: ["Potencia para la oficina", "Firme para trabajar todo el día"],
  mini: ["Chiquito, pero rinde harto", "Cabe detrás del monitor"],
  offer: ["¡Oferta de Terqui!", "¡Este está rebajado!"],
};
const PROD_POSES = ["apunta", "explica", "guino", "apunta", "arriba"];
const DUR = { intro: 5, prod: 5.6, garantia: 5.4, revisado: 5.6, envio: 6.2 };
const TRUST = ["garantia", "revisado", "envio"];
const LABELS = { intro: "Hola", garantia: "Garantía TERC", revisado: "Revisado uno a uno", envio: "Envío a todo Chile" };
const TQ = 560; // tamaño del dibujo de Terqui en el escenario

// Dos escenarios fijos que se escalan al ancho del banner: computador y celular.
const LAYOUTS = {
  d: { W: 1440, H: 640, tx: 96, ty: 84, tw: 720, cy: 488, py: 584, pw: 560, h1: 58, p: 21, chip: 16, price: 46, small: 14, btn: 17, bub: 24,
       TX: 1236, G: 590, S: 0.7, prod: { x: 915, y: 520 }, maxW: 520, maxH: 380, ring: { x: 960, y: 300, r: 170 }, stamp: { x: 680, y: 300 }, bx: -24,
       card: { x: 770, y: 250 }, route: { x: 700, y: 260, w: 480 } },
  m: { W: 720, H: 1100, tx: 44, ty: 118, tw: 632, cy: 508, py: 1040, pw: 632, h1: 62, p: 26, chip: 22, price: 52, small: 19, btn: 23, bub: 28,
       TX: 588, G: 1015, S: 0.66, prod: { x: 300, y: 925 }, maxW: 500, maxH: 330, ring: { x: 330, y: 780, r: 150 }, stamp: { x: 112, y: 690 }, bx: 30,
       card: { x: 44, y: 725 }, route: { x: 10, y: 700, w: 470 } },
};
export const HERO_RATIO = { d: LAYOUTS.d.H / LAYOUTS.d.W, m: LAYOUTS.m.H / LAYOUTS.m.W };

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, p) => a + (b - a) * p;
const ease = {
  out: (p) => 1 - Math.pow(1 - p, 3),
  io: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  back: (p) => 1 + 2.4 * Math.pow(p - 1, 3) + 1.4 * Math.pow(p - 1, 2),
};
const seg = (t, a, b) => clamp((t - a) / (b - a));
const clp = (n) => "$" + n.toLocaleString("es-CL");
const pct = (p) => Math.round((1 - p.price / p.before) * 100);

// El guion: bienvenida y después los equipos, con un mensaje de confianza cada tres.
function buildScript(products) {
  const out = [];
  let t = 0;
  const push = (type, extra = {}) => {
    const dur = DUR[type];
    out.push({ type, t0: t, dur, ...extra });
    t += dur;
  };
  push("intro");
  let n = 0, trust = 0, round = 0;
  if (!products.length) {
    for (const type of TRUST) push(type);
  }
  while (products.length && out.length < 64) {
    const order = products.map((_, i) => (i + round * 2) % products.length);
    for (const k of order) {
      const p = products[k];
      const bank = p.deal === "oferta" ? LINES.offer : LINES[p.kind];
      push("prod", { p, slot: n % 2, line: bank[(n + round) % bank.length], pose: PROD_POSES[n % PROD_POSES.length], from: n % 2 ? 1 : -1 });
      n++;
      if (n % 3 === 0) push(TRUST[trust++ % TRUST.length]);
    }
    round++;
  }
  return { segs: out, end: t, loopFrom: out[1].t0 };
}

/**
 * Arranca el banner dentro de `root` (el HTML lo pone TerquiHero.tsx).
 * opts.products: equipos ya preparados ({ id, slug, kind, brand, cat, name, chips, price, before, deal, img })
 * opts.cutout(src): devuelve { url, ar } con la foto sin fondo blanco
 * opts.music: dirección de la música · opts.startDelay: segundos de espera (la cortina)
 * Devuelve { stop, start } (start adelanta la espera, por ejemplo al saltar la cortina).
 */
export function startHero(root, opts) {
  const products = opts.products;
  const SCRIPT = buildScript(products);
  const SEGS = SCRIPT.segs;
  const segAt = (t) => {
    let lo = 0, hi = SEGS.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (SEGS[mid].t0 <= t) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  };
  const cache = {};
  const $ = (name) => cache[name] || (cache[name] = root.querySelector(`[data-h="${name}"]`));
  const stage = $("stage");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lay = null, mode = null, P = null, rig = null, LINES_AT = [], CUES = [];
  let visible = true, raf = 0, stopped = false;

  // Fotos sin fondo, una a la vez para no trabar la animación.
  const photos = new Map();
  const queue = [...new Set(products.map((p) => p.img))];
  (async () => {
    for (const src of queue) {
      if (stopped) return;
      try {
        photos.set(src, await opts.cutout(src));
      } catch {
        photos.set(src, null);
      }
      await new Promise((r) => setTimeout(r, 60));
    }
  })();

  // Partículas: hojitas que suben despacio.
  const motes = [];
  for (let i = 0; i < 16; i++) {
    const m = document.createElement("div");
    m.className = "hx-mote";
    m.style.background = i % 3 === 0 ? "#b3a26a" : "#3db585";
    $("motes").appendChild(m);
    motes.push({ el: m, x: (i * 0.618) % 1, sp: 0.018 + ((i * 7) % 5) * 0.006, ph: (i * 0.37) % 1, s: 0.6 + ((i * 3) % 4) * 0.25 });
  }

  // Terqui: su coreografía sale del mismo guion.
  function buildTerqui() {
    const l = lay;
    P = performer({ bpm: 96, size: TQ, seed: 11 });
    LINES_AT = [];
    const talk = (t, text) => {
      const end = P.say(t, text);
      LINES_AT.push({ t, end, text });
    };
    P.place(0, { x: l.W + 220, g: l.G, s: l.S });
    P.pose(0, "camina", 0);
    P.walk(0.25, 1.95, { x: l.TX });
    P.pose(1.95, "hola", 0.25);
    talk(2.15, "¡Hola! Soy Terqui");
    for (const s of SEGS.slice(1)) {
      const t = s.t0;
      if (s.type === "prod") {
        P.pose(t + 0.25, s.pose, 0.25);
        talk(t + 0.7, s.line);
      } else if (s.type === "garantia") {
        P.jump(t + 0.05, t + 0.75, { x: l.TX }, { h: 90, land: "corazon" });
        talk(t + 1.0, "¡Compra tranquilo!");
      } else if (s.type === "revisado") {
        P.pose(t + 0.2, "lupa", 0.3);
        talk(t + 0.8, "¡Pieza por pieza!");
      } else if (s.type === "envio") {
        // se va por la derecha y vuelve por la izquierda con la caja
        P.pose(t, "camina", 0.2);
        P.walk(t + 0.05, t + 0.95, { x: l.W + 220 });
        P.place(t + 1.0, { x: -220 });
        P.pose(t + 1.0, "caja", 0);
        P.walk(t + 1.1, t + 3.0, { x: l.TX });
        talk(t + 3.2, "¡Va en camino!");
      }
    }
    $("tq").innerHTML = "";
    rig = TerquiRig($("tq"), TQ);
    CUES = P.cues().filter((c) => c.type === "voice" || c.type === "step" || c.type === "land" || c.type === "takeoff");
    for (const s of SEGS) {
      if (s.type === "prod") CUES.push({ t: s.t0 + 0.05, type: "whoosh" }, { t: s.t0 + 0.65, type: "sparkle" }, { t: s.t0 + 1.45, type: "pop" });
      if (s.type === "garantia") CUES.push({ t: s.t0 + 1.3, type: "ding" });
      if (s.type === "revisado") for (let i = 0; i < 5; i++) CUES.push({ t: s.t0 + 1.2 + i * 0.45, type: "tick" });
      if (s.type === "envio") CUES.push({ t: s.t0 + 3.0, type: "ding" });
    }
    CUES.sort((a, b) => a.t - b.t);
  }

  function applyLayout() {
    const w = root.clientWidth;
    if (!w) return;
    const next = w < 700 ? "m" : "d";
    const l = LAYOUTS[next];
    const k = w / l.W;
    stage.style.width = l.W + "px";
    stage.style.height = l.H + "px";
    stage.style.transform = `scale(${k})`;
    if (next === mode) return;
    mode = next;
    lay = l;
    root.classList.toggle("hx-compact", next === "m");
    const s = stage.style;
    for (const key of ["tx", "ty", "tw", "cy", "py", "pw", "h1", "p", "chip", "price", "small", "btn", "bub"]) s.setProperty("--" + key, l[key] + "px");
    const P0 = l.prod;
    const set = (el, css) => Object.assign($(el).style, css);
    set("g1", { width: "900px", height: "900px" });
    set("g2", { width: "700px", height: "700px" });
    set("g3", { width: "620px", height: "620px" });
    set("floor", { height: l.H * 0.55 + "px" });
    set("spot", { left: P0.x - 330 + "px", top: "-40px", width: "660px", height: P0.y + 60 + "px" });
    set("podium", { left: P0.x - 330 + "px", top: P0.y - 70 + "px", width: "660px", height: "140px" });
    set("pring", { left: P0.x - 250 + "px", top: P0.y - 34 + "px", width: "500px", height: "68px" });
    set("pshadow", { left: P0.x - 230 + "px", top: P0.y - 22 + "px", width: "460px", height: "44px" });
    set("ring", { left: l.ring.x - l.ring.r * 1.18 + "px", top: l.ring.y - l.ring.r * 1.18 + "px", width: l.ring.r * 2.36 + "px", height: l.ring.r * 2.36 + "px" });
    set("ringLabel", { left: l.ring.x - 150 + "px", top: l.ring.y - 95 + "px", width: "300px", height: "190px" });
    set("checkCard", { left: l.card.x + "px", top: l.card.y + "px" });
    set("route", { left: l.route.x + "px", top: l.route.y + "px", width: l.route.w + "px", height: l.route.w / 2 + "px" });
    buildTerqui();
    lastSlot = [null, null];
    bubbleText = null;
    stage.classList.add("hx-ready");
  }

  // ---------- bloques de texto ----------
  const blocks = {};
  for (const b of stage.querySelectorAll("[data-block]")) blocks[b.dataset.block] = b;
  const anims = new Map(); // bloque -> elementos animados (se recalcula al llenar un bloque)
  const scan = (b) => anims.set(b, [...b.querySelectorAll("[data-in]")].map((el) => ({ el, tin: +el.dataset.in, fx: el.dataset.fx || "up" })));
  Object.values(blocks).forEach(scan);

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  function fillProduct(b, p) {
    if (b.dataset.pid === p.id) return;
    b.dataset.pid = p.id;
    b.querySelector('[data-k="eyebrow"]').textContent = `${p.brand} · ${p.cat}`;
    b.querySelector('[data-k="name"]').textContent = p.name;
    b.querySelector('[data-k="chips"]').innerHTML = p.chips
      .map((c, i) => `<span class="hx-chip" data-in="${(0.95 + i * 0.1).toFixed(2)}">${esc(c)}</span>`)
      .join("");
    const pr = b.querySelector('[data-k="price"]');
    pr.classList.toggle("hx-sale", p.deal === "oferta");
    if (p.deal === "oferta") {
      pr.innerHTML = `<div class="hx-main"><div class="hx-amt">${clp(p.price)}</div><div class="hx-was">Antes <s>${clp(p.before)}</s> · ahorras ${clp(p.before - p.price)}</div></div><div class="hx-pct">Oferta<br>−${pct(p)}%</div>`;
    } else if (p.deal === "nuevo") {
      pr.innerHTML = `<div class="hx-main"><div class="hx-amt">${clp(p.price)}</div><div class="hx-was">Uno nuevo: <s>${clp(p.before)}</s> · ahorras ${clp(p.before - p.price)}</div></div><div class="hx-pct">−${pct(p)}%<br>vs. nuevo</div>`;
    } else {
      pr.innerHTML = `<div class="hx-main"><div class="hx-amt">${clp(p.price)}</div><div class="hx-was">IVA incluido · ${p.warranty} meses de garantía</div></div>`;
    }
    scan(b);
  }

  function animateBlock(b, lt, dur, on) {
    b.style.visibility = on ? "visible" : "hidden";
    if (!on) return;
    for (const a of anims.get(b)) {
      const p = ease.out(seg(lt, a.tin, a.tin + (a.fx === "word" ? 0.75 : 0.6)));
      const q = ease.io(seg(lt, dur - 0.55, dur - 0.15));
      const s = a.el.style;
      s.opacity = p * (1 - q);
      if (a.fx === "pop") {
        const pb = ease.back(seg(lt, a.tin, a.tin + 0.55));
        s.transform = `translateY(${-q * 14}px) scale(${lerp(0.7, 1, pb) - q * 0.04})`;
        s.transformOrigin = "0 50%";
      } else {
        s.transform = `translateY(${(1 - p) * (a.fx === "word" ? 40 : 24) - q * 16}px)`;
        s.filter = p < 1 || q > 0 ? `blur(${(1 - p) * 10 + q * 6}px)` : "none";
      }
      if (a.fx === "word") s.display = "inline-block";
    }
  }

  // ---------- equipos ----------
  let lastSlot = [null, null];
  function drawProduct(slot, s, t) {
    const el = $(slot ? "pB" : "pA");
    const photo = s && photos.get(s.p.img);
    if (!s || !photo) {
      el.style.opacity = 0;
      el.style.visibility = "hidden";
      return 0;
    }
    const p = s.p, lt = t - s.t0;
    if (lastSlot[slot] !== p.id) {
      const img = el.querySelector("img");
      img.src = photo.url;
      img.alt = `${p.brand} ${p.name}`;
      const sw = el.querySelector(".hx-sweep");
      sw.style.webkitMaskImage = sw.style.maskImage = `url("${photo.url}")`;
      lastSlot[slot] = p.id;
    }
    const w = Math.min(lay.maxW, lay.maxH * photo.ar), h = w / photo.ar;
    el.style.width = w + "px";
    const pin = ease.out(seg(lt, 0, 0.85));
    const q = ease.io(seg(lt, s.dur - 0.6, s.dur - 0.05));
    const o = pin * (1 - q);
    el.style.opacity = o;
    el.style.visibility = o < 0.01 ? "hidden" : "visible";
    const zoom = 1 + 0.05 * seg(lt, 0, s.dur);
    const dx = (1 - pin) * 420 * s.from - q * 420 * s.from;
    const dy = (1 - pin) * -40 + Math.sin(lt * 1.3) * 5;
    el.style.transform = `translate(${lay.prod.x - w / 2 + dx}px, ${lay.prod.y - h - 8 + dy}px) scale(${zoom * lerp(0.9, 1, pin)})`;
    el.style.transformOrigin = "50% 100%";
    const sw = el.querySelector(".hx-sweep");
    const sp = seg(lt, 0.6, 1.6);
    sw.style.backgroundPosition = `${lerp(130, -30, sp)}% 0`;
    sw.style.opacity = sp > 0 && sp < 1 ? 1 : 0;
    return o;
  }

  const COLORS = { intro: [61, 181, 133], prod: [61, 181, 133], offer: [229, 86, 107], garantia: [179, 162, 106], revisado: [61, 181, 133], envio: [216, 173, 115] };
  const isOffer = (s) => s.type === "prod" && s.p.deal === "oferta";
  const colorOf = (s) => (isOffer(s) ? COLORS.offer : COLORS[s.type]);
  const ccRows = [...$("checkCard").querySelectorAll(".hx-cc-row")];
  const routePath = $("routeDraw");
  let routeLen = 0;
  let bubbleText = null, bubbleW = 0, bubbleH = 0;

  function render(t) {
    const l = lay;
    const i = segAt(t), s = SEGS[i], lt = t - s.t0;
    const nx = SEGS[i + 1] || SEGS[1];
    // fondo: luces que se mueven y cambian de color con la escena
    const u = ease.io(seg(lt, s.dur - 0.6, s.dur));
    const [r, g, b] = colorOf(s).map((c, k) => Math.round(lerp(c, colorOf(nx)[k], u)));
    const glow = (id, x, y, bg) => {
      const st = $(id).style;
      st.transform = `translate(${x}px, ${y}px)`;
      st.background = bg;
    };
    glow("g1", l.prod.x - 450 + Math.sin(t * 0.4) * 60, l.prod.y - 640 + Math.cos(t * 0.3) * 40, `radial-gradient(circle, rgba(${r},${g},${b},.42), transparent 65%)`);
    glow("g2", -120 + Math.cos(t * 0.25) * 80, -200 + Math.sin(t * 0.35) * 60, "radial-gradient(circle, rgba(179,162,106,.22), transparent 65%)");
    glow("g3", l.W - 420 + Math.sin(t * 0.3) * 70, l.H - 380 + Math.cos(t * 0.45) * 50, `radial-gradient(circle, rgba(229,86,107,${isOffer(s) ? 0.3 : 0.12}), transparent 65%)`);
    $("floor").style.backgroundPosition = `0 ${(t * 22) % 90}px, ${(t * 4) % 90}px 0`;
    for (const m of motes) {
      const y = 1 - ((t * m.sp + m.ph) % 1);
      const x = m.x * l.W + Math.sin(t * 0.8 + m.ph * 9) * 30;
      m.el.style.transform = `translate(${x}px, ${y * l.H}px) rotate(${t * 40 + m.ph * 360}deg) scale(${m.s})`;
      m.el.style.opacity = Math.sin(Math.PI * y) * 0.5;
    }
    // podio: visible en la bienvenida y con equipos
    const stageOn = (x) => (x.type === "prod" || x.type === "intro" ? 1 : 0);
    const prevS = SEGS[i - 1];
    let pod = stageOn(s);
    if (prevS && stageOn(prevS) !== pod) pod = lerp(stageOn(prevS), pod, ease.io(seg(lt, 0, 0.5)));
    if (stageOn(nx) !== stageOn(s)) pod = lerp(pod, stageOn(nx), ease.io(seg(lt, s.dur - 0.5, s.dur)));
    if (s.type === "intro") pod *= ease.out(seg(lt, 0.4, 1.4));
    for (const id of ["podium", "pring", "spot"]) $(id).style.opacity = pod;
    $("pring").style.transform = `scale(${1 + Math.sin(t * 2) * 0.015})`;
    // equipos en dos ranuras que se alternan
    const sA = s.type === "prod" && s.slot === 0 ? s : null;
    const sB = s.type === "prod" && s.slot === 1 ? s : null;
    const o = Math.max(drawProduct(0, sA, t), drawProduct(1, sB, t));
    $("pshadow").style.opacity = o * 0.9;
    // sello de oferta
    const st = $("stamp").style;
    if (isOffer(s)) {
      $("stampPct").textContent = `−${pct(s.p)}%`;
      const sp = ease.back(seg(lt, 1.2, 1.75)), sq = seg(lt, s.dur - 0.5, s.dur - 0.2);
      st.opacity = seg(lt, 1.2, 1.35) * (1 - sq);
      st.transform = `translate(${l.stamp.x - 66}px, ${l.stamp.y - 66}px) rotate(${lerp(-40, -10, sp)}deg) scale(${lerp(0.3, 1, sp) * (1 - sq * 0.3)})`;
    } else st.opacity = 0;
    // garantía: anillo que se llena hasta los meses de garantía
    const gOn = s.type === "garantia";
    const ra = gOn ? ease.io(seg(lt, 0.3, 1.3)) : 0;
    const ro = gOn ? seg(lt, 0.15, 0.4) * (1 - ease.io(seg(lt, s.dur - 0.5, s.dur - 0.1))) : 0;
    $("ring").style.opacity = ro;
    $("ringLabel").style.opacity = ro;
    if (gOn) {
      $("ringLabel").style.transform = `scale(${lerp(0.85, 1, ease.back(seg(lt, 0.3, 0.9)))})`;
      $("ringArc").setAttribute("stroke-dashoffset", 1068 * (1 - ra));
      const ang = -Math.PI / 2 + ra * Math.PI * 2;
      $("ringDot").setAttribute("cx", 200 + 170 * Math.cos(ang));
      $("ringDot").setAttribute("cy", 200 + 170 * Math.sin(ang));
      $("ringNum").textContent = Math.round(ra * opts.warranty);
    }
    // revisión: ficha que se va marcando
    const cOn = s.type === "revisado";
    const cc = $("checkCard").style;
    const ci = cOn ? ease.back(seg(lt, 0.3, 0.9)) : 0, cq = cOn ? ease.io(seg(lt, s.dur - 0.5, s.dur - 0.1)) : 1;
    cc.opacity = cOn ? clamp(seg(lt, 0.3, 0.5)) * (1 - cq) : 0;
    cc.transform = `translateY(${(1 - ci) * 40}px) rotate(${lerp(-4, -1.5, ci)}deg)`;
    ccRows.forEach((row, k) => row.classList.toggle("hx-ok", cOn && lt > 1.2 + k * 0.45));
    // envío: el camión recorre la ruta hasta la casa
    const eOn = s.type === "envio";
    $("route").style.opacity = eOn ? clamp(seg(lt, 0.9, 1.3)) * (1 - ease.io(seg(lt, s.dur - 0.5, s.dur - 0.1))) : 0;
    if (eOn) {
      if (!routeLen) routeLen = routePath.getTotalLength();
      const len = routeLen;
      const pr = ease.io(seg(lt, 1.1, 3.0));
      routePath.style.strokeDasharray = len;
      routePath.style.strokeDashoffset = len * (1 - pr);
      const pt = routePath.getPointAtLength(len * pr), pt2 = routePath.getPointAtLength(Math.min(len, len * pr + 2));
      const ang = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI;
      $("routeTruck").setAttribute("transform", `translate(${pt.x} ${pt.y - 14}) rotate(${ang * 0.35})`);
      $("routeHome").setAttribute("transform", `translate(540 70) scale(${lerp(1, 1.15, Math.sin(Math.PI * clamp((lt - 2.9) / 0.6)))})`);
    }
    // textos
    const want = s.type === "prod" ? (s.slot ? "prodB" : "prodA") : s.type;
    if (s.type === "prod") fillProduct(blocks[want], s.p);
    for (const [name, blk] of Object.entries(blocks)) animateBlock(blk, lt, s.dur, name === want);
    const cta = $("cta");
    const href = s.type === "prod" ? `/producto/${s.p.slug}` : "#equipos";
    if (cta.getAttribute("href") !== href) {
      cta.setAttribute("href", href);
      $("ctaLabel").textContent = s.type === "prod" ? "Ver este equipo" : "Ver equipos";
    }
    const c = s.type === "intro" ? ease.out(seg(lt, 1.9, 2.5)) : 1;
    $("ctas").style.opacity = c;
    $("ctas").style.transform = `translateY(${(1 - c) * 20}px)`;
    // navegación
    const label = s.type === "prod" ? `${s.p.brand} ${s.p.name}` : LABELS[s.type];
    if ($("navLabel").textContent !== label) $("navLabel").textContent = label;
    $("navBar").style.width = clamp(lt / s.dur) * 100 + "%";
    // Terqui
    const stt = P.state(t);
    stt.rig.gloss = 1;
    rig.draw(stt.rig);
    place($("tq"), stt.root, TQ);
    const line = LINES_AT.find((x) => t >= x.t - 0.1 && t <= x.end + 0.7);
    const bub = $("bubble");
    if (line) {
      if (bubbleText !== line.text) {
        bub.textContent = bubbleText = line.text;
        bubbleW = bub.offsetWidth;
        bubbleH = bub.offsetHeight;
      }
      const uu = (TQ * stt.root.s) / 200;
      const pop = ease.back(seg(t, line.t - 0.1, line.t + 0.2));
      const out = seg(t, line.end + 0.45, line.end + 0.7);
      bub.style.opacity = clamp(pop) * (1 - out);
      bub.style.transform = `translate(${stt.root.x + l.bx * uu - bubbleW}px, ${stt.root.g - 176 * uu - bubbleH}px) scale(${lerp(0.6, 1, pop) * (1 - out * 0.2)})`;
    } else bub.style.opacity = 0;
  }

  // ---------- sonido: música suave en loop + voz y efectos de Terqui hechos en vivo ----------
  let music = null, ac = null, master = null, noiseBuf = null;
  function initAudio() {
    if (ac) return;
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain();
    master.gain.value = 0.9;
    master.connect(ac.destination);
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const FORM = { a: [800, 1150], e: [500, 1700], i: [320, 2200], o: [500, 900], u: [350, 700] };
  function env(g, at, a, d, peak) {
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(peak, at + a);
    g.gain.exponentialRampToValueAtTime(0.0001, at + a + d);
  }
  function play(c, at) {
    const osc = (type, f) => {
      const x = ac.createOscillator();
      x.type = type;
      x.frequency.setValueAtTime(f, at);
      return x;
    };
    if (c.type === "voice") {
      const f0 = 300 * Math.pow(2, (c.p || 0) / 12);
      const src = osc("sawtooth", f0);
      src.frequency.linearRampToValueAtTime(f0 * 1.04, at + c.dur);
      const g = ac.createGain(), mix = ac.createGain();
      mix.gain.value = 0.5;
      for (const f of FORM[c.v] || FORM.a) {
        const bp = ac.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = f;
        bp.Q.value = 6;
        src.connect(bp);
        bp.connect(mix);
      }
      mix.connect(g);
      g.connect(master);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.5, at + 0.02);
      g.gain.setValueAtTime(0.5, at + c.dur * 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, at + c.dur);
      src.start(at);
      src.stop(at + c.dur + 0.05);
    } else if (c.type === "whoosh") {
      const n = ac.createBufferSource();
      n.buffer = noiseBuf;
      const bp = ac.createBiquadFilter();
      bp.type = "bandpass";
      bp.Q.value = 1.2;
      bp.frequency.setValueAtTime(300, at);
      bp.frequency.exponentialRampToValueAtTime(2400, at + 0.35);
      const g = ac.createGain();
      env(g, at, 0.12, 0.35, 0.12);
      n.connect(bp);
      bp.connect(g);
      g.connect(master);
      n.start(at);
      n.stop(at + 0.6);
    } else if (c.type === "pop" || c.type === "tick") {
      const x = osc("sine", c.type === "pop" ? 900 : 1500);
      x.frequency.exponentialRampToValueAtTime(c.type === "pop" ? 300 : 1100, at + 0.08);
      const g = ac.createGain();
      env(g, at, 0.005, c.type === "pop" ? 0.12 : 0.06, c.type === "pop" ? 0.25 : 0.12);
      x.connect(g);
      g.connect(master);
      x.start(at);
      x.stop(at + 0.2);
    } else if (c.type === "sparkle") {
      [2093, 2637, 3136].forEach((f, k) => {
        const x = osc("sine", f), g = ac.createGain();
        env(g, at + k * 0.06, 0.005, 0.25, 0.05);
        x.connect(g);
        g.connect(master);
        x.start(at + k * 0.06);
        x.stop(at + k * 0.06 + 0.35);
      });
    } else if (c.type === "ding") {
      [1318, 1976].forEach((f, k) => {
        const x = osc("sine", f), g = ac.createGain();
        env(g, at, 0.005, 1.0, k ? 0.05 : 0.12);
        x.connect(g);
        g.connect(master);
        x.start(at);
        x.stop(at + 1.1);
      });
    } else if (c.type === "step" || c.type === "land" || c.type === "takeoff") {
      const x = osc("sine", c.type === "land" ? 160 : 220);
      x.frequency.exponentialRampToValueAtTime(80, at + 0.06);
      const g = ac.createGain();
      env(g, at, 0.003, 0.07, c.type === "land" ? 0.25 : c.soft ? 0.04 : 0.07);
      x.connect(g);
      g.connect(master);
      x.start(at);
      x.stop(at + 0.12);
    }
  }
  let schedUntil = -1;
  function scheduleSounds(t) {
    if (!soundOn || !ac || paused || !visible) return;
    const horizon = t + 0.3;
    if (schedUntil < t - 1 || schedUntil > horizon + 1) schedUntil = t; // salto o vuelta al inicio
    for (const c of CUES) {
      if (c.t <= schedUntil || c.t > horizon) continue;
      play(c, ac.currentTime + Math.max(0, c.t - t));
    }
    schedUntil = horizon;
  }

  // ---------- reloj y controles ----------
  const clock = () => performance.now() / 1000;
  let paused = false, pausedAt = 0, soundOn = false;
  let bannerStart = clock() + (opts.startDelay || 0);
  const wrap = (t) => (t < SCRIPT.end ? t : SCRIPT.loopFrom + ((t - SCRIPT.loopFrom) % (SCRIPT.end - SCRIPT.loopFrom)));
  const bannerTime = () => (paused ? pausedAt : wrap(Math.max(0, clock() - bannerStart)));
  // En pausa se muestra cada escena ya armada, no su primer cuadro vacío.
  const settle = (k) => SEGS[k].t0 + (paused ? Math.min(2.6, SEGS[k].dur - 0.7) : 0.01);
  function seek(t) {
    bannerStart = clock() - t;
    if (paused) pausedAt = t;
    schedUntil = t;
  }
  function setPaused(on) {
    const t = bannerTime();
    paused = on;
    if (paused) {
      pausedAt = t;
      if (music) music.pause();
    } else {
      bannerStart = clock() - pausedAt;
      schedUntil = pausedAt;
      if (music && soundOn) music.play().catch(() => {});
    }
    $("pause").dataset.on = String(paused);
    $("pause").setAttribute("aria-label", paused ? "Reproducir el banner" : "Pausar el banner");
  }
  const on = (el, fn) => {
    el.addEventListener("click", fn);
    return () => el.removeEventListener("click", fn);
  };
  const offs = [
    on($("prev"), () => {
      const t = bannerTime(), i = segAt(t);
      seek(settle(t - SEGS[i].t0 > 1.2 || i === 0 ? i : i - 1));
    }),
    on($("next"), () => {
      const i = segAt(bannerTime()) + 1;
      seek(settle(i < SEGS.length ? i : 1));
    }),
    on($("pause"), () => setPaused(!paused)),
    on($("sound"), () => {
      soundOn = !soundOn;
      if (soundOn) {
        initAudio();
        ac.resume();
        schedUntil = bannerTime();
        if (!music && opts.music) {
          music = new Audio(opts.music);
          music.loop = true;
          music.volume = 0.55;
        }
        if (music && !paused) music.play().catch(() => {});
      } else if (music) music.pause();
      $("sound").dataset.on = String(soundOn);
      $("sound").setAttribute("aria-pressed", String(soundOn));
    }),
  ];

  const ro = new ResizeObserver(applyLayout);
  ro.observe(root);
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (!visible && music) music.pause();
    else if (visible && music && soundOn && !paused) music.play().catch(() => {});
  });
  io.observe(root);
  applyLayout();

  // Con "reducir movimiento" el banner queda quieto en el primer equipo; las flechas siguen funcionando.
  if (reduced) {
    setPaused(true);
    seek(settle(SEGS.length > 1 ? 1 : 0));
  }
  function loop() {
    if (stopped) return;
    if (visible && lay) {
      const t = bannerTime();
      render(t);
      scheduleSounds(t);
    }
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  return {
    // La cortina se saltó: el banner parte de inmediato.
    start() {
      if (clock() < bannerStart) bannerStart = clock();
    },
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      offs.forEach((off) => off());
      if (music) music.pause();
      if (ac) ac.close();
      motes.forEach((m) => m.el.remove());
    },
  };
}
