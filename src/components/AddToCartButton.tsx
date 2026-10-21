"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";

export function AddToCartButton({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  if (product.stock <= 0) {
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
          maxQuantity: product.stock,
        });
        setAdded(true);
      }}
      className="w-full rounded-full bg-pine px-6 py-3.5 font-semibold text-white transition hover:bg-pine-700"
    >
      {added ? "Agregado al carrito ✓" : "Agregar al carrito"}
    </button>
  );
}
