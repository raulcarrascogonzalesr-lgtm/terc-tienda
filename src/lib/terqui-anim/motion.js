// La "fórmula" de Terqui: una línea de tiempo que dice qué hace en cada segundo
// y la convierte en articulaciones para terqui-rig.js. Todo es función del tiempo t,
// así cada cuadro se puede calcular por separado y el video siempre sale igual.
// La misma línea de tiempo entrega la lista de "cues" (pasos, saltos, sílabas…) que usa audio.py,
// por eso el sonido calza exacto con lo que se ve. El ritmo de la música (bpm) manda:
// los pasos caen en el pulso y los bailes van al compás.
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, p) => a + (b - a) * p;
const E = {
  lin: (p) => p,
  in: (p) => p * p * p,
  out: (p) => 1 - Math.pow(1 - p, 3),
  io: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  back: (p) => 1 + 2.7 * Math.pow(p - 1, 3) + 1.7 * Math.pow(p - 1, 2),
};
const TAU = Math.PI * 2;
function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }

// ---------- poses: manos, cara y postura. "osc" agrega movimiento propio de cada pose ----------
const REST = {
  handL: [58, 150], handR: [142, 150], footL: [86, 190], footR: [114, 190],
  lean: 0, bodyY: 0, squash: 0, sit: 0, look: [0, 0], eyeL: 1, eyeR: 1, eyeArc: 1,
  browL: [0, 0], browR: [0, 0], mouth: { w: 9.5, open: 0, smile: 1.5 },
  prop: null, armsFront: false, elbowOutL: true, elbowOutR: true, dangle: 0, pulse: 0,
};
const sin = Math.sin;
const GESTURES = {
  rest: {},
  hola: { handL: [54, 150], handR: [152, 80], lean: -3, browL: [1.5, 0], browR: [1.5, 0], mouth: { smile: 3.2 },
    osc: (t) => ({ handR: [7 * sin(TAU * 2.2 * t), 2 * Math.cos(TAU * 2.2 * t)] }) },
  apunta: { handL: [60, 152], handR: [174, 92], lean: 5, look: [3, 0], browR: [2, -1], mouth: { smile: 2.5 },
    osc: (t) => ({ handR: [2.5 * sin(TAU * 1.5 * t), 0] }) },
  duda: { handL: [60, 152], handR: [140, 76], lean: -8, look: [-2, -1], browL: [-1, 0], browR: [3, 1.5], mouth: { w: 7, smile: -1 },
    osc: (t) => ({ handR: [0, 2 * sin(TAU * 3 * t)] }) },
  lupa: { handL: [60, 150], handR: [150, 94], prop: "lupa", lean: 4, look: [3, -1], browL: [1, 0], browR: [-0.5, 0], mouth: { w: 7, smile: 0.3 },
    osc: (t) => ({ handR: [4 * sin(TAU * 0.8 * t), 3 * sin(TAU * 1.6 * t)] }) },
  guino: { handL: [56, 150], handR: [160, 98], prop: "star", lean: -5, eyeR: 0, browL: [1, 0], browR: [-1, 0], mouth: { smile: 3.5, open: 3 } },
  caja: { handL: [62, 152], handR: [138, 152], prop: "box", lean: 8, look: [3, 0], mouth: { smile: 3, open: 2.5 } },
  corazon: { handL: [86, 146], handR: [114, 146], armsFront: true, elbowOutL: true, elbowOutR: true, prop: "heart", lean: -3,
    eyeL: 0, eyeR: 0, eyeArc: -1, browL: [1.5, 0], browR: [1.5, 0], mouth: { smile: 3.5, open: 3 },
    osc: (t, b) => ({ pulse: Math.pow(1 - b.frac, 3) }) },
  celebra: { handL: [40, 66], handR: [160, 66], eyeL: 0, eyeR: 0, eyeArc: -1, browL: [3, 0], browR: [3, 0], mouth: { w: 10, smile: 3, open: 7 },
    osc: (t, b) => { const k = Math.pow(sin(Math.PI * b.frac), 2) * 7; return { handL: [0, k], handR: [0, k] }; } },
  empuja: { handL: [150, 132], handR: [166, 114], lean: 14, eyeL: 0.75, eyeR: 0.75, look: [3, 0], browL: [0, -2], browR: [0, -2], mouth: { w: 8, smile: -0.5 } },
  camina: { handL: [60, 150], handR: [140, 150], lean: 3, look: [3, 0], mouth: { smile: 2.5 } },
  sentado: { handL: [64, 170], handR: [136, 170], sit: 1, dangle: 1, mouth: { smile: 2.5 } },
  agacha: { handL: [50, 162], handR: [150, 162], bodyY: -7, squash: 0.12, eyeL: 0.8, eyeR: 0.8, browL: [1, 0], browR: [1, 0], mouth: { smile: 2 } },
  salta: { handL: [44, 94], handR: [156, 94], footL: [88, 186], footR: [112, 186], browL: [3, 0], browR: [3, 0], mouth: { smile: 3, open: 5 } },
  listo: { handL: [46, 80], handR: [154, 80], browL: [2.5, 0], browR: [2.5, 0], mouth: { smile: 3, open: 4 } },
  asombro: { handL: [50, 132], handR: [150, 132], browL: [4, 1], browR: [4, 1], mouth: { w: 5, smile: 0, open: 8 } },
  // para videos hablando a cámara
  arriba: { handL: [58, 150], handR: [148, 64], lean: 3, look: [2, -4], browL: [2, 0], browR: [2.5, 0], mouth: { smile: 2.5 },
    osc: (t) => ({ handR: [1.5 * sin(TAU * 1.1 * t), 2 * sin(TAU * 1.1 * t)] }) },
  yo: { handL: [56, 150], handR: [114, 136], armsFront: true, lean: -3, browL: [2, 0], browR: [2.5, 0], mouth: { smile: 3 } },
  explica: { handL: [50, 134], handR: [150, 134], browL: [1, 0], browR: [1, 0], mouth: { smile: 2 },
    osc: (t) => ({ handL: [0, 3 * sin(TAU * 1.1 * t)], handR: [0, 3 * sin(TAU * 1.1 * t + 1.3)] }) },
};

const mix = (a, b, p) => {
  if (typeof a === "number") return lerp(a, b, p);
  if (Array.isArray(a)) return a.map((v, i) => lerp(v, b[i], p));
  if (a && typeof a === "object") { const o = {}; for (const k in a) o[k] = mix(a[k], b[k], p); return o; }
  return p < 0.5 ? a : b;
};
const add = (st, d) => {
  for (const k in d) {
    if (Array.isArray(d[k])) st[k] = st[k].map((v, i) => v + d[k][i]);
    else if (typeof d[k] === "object") st[k] = { ...st[k], ...Object.fromEntries(Object.entries(d[k]).map(([kk, v]) => [kk, st[k][kk] + v])) };
    else st[k] = (st[k] || 0) + d[k];
  }
};
const clone = (o) => JSON.parse(JSON.stringify(o));

// ---------- sílabas para que la boca y la "voz" sigan lo que dice ----------
const VOW = "aeiouáéíóúü";
function syllables(text) {
  const out = [];
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const w = word.toLowerCase().replace(/[^a-záéíóúüñ]/g, "");
    const parts = w.match(/[^aeiouáéíóúü]*[aeiouáéíóúüy]+(?:[^aeiouáéíóúü]+$)?/g) || [w];
    parts.forEach((p, i) => {
      const v = [...p].find((c) => VOW.includes(c)) || "a";
      out.push({ v: "aáeéiíoóuúü".indexOf(v) < 2 ? "a" : "eé".includes(v) ? "e" : "ií".includes(v) ? "i" : "oó".includes(v) ? "o" : "u", end: i === parts.length - 1, word });
    });
  }
  return out;
}
const VISEME = { a: { w: 8.5, open: 7.5 }, e: { w: 10.5, open: 4.5 }, i: { w: 10.5, open: 3 }, o: { w: 6, open: 7 }, u: { w: 5, open: 4.5 } };

export function performer(opt = {}) {
  const bpm = opt.bpm || 120, beatLen = 60 / bpm, offset = opt.offset || 0, size = opt.size || 560;
  const r = rng(opt.seed || 7);
  const poseKeys = [{ t: -1e9, name: "rest", blend: 0, over: {} }];
  const rootSegs = []; // {t0, t1, from, to, fn}
  const walks = [], jumps = [], talks = [], dances = [], extra = [];
  let last = { x: 0, g: 0, s: 1, rot: 0 };
  let cursor = -1e9;

  const beat = (n) => offset + n * beatLen; // tiempo del pulso n
  const beatInfo = (t) => { const b = (t - offset) / beatLen; return { n: Math.floor(b), frac: ((b % 1) + 1) % 1 }; };

  const api = {
    bpm, beatLen, beat, size,
    // posa: cambia de pose en t, mezclando durante "blend" segundos
    pose(t, name, blend = 0.25, over = {}) { poseKeys.push({ t, name, blend, over }); return api; },
    // pone a Terqui en un lugar al instante (x, g = suelo en px, s = escala, rot)
    place(t, to) { const v = { ...last, ...to }; rootSegs.push({ t0: t, t1: t, from: v, to: v, ease: E.lin }); last = v; cursor = t; return api; },
    // se desliza de donde esté a "to"
    move(t0, t1, to, ease = "io") { const from = { ...last }; const v = { ...last, ...to }; rootSegs.push({ t0, t1, from, to: v, ease: E[ease] || ease }); last = v; cursor = t1; return api; },
    // camina con pies bien plantados; cada paso cae en el pulso (stepBeats = cada cuánto pulso hay un paso)
    walk(t0, t1, to, o = {}) {
      const from = { ...last }; const v = { ...last, ...to };
      rootSegs.push({ t0, t1, from, to: v, ease: E.lin });
      walks.push({ t0, t1, from, to: v, step: (o.stepBeats || 0.5) * beatLen, lift: o.lift || 7, quiet: o.quiet });
      last = v; cursor = t1; return api;
    },
    // salto: se agacha, vuela en arco y aterriza (land = pose al caer)
    jump(t0, t1, to, o = {}) {
      const crouch = o.crouch ?? 0.22, ta = t0 + crouch;
      const from = { ...last }; const v = { ...last, ...to };
      rootSegs.push({ t0: ta, t1, from, to: v, ease: E.lin, arc: o.h ?? 160, spin: o.spin || 0 });
      jumps.push({ t0, ta, t1, crouch, big: o.big ?? 1 });
      if (crouch > 0) api.pose(t0, "agacha", Math.min(0.12, crouch));
      api.pose(ta, o.air || "salta", 0.1);
      if (o.land) api.pose(t1, o.land, 0.12, o.landOver || {});
      last = v; cursor = t1; return api;
    },
    // habla: la boca sigue las sílabas y se anotan para la voz
    say(t0, text, o = {}) {
      const rate = o.rate || 0.13, sy = syllables(text);
      let t = t0;
      const q = text.includes("?"), ex = text.includes("!");
      sy.forEach((s, i) => {
        const dur = rate * (s.end ? 1.25 : 1) * (0.9 + r() * 0.2);
        let p = (o.pitch || 0) + Math.round((r() - 0.5) * 4);
        if (ex && i === 0) p += 3;
        if (q && i === sy.length - 1) p += 5;
        if (!q && i === sy.length - 1) p -= 2;
        talks.push({ t, dur, v: s.v, p });
        t += dur + (s.end ? 0.05 : 0.012);
      });
      return t; // cuándo termina de hablar
    },
    // baila al compás entre t0 y t1
    dance(t0, t1, amount = 1) { dances.push({ t0, t1, amount }); return api; },
    // un sonido o evento libre (logo, transición…) que también va a audio.py
    cue(t, type, data = {}) { extra.push({ t, type, ...data }); return api; },
    get cursor() { return cursor; },
  };

  function rootAt(t) {
    let seg = null;
    for (const s of rootSegs) if (s.t0 <= t) seg = s; // el último que ya empezó
    if (!seg) return { ...(rootSegs[0] ? rootSegs[0].from : last) };
    const u = seg.t1 > seg.t0 ? clamp((t - seg.t0) / (seg.t1 - seg.t0)) : 1;
    const e = seg.ease(u);
    const v = { x: lerp(seg.from.x, seg.to.x, e), g: lerp(seg.from.g, seg.to.g, e), s: lerp(seg.from.s, seg.to.s, E.io(u)), rot: lerp(seg.from.rot, seg.to.rot, e) };
    if (seg.arc) { v.g -= seg.arc * 4 * u * (1 - u); v.rot += (seg.spin || 0) * 360 * E.io(u); }
    return v;
  }

  function poseAt(t) {
    const keys = poseKeys.filter((k) => k.t <= t).sort((a, b) => a.t - b.t);
    const cur = keys[keys.length - 1], prev = keys[keys.length - 2] || cur;
    const ev = (k) => {
      const g = GESTURES[k.name] || {};
      const st = clone({ ...REST, ...g, ...k.over, mouth: { ...REST.mouth, ...(g.mouth || {}), ...((k.over || {}).mouth || {}) } });
      if (g.osc) add(st, g.osc(t, beatInfo(t)));
      return st;
    };
    const u = cur.blend > 0 ? clamp((t - cur.t) / cur.blend) : 1;
    return u >= 1 ? ev(cur) : mix(ev(prev), ev(cur), E.io(u));
  }

  function state(t) {
    const st = poseAt(t);
    const root = rootAt(t);
    const unit = (size * root.s) / 200;
    let moving = false;
    // caminar: pies plantados en el suelo, cuerpo que rebota, brazos que se balancean al revés de las piernas
    for (const w of walks) {
      if (t < w.t0 || t > w.t1 + 0.18) continue;
      moving = true;
      const tt = Math.min(t, w.t1);
      const dir = Math.sign(w.to.x - w.from.x) || 1;
      const S = Math.min(26, Math.abs((w.to.x - w.from.x) / (w.t1 - w.t0)) * w.step / unit); // largo del paso en unidades de Terqui (máx. 26 para que no se estiren las piernas)
      const ph = (tt - w.t0) / (2 * w.step);
      const fade = 1 - clamp((t - w.t1) / 0.18);
      const foot = (off, baseX) => {
        const p = (((ph + off) % 1) + 1) % 1;
        let rel, lift = 0;
        if (p < 0.5) rel = S / 2 - (p / 0.5) * S;
        else { const q = (p - 0.5) / 0.5; rel = -S / 2 + S * E.io(q); lift = Math.sin(Math.PI * q) * w.lift; }
        return [lerp(baseX, baseX + dir * rel, fade), lerp(190, 190 - lift, fade)];
      };
      st.footL = foot(0, 86); st.footR = foot(0.5, 114);
      const sw = Math.cos(TAU * ph) * 9 * fade;
      st.handL = [st.handL[0] - dir * sw, st.handL[1] - Math.abs(sw) * 0.3];
      st.handR = [st.handR[0] + dir * sw, st.handR[1] - Math.abs(sw) * 0.3];
      st.bodyY += Math.pow(Math.sin(TAU * ph), 2) * 4 * fade;
      st.lean += dir * 3 * fade + Math.sin(TAU * ph) * 2 * fade;
    }
    // salto: agacharse, estirarse en el aire, aplastarse al caer
    for (const j of jumps) {
      if (t >= j.t0 && t < j.ta) { const k = Math.sin((Math.PI / 2) * clamp((t - j.t0) / j.crouch)); st.squash += 0.1 * k; st.bodyY -= 3 * k; moving = true; }
      if (t >= j.ta && t < j.t1) {
        const u = (t - j.ta) / (j.t1 - j.ta);
        st.squash -= 0.14 * Math.max(0, 1 - u * 2.5) - 0.06 * Math.max(0, (u - 0.75) * 4); moving = true;
        st.shadow = 0.4;
      }
      const dl = t - j.t1;
      if (dl >= 0 && dl < 0.35) { st.squash += 0.22 * j.big * Math.exp(-dl * 9) * Math.cos(dl * 22); }
    }
    // sentado: las piernas cuelgan y patalean
    if (st.dangle > 0.01) {
      const k = st.dangle;
      const a = Math.sin(TAU * 0.9 * t), b = Math.sin(TAU * 0.9 * t + Math.PI);
      st.footL = [lerp(st.footL[0], 84 + a * 2, k), lerp(st.footL[1], 196 + a * 4, k)];
      st.footR = [lerp(st.footR[0], 116 + b * 2, k), lerp(st.footR[1], 196 + b * 4, k)];
      st.shadow = 0;
    }
    // bailar al compás
    for (const d of dances) {
      if (t < d.t0 || t > d.t1) continue;
      const b = beatInfo(t);
      const fade = clamp((t - d.t0) / 0.2) * clamp((d.t1 - t) / 0.2);
      st.bodyY += Math.pow(Math.sin(Math.PI * b.frac), 2) * 5 * d.amount * fade;
      st.lean += (b.n % 2 ? 1 : -1) * Math.sin(Math.PI * b.frac) * 4 * d.amount * fade;
      st.squash += Math.pow(1 - b.frac, 6) * 0.06 * d.amount * fade;
    }
    // hablar
    for (const s of talks) {
      if (t < s.t || t > s.t + s.dur) continue;
      const env = Math.pow(Math.sin(Math.PI * clamp((t - s.t) / s.dur)), 0.7);
      const v = VISEME[s.v];
      st.mouth = { w: lerp(st.mouth.w, v.w, env), open: lerp(st.mouth.open, v.open, env), smile: st.mouth.smile * (1 - 0.4 * env) };
      st.browL = [st.browL[0] + env * 0.8, st.browL[1]]; st.browR = [st.browR[0] + env * 0.8, st.browR[1]];
    }
    // pestañear (se salta si la pose ya tiene los ojos cerrados)
    const bk = blinkAt(t);
    if (bk > 0) { st.eyeL = Math.min(st.eyeL, 1 - bk); st.eyeR = Math.min(st.eyeR, 1 - bk); if (st.eyeArc < 0 && bk > 0) st.eyeArc = 1; }
    // respirar cuando está quieto
    if (!moving) st.squash += 0.012 * Math.sin((TAU * t) / 2.2);
    // la hoja se queda atrás cuando se mueve y rebota al aterrizar
    const before = rootAt(t - 1 / 30), vx = (root.x - before.x) * 30, vy = (root.g - before.g) * 30;
    let jig = 0;
    for (const j of jumps) { const dl = t - j.t1; if (dl > 0 && dl < 1.6) jig += 22 * Math.exp(-dl * 4.5) * Math.sin(dl * 17); }
    st.sprout = clamp(-vx * 0.02, -24, 24) + st.lean * 0.5 + jig + Math.sin(t * 1.7) * 2;
    st.flutter = Math.sin(t * 9) * (0.15 + Math.min(1, (Math.abs(vx) + Math.abs(vy)) / 900));
    return { root, rig: st };
  }

  // pestañeos al azar pero siempre iguales (semilla fija)
  const blinks = [];
  { const br = rng((opt.seed || 7) + 99); let t = 0.8; while (t < 600) { blinks.push(t); if (br() < 0.2) blinks.push(t + 0.22); t += 2.2 + br() * 2.6; } }
  function blinkAt(t) {
    for (const b of blinks) { if (b > t) break; const u = (t - b) / 0.14; if (u < 1) return Math.sin(Math.PI * u); }
    return 0;
  }

  // lista de sonidos que calzan con el movimiento
  function cues() {
    const out = [];
    for (const w of walks) {
      if (w.quiet) continue;
      for (let tt = w.t0; tt < w.t1 - 1e-6; tt += w.step) out.push({ t: +tt.toFixed(4), type: "step", n: out.length });
      out.push({ t: w.t1, type: "step", soft: true });
    }
    for (const j of jumps) { out.push({ t: j.ta, type: "takeoff" }); out.push({ t: j.t1, type: "land", big: j.big }); }
    for (const s of talks) out.push({ t: +s.t.toFixed(4), type: "voice", dur: s.dur, v: s.v, p: s.p });
    for (const k of poseKeys) if (k.t > 0 && !["agacha", "salta", "rest"].includes(k.name)) out.push({ t: k.t, type: "pose", name: k.name });
    return out.concat(extra).sort((a, b) => a.t - b.t);
  }

  api.state = state; api.cues = cues; api.beatInfo = beatInfo;
  return api;
}

// Coloca el contenedor de Terqui en la escena: x = centro, g = suelo (px)
export function place(box, root, size = 560) {
  const oy = (size * 194) / 200;
  box.style.transformOrigin = `${size / 2}px ${oy}px`;
  box.style.transform = `translate(${root.x - size / 2}px, ${root.g - oy}px) rotate(${root.rot || 0}deg) scale(${root.s})`;
}

