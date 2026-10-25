"use client";

import { useEffect, useState } from "react";

// Las fotos de los equipos vienen sobre fondo blanco. Para mostrarlas sobre un fondo oscuro
// (el banner de la portada), se quita ese blanco en el navegador: se pinta la foto en un
// canvas y se vuelve transparente el blanco que toca los bordes. El equipo queda intacto
// aunque tenga partes blancas por dentro, porque solo se borra el blanco conectado al borde.
// Si algo falla (por ejemplo, la foto no permite leerse), se muestra la foto tal cual.

const MAX_SIDE = 1200; // suficiente para el banner y mucho más liviano que la original
const WHITE = 246; // desde aquí un píxel cuenta como fondo (más bajo se come el plateado)
const STEP = 10; // el relleno no cruza un cambio de color mayor a este entre vecinos
const FEATHER = 2; // pasadas de suavizado del borde (cada una ~1 px)
const cache = new Map<string, string>();

async function removeWhiteBackground(src: string): Promise<string> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  await img.decode();
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const W = Math.round(img.naturalWidth * scale);
  const H = Math.round(img.naturalHeight * scale);
  const N = W * H;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, W, H);
  const data = ctx.getImageData(0, 0, W, H);
  const p = data.data;

  const isBackground = (i: number) => {
    const r = p[i * 4];
    const g = p[i * 4 + 1];
    const b = p[i * 4 + 2];
    if (p[i * 4 + 3] < 8) return true;
    return Math.min(r, g, b) >= WHITE && Math.max(r, g, b) - Math.min(r, g, b) < 12;
  };
  const step = (i: number, j: number) =>
    Math.abs(p[i * 4] - p[j * 4]) + Math.abs(p[i * 4 + 1] - p[j * 4 + 1]) + Math.abs(p[i * 4 + 2] - p[j * 4 + 2]);

  // Relleno desde los bordes hacia adentro. Se detiene en cualquier cambio brusco, así no
  // entra en las partes plateadas casi blancas que tocan el fondo (bisagras, bordes).
  const background = new Uint8Array(N);
  const stack: number[] = [];
  for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
  while (stack.length) {
    const i = stack.pop()!;
    if (background[i] || !isBackground(i)) continue;
    background[i] = 1;
    const x = i % W;
    for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i >= W ? i - W : -1, i < N - W ? i + W : -1]) {
      if (j >= 0 && !background[j] && (step(i, j) <= STEP || p[j * 4 + 3] < 8)) stack.push(j);
    }
  }

  // Borde suave: se difumina la máscara un par de píxeles (sin serrucho) y se le quita al
  // borde el blanco del fondo original, para que no quede un halo claro sobre el verde.
  let alpha = new Float32Array(N);
  for (let i = 0; i < N; i++) alpha[i] = background[i] ? 0 : 1;
  for (let pass = 0; pass < FEATHER; pass++) {
    const blurred = new Float32Array(N);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let sum = 0;
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          const yy = y + dy;
          if (yy < 0 || yy >= H) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            if (xx < 0 || xx >= W) continue;
            sum += alpha[yy * W + xx];
            n++;
          }
        }
        blurred[y * W + x] = sum / n;
      }
    }
    alpha = blurred;
  }
  for (let i = 0; i < N; i++) {
    const a = background[i] ? 0 : Math.min(1, alpha[i] * 1.6);
    if (a > 0 && a < 1) {
      for (let c = 0; c < 3; c++) p[i * 4 + c] = Math.max(0, Math.min(255, (p[i * 4 + c] - 255 * (1 - a)) / a));
    }
    p[i * 4 + 3] = Math.round(a * p[i * 4 + 3]);
  }
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
