"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { energyHref } from "@/lib/energy";
import { SITE } from "@/lib/site";
import { warrantyLabel } from "@/lib/warranty";
import { useCart } from "./CartProvider";
import { StoreIcon } from "./icons";
import { Logo } from "./Logo";
import { Terqui } from "./Terqui";
import { ThemeToggle } from "./ThemeToggle";

function SearchForm({ className = "", energy = false }: { className?: string; energy?: boolean }) {
  return (
    <form action="/" role="search" className={`relative ${className}`}>
      <input
        type="search"
        name="q"
        placeholder={energy ? "¿Qué buscas? Notebook, batería, UPS…" : "¿Qué equipo buscas?"}
        aria-label={energy ? "Buscar equipos y productos de Energía" : "Buscar equipos"}
        className="w-full rounded-full border border-line/10 bg-paper/70 py-2.5 pl-4 pr-11 text-sm text-ink placeholder:text-muted/80 focus:border-pine-700 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-pine-700/10"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-2 text-ink hover:bg-mint-50"
      >
        <StoreIcon name="search" className="w-[18px] h-[18px]" />
      </button>
    </form>
  );
}

type EnergyLink = { name: string; short: string };

// Los dos mundos de la tienda: Computadores (reacondicionados) y Energía (nuevos, TERC 2.1).
function Worlds({ energyWorld }: { energyWorld: boolean }) {
  const base = "flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold transition";
  return (
    <div className="flex shrink-0 items-center rounded-full bg-surface p-1 ring-1 ring-line/[0.08]" role="group" aria-label="Secciones de la tienda">
      <Link
        href="/#equipos"
        aria-current={!energyWorld ? "page" : undefined}
        className={`${base} ${!energyWorld ? "bg-pine text-white" : "text-muted hover:text-ink"}`}
      >
        Computadores
      </Link>
      <Link
        href="/energia"
        aria-current={energyWorld ? "page" : undefined}
        className={`${base} ${energyWorld ? "bg-pine text-white" : "text-muted hover:text-ink"}`}
      >
        <StoreIcon name="bolt" className="h-4 w-4 text-gold" />
        Energía
        {!energyWorld && (
          <span className="rounded-full bg-gold px-1.5 py-px text-[10px] font-extrabold uppercase tracking-wide text-pine">Nuevo</span>
        )}
      </Link>
    </div>
  );
}

export function Header({
  categories,
  energyCategories,
  offerPercent,
  limitedOffers,
  offerName,
  freeShipping,
}: {
  categories: string[];
  energyCategories: EnergyLink[]; // categorías de Energía con productos; vacío = sin menú de Energía
  offerPercent: number; // mayor descuento en oferta; 0 si no hay ofertas
  limitedOffers: boolean; // alguna oferta tiene fecha de término
  offerName: string | null; // nombre de la promoción, si tiene
  freeShipping: boolean; // envío gratis en la Región Metropolitana
}) {
  const { count } = useCart();
  const pathname = usePathname() ?? "";
  const hasEnergy = energyCategories.length > 0;
  const energyWorld = hasEnergy && pathname.startsWith("/energia");
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
            <span className={`${freeShipping ? "hidden sm:flex" : "flex"} items-center gap-1.5`}>
              <StoreIcon name="shield" className="w-4 h-4 text-gold" />
              {warrantyLabel(SITE.warrantyMonths)} de garantía en todos los equipos
            </span>
            <span className="hidden lg:flex items-center gap-1.5">
              <StoreIcon name="chat" className="w-4 h-4 text-gold" />
              Soporte por WhatsApp
            </span>
            <span className={`${freeShipping ? "flex font-semibold text-white" : "hidden sm:flex"} items-center gap-1.5`}>
              <StoreIcon name="truck" className="w-4 h-4 text-gold" />
              {freeShipping ? "Envío gratis en toda la Región Metropolitana" : "Envíos a todo Chile"}
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
        <div className="bg-surface/95 backdrop-blur border-b border-line/[0.06]">
          <div className="shell h-16 flex items-center gap-6">
            <Link href="/" aria-label="TERC, ir al inicio" className="shrink-0">
              <Logo
                className={`h-14 w-auto origin-left transition-transform duration-300 ${scrolled ? "scale-[0.86]" : ""}`}
              />
            </Link>
            <SearchForm energy={hasEnergy} className="hidden md:block flex-1 max-w-xl mx-auto" />
            <div className="ml-auto md:ml-0 flex items-center gap-1">
            <ThemeToggle />
            <Link
              href="/carrito"
              aria-label={`Carrito, ${count} productos`}
              className="relative flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-ink hover:bg-mint-50"
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
          </div>
          <div className="md:hidden px-4 pb-3">
            <SearchForm energy={hasEnergy} />
          </div>
          {(categories.length > 0 || hasEnergy) && (
            <nav
              aria-label="Categorías"
              className="border-t border-line/[0.06] bg-mint-50/70"
            >
              <div className={`scroll-fade shell flex items-center gap-1 overflow-x-auto text-sm ${hasEnergy ? "h-12" : "h-11"}`}>
                {hasEnergy && <Worlds energyWorld={energyWorld} />}
                {energyWorld ? (
                  <>
                    <Link href="/energia#productos" className="ml-1 shrink-0 rounded-full px-3 py-1.5 font-medium text-ink hover:bg-surface">
                      Todo Energía
                    </Link>
                    {energyCategories.map((c) => (
                      <Link
                        key={c.name}
                        href={energyHref(c)}
                        className="shrink-0 rounded-full px-3 py-1.5 text-muted hover:bg-surface hover:text-ink"
                      >
                        {c.short}
                      </Link>
                    ))}
                  </>
                ) : (
                  <>
                    <Link
                      href="/#equipos"
                      className={`shrink-0 rounded-full px-3 py-1.5 font-medium text-ink hover:bg-surface ${hasEnergy ? "ml-1" : ""}`}
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
                        className="shrink-0 rounded-full px-3 py-1.5 text-muted hover:bg-surface hover:text-ink"
                      >
                        {c}
                      </Link>
                    ))}
                  </>
                )}
                {/* "Por qué TERC" habla de los reacondicionados: en Energía se deja el espacio para sus categorías. */}
                <Link
                  href="/por-que-terc"
                  className={`ml-auto shrink-0 items-center gap-1 rounded-full py-1.5 pl-1 pr-3 text-muted hover:bg-surface hover:text-ink ${energyWorld ? "hidden" : "flex"}`}
                >
                  <Terqui pose="apunta" crop="asoma" className="terqui-peek -my-3 h-11 w-auto" />
                  Por qué TERC
                </Link>
                <Link
                  href="/empresas"
                  className={`shrink-0 rounded-full bg-pine px-3.5 py-1.5 font-semibold text-white hover:bg-cta ${energyWorld ? "ml-auto" : ""}`}
                >
                  Empresas: precio por volumen
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
}
