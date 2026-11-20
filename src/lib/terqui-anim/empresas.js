// Página de empresas: Terqui entrega la caja mientras bajas, camina en el paso 2 y cada equipo
// dibujado muestra su foto real. El HTML lo ponen app/(tienda)/empresas/page.tsx y EmpresasVivo.tsx.
//
// Cómo camina (para que no "flote"): el pie que está en el piso queda fijo en la escena y el
// cuerpo avanza sobre él; el otro pie viaja el doble de rápido hasta el siguiente apoyo. El paso
// depende de la distancia recorrida, no del reloj, así nunca patina. Para no abrir y cerrar las
// piernas como tijera, al caminar se gira a 3/4 (se le ve el canto del celular) y al llegar se
// da vuelta hacia ti.

const INK = "#0a2a2a";
const ARM = `stroke="${INK}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
const LEAF = `<path d="M100 58 C100 50 98 44 101 34" stroke="#288868" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M100 44 Q84 24 64 30 Q76 50 100 44Z" fill="#288868"/><path d="M101 37 Q116 14 138 20 Q126 42 101 37Z" fill="#3db585"/><path d="M98 42.5 Q86 34 72 32.5 M103 35.5 Q116 25 130 22.5" stroke="#1d6b50" stroke-width="1.1" fill="none" opacity=".5"/>`;
// Coordenadas internas de 200 x 200, como Terqui.tsx: pies en y = 191, caderas en (88,176) y (112,176).
const RIG = `
<ellipse class="r-boxshadow" cx="189" cy="194" rx="46" ry="4.2" fill="rgba(28,44,40,.24)" opacity="0"/>
<g><path class="r-leg" ${ARM}/><path class="r-leg" ${ARM}/><ellipse class="r-foot" rx="7" ry="3.5" fill="${INK}"/><ellipse class="r-foot" rx="7" ry="3.5" fill="${INK}"/></g>
<g class="r-upper">
 <rect class="r-side" y="60" height="114" rx="11" fill="#04201c"/>
 <g class="r-front">
  <g class="r-hold"><path d="M70 120 L58 136 L62 152" ${ARM}/><path d="M130 120 L142 136 L138 152" ${ARM}/></g>
  <g class="r-hola" style="display:none"><path d="M70 118 L57 135 L54 150" ${ARM}/><circle cx="54" cy="150" r="5" fill="${INK}"/><g class="terqui-wave"><path d="M130 112 L148 100 L152 78" ${ARM}/><circle cx="152" cy="78" r="5" fill="${INK}"/></g></g>
  <g class="r-leaf">${LEAF}</g>
  <rect x="70" y="58" width="60" height="118" rx="13" fill="${INK}"/>
  <rect x="67.6" y="84" width="3.2" height="12" rx="1.6" fill="${INK}"/><rect x="67.6" y="99" width="3.2" height="7" rx="1.6" fill="${INK}"/>
  <rect x="75.5" y="69" width="49" height="96" rx="7" fill="#eaf5f0"/>
  <path d="M118 71.5 Q122 72 122 77" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".9"/>
  <rect x="93" y="62.5" width="14" height="3" rx="1.5" fill="#fff" opacity=".35"/><circle cx="113" cy="64" r="1.5" fill="#fff" opacity=".3"/>
  <g class="r-face">
   <g class="terqui-blink"><rect x="84" y="102" width="7" height="13" rx="3.5" fill="${INK}"/><rect x="108" y="102" width="7" height="13" rx="3.5" fill="${INK}"/><circle cx="88.8" cy="105.6" r="1.5" fill="#fff"/><circle cx="112.8" cy="105.6" r="1.5" fill="#fff"/></g>
   <path d="M81 94 L93 91 M107 91 L119 94" stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"/>
   <path d="M90 122 Q100 134 111 121 Z" fill="${INK}"/><ellipse cx="100.6" cy="125.6" rx="4.2" ry="1.7" fill="#e07f6d"/>
  </g>
  <g class="r-box">
   <path class="r-boxside" fill="#b98447"/>
   <rect x="60" y="138" width="80" height="40" rx="4" fill="#d8ad73"/>
   <rect x="60" y="138" width="80" height="9" rx="3" fill="#c39257"/>
   <rect x="95" y="138" width="10" height="40" fill="#efe3c8" opacity=".75"/>
   <path d="M100 170 C100 165 99 162 101 157" stroke="#288868" stroke-width="2.4" stroke-linecap="round" fill="none"/>
   <path d="M100 162 Q91 152 82 156 Q89 165 100 162Z" fill="#288868"/><path d="M101 158 Q109 147 120 150 Q113 161 101 158Z" fill="#3db585"/>
   <rect x="64" y="160" width="14" height="11" rx="1" fill="#fbf8f0"/><path d="M66.5 163.5 h9 M66.5 167 h6" stroke="#9aa5a2" stroke-width="1.1"/>
  </g>
  <g class="r-hands"><circle cx="62" cy="152" r="5" fill="${INK}"/><circle cx="138" cy="152" r="5" fill="${INK}"/></g>
 </g>
</g>`;

const f2 = (n) => n.toFixed(2);
const cl = (x) => Math.min(1, Math.max(0, x));
const sm = (x) => x * x * (3 - 2 * x);

function makeRig(g) {
  g.innerHTML = RIG;
  const q = (s) => g.querySelector(s), qa = (s) => g.querySelectorAll(s);
  return {
    root: g, upper: q(".r-upper"), front: q(".r-front"), side: q(".r-side"), face: q(".r-face"), leaf: q(".r-leaf"),
    legs: qa(".r-leg"), feet: qa(".r-foot"), hold: q(".r-hold"), hola: q(".r-hola"), box: q(".r-box"),
    boxside: q(".r-boxside"), hands: q(".r-hands"), boxshadow: q(".r-boxshadow"), mode: "",
  };
}

// st: gx, gy (punto entre los pies, en la escena), s (tamaño), tau (0 de frente, 1 girado a 3/4),
// bob, sway, tilt, feet[2] {x, y, lift}, leaf, breathe, hola, drop.
function poseRig(R, st) {
  const k = st.s / 200, tau = st.tau, c = 1 - 0.14 * tau, cx = 100 + 4 * tau;
  R.root.setAttribute("transform", `translate(${f2(st.gx)} ${f2(st.gy)}) scale(${k.toFixed(4)}) translate(-100 -191)`);
  R.upper.setAttribute("transform", `translate(${f2(st.sway)} ${f2(-st.bob)}) rotate(${f2(st.tilt)} 100 176) translate(0 176) scale(1 ${st.breathe.toFixed(4)}) translate(0 -176)`);
  R.front.setAttribute("transform", `translate(${f2(cx)} 0) scale(${c.toFixed(4)} 1) translate(-100 0)`);
  const sw = 9 * tau, x0 = cx - 30 * c;
  R.side.setAttribute("x", f2(x0 - sw));
  R.side.setAttribute("width", f2(16 + sw));
  R.side.style.display = sw < 0.4 ? "none" : "";
  R.face.setAttribute("transform", `translate(${f2(2.6 * tau)} 0)`);
  R.leaf.setAttribute("transform", `rotate(${f2(st.leaf)} 100 58)`);
  const mode = st.hola ? "h" : "c";
  if (R.mode !== mode) {
    R.mode = mode;
    R.hold.style.display = R.hands.style.display = st.hola ? "none" : "";
    R.hola.style.display = st.hola ? "" : "none";
  }
  const d = st.drop;
  R.box.setAttribute("transform", `translate(${f2(88 * d)} ${f2(16 * d - 16 * Math.sin(Math.PI * d))})`);
  R.boxside.setAttribute("d", `M60 140 L${f2(60 - 12 * tau * (1 - d))} 135.5 V173.5 L60 178 Z`);
  R.boxshadow.setAttribute("opacity", d > 0.85 ? f2((d - 0.85) / 0.15) : "0");
  const a = (st.tilt * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  [-1, 1].forEach((side, i) => {
    const f = st.feet[i];
    const hr = side * 12 * c + cx - 100, hx = 100 + hr * ca + st.sway, hy = 176 + hr * sa - st.bob;
    const px = (f.x - st.gx) / k + 100, py = (f.y - st.gy) / k + 191 - f.lift;
    const ax = px - side * 4 * (1 - tau) - 3 * tau, ay = py - 1;
    // La pierna se dobla (curva) cuando queda más corta que en reposo; la rodilla mira hacia afuera o hacia adelante.
    const dx = ax - hx, dy = ay - hy, L = Math.hypot(dx, dy) || 1, L0 = 16.5;
    const bend = L < L0 ? Math.sqrt(L0 * L0 - L * L) : 0, kd = -side * (1 - tau) - tau;
    const mx = (hx + ax) / 2 + (-dy / L) * bend * kd, my = (hy + ay) / 2 + (dx / L) * bend * kd;
    R.legs[i].setAttribute("d", `M${f2(hx)} ${f2(hy)} Q${f2(mx)} ${f2(my)} ${f2(ax)} ${f2(ay)}`);
    const lt = cl(f.lift / 6), ft = R.feet[i];
    ft.setAttribute("cx", f2(px + 2 * tau));
    ft.setAttribute("cy", f2(py));
    ft.setAttribute("rx", f2(7 - 0.9 * lt));
    ft.setAttribute("ry", f2(3.5 + 0.9 * lt));
  });
}

// Caminata en línea recta de A a B ([x, y, tamaño]) en N pasos. b va de -h/2 (parado en A) a 1 + h/2 (parado en B).
function walkPath(cfg) {
  const h = 1 / cfg.N;
  const P = (t) => { t = cl(t); return [0, 1, 2].map((j) => cfg.A[j] + (cfg.B[j] - cfg.A[j]) * t); };
  const sideOf = (k) => (((k % 2) + 2) % 2 ? 1 : -1);
  const plant = (k, tau) => {
    const t = cl(k * h), [x, y, s] = P(t), side = sideOf(k), w = ((cfg.hw - 7 * tau) * s) / 200;
    return { x: x + side * w, y: y + (side * 1.6 * tau * s) / 200, t };
  };
  return {
    min: -h / 2,
    max: 1 + h / 2,
    // Posición más cercana con los dos pies en el piso (para no quedar congelado con un pie en el aire).
    rest: (b) => Math.min(1 + h / 2, Math.max(-h / 2, (Math.round(b / h + 0.5) - 0.5) * h)),
    pose(b, tau) {
      const k = Math.floor(b / h + 0.5), u = (b - (k - 0.5) * h) / h, [gx, gy, s] = P(b);
      const st = plant(k, tau), from = plant(k - 1, tau), to = plant(k + 1, tau);
      const m = Math.abs(to.t - from.t) > 1e-6 ? 1 : 0;
      const e = u - Math.sin(2 * Math.PI * u) / (2 * Math.PI);
      const swing = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, lift: m * cfg.lift * Math.sin(Math.PI * u) };
      const ss = sideOf(k), pu = Math.sin(Math.PI * u);
      const bob = (m * cfg.bobA * (1 - Math.cos(2 * Math.PI * u))) / 2; // sube a mitad de paso, baja al apoyar
      const sway = m * ss * 2.4 * (1 - 0.45 * tau) * pu; // se carga hacia el pie apoyado
      const tilt = m * (ss * 1.5 * pu + 2.4 * tau);
      const stance = { x: st.x, y: st.y, lift: 0 };
      return { gx, gy, s, bob, sway, tilt, feet: ss < 0 ? [stance, swing] : [swing, stance] };
    },
  };
}

// Las hojas reaccionan con un resorte: se quedan atrás al avanzar y rebotan al frenar.
function leafSpring() {
  let a = 8, v = 0;
  return (target, dt) => { const n = dt / 16.7; v += (target - a) * 0.16 * n; v *= Math.pow(0.78, n); a += v * n; return a; };
}

/** Arranca todo dentro de `root`. `equipos` = { clave: { name, line, price, url, photo } }. Devuelve { stop }. */
export function startEmpresas(root, { equipos }) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel) => root.querySelector(sel);
  const off = [];
  const on = (target, type, fn, opts) => { target.addEventListener(type, fn, opts); off.push(() => target.removeEventListener(type, fn, opts)); };

  // ---------- Ficha con la foto real de cada equipo ----------
  const card = $("[data-emp-card]");
  const field = (name) => card.querySelector(`[data-f="${name}"]`);
  let current = null, hideT = 0, shownAt = 0, tapped = null;
  let pointer = matchMedia("(hover: hover)").matches ? "mouse" : "touch";
  const show = (dev) => {
    const p = equipos[dev.dataset.p];
    if (!p) return;
    clearTimeout(hideT);
    if (current && current !== dev) current.classList.remove("on");
    current = dev;
    dev.classList.add("on");
    const img = field("img");
    img.removeAttribute("srcset");
    if (p.photo) {
      img.src = p.photo.src;
      if (p.photo.srcSet) { img.srcset = p.photo.srcSet; img.sizes = p.photo.sizes; }
      img.alt = "Foto del " + p.name;
      img.style.display = "";
    } else img.style.display = "none";
    field("name").textContent = p.name;
    field("line").textContent = p.line;
    field("price").textContent = p.price;
    field("buy").href = p.url;
    field("tip").textContent = pointer === "mouse" ? "Haz clic en el equipo para abrir su página" : "Toca el equipo otra vez para abrir su página";
    const dot = dev.querySelector(".emp-ring").getBoundingClientRect();
    const W = card.offsetWidth || 272, H = card.offsetHeight || 340, vw = innerWidth, vh = innerHeight, gap = 16;
    let x = dot.right + gap;
    if (x + W > vw - 8) x = dot.left - gap - W;
    if (x < 8) x = Math.max(8, Math.min(vw - W - 8, dot.left - W / 2));
    let y = Math.max(8, Math.min(vh - H - 8, dot.top - 60));
    if (vw < 520) {
      x = (vw - W) / 2;
      y = dot.bottom + 12;
      if (y + H > vh - 8) y = Math.max(8, dot.top - H - 12);
    }
    card.style.left = x + "px";
    card.style.top = y + "px";
    card.classList.add("show");
    shownAt = scrollY;
  };
  const hideNow = () => { card.classList.remove("show"); current?.classList.remove("on"); current = null; tapped = null; };
  const hide = () => { hideT = setTimeout(hideNow, 220); };
  root.querySelectorAll(".emp-dev").forEach((d) => {
    on(d, "pointerdown", (e) => { pointer = e.pointerType; });
    on(d, "pointerenter", (e) => { if (e.pointerType === "mouse") { pointer = "mouse"; show(d); } });
    on(d, "pointerleave", (e) => { if (e.pointerType === "mouse") hide(); });
    // Con mouse el clic abre el equipo. En el celular el primer toque muestra la foto y el segundo abre.
    on(d, "click", (e) => {
      e.stopPropagation();
      if (pointer !== "mouse" && !(tapped === d && card.classList.contains("show"))) { e.preventDefault(); show(d); tapped = d; }
    });
    // Con teclado (Tab) también se ve la ficha; un toque no cuenta como foco de teclado.
    on(d, "focus", () => { if (d.matches(":focus-visible")) show(d); });
    on(d, "blur", hide);
  });
  on(card, "pointerenter", () => clearTimeout(hideT));
  on(card, "pointerleave", hide);
  on(card, "focusin", () => clearTimeout(hideT));
  on(card, "click", (e) => { if (e.target.closest("a")) hideNow(); });
  on(document, "click", (e) => { if (!card.contains(e.target)) hideNow(); });
  on(document, "keydown", (e) => { if (e.key === "Escape") hideNow(); });
  on(window, "scroll", () => { if (card.classList.contains("show") && Math.abs(scrollY - shownAt) > 60) hideNow(); }, { passive: true });

  // ---------- Terqui ----------
  const actors = [];
  const bannerRig = $('[data-emp-rig="banner"]');
  if (bannerRig) {
    // Banner: avanza según cuánto bajas. Si dejas de bajar, termina el paso y queda con los dos pies en el piso.
    const scene = bannerRig.closest(".emp-stage");
    const R = makeRig(bannerRig);
    const W = walkPath({ A: [96, 352, 226], B: [180, 432, 300], N: 4, hw: 18, lift: 7, bobA: 3.2 });
    const sh = $('[data-emp-shadow="banner"]'), hint = $("[data-emp-hint]"), leaf = leafSpring();
    let b = W.min, alpha = 0, prevGx = null, lastScroll = -1e9, top0 = 0;
    const measure = () => { top0 = scene.getBoundingClientRect().top + scrollY; };
    measure();
    on(window, "resize", measure);
    on(window, "scroll", () => { lastScroll = performance.now(); hint?.classList.toggle("off", scrollY > 12); }, { passive: true });
    actors.push({
      el: scene,
      tick(dt, now) {
        // Llega cuando la escena subió algo más de la mitad de su alto (todavía se ve entera o casi).
        const range = Math.max(200, Math.min(340, top0 + scene.offsetHeight * 0.55 - 140));
        const raw = cl(scrollY / range);
        let tgt = reduced ? W.max : W.min + raw * (W.max - W.min);
        if (now - lastScroll > 150) tgt = W.rest(tgt);
        b += (tgt - b) * (1 - Math.exp(-dt / 150));
        if (Math.abs(tgt - b) < 1e-4) b = tgt;
        const arrived = b >= W.max - 1e-3;
        alpha = reduced ? 1 : cl(alpha + (arrived ? dt / 1000 : -dt / 420));
        const tau = 1 - sm(cl(alpha / 0.35)), drop = sm(cl((alpha - 0.35) / 0.42));
        const p = W.pose(b, tau);
        const vx = prevGx == null ? 0 : (p.gx - prevGx) / (p.s / 200) / (dt / 16.7 || 1);
        prevGx = p.gx;
        const lf = leaf(8 - 12 * drop - vx * 5 - p.tilt * 1.4 + Math.sin(now / 640) * 1.3, dt);
        poseRig(R, { ...p, tau, leaf: lf, breathe: 1 + 0.011 * Math.sin(now / 560), hola: alpha >= 0.35, drop, bob: p.bob - 3.5 * Math.sin(Math.PI * drop) });
        sh.setAttribute("cx", f2(p.gx)); sh.setAttribute("cy", f2(p.gy + 1)); sh.setAttribute("rx", f2(p.s * 0.21)); sh.setAttribute("ry", f2(p.s * 0.04));
      },
    });
  }
  const stepRig = $('[data-emp-rig="paso2"]');
  if (stepRig) {
    // Paso 2: camina del auto a la puerta, se da vuelta hacia ti y vuelve a empezar.
    const R = makeRig(stepRig);
    const W = walkPath({ A: [112, 216, 84], B: [236, 213, 86], N: 11, hw: 18, lift: 6, bobA: 3 });
    const wrap = $('[data-emp-wrap="paso2"]'), sh = $('[data-emp-shadow="paso2"]'), leaf = leafSpring();
    const T0 = performance.now(), T = 8400, W0 = 450, W1 = 5900;
    let prevGx = null;
    actors.push({
      el: wrap.closest(".emp-stage"),
      tick(dt, now) {
        const t = reduced ? T - 1500 : (now - T0) % T;
        const b = t < W0 ? W.min : t < W1 ? W.min + ((W.max - W.min) * (t - W0)) / (W1 - W0) : W.max;
        const tau = 1 - sm(cl((t - W1) / 450));
        wrap.setAttribute("opacity", reduced ? "1" : f2(t < W0 ? t / W0 : t > T - 500 ? (T - t) / 500 : 1));
        const p = W.pose(b, tau);
        const vx = prevGx == null || t < 20 ? 0 : (p.gx - prevGx) / (p.s / 200) / (dt / 16.7 || 1);
        prevGx = p.gx;
        const lf = leaf(8 - vx * 5 - p.tilt * 1.4 + Math.sin(now / 640) * 1.3, dt);
        poseRig(R, { ...p, tau, leaf: lf, breathe: 1 + 0.011 * Math.sin(now / 560), hola: false, drop: 0 });
        sh.setAttribute("cx", f2(p.gx)); sh.setAttribute("cy", f2(p.gy + 1)); sh.setAttribute("rx", f2(p.s * 0.22)); sh.setAttribute("ry", f2(p.s * 0.045));
      },
    });
  }
  // Solo se anima lo que está en pantalla.
  const visible = new Set();
  const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))));
  actors.forEach((a) => io.observe(a.el));
  let last = performance.now(), raf = 0;
  const frame = (now) => {
    const dt = Math.min(64, Math.max(1, now - last));
    last = now;
    for (const a of actors) if (visible.has(a.el) || !a.ran) { a.tick(dt, now); a.ran = true; }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return {
    stop() {
      cancelAnimationFrame(raf);
      io.disconnect();
      clearTimeout(hideT);
      off.forEach((fn) => fn());
    },
  };
}
