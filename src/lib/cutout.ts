// Quita el fondo blanco de una foto de equipo (ver CutoutImage.tsx y cutout.worker.ts).
// Es solo cálculo sobre los píxeles, sin tocar la página, así puede correr en segundo plano.

const LIGHT = 230; // desde aquí un píxel gris claro puede ser fondo (el blanco de estudio no es parejo)
const NEUTRAL = 14; // el fondo y las sombras son grises: sin color
const STEP = 10; // el relleno no cruza un cambio de color mayor a este entre vecinos
const SHADOW_MIN = 110; // la sombra o el reflejo bajo el equipo llega hasta este gris
const SHADOW_STEP = 16; // la sombra se oscurece de a poco (el borde de un equipo, de golpe)
const SHADOW_HEIGHT = 0.12; // alto máximo de la sombra, como parte del alto de la foto
const DARK = 110; // la sombra se acepta solo si termina (a pocos px) en una parte oscura del equipo
const GAP = 0.012; // huecos entre columnas de sombra que se rellenan, como parte del ancho
const SHADOW_RUN = 0.15; // una sombra de verdad es ancha: al menos esta parte del ancho de la foto
const BAND = 3; // ancho del borde que se mezcla con el fondo (px)
const SPECK = 0.0005; // islas sueltas más chicas que esto (parte de la foto) se borran

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
  const chains: { x: number; pixels: number[] }[] = [];
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
      if (chain.length && endsDark) chains.push({ x, pixels: chain });
      if (chain.length) y = yy + 1;
    }
  }
  // Solo cuenta como sombra un tramo ancho de columnas seguidas. Una franja plateada bajo
  // puertos o botones (como el frente de un EliteDesk) da tramos angostos, uno por puerto,
  // y no se borra.
  const gap = Math.max(4, Math.round(W * GAP));
  const hasChain = new Uint8Array(W);
  for (const c of chains) hasChain[c.x] = 1;
  const keep = new Uint8Array(W);
  for (let x = 0; x < W; ) {
    if (!hasChain[x]) {
      x++;
      continue;
    }
    let end = x;
    for (let xx = x + 1; xx < W && xx - end - 1 <= gap; xx++) if (hasChain[xx]) end = xx;
    if (end - x + 1 >= W * SHADOW_RUN) keep.fill(1, x, end + 1);
    x = end + 1;
  }
  const candidate = new Uint8Array(N);
  for (const c of chains) if (keep[c.x]) for (const k of c.pixels) candidate[k] = 1;
  // Y una sombra va debajo del equipo: si en esa fila hay equipo a la izquierda y a la derecha,
  // es parte del equipo (la franja plateada entre el logo y el botón de encendido).
  for (let y = 0; y < H; y++) {
    let left = -1;
    let right = -1;
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (bg[i] || candidate[i]) continue;
      if (left < 0) left = x;
      right = x;
    }
    if (left >= 0) candidate.fill(0, y * W + left + 1, y * W + right);
  }
  for (let k = 0; k < N; k++) {
    if (!candidate[k]) continue;
    bg[k] = 1;
    shadow[k] = 1;
  }
  // Entre columnas de sombra quedan a veces rayitas sin borrar: se rellenan si son gris de sombra.
  const isShade = (k: number) => bg[k] || (neutral(k) && lum(k) >= SHADOW_MIN);
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

// ---------- foto lista para el banner ----------

// Los recortes se guardan en el navegador: la segunda visita no vuelve a calcular nada.
// Cambiar el número si cambia el recorte, para no seguir usando los guardados.
export const CUTOUT_CACHE = "terc-recortes-1";

type AnyCanvas = OffscreenCanvas | HTMLCanvasElement;
const makeCanvas = (w: number, h: number): AnyCanvas =>
  typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(w, h) : Object.assign(document.createElement("canvas"), { width: w, height: h });
const context = (c: AnyCanvas) => c.getContext("2d", { willReadFrequently: true }) as OffscreenCanvasRenderingContext2D;
const toBlob = (c: AnyCanvas): Promise<Blob | null> =>
  "convertToBlob" in c ? c.convertToBlob({ type: "image/webp", quality: 0.92 }) : new Promise((r) => c.toBlob(r, "image/webp", 0.92));

async function openCache() {
  try {
    return await caches.open(CUTOUT_CACHE);
  } catch {
    return null; // sin caché (modo privado, http): se calcula igual
  }
}

/**
 * La foto sin fondo y recortada justo al equipo (sin el margen transparente), así todos se ven
 * del mismo tamaño. Funciona en un worker (en segundo plano) o en la página.
 */
export async function cutoutBlob(src: string, maxSide = 900): Promise<{ blob: Blob; ar: number }> {
  const store = await openCache();
  const hit = await store?.match(src).catch(() => undefined);
  if (hit) return { blob: await hit.blob(), ar: Number(hit.headers.get("x-ar")) };

  const res = await fetch(src, { mode: "cors" });
  if (!res.ok) throw new Error(`Foto no disponible (${res.status})`);
  const bmp = await createImageBitmap(await res.blob());
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const W = Math.round(bmp.width * scale);
  const H = Math.round(bmp.height * scale);
  const canvas = makeCanvas(W, H);
  const ctx = context(canvas);
  ctx.drawImage(bmp, 0, 0, W, H);
  bmp.close();
  const data = ctx.getImageData(0, 0, W, H);
  data.data.set(cutout(data.data, W, H));

  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (data.data[(y * W + x) * 4 + 3] < 24) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < x0) throw new Error("Foto vacía");
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const crop = makeCanvas(w, h);
  context(crop).putImageData(data, -x0, -y0, x0, y0, w, h);
  const blob = await toBlob(crop);
  if (!blob) throw new Error("No se pudo preparar la foto");
  const ar = w / h;
  await store?.put(src, new Response(blob, { headers: { "content-type": blob.type, "x-ar": String(ar) } })).catch(() => {});
  return { blob, ar };
}
