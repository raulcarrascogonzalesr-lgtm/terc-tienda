"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function Header() {
  const { count } = useCart();
  return (
    <header className="bg-white border-b border-black/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-brand">
          TERC
        </Link>
        <Link href="/carrito" className="text-sm font-medium">
          Carrito ({count})
        </Link>
      </div>
    </header>
  );
}
