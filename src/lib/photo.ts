// Las fotos de los equipos se suben en tamaño grande (hasta 2400 px), pero en la tienda se
// muestran mucho más chicas. El servidor de la tienda (/_next/image) las achica y las pasa a
// WebP la primera vez que alguien las pide y después las guarda, así cada visita descarga
// unos pocos KB en vez de cientos. Los anchos tienen que estar en la lista de Next.js
// (imageSizes + deviceSizes en next.config.ts).

const WIDTHS = [256, 384, 640, 828, 1080] as const;

// Solo se achican las fotos de la tienda (Supabase) y las de /public; el resto queda igual.
function resizable(src: string) {
  if (src.endsWith(".svg")) return false;
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    return new URL(src).hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

function photoUrl(src: string, width: number, quality = 75) {
  if (!resizable(src)) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

/** Atributos para un <img>: el navegador elige el tamaño según `sizes` y la pantalla. */
export function photoProps(src: string, sizes: string, maxWidth = 1080) {
  if (!resizable(src)) return { src };
  const widths = WIDTHS.filter((w) => w <= maxWidth);
  return {
    src: photoUrl(src, widths[widths.length - 1]),
    srcSet: widths.map((w) => `${photoUrl(src, w)} ${w}w`).join(", "),
    sizes,
  };
}
