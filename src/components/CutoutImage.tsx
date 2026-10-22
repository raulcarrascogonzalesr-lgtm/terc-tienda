"use client";

import { useEffect, useState } from "react";

// Las fotos de los equipos vienen sobre fondo blanco. Para mostrarlas sobre un fondo oscuro
// (el banner de la portada), se quita ese blanco en el navegador: se pinta la foto en un
// canvas y se vuelve transparente el blanco que toca los bordes. El equipo queda intacto
// aunque tenga partes blancas por dentro, porque solo se borra el blanco conectado al borde.
// Si algo falla (por ejemplo, la foto no permite leerse), se muestra la foto tal cual.

const MAX_SIDE = 900; // suficiente para el banner y mucho más liviano que la original
const cache = new Map<string, string>();

function isBackground(p: Uint8ClampedArray, i: number) {
  const r = p[i * 4];
  const g = p[i * 4 + 1];
  const b = p[i * 4 + 2];
  return r > 230 && g > 230 && b > 230 && Math.max(r, g, b) - Math.min(r, g, b) < 16;
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
  const p = data.data;

  // Relleno desde los bordes hacia adentro.
  const cleared = new Uint8Array(W * H);
  const stack: number[] = [];
  for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
  while (stack.length) {
    const i = stack.pop()!;
    if (cleared[i] || !isBackground(p, i)) continue;
    cleared[i] = 1;
    p[i * 4 + 3] = 0;
    const x = i % W;
    if (x > 0) stack.push(i - 1);
    if (x < W - 1) stack.push(i + 1);
    if (i >= W) stack.push(i - W);
    if (i < W * (H - 1)) stack.push(i + W);
  }
  // Borde suave: los píxeles claros que tocan el fondo quedan semitransparentes.
  for (let i = 0; i < W * H; i++) {
    if (cleared[i]) continue;
    const x = i % W;
    const touches =
      (x > 0 && cleared[i - 1]) || (x < W - 1 && cleared[i + 1]) || cleared[i - W] || cleared[i + W];
    if (!touches) continue;
    const light = Math.min(p[i * 4], p[i * 4 + 1], p[i * 4 + 2]);
    if (light > 200) p[i * 4 + 3] = Math.round((255 * (255 - light)) / 55);
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
