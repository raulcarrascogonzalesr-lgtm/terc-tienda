"use client";

import { useEffect, useState } from "react";

// Las fotos de los equipos vienen sobre fondo blanco. Para mostrarlas sobre un fondo oscuro
// (el banner de la portada), se quita ese blanco en el navegador: se pinta la foto en un
// canvas y se vuelve transparente el blanco que toca los bordes. El equipo queda intacto
// aunque tenga partes blancas por dentro, porque solo se borra el blanco conectado al borde.
// Si algo falla (por ejemplo, la foto no permite leerse), se muestra la foto tal cual.

const MAX_SIDE = 1200; // suficiente para el banner y mucho más liviano que la original
const LIGHT = 230; // desde aquí un píxel gris claro puede ser fondo (el blanco de estudio no es parejo)
const NEUTRAL = 14; // el fondo y las sombras son grises: sin color
const STEP = 10; // el relleno no cruza un cambio de color mayor a este entre vecinos
const SHADOW_MIN = 110; // la sombra o el reflejo bajo el equipo llega hasta este gris
const SHADOW_STEP = 16; // la sombra se oscurece de a poco (el borde de un equipo, de golpe)
const SHADOW_HEIGHT = 0.12; // alto máximo de la sombra, como parte del alto de la foto
const DARK = 110; // la sombra se acepta solo si termina (a pocos px) en una parte oscura del equipo
const GAP = 0.012; // huecos entre columnas de sombra que se rellenan, como parte del ancho
const BAND = 3; // ancho del borde que se mezcla con el fondo (px)
const SPECK = 0.0005; // islas sueltas más chicas que esto (parte de la foto) se borran
const cache = new Map<string, string>();

export function cutout(p: Uint8ClampedArray, W: number, H: number): Uint8ClampedArray {
  const N = W * H;
  const lum = (i: number) => (p[i * 4] + p[i * 4 + 1] + p[i * 4 + 2]) / 3;
  const neutral = (i: number) => {
    const r = p[i * 4];
    const g = p[i * 4 + 1];
    const b = p[i * 4 + 2];
    return Math.max(r, g, b) - Math.min(r, g, b) < NEUTRAL;
  };
  const clear = (i: number) => p[i * 4 + 3] < 8;
  const step = (i: number, j: number) =>
    Math.abs(p[i * 4] - p[j * 4]) + Math.abs(p[i * 4 + 1] - p[j * 4 + 1]) + Math.abs(p[i * 4 + 2] - p[j * 4 + 2]);
  const neighbors = (i: number) => {
    const x = i % W;
    return [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i >= W ? i - W : -1, i < N - W ? i + W : -1];
  };

  // 1. Relleno desde los bordes hacia adentro por el blanco y gris muy claro. Se detiene en
  // cualquier cambio brusco, así no entra en las partes plateadas que tocan el fondo.
  const bg = new Uint8Array(N);
  const stack: number[] = [];
  for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
  const isLight = (i: number) => clear(i) || (neutral(i) && lum(i) >= LIGHT);
  for (let k = 0; k < stack.length; k++) if (!isLight(stack[k])) stack[k] = -1;
  while (stack.length) {
    const i = stack.pop()!;
    if (i < 0 || bg[i]) continue;
    bg[i] = 1;
    for (const j of neighbors(i)) {
      if (j >= 0 && !bg[j] && (clear(j) || (isLight(j) && step(i, j) <= STEP))) stack.push(j);
    }
  }

  // 2. Sombra o reflejo bajo el equipo: columna por columna, desde el fondo hacia arriba, un
  // gris que se oscurece de a poco y termina en una parte oscura del equipo. Un borde plateado
  // no cumple (pasa del blanco al gris de golpe o termina en otro plateado), así no se come.
  const maxHeight = Math.round(H * SHADOW_HEIGHT);
  const shadow = new Uint8Array(N);
  for (let x = 0; x < W; x++) {
    for (let y = H - 1; y >= 0; y--) {
      const i = y * W + x;
      if (bg[i]) continue;
      const fromFloor = y === H - 1; // la sombra quedó cortada por el borde de abajo
      if (fromFloor ? !(neutral(i) && lum(i) >= 150) : !bg[i + W]) continue;
      let prev = fromFloor ? lum(i) : lum(i + W);
      const chain: number[] = [];
      let yy = y;
      while (yy >= 0 && chain.length <= maxHeight) {
        const k = yy * W + x;
        if (bg[k]) break;
        const l = lum(k);
        if (!neutral(k) || l < SHADOW_MIN || l > prev + 6 || prev - l > SHADOW_STEP) break;
        chain.push(k);
        prev = l;
        yy--;
      }
      let endsDark = false;
      for (let t = yy; t >= 0 && t >= yy - 4 && !bg[t * W + x]; t--) {
        if (lum(t * W + x) < DARK) {
          endsDark = true;
          break;
        }
      }
      if (chain.length && endsDark) {
        for (const k of chain) {
          bg[k] = 1;
          shadow[k] = 1;
        }
      }
      if (chain.length) y = yy + 1;
    }
  }
  // Entre columnas de sombra quedan a veces rayitas sin borrar: se rellenan si son gris de sombra.
  const isShade = (k: number) => bg[k] || (neutral(k) && lum(k) >= SHADOW_MIN);
  const gap = Math.max(4, Math.round(W * GAP));
  for (let y = 0; y < H; y++) {
    let last = -1;
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (shadow[i]) {
        if (last >= 0 && x - last > 1 && x - last - 1 <= gap) {
          for (let xx = last + 1; xx < x; xx++) bg[y * W + xx] = 1;
        }
        last = x;
      } else if (!isShade(i)) last = -1;
    }
  }

  // 3. Pelos claros de 1 px pegados al borde (restos del blanco por la compresión) y
  // 4. islas sueltas: también son fondo.
  const object = new Uint8Array(N);
  for (let i = 0; i < N; i++) object[i] = bg[i] ? 0 : 1;
  const morph = (src: Uint8Array, grow: boolean) => {
    const rows = new Uint8Array(N);
    const out = new Uint8Array(N);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const l = x > 0 ? src[y * W + x - 1] : 0;
        const c = src[y * W + x];
        const r = x < W - 1 ? src[y * W + x + 1] : 0;
        rows[y * W + x] = grow ? l | c | r : l & c & r;
      }
    }
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const u = y > 0 ? rows[(y - 1) * W + x] : 0;
        const c = rows[y * W + x];
        const d = y < H - 1 ? rows[(y + 1) * W + x] : 0;
        out[y * W + x] = grow ? u | c | d : u & c & d;
      }
    }
    return out;
  };
  const opened = morph(morph(object, false), true);
  for (let i = 0; i < N; i++) if (object[i] && !opened[i] && lum(i) >= 150) bg[i] = 1;
  const seen = new Uint8Array(N);
  const speck = Math.max(4, Math.round(N * SPECK));
  for (let s = 0; s < N; s++) {
    if (bg[s] || seen[s]) continue;
    const part = [s];
    seen[s] = 1;
    for (let h = 0; h < part.length; h++) {
      for (const j of neighbors(part[h])) {
        if (j >= 0 && !bg[j] && !seen[j]) {
          seen[j] = 1;
          part.push(j);
        }
      }
    }
    if (part.length <= speck) for (const i of part) bg[i] = 1;
  }

  // Distancia de cada píxel del equipo al fondo (solo cerca del borde).
  const dist = new Uint8Array(N).fill(255);
  let front: number[] = [];
  for (let i = 0; i < N; i++) {
    if (bg[i]) {
      dist[i] = 0;
      front.push(i);
    }
  }
  for (let d = 1; d <= BAND + 2 && front.length; d++) {
    const next: number[] = [];
    for (const i of front) {
      const x = i % W;
      const y = (i - x) / W;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          const k = yy * W + xx;
          if (dist[k] === 255) {
            dist[k] = d;
            next.push(k);
          }
        }
      }
    }
    front = next;
  }

  const out = new Uint8ClampedArray(p.length);
  const R = BAND + 2;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const I = i * 4;
      if (bg[i]) {
        // Fondo: el blanco desaparece y el gris de la sombra queda como sombra suave.
        const a = clear(i) ? 0 : Math.max(0, (232 - lum(i)) / 232) * 0.8;
        out[I + 3] = Math.round(255 * a);
        continue;
      }
      if (dist[i] > BAND) {
        out.set(p.subarray(I, I + 4), I);
        continue;
      }
      // Borde: la transparencia sale de cuánto se parece el píxel al fondo de al lado o al
      // equipo de al lado, y se le quita el fondo al color. Así no queda halo blanco.
      let bgSum = 0;
      let bgCount = 0;
      let objSum = 0;
      let objCount = 0;
      for (let dy = -R; dy <= R; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= H) continue;
        for (let dx = -R; dx <= R; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= W) continue;
          const k = yy * W + xx;
          if (bg[k]) {
            if (!clear(k)) {
              bgSum += lum(k);
              bgCount++;
            }
          } else if (dist[k] > BAND) {
            objSum += lum(k);
            objCount++;
          }
        }
      }
      const ref = bgCount ? bgSum / bgCount : 255;
      const inner = objCount ? objSum / objCount : -1;
      let a: number;
      if (inner >= 0 && ref - inner >= 40) a = Math.max(0, Math.min(1, (ref - lum(i)) / (ref - inner)));
      else a = dist[i] === 1 ? 0.5 : objCount ? 1 : 0.85;
      if (a <= 0.02) continue;
      for (let c = 0; c < 3; c++) out[I + c] = (p[I + c] - ref * (1 - a)) / a;
      out[I + 3] = Math.round(a * p[I + 3]);
    }
  }
  return out;
}

async function removeWhiteBackground(src: string): Promise<string> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  await img.decode();
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const W = Math.round(img.naturalWidth * scale);
  const H = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, W, H);
  const data = ctx.getImageData(0, 0, W, H);
  data.data.set(cutout(data.data, W, H));
  ctx.putImageData(data, 0, 0);
  return canvas.toDataURL("image/png");
}

export function CutoutImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [state, setState] = useState<{ src: string; result: string | null } | null>(() =>
    cache.has(src) ? { src, result: cache.get(src)! } : null,
  );

  useEffect(() => {
    if (cache.has(src)) return;
    let current = true;
    removeWhiteBackground(src)
      .then((url) => {
        cache.set(src, url);
        if (current) setState({ src, result: url });
      })
      .catch(() => current && setState({ src, result: null }));
    return () => {
      current = false;
    };
  }, [src]);

  const ready = state?.src === src;
  if (ready && state.result === null) {
    // Sin recorte: la foto original dentro de un recuadro claro.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={`rounded-3xl bg-white object-contain p-4 ${className}`} />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ready ? state.result! : src}
      alt={alt}
      className={`object-contain transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"} ${className}`}
    />
  );
}
