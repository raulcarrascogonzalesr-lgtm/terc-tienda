// Escena de la página de gracias: Terqui celebra, sube con la caja al camión de TERC
// y lo lleva hasta la casa, con papel picado al principio y al llegar. Dura unos 9 segundos.
import { TerquiRig } from "./rig";
import { performer, place } from "./motion";

const SZ = 200;
const END = 9.5;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, p) => a + (b - a) * p;
const io = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const COLORS = ["#3db585", "#b3a26a", "#e5566b", "#d8ad73", "#ffffff"];
const bits = Array.from({ length: 90 }, (_, i) => ({ x: (i * 0.137) % 1, d: 0.6 + ((i * 7) % 10) / 10, r: (i * 53) % 360, c: COLORS[i % 5], w: 6 + (i % 4) * 2 }));

/** Arranca la escena dentro de `root` (el HTML lo pone ThanksScene.tsx). Devuelve { replay, stop }. */
export function startThanksScene(root, { firstLine = "¡Gracias por tu compra!" } = {}) {
  const $ = (name) => root.querySelector(`[data-s="${name}"]`);
  const cv = $("confetti"), cx = cv.getContext("2d");
  const tq = $("tq"), bub = $("bubble"), truck = $("truck"), home = $("home");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let S = null, rig = null, lines = [], start = performance.now(), raf = 0;

  function build() {
    const W = root.clientWidth, H = root.clientHeight;
    const G = H - 46;
    const s = Math.min(1, W / 520);
    // la casa a la derecha, Terqui baja justo antes de la puerta y el camión se detiene antes que él
    const k = Math.max(0.7, s);
    const homeX = W - 110 * k, land = homeX - 60 * k - 40 * s;
    const truck0 = -40, truck1 = Math.max(truck0 + 80, land - 50 * s - 170 * k);
    const P = performer({ bpm: 96, size: SZ, seed: 9 });
    lines = [];
    const talk = (t, text) => lines.push({ t, end: P.say(t, text), text });
    P.place(0, { x: W * 0.3, g: G, s });
    P.pose(0, "celebra", 0);
    talk(0.4, firstLine);
    P.pose(2.2, "caja", 0.2);
    P.jump(2.6, 3.3, { x: truck0 + 60 * s, g: G - 62 * s }, { h: 60 * s, land: "caja" });
    P.move(3.6, 6.4, { x: truck1 + 60 * s }, "io");
    P.jump(6.7, 7.4, { x: land, g: G }, { h: 70 * s, land: "hola" });
    talk(7.6, "¡Llegó a tu casa!");
    tq.innerHTML = "";
    rig = TerquiRig(tq, SZ);
    S = { P, W, H, truck0, truck1, s };
    home.style.left = homeX - 60 * k + "px";
    home.style.width = 120 * k + "px";
    truck.style.width = 170 * k + "px";
    cv.width = W;
    cv.height = H;
  }

  function draw(t) {
    const { P, W, H, truck0, truck1 } = S;
    // camión: llega a la izquierda, espera a Terqui y avanza
    const tin = io(clamp((t - 1.6) / 1.0));
    const go = io(clamp((t - 3.6) / 2.8));
    const tx = lerp(-200, truck0, tin) + (truck1 - truck0) * go;
    const bump = go > 0 && go < 1 ? Math.sin(t * 30) * 1.2 : 0;
    truck.style.transform = `translate(${tx}px, ${bump}px)`;
    const st = P.state(t);
    st.rig.gloss = 1;
    rig.draw(st.rig);
    place(tq, st.root, SZ);
    // papel picado al principio y al llegar
    cx.clearRect(0, 0, W, H);
    for (const [t0, x0] of [[0.2, 0.3], [7.5, 0.85]]) {
      const u = t - t0;
      if (u < 0 || u > 2.6 || reduced) continue;
      for (const b of bits) {
        const x = (x0 + (b.x - 0.5) * 0.7) * W + Math.sin(u * 3 + b.r) * 10;
        const y = -20 + u * 160 * b.d + 18 * u * u;
        cx.save();
        cx.globalAlpha = clamp(1 - (u - 1.8) / 0.8);
        cx.translate(x, y);
        cx.rotate(b.r + u * 4);
        cx.fillStyle = b.c;
        cx.fillRect(-b.w / 2, -3, b.w, 6);
        cx.restore();
      }
    }
    // la última frase ("¡Llegó a tu casa!") se queda al final
    const last = lines[lines.length - 1];
    const line = lines.find((x) => t >= x.t - 0.1 && (x === last || t <= x.end + 0.8));
    if (line) {
      if (bub.textContent !== line.text) bub.textContent = line.text;
      const u = (SZ * st.root.s) / 200;
      const fade = line === last ? 0 : clamp((t - line.end - 0.5) / 0.3);
      bub.style.opacity = clamp((t - line.t + 0.1) / 0.2) * (1 - fade);
      const left = Math.min(W - bub.offsetWidth - 8, Math.max(8, st.root.x + 30 * u));
      bub.style.transform = `translate(${left}px, ${st.root.g - 170 * u - bub.offsetHeight}px)`;
    } else bub.style.opacity = 0;
  }

  function loop() {
    // Con "reducir movimiento" se muestra directo el final: Terqui ya llegó a la casa.
    const t = reduced ? 8.2 : Math.min(END, (performance.now() - start) / 1000);
    draw(t);
    if (t < END && !reduced) raf = requestAnimationFrame(loop);
  }
  const ro = new ResizeObserver(() => {
    build();
    cancelAnimationFrame(raf);
    loop();
  });
  ro.observe(root);
  build();
  loop();

  return {
    replay() {
      start = performance.now();
      cancelAnimationFrame(raf);
      loop();
    },
    stop() {
      cancelAnimationFrame(raf);
      ro.disconnect();
    },
  };
}
