"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { Logo } from "./Logo";

export function Header() {
  const { count } = useCart();
  return (
    <header className="bg-white border-b border-black/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" aria-label="TERC, ir al inicio">
          <Logo className="h-11 sm:h-12 w-auto" />
        </Link>
        <Link href="/carrito" className="text-sm font-medium">
          Carrito ({count})
        </Link>
      </div>
    </header>
  );
}
