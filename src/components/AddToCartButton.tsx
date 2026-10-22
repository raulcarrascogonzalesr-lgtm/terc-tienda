"use client";

import { useState } from "react";
import { trackAddToCart } from "@/lib/analytics";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { StoreIcon } from "./icons";

// "compact" es la versión chica de las tarjetas de la portada.
export function AddToCartButton({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { add, canBuy } = useCart();
  const [added, setAdded] = useState(false);

  const max = product.stock;
  if (max <= 0) {
    return <p className="text-red-700 font-medium">Agotado</p>;
  }

  if (!canBuy) {
    return (
      <button
        type="button"
        disabled
        className={
          compact
            ? "flex w-full items-center justify-center rounded-full bg-black/[0.06] px-4 py-2.5 text-sm font-semibold text-muted"
            : "w-full rounded-full bg-black/[0.06] px-6 py-3.5 font-semibold text-muted"
        }
      >
        {compact ? "Muy pronto" : "Muy pronto podrás comprarlo"}
      </button>
    );
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
        trackAddToCart({ id: product.id, name: product.name, price: product.price, quantity: 1, category: product.category });
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
