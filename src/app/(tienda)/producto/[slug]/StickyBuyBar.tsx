"use client";

import { useEffect, useState } from "react";
import { BuyNowButton } from "@/components/AddToCartButton";
import { useCart } from "@/components/CartProvider";
import { formatCLP } from "@/lib/format";
import type { Product } from "@/lib/types";

// En el celular, cuando el botón "Comprar ahora" queda fuera de la pantalla, aparece abajo una
// barra con el precio y el botón. Mientras se ve, el botón de WhatsApp sube para no quedar tapado.
export function StickyBuyBar({ product, note }: { product: Product; note: string | null }) {
  const { canBuy } = useCart();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const target = document.getElementById("comprar");
    if (!target) return;
    // Se mira al bajar (y no con IntersectionObserver) para que funcione también con saltos largos.
    const check = () => setShow(target.getBoundingClientRect().bottom < 0);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("has-buybar", show);
    return () => document.documentElement.classList.remove("has-buybar");
  }, [show]);

  if (product.stock <= 0 || !canBuy) return null;
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line/10 bg-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_-12px_rgba(10,42,42,0.3)] backdrop-blur transition-transform duration-300 sm:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      inert={!show}
    >
      <div className="grid leading-tight">
        <b className="font-[family-name:var(--font-display)] text-xl text-ink">
          {formatCLP(product.price)}
        </b>
        {note && <span className="text-[11px] font-bold text-pine-700">{note}</span>}
      </div>
      <BuyNowButton product={product} className="flex-1 !py-3.5 !text-[15px]" />
    </div>
  );
}
