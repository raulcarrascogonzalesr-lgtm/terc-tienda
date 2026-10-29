"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trackAddToCart } from "@/lib/analytics";
import { savings } from "@/lib/format";
import { productSpecs } from "@/lib/specs";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { StoreIcon } from "./icons";

// Agrega el equipo al carrito (con lo que el carrito muestra: foto, características y ahorro).
function useAddToCart(product: Product) {
  const { add } = useCart();
  return () => {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      maxQuantity: product.stock,
      cosmetic: product.grade !== "A",
      image: product.image_url,
      specs: productSpecs(product).chips.slice(0, 3).join(" · "),
      onDemand: product.on_demand,
      savings: savings(product)?.amount ?? null,
      warrantyMonths: product.warranty_months,
    });
    trackAddToCart({ id: product.id, name: product.name, price: product.price, quantity: 1, category: product.category });
  };
}

// "compact" es la versión chica de las tarjetas de la portada.
export function AddToCartButton({
  product,
  compact = false,
  secondary = false,
}: {
  product: Product;
  compact?: boolean;
  secondary?: boolean; // en la ficha, cuando "Comprar ahora" es el botón principal
}) {
  const { canBuy } = useCart();
  const addToCart = useAddToCart(product);
  const [added, setAdded] = useState(false);

  if (product.stock <= 0) {
    return <p className="text-red-700 font-medium">Agotado</p>;
  }

  if (!canBuy) {
    return (
      <button
        type="button"
        disabled
        className={
          compact
            ? "flex w-full items-center justify-center rounded-full bg-line/[0.06] px-4 py-2.5 text-sm font-semibold text-muted"
            : "w-full rounded-full bg-line/[0.06] px-6 py-3.5 font-semibold text-muted"
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
        addToCart();
        setAdded(true);
      }}
      className={
        compact
          ? "flex w-full items-center justify-center gap-2 rounded-full bg-cta px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cta-hover"
          : secondary
            ? "w-full rounded-full border-[1.5px] border-line/20 bg-surface px-6 py-3.5 font-semibold text-ink transition hover:border-pine-700/50"
            : "w-full rounded-full bg-cta px-6 py-3.5 font-semibold text-white transition hover:bg-cta-hover"
      }
    >
      {compact && !added && <StoreIcon name="cart" className="w-4 h-4" />}
      {added ? "Agregado al carrito ✓" : compact ? "Agregar" : "Agregar al carrito"}
    </button>
  );
}

// El botón principal de la ficha: lo agrega (si no estaba) y lleva directo al carrito.
export function BuyNowButton({ product, className = "" }: { product: Product; className?: string }) {
  const { canBuy, items } = useCart();
  const addToCart = useAddToCart(product);
  const router = useRouter();
  if (product.stock <= 0 || !canBuy) return null;
  return (
    <button
      type="button"
      onClick={() => {
        if (!items.some((i) => i.productId === product.id)) addToCart();
        router.push("/carrito");
      }}
      className={`flex w-full items-center justify-center gap-2.5 rounded-full bg-cta px-6 py-4 text-[17px] font-bold text-white shadow-lg shadow-cta/30 transition hover:bg-cta-hover ${className}`}
    >
      Comprar ahora <StoreIcon name="arrow" className="w-5 h-5" />
    </button>
  );
}
