import { CUTOUT_CACHE, cutoutBlob } from "@/lib/cutout";

// Fotos sin fondo para el banner. El cálculo corre en un worker (otro hilo), así la animación
// y la página siguen fluidas; si el navegador no puede, se hace en la página como antes.
export function cutoutPhotos() {
  const pending = new Map<number, { resolve(r: { blob: Blob; ar: number }): void; reject(e: Error): void }>();
  const urls: string[] = [];
  let worker: Worker | null = null;
  let next = 0;
  if (typeof OffscreenCanvas !== "undefined") {
    try {
      worker = new Worker(new URL("../../lib/cutout.worker.ts", import.meta.url));
      worker.onmessage = (e: MessageEvent<{ id: number; blob?: Blob; ar?: number; error?: string }>) => {
        const job = pending.get(e.data.id);
        pending.delete(e.data.id);
        if (!job) return;
        if (e.data.blob) job.resolve({ blob: e.data.blob, ar: e.data.ar! });
        else job.reject(new Error(e.data.error));
      };
    } catch {
      worker = null;
    }
  }

  return {
    async cut(src: string) {
      const abs = new URL(src, location.href).href;
      const { blob, ar } = worker
        ? await new Promise<{ blob: Blob; ar: number }>((resolve, reject) => {
            const id = next++;
            pending.set(id, { resolve, reject });
            worker!.postMessage({ id, src: abs });
          })
        : await cutoutBlob(abs);
      const url = URL.createObjectURL(blob);
      urls.push(url);
      return { url, ar };
    },
    // Borra del navegador los recortes de equipos que ya no están en el banner.
    async prune(keep: string[]) {
      try {
        const store = await caches.open(CUTOUT_CACHE);
        const wanted = new Set(keep.map((src) => new URL(src, location.href).href));
        for (const req of await store.keys()) if (!wanted.has(req.url)) await store.delete(req);
      } catch {}
    },
    stop() {
      worker?.terminate();
      urls.forEach((u) => URL.revokeObjectURL(u));
    },
  };
}
