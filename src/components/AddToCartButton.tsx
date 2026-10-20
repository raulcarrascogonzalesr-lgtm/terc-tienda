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
      className="w-full sm:w-auto bg-brand text-white font-medium rounded-lg px-6 py-3 hover:opacity-90"
    >
      {added ? "Agregado al carrito ✓" : "Agregar al carrito"}
    </button>
  );
}
