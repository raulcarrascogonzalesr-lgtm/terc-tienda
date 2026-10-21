"use client";

import { useState } from "react";
import { maxUnits } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { StoreIcon } from "./icons";

// "compact" es la versión chica de las tarjetas de la portada.
export function AddToCartButton({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const max = maxUnits(product);
  if (max <= 0) {
    return <p className="text-red-700 font-medium">Agotado</p>;
  }

  return (
    <button
      type="button"
      onClick={() => {
        add({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          maxQuantity: max,
        });
        setAdded(true);
      }}
      className={
        compact
          ? "flex w-full items-center justify-center gap-2 rounded-full bg-pine px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pine-700"
          : "w-full rounded-full bg-pine px-6 py-3.5 font-semibold text-white transition hover:bg-pine-700"
      }
    >
      {compact && !added && <StoreIcon name="cart" className="w-4 h-4" />}
      {added ? "Agregado al carrito ✓" : compact ? "Agregar" : "Agregar al carrito"}
    </button>
  );
}
