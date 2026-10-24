"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";
import { StoreIcon } from "./icons";
import { Logo } from "./Logo";
import { Terqui } from "./Terqui";

function SearchForm({ className = "" }: { className?: string }) {
  return (
    <form action="/" role="search" className={`relative ${className}`}>
      <input
        type="search"
        name="q"
        placeholder="¿Qué equipo buscas?"
        aria-label="Buscar equipos"
        className="w-full rounded-full border border-black/10 bg-paper py-2.5 pl-4 pr-11 text-sm text-ink placeholder:text-muted/80 focus:border-pine-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-pine-700/10"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-2 text-pine hover:bg-mint-50"
      >
        <StoreIcon name="search" className="w-[18px] h-[18px]" />
      </button>
    </form>
  );
}

export function Header({
  categories,
  offerPercent,
  limitedOffers,
  offerName,
}: {
  categories: string[];
  offerPercent: number; // mayor descuento en oferta; 0 si no hay ofertas
  limitedOffers: boolean; // alguna oferta tiene fecha de término
  offerName: string | null; // nombre de la promoción, si tiene
}) {
  const { count } = useCart();
  // Al bajar, la franja de arriba se va con la página y el menú queda fijo, más compacto y con sombra.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <>
      {offerPercent > 0 ? (
        <Link
          href="/?ofertas=1#equipos"
          className="block bg-sale text-[13px] font-semibold text-white"
        >
          <div className="shell h-9 flex items-center justify-center gap-2">
            <StoreIcon name="tag" className="w-4 h-4" />
            <span>
              {offerName && <strong className="font-extrabold uppercase tracking-wide">{offerName}: </strong>}
              {limitedOffers && !offerName && "Solo por tiempo limitado: "}
              {limitedOffers && offerName && <span className="hidden sm:inline">solo por tiempo limitado, </span>}
              ofertas de hasta −{offerPercent}%
            </span>
            <span className="hidden sm:flex items-center gap-1 underline underline-offset-2">
              Ver ofertas <StoreIcon name="arrow" className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      ) : (
        <div className="bg-pine text-[13px] text-white/85">
          <div className="shell h-9 flex items-center justify-center gap-6">
            <span className="flex items-center gap-1.5">
              <StoreIcon name="shield" className="w-4 h-4 text-gold" />
              Todos los equipos con garantía
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <StoreIcon name="truck" className="w-4 h-4 text-gold" />
              Envíos a todo Chile
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <StoreIcon name="card" className="w-4 h-4 text-gold" />
              Paga en cuotas con Mercado Pago
            </span>
          </div>
        </div>
      )}

      <header
        className={`sticky top-0 z-40 transition-shadow duration-300 ${scrolled ? "shadow-lg shadow-pine/[0.07]" : ""}`}
      >
        <div className="bg-white/95 backdrop-blur border-b border-black/[0.06]">
          <div className="shell h-16 flex items-center gap-6">
            <Link href="/" aria-label="TERC, ir al inicio" className="shrink-0">
              <Logo
                className={`h-14 w-auto origin-left transition-transform duration-300 ${scrolled ? "scale-[0.86]" : ""}`}
              />
            </Link>
            <SearchForm className="hidden md:block flex-1 max-w-xl mx-auto" />
            <Link
              href="/carrito"
              aria-label={`Carrito, ${count} productos`}
              className="relative ml-auto md:ml-0 flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-ink hover:bg-paper"
            >
              <StoreIcon name="cart" className="w-[22px] h-[22px]" />
              <span className="hidden sm:inline">Carrito</span>
              {count > 0 && (
                <span className="absolute -top-0.5 left-6 min-w-5 h-5 px-1 rounded-full bg-gold text-pine text-[11px] font-bold flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          </div>
          <div className="md:hidden px-4 pb-3">
            <SearchForm />
          </div>
          {categories.length > 0 && (
            <nav
              aria-label="Categorías"
              className="border-t border-black/[0.06]"
            >
              <div className="shell h-11 flex items-center gap-1 overflow-x-auto text-sm">
                <Link
                  href="/#equipos"
                  className="shrink-0 rounded-full px-3 py-1.5 font-medium text-ink hover:bg-paper"
                >
                  Todos
                </Link>
                {offerPercent > 0 && (
                  <Link
                    href="/?ofertas=1#equipos"
                    className="shrink-0 rounded-full px-3 py-1.5 font-semibold text-sale hover:bg-sale-50"
                  >
                    Ofertas
                  </Link>
                )}
                {categories.map((c) => (
                  <Link
                    key={c}
                    href={`/?categoria=${encodeURIComponent(c)}#equipos`}
                    className="shrink-0 rounded-full px-3 py-1.5 text-muted hover:bg-paper hover:text-ink"
                  >
                    {c}
                  </Link>
                ))}
                <Link
                  href="/por-que-terc"
                  className="ml-auto flex shrink-0 items-center gap-1 rounded-full py-1.5 pl-1 pr-3 text-muted hover:bg-paper hover:text-ink"
                >
                  <Terqui pose="apunta" crop="asoma" className="terqui-peek -my-3 h-11 w-auto" />
                  Por qué TERC
                </Link>
                <Link
                  href="/empresas"
                  className="shrink-0 rounded-full px-3 py-1.5 font-medium text-pine-700 hover:bg-mint-50"
                >
                  Empresas y cotizaciones
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
}
