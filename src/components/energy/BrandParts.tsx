import Link from "next/link";
import { StoreIcon } from "@/components/icons";
import { ProductCard } from "@/components/ProductCard";
import type { BrandGroup, EnergyBrand } from "@/lib/energy-brands";
import { formatCLP } from "@/lib/format";
import type { Product } from "@/lib/types";

// Apartados por marca de la página de Energía (pedido de Raúl, 24-11): logo, nombre y productos.

// Logo oficial de la marca, siempre sobre fondo blanco (o oscuro si el logo oficial es blanco).
// Sin logo, el nombre escrito.
export function BrandLogo({ brand, className = "" }: { brand: EnergyBrand; className?: string }) {
  return (
    <span
      className={`flex items-center justify-center overflow-hidden rounded-xl ring-1 ${
        brand.dark ? "bg-pine ring-pine" : "bg-white ring-line/10"
      } ${className}`}
    >
      {brand.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={brand.logo} alt={brand.name} loading="lazy" className="max-h-full max-w-full object-contain" />
      ) : (
        <span className="truncate font-[family-name:var(--font-display)] text-[15px] font-extrabold tracking-tight text-pine">
          {brand.name}
        </span>
      )}
    </span>
  );
}

// Fila de marcas para filtrar: "Todas" y un logo por marca, con cuántos productos tiene.
export function BrandPicker({
  brands,
  active,
  href,
}: {
  brands: { brand: EnergyBrand; count: number }[];
  active: EnergyBrand | null;
  href: (brand: EnergyBrand | null) => string;
}) {
  if (brands.length < 2 && !active) return null;
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Marcas</p>
      <div className="scroll-fade mt-2 flex gap-2 overflow-x-auto pb-2">
        <Link
          href={href(null)}
          aria-current={!active ? "page" : undefined}
          className={`flex h-[68px] w-24 shrink-0 flex-col items-center justify-center rounded-2xl text-sm font-semibold ring-1 transition ${
            !active ? "bg-pine text-white ring-pine" : "bg-surface text-ink ring-line/10 hover:ring-pine-700/40"
          }`}
        >
          Todas
          <span className={`text-[11px] font-normal ${!active ? "text-white/75" : "text-muted"}`}>
            {brands.reduce((n, b) => n + b.count, 0)} productos
          </span>
        </Link>
        {brands.map(({ brand, count }) => {
          const on = active?.key === brand.key;
          return (
            <Link
              key={brand.key}
              href={href(on ? null : brand)}
              aria-current={on ? "page" : undefined}
              title={brand.name}
              className={`flex w-32 shrink-0 flex-col gap-1 rounded-2xl p-1.5 ring-1 transition ${
                on ? "bg-mint-50 ring-2 ring-pine-700" : "bg-surface ring-line/10 hover:ring-pine-700/40"
              }`}
            >
              <BrandLogo brand={brand} className="h-10 px-2.5 py-1.5" />
              <span className={`text-center text-[11px] ${on ? "font-semibold text-pine-700" : "text-muted"}`}>
                {count} {count === 1 ? "producto" : "productos"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Un apartado: la marca (logo, nombre, cuántos y desde cuánto) y sus productos ordenados por modelo.
// Con `limit`, muestra los primeros y un enlace para ver todos los de esa marca.
export function BrandSection({
  group,
  limit,
  moreHref,
}: {
  group: BrandGroup<Product>;
  limit?: number;
  moreHref: string;
}) {
  const { brand, products, from } = group;
  const shown = limit ? products.slice(0, limit) : products;
  const hidden = products.length - shown.length;
  return (
    <section aria-label={brand.name} className="rounded-3xl bg-surface/60 p-3 ring-1 ring-line/[0.06] sm:p-5">
      <header className="flex flex-wrap items-center gap-3 sm:gap-4">
        <BrandLogo brand={brand} className="h-14 w-32 shrink-0 px-3 py-2 sm:w-40" />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold leading-tight tracking-tight text-ink sm:text-xl">{brand.name}</h3>
          <p className="text-[13px] text-muted">
            {products.length} {products.length === 1 ? "producto" : "productos"} · desde{" "}
            <b className="text-pine-700">{formatCLP(from)}</b>
          </p>
        </div>
        {hidden > 0 && (
          <Link href={moreHref} className="hidden items-center gap-1 text-sm font-semibold text-pine-700 hover:underline sm:inline-flex">
            Ver los {products.length} <StoreIcon name="arrow" className="h-4 w-4" />
          </Link>
        )}
      </header>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {shown.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {hidden > 0 && (
        <Link
          href={moreHref}
          className="mt-4 flex items-center justify-center gap-2 rounded-full bg-pine px-5 py-3 text-sm font-bold text-white transition hover:bg-cta"
        >
          Ver los {products.length} productos de {brand.name}
          <StoreIcon name="arrow" className="h-4 w-4" />
        </Link>
      )}
    </section>
  );
}
