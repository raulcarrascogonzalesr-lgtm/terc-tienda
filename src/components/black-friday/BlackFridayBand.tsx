import Link from "next/link";
import { StoreIcon } from "@/components/icons";
import { Terqui } from "@/components/Terqui";
import { energyCategory } from "@/lib/energy";
import { formatCLP, offer } from "@/lib/format";
import { hasRealPhoto, photoProps } from "@/lib/photo";
import { productSpecs } from "@/lib/specs";
import type { Product } from "@/lib/types";
import { BlackFridayClock } from "./BlackFridayClock";

// Tarjeta oscura de una oferta: foto sobre un círculo blanco, precio de antes tachado y el nuevo en dorado.
export function BlackFridayDeal({ product }: { product: Product }) {
  const sale = offer(product)!;
  const energy = energyCategory(product.category);
  const name = energy ? product.name : productSpecs(product).shortName;
  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group relative flex h-full flex-col rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/[0.07] hover:ring-gold/50 sm:p-4"
    >
      <span className="absolute right-2 top-2 z-10 rotate-6 rounded-full bg-gold px-2.5 py-1 text-xs font-extrabold text-black shadow-lg sm:text-sm">
        −{sale.percent}%
      </span>
      <div className="relative mx-auto aspect-square w-full max-w-36 overflow-hidden rounded-full bg-white">
        {hasRealPhoto(product) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            {...photoProps(product.image_url!, "(min-width: 640px) 180px, 140px", 384)}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain p-[14%] transition duration-500 group-hover:scale-105"
          />
        ) : (
          <Terqui pose="guino" className="absolute inset-[12%] h-auto w-auto" />
        )}
      </div>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
        {energy ? `Energía · ${energy.short}` : product.category}
      </p>
      <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-white">
        {!energy && product.brand && !name.startsWith(product.brand) ? `${product.brand} ` : ""}
        {name}
      </p>
      <div className="mt-auto pt-2">
        <p className="text-xs text-white/50">
          Antes <span className="line-through">{formatCLP(sale.before)}</span>
        </p>
        <p className="font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight text-gold sm:text-2xl">
          {formatCLP(product.price)}
        </p>
        <p className="mt-1 inline-block rounded-md bg-sale px-1.5 py-0.5 text-[11px] font-bold text-white">
          Ahorras {formatCLP(sale.amount)}
        </p>
      </div>
    </Link>
  );
}

// El gran letrero de Black Friday. En la portada lleva las ofertas abajo; en /black-friday va solo.
export function BlackFridayBand({
  deals,
  ends,
  maxPercent,
  showDeals = true,
  heading = "h2",
}: {
  deals: Product[];
  ends: string | null;
  maxPercent: number;
  showDeals?: boolean;
  heading?: "h1" | "h2";
}) {
  const H = heading;
  const hasEnergy = deals.some((p) => energyCategory(p.category));
  const hasPcs = deals.some((p) => !energyCategory(p.category));
  const what = hasEnergy && hasPcs ? "equipos y energía" : hasEnergy ? "baterías e inversores" : "equipos";
  return (
    <section className="bf-band relative overflow-hidden rounded-3xl bg-[#0b0b0a] text-white">
      {/* Brillo dorado y franjas diagonales de fondo. */}
      <div aria-hidden className="bf-glow pointer-events-none absolute inset-0" />
      <div aria-hidden className="bf-stripes pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-[0.07]" />

      <div className="relative grid items-center gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10 lg:px-10 lg:py-8">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold sm:text-xs">
            <span className="h-2 w-2 animate-pulse rounded-full bg-sale" /> TERC · 27 al 30 de noviembre
          </p>
          <H className="mt-2 font-[family-name:var(--font-display)] font-black uppercase leading-[0.85] tracking-tight">
            <span className="block text-[3.4rem] sm:text-7xl lg:text-8xl">Black</span>
            <span className="bf-outline block text-[3.4rem] sm:text-7xl lg:text-8xl">Friday</span>
          </H>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/80 sm:text-lg">
            Hasta <strong className="font-extrabold text-gold">−{maxPercent}%</strong> en {what}.{" "}
            <span className="hidden sm:inline">
              Con la misma garantía de siempre y el precio de antes real: no lo inflamos para que el descuento se vea más grande.
            </span>
            <span className="sm:hidden">Misma garantía y precio de antes real.</span>
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            {ends && <BlackFridayClock endsOn={ends} />}
            <Link
              href="/black-friday"
              className="group inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-extrabold text-black transition hover:brightness-110 sm:text-base"
            >
              Ver las ofertas <StoreIcon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Terqui celebrando junto al sello del descuento (se oculta en celular para dar espacio). */}
        <div aria-hidden className="relative mx-auto hidden h-64 w-64 lg:block">
          <div className="bf-spin absolute inset-0 rounded-full border-2 border-dashed border-gold/30" />
          <div className="absolute inset-6 rounded-full bg-gold/10" />
          <Terqui pose="celebra" className="absolute inset-x-6 bottom-2 h-56 w-52" />
          <span className="stamp absolute -right-4 top-2 flex h-24 w-24 -rotate-12 flex-col items-center justify-center rounded-full bg-sale font-[family-name:var(--font-display)] text-3xl font-black leading-none text-white shadow-xl ring-4 ring-[#0b0b0a]">
            −{maxPercent}%<small className="mt-1 text-[10px] font-bold uppercase tracking-wider">hasta</small>
          </span>
        </div>
      </div>

      {showDeals && deals.length > 0 && (
        <div className="relative border-t border-white/10 p-5 pt-5 sm:p-8 sm:pt-6 lg:px-10">
          <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-5">
            {deals.slice(0, 5).map((p, i) => (
              <div key={p.id} className={`w-[62%] shrink-0 snap-start sm:w-auto ${i >= 3 ? "sm:hidden lg:block" : ""}`}>
                <BlackFridayDeal product={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
