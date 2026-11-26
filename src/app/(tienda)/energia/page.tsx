import type { Metadata } from "next";
import Link from "next/link";
import { BlackFridayBand } from "@/components/black-friday/BlackFridayBand";
import { blackFriday } from "@/lib/black-friday";
import { BrandPicker, BrandSection } from "@/components/energy/BrandParts";
import { BlackoutBand } from "@/components/energy/BlackoutBand";
import { EnergyFacts, EnergySteps, InstallerCard, WireSunCard } from "@/components/energy/EnergyParts";
import { StoreIcon, WhatsAppIcon } from "@/components/icons";
import { Mark } from "@/components/Mark";
import { ProductCard } from "@/components/ProductCard";
import { Terqui } from "@/components/Terqui";
import { ENERGY_CATEGORIES, ENERGY_INFO, ENERGY_PRICE_CLAIM, energyCategory, energyHref, showcaseOrder, splitWorlds, UPS_CATEGORY, upsProducts } from "@/lib/energy";
import { brandFromParam, energyBrand, type EnergyBrand, groupByBrand } from "@/lib/energy-brands";
import { formatCLP } from "@/lib/format";
import { photoProps } from "@/lib/photo";
import { listProducts } from "@/lib/products";
import { breadcrumbJsonLd, itemListJsonLd, jsonLdScript } from "@/lib/seo";
import { whatsappLink } from "@/lib/site";
import type { Product } from "@/lib/types";

export const revalidate = 60;

type Props = { searchParams: Promise<{ categoria?: string; marca?: string; orden?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const cat = energyCategory(params.categoria);
  const brand = brandFromParam(params.marca);
  const query = new URLSearchParams();
  if (cat) query.set("categoria", cat.name);
  if (brand) query.set("marca", brand.key);
  const qs = query.toString();
  // Títulos y textos con las palabras que la gente busca en Google (ver seo en src/lib/energy.ts).
  const title = brand
    ? `${cat ? `${cat.seo.heading} ` : ""}${brand.name}: precios en Chile | TERC Energía`
    : cat
      ? `${cat.seo.title} | TERC`
      : "Baterías de litio, UPS, inversores y paneles solares en Chile | TERC Energía";
  return {
    title,
    description: cat
      ? cat.seo.description
      : "Baterías de litio, UPS, inversores, paneles solares y cables nuevos, con garantía de fábrica y factura. Pagas por transferencia y, si no hay stock, te devolvemos el 100%. Entrega en la Región Metropolitana.",
    alternates: { canonical: `/energia${qs ? `?${qs}` : ""}` },
  };
}

// Raúl (24-11): por defecto, ordenado por marca y modelo, cada marca en su apartado.
const SORTS = {
  marca: "Por marca y modelo",
  "menor-precio": "Menor precio",
  "mayor-precio": "Mayor precio",
} as const;
type Sort = keyof typeof SORTS;

// Cuántos productos se ven por marca antes del botón "Ver los N" (cuando no hay una marca elegida).
const PER_BRAND = 10;

export default async function EnergyPage({ searchParams }: Props) {
  const params = await searchParams;
  const cat = energyCategory(params.categoria);
  const brand = brandFromParam(params.marca);
  const sort: Sort = params.orden && params.orden in SORTS ? (params.orden as Sort) : "marca";
  const { energy } = splitWorlds(await listProducts());
  const ups = upsProducts(energy);
  // Black Friday: solo las ofertas de Energía, arriba de todo (sin filtros de categoría o marca).
  const bf = blackFriday(energy);
  const inCategory = cat ? energy.filter((p) => energyCategory(p.category)?.name === cat.name) : energy;
  // Las marcas de lo que se está mirando (para la fila de logos) y los productos de la marca elegida.
  const brands = groupByBrand(inCategory).map((g) => ({ brand: g.brand, count: g.products.length }));
  const inBrand = brand ? inCategory.filter((p) => energyBrand(p.brand).key === brand.key) : inCategory;
  // Por marca: un bloque por categoría (o solo la elegida) y, dentro, un apartado por marca.
  const sections =
    sort === "marca"
      ? ENERGY_CATEGORIES.map((c) => ({
          cat: c,
          groups: groupByBrand(inBrand.filter((p) => energyCategory(p.category)?.name === c.name)),
        })).filter((x) => x.groups.length > 0)
      : [];
  const list =
    sort === "marca"
      ? sections.flatMap((x) => x.groups.flatMap((g) => g.products))
      : [...inBrand].sort((a, b) => (sort === "menor-precio" ? a.price - b.price : b.price - a.price));

  // Tarjetas de categoría: las que tienen productos, con foto y precio "desde". Mientras no haya
  // ningún producto de Energía se muestran todas como "Muy pronto" (decisión de Raúl, 23-11).
  const soon = energy.length === 0;
  const tiles = ENERGY_CATEGORIES.map((c) => {
    const items = energy.filter((p) => energyCategory(p.category)?.name === c.name);
    return { c, count: items.length, from: items.length ? Math.min(...items.map((p) => p.price)) : 0, photo: showcaseOrder(items)[0]?.image_url ?? null };
  }).filter((t) => soon || t.count > 0);
  // Tres fotos para el banner de arriba: de categorías distintas si se puede, y si no, las más lindas.
  const collage = [
    ...new Set([...tiles.map((t) => t.photo), ...showcaseOrder(energy).map((p) => p.image_url)].filter((x): x is string => Boolean(x))),
  ].slice(0, 3);
  const bubbles = ["left-0 top-4 h-48 w-48", "right-2 top-0 h-36 w-36", "bottom-0 right-16 h-32 w-32"];
  const wa = whatsappLink("Hola, quiero ayuda para elegir un producto de Energía en TERC");

  const link = (changes: { categoria?: string | null; marca?: string | null; orden?: string | null }) => {
    const next = new URLSearchParams();
    const categoria = changes.categoria === undefined ? (cat?.name ?? null) : changes.categoria;
    // Al cambiar de categoría se suelta la marca (puede no tener productos en la otra).
    const marca = changes.marca === undefined ? (changes.categoria === undefined ? (brand?.key ?? null) : null) : changes.marca;
    const orden = changes.orden === undefined ? (sort === "marca" ? null : sort) : changes.orden;
    if (categoria) next.set("categoria", categoria);
    if (marca) next.set("marca", marca);
    if (orden) next.set("orden", orden);
    const qs = next.toString();
    return `/energia${qs ? `?${qs}` : ""}#productos`;
  };

  // Para Google: la ruta (Inicio > Energía > categoría) y la lista de productos de esta página.
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Inicio", path: "/" },
      { name: "Energía", path: "/energia" },
      ...(cat ? [{ name: cat.name, path: `/energia?categoria=${encodeURIComponent(cat.name)}` }] : []),
      ...(brand ? [{ name: brand.name, path: link({ marca: brand.key, orden: null }).replace("#productos", "") }] : []),
    ]),
    ...(list.length ? [itemListJsonLd(list)] : []),
  ];

  return (
    <div className="pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
      {bf.active && !cat && !brand && (
        <div className="shell pt-5">
          <div className="rise">
            <BlackFridayBand deals={bf.deals} ends={bf.ends} maxPercent={bf.maxPercent} />
          </div>
        </div>
      )}
      <div className="shell pt-5">
        <section className="rise relative grid items-center gap-8 overflow-hidden rounded-3xl bg-pine p-6 text-white sm:p-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <Mark className="absolute -right-10 -top-10 w-56 opacity-[0.06]" ink="#ffffff" />
          <div className="relative">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
              <StoreIcon name="bolt" className="h-4 w-4" /> {soon ? "Energía TERC · Muy pronto" : "Energía TERC"}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl">
              {cat ? cat.seo.heading : "Energía para tu casa y tu oficina"}
            </h1>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/80 sm:text-base">
              Respaldo, baterías de litio, inversores y energía solar{" "}
              <strong className="font-bold text-gold">{ENERGY_PRICE_CLAIM}</strong>. Te ayudamos a elegir por WhatsApp.
            </p>
            <EnergyFacts dark className="mt-5" />
          </div>
          {collage.length > 0 ? (
            <div className="relative mx-auto hidden h-64 w-full max-w-sm sm:block" aria-hidden>
              {collage.map((src, i) => (
                <div key={src} className={`photo-stage absolute overflow-hidden rounded-full ring-4 ring-white/10 ${bubbles[i]}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img {...photoProps(src, "200px", 384)} alt="" className="absolute inset-0 h-full w-full object-contain p-[16%] mix-blend-multiply" />
                </div>
              ))}
            </div>
          ) : (
            // Sin fotos todavía: los íconos de batería, inversor y panel en las mismas burbujas.
            <div className="relative mx-auto hidden h-64 w-full max-w-sm sm:block" aria-hidden>
              {(["battery", "bolt", "sun"] as const).map((icon, i) => (
                <div key={icon} className={`absolute flex items-center justify-center rounded-full bg-white/[0.07] ring-4 ring-white/10 ${bubbles[i]}`}>
                  <StoreIcon name={icon} className={`text-gold ${["h-20 w-20", "h-14 w-14", "h-12 w-12"][i]}`} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {tiles.length > 0 && (
        <section className="shell pt-8">
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Categorías</h2>
          <p className="mt-1 text-sm text-muted">
            {soon ? "Esto es lo que viene. Si buscas algo ya, pregúntanos por WhatsApp." : "Elige una para ver sus productos."}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {tiles.map(({ c, count, from, photo }) => (
              <Link
                key={c.name}
                href={energyHref(c)}
                aria-current={cat?.name === c.name ? "page" : undefined}
                className={`group flex flex-col overflow-hidden rounded-3xl bg-surface p-3 ring-1 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pine/10 ${
                  cat?.name === c.name ? "ring-2 ring-pine-700" : "ring-line/[0.06]"
                }`}
              >
                <div className={`relative aspect-[4/3] overflow-hidden rounded-2xl ${soon ? "flex items-center justify-center bg-mint-50" : "photo-stage"}`}>
                  {soon ? (
                    <StoreIcon name={c.icon} className="h-12 w-12 text-pine-700 transition duration-500 group-hover:scale-110" />
                  ) : photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      {...photoProps(photo, "(min-width: 1024px) 180px, 45vw", 384)}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-contain p-[10%] mix-blend-multiply transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <Mark className="absolute inset-[30%] opacity-30" />
                  )}
                </div>
                <b className="mt-3 text-[15px] leading-tight text-ink">{c.name}</b>
                <span className="mt-0.5 text-xs leading-snug text-muted">{c.blurb}</span>
                {soon ? (
                  <span className="mt-2 inline-flex w-fit rounded-full bg-gold px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-pine">
                    Muy pronto
                  </span>
                ) : (
                  <span className="mt-2 text-xs text-muted">
                    {count} {count === 1 ? "producto" : "productos"} · desde <b className="text-pine-700">{formatCLP(from)}</b>
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Las UPS tienen su apartado (también va en la portada de los equipos). */}
      {ups.length > 0 && !brand && (!cat || cat.name === UPS_CATEGORY) && (
        <div className="shell pt-10">
          <BlackoutBand products={ups} moreHref={energyHref(ENERGY_CATEGORIES.find((c) => c.name === "Inversores y reguladores"))} />
        </div>
      )}

      <section id="productos" className="shell scroll-mt-40 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {cat ? cat.name : "Todo Energía"}
              {brand && <span className="text-pine-700"> · {brand.name}</span>}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {soon
                ? "Muy pronto · se comprarán con solicitud y se pagarán por transferencia"
                : `${list.length} ${list.length === 1 ? "producto" : "productos"}${
                    brand ? "" : ` de ${brands.length} ${brands.length === 1 ? "marca" : "marcas"}`
                  } · se compran con solicitud y se pagan por transferencia`}
            </p>
          </div>
          {(cat || brand) && (
            <Link href={brand && cat ? link({ marca: null }) : "/energia#productos"} className="text-sm font-medium text-pine-700 hover:underline">
              {brand && cat ? `Ver todo ${cat.short}` : "Ver todo Energía"}
            </Link>
          )}
        </div>
        {energy.length > 0 && (
          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="scroll-fade flex gap-2 overflow-x-auto pb-1">
              <Link
                href={link({ categoria: null })}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm ${!cat ? "border-pine bg-pine text-white" : "border-line/10 bg-surface text-ink hover:border-pine-700/40"}`}
              >
                Todo
              </Link>
              {tiles.map(({ c }) => (
                <Link
                  key={c.name}
                  href={link({ categoria: cat?.name === c.name ? null : c.name })}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-sm ${cat?.name === c.name ? "border-pine bg-pine text-white" : "border-line/10 bg-surface text-ink hover:border-pine-700/40"}`}
                >
                  {c.short}
                </Link>
              ))}
            </div>
            <div className="scroll-fade flex items-center gap-1 overflow-x-auto text-sm">
              <span className="shrink-0 text-muted">Ordenar:</span>
              {Object.entries(SORTS).map(([key, label]) => (
                <Link
                  key={key}
                  href={link({ orden: key === "marca" ? null : key })}
                  className={`shrink-0 rounded-full px-3 py-1.5 ${sort === key ? "bg-surface font-semibold text-ink ring-1 ring-line/10" : "text-muted hover:text-ink"}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {energy.length > 0 && (
          <BrandPicker
            brands={brands}
            active={brand}
            href={(b: EnergyBrand | null) => link({ marca: b?.key ?? null })}
          />
        )}

        {list.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-line/15 bg-surface p-10 text-center">
            <Terqui pose="cargando" className="mb-2 h-32 w-32" />
            <p className="font-medium text-ink">
              {soon ? "Muy pronto: estamos cargando los productos de Energía." : "Todavía no hay productos en esta categoría."}
            </p>
            <p className="mt-1 max-w-md text-sm text-muted">¿Buscas algo en particular? Escríbenos y te decimos si lo conseguimos y a qué precio.</p>
            {wa && (
              <a href={wa} target="_blank" rel="noopener" className="mt-4 inline-flex items-center gap-2 rounded-full bg-cta px-5 py-2.5 text-sm font-semibold text-white hover:bg-cta-hover">
                <WhatsAppIcon className="h-4 w-4" /> Preguntar por WhatsApp
              </a>
            )}
          </div>
        ) : sort === "marca" ? (
          // Por marca y modelo: sin categoría elegida, un bloque por categoría; dentro, un apartado por marca.
          <div className="mt-6 space-y-10">
            {sections.map(({ cat: c, groups }) => (
              <div key={c.name} className="space-y-4">
                {!cat && (
                  <div className="flex flex-wrap items-end justify-between gap-2 border-b border-line/10 pb-2">
                    <h3 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{c.name}</h3>
                    <Link href={link({ categoria: c.name })} className="text-sm font-medium text-pine-700 hover:underline">
                      Ver solo {c.short.toLowerCase()}
                    </Link>
                  </div>
                )}
                {groups.map((g) => (
                  <BrandSection
                    key={g.brand.key}
                    group={g}
                    limit={brand ? undefined : PER_BRAND}
                    moreHref={link({ categoria: c.name, marca: g.brand.key })}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="shell pt-12">
        <WireSunCard />
      </section>

      <section id="como-comprar" className="shell scroll-mt-40 pt-12">
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">¿Cómo se compra Energía?</h2>
        <p className="mt-1 text-sm text-muted">Por transferencia y sin sorpresas: si no tenemos stock, te devolvemos el 100%.</p>
        <EnergySteps className="mt-5" />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-surface p-4 ring-1 ring-line/[0.06]">
            <b className="text-ink">¿Cuál necesito?</b>
            <p className="mt-1 text-[13px] text-muted">
              Escríbenos por WhatsApp y te recomendamos según lo que quieres respaldar.{" "}
              {wa && (
                <a href={wa} target="_blank" rel="noopener" className="font-semibold text-pine-700 hover:underline">
                  Preguntar
                </a>
              )}
            </p>
          </div>
          <div className="rounded-2xl bg-surface p-4 ring-1 ring-line/[0.06]">
            <b className="text-ink">Entrega</b>
            <p className="mt-1 text-[13px] text-muted">{ENERGY_INFO.delivery}</p>
          </div>
          <div className="rounded-2xl bg-surface p-4 ring-1 ring-line/[0.06]">
            <b className="text-ink">Garantía</b>
            <p className="mt-1 text-[13px] text-muted">
              Garantía de fábrica, y nosotros te acompañamos para hacerla válida. Vendemos el producto; no hacemos instalación.
            </p>
          </div>
        </div>
      </section>

      <section className="shell pt-8">
        <InstallerCard />
      </section>
    </div>
  );
}
