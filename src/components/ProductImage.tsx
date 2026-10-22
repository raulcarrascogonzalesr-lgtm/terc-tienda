import type { Product } from "@/lib/types";
import { Mark } from "./Mark";

export const PHOTO_BACKDROP = "bg-gradient-to-b from-[#f6f4ef] to-[#ebede8]";

export function ProductImage({ product }: { product: Product }) {
  if (!product.image_url) {
    // Mientras el equipo no tenga foto, se muestra un fondo de la marca con el nombre del fabricante.
    return (
      <div className="aspect-square w-full bg-gradient-to-br from-[#f1efe8] to-[#e6ebe7] flex flex-col items-center justify-center gap-4 p-6">
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
        src={product.image_url}
        alt={product.name}
        className="h-full w-full object-contain p-[4%] mix-blend-multiply"
      />
    </div>
  );
}
