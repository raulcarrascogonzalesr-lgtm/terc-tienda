// Recorta las fotos del banner en segundo plano, para que la página no se trabe mientras tanto.
import { cutoutBlob } from "./cutout";

self.onmessage = async (e: MessageEvent<{ id: number; src: string }>) => {
  const { id, src } = e.data;
  try {
    const { blob, ar } = await cutoutBlob(src);
    self.postMessage({ id, blob, ar });
  } catch (err) {
    self.postMessage({ id, error: String(err) });
  }
};
