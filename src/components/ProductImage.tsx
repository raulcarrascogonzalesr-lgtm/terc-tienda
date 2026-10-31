import { photoProps } from "@/lib/photo";
import type { Product } from "@/lib/types";
import { Mark } from "./Mark";

// Escenario verde con hojas de TERC detrás de cada foto (clase .photo-stage en globals.css).
export const PHOTO_BACKDROP = "relative photo-stage";

// Ancho de la foto en las tarjetas del catálogo (2 columnas en celular, hasta 5 en pantalla grande).
export const CARD_SIZES = "(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw";

export function ProductImage({ product }: { product: Product }) {
  if (!product.image_url) {
    // Mientras el equipo no tenga foto, se muestra un fondo de la marca con el nombre del fabricante.
    return (
      <div className="relative aspect-square w-full photo-stage flex flex-col items-center justify-center gap-4 p-6">
        <Mark className="w-1/3 opacity-60" ink="#0a2a2a" />
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-pine/60">
          {product.brand}
        </span>
      </div>
    );
  }
  // Todas las fotos sobre el mismo fondo suave: el blanco de la foto se funde con él (multiply).
  return (
    <div className={`aspect-square w-full ${PHOTO_BACKDROP}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...photoProps(product.image_url, CARD_SIZES, 828)}
        alt={product.name}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-contain p-[1.5%] mix-blend-multiply"
      />
    </div>
  );
}
