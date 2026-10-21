import Link from "next/link";
import { StoreIcon, type IconName } from "@/components/icons";
import { Mark } from "@/components/Mark";
import { PriceTag } from "@/components/PriceTag";
import { ProductCard } from "@/components/ProductCard";
import { PromoCarousel } from "@/components/PromoCarousel";
import { GRADE_LABELS, offer, savings } from "@/lib/format";
import { listProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

export const revalidate = 60;

type Props = {
  searchParams: Promise<{ q?: string; categoria?: string; orden?: string; ofertas?: string }>;
};

const SORTS = {
  recientes: "Más nuevos",
  "menor-precio": "Menor precio",
  "mayor-precio": "Mayor precio",
  descuento: "Mayor descuento",
} as const;
type Sort = keyof typeof SORTS;

const BENEFITS: { icon: IconName; title: string; text: string }[] = [
  { icon: "shield", title: "Garantía en todo", text: "Cada equipo con su garantía TERC" },
  { icon: "truck", title: "Envíos a todo Chile", text: "Despacho seguro a tu casa" },
  { icon: "card", title: "Paga en cuotas", text: "Tarjeta o débito con Mercado Pago" },
  { icon: "checklist", title: "Revisado uno a uno", text: "Batería, pantalla y funciones" },
];

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// Mayor descuento del equipo: la oferta de TERC o, si no hay, el ahorro frente a uno nuevo.
function bestDiscount(p: Product) {
  return offer(p)?.percent ?? savings(p)?.percent ?? 0;
}

function sortProducts(products: Product[], sort: Sort) {
  const list = [...products];
  if (sort === "menor-precio") list.sort((a, b) => a.price - b.price);
  if (sort === "mayor-precio") list.sort((a, b) => b.price - a.price);
  if (sort === "descuento") list.sort((a, b) => bestDiscount(b) - bestDiscount(a));
  return list;
}

function ProductSlide({ product }: { product: Product }) {
  const sale = offer(product);
  const deal = sale ?? savings(product);
  return (
    <div className="relative grid h-full items-center gap-6 bg-pine px-7 pb-12 pt-8 text-white sm:grid-cols-[1.3fr_1fr] sm:px-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_50%,rgba(127,196,168,0.22),transparent_60%)]" />
      <div className="relative space-y-3.5">
        <span
          className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${sale ? "bg-sale text-white" : "bg-gold text-pine"}`}
        >
          {sale ? "Oferta" : "Precio TERC"}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{product.brand}</p>
          <h2 className="mt-1 line-clamp-2 text-2xl sm:text-[1.75rem] font-semibold leading-tight tracking-tight">
            {product.name}
          </h2>
          <p className="mt-2 text-sm text-white/70">
            {GRADE_LABELS[product.grade]}
            {product.battery_health !== null && ` · Batería ${product.battery_health}%`}
            {` · ${product.warranty_months} meses de garantía`}
          </p>
        </div>
        <PriceTag
          price={product.price}
          before={deal?.before}
          percent={deal?.percent}
          beforeLabel={sale ? "Antes" : "Nuevo"}
        />
        <div>
          <Link
            href={`/producto/${product.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-pine transition hover:bg-[#d8ca9f]"
          >
            Comprar ahora <StoreIcon name="arrow" className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <div className="relative hidden sm:block">
        <div className="mx-auto aspect-square max-w-[260px] overflow-hidden rounded-3xl bg-white/95 shadow-2xl shadow-black/30">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.name} className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#f1efe8] to-[#e6ebe7]">
              <Mark className="w-2/5" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-pine/60">
                {product.brand}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BrandSlide({
  eyebrow,
  title,
  text,
  icon,
  href,
  cta,
}: {
  eyebrow: string;
  title: string;
  text: string;
  icon: IconName;
  href: string;
  cta: string;
}) {
  return (
    <div className="relative flex h-full items-center overflow-hidden bg-pine px-7 pb-12 pt-8 text-white sm:px-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_40%,rgba(201,185,140,0.2),transparent_60%)]" />
      <StoreIcon
        name={icon}
        className="absolute -right-6 top-1/2 hidden h-72 w-72 -translate-y-1/2 text-white/[0.07] sm:block"
      />
      <div className="relative max-w-md space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">{eyebrow}</p>
        <h2 className="text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight">{title}</h2>
        <p className="text-white/75">{text}</p>
        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-pine transition hover:bg-[#d8ca9f]"
        >
          {cta} <StoreIcon name="arrow" className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q ?? "";
  const categoria = params.categoria ?? "";
  const onlyOffers = params.ofertas === "1";
  const sort: Sort = params.orden && params.orden in SORTS ? (params.orden as Sort) : "recientes";

  const all = await listProducts();
  const query = normalize(q.trim());
  const filtered = sortProducts(
    all.filter(
      (p) =>
        (!categoria || p.category === categoria) &&
        (!onlyOffers || offer(p)) &&
        (!query || normalize(`${p.name} ${p.brand} ${p.category}`).includes(query)),
    ),
    sort,
  );
  const filtering = Boolean(query || categoria || onlyOffers);
  const categories = [...new Set(all.map((p) => p.category))].sort();

  const offers = all.filter((p) => offer(p)).sort((a, b) => bestDiscount(b) - bestDiscount(a));
  const maxOffer = offers.length ? bestDiscount(offers[0]) : 0;
  // El banner muestra primero los equipos con más descuento.
  const featured = [...all].sort((a, b) => bestDiscount(b) - bestDiscount(a)).slice(0, 3);

  // Arma el enlace manteniendo los filtros actuales.
  const link = (changes: Record<string, string | null>) => {
    const current = {
      q,
      categoria,
      orden: sort === "recientes" ? "" : sort,
      ofertas: onlyOffers ? "1" : "",
    };
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...current, ...changes })) if (v) next.set(k, v);
    const qs = next.toString();
    return `/${qs ? `?${qs}` : ""}#equipos`;
  };

  return (
    <div className="pb-16">
      {!filtering && (
        <section className="max-w-6xl mx-auto px-4 pt-5 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="h-[400px] min-w-0">
            <PromoCarousel>
              {featured.map((p) => (
                <ProductSlide key={p.id} product={p} />
              ))}
              <BrandSlide
                eyebrow="Envíos a todo Chile"
                title="Tu equipo, directo a tu puerta."
                text="Despachamos a todo el país, bien embalado y con garantía."
                icon="truck"
                href="#equipos"
                cta="Ver equipos"
              />
              <BrandSlide
                eyebrow="Garantía TERC"
                title="Compra tranquilo: todo tiene garantía."
                text="Cada equipo se revisa uno por uno antes de salir. Si algo falla, te respondemos nosotros."
                icon="shield"
                href="/por-que-terc"
                cta="Cómo revisamos"
              />
            </PromoCarousel>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-1">
            <Link
              href={offers.length ? "/?ofertas=1#equipos" : "#equipos"}
              className="group relative flex min-h-36 flex-col justify-between overflow-hidden rounded-3xl bg-sale p-5 sm:p-7 text-white transition hover:brightness-105"
            >
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] sm:tracking-[0.22em] text-white/80">
                {offers.length ? "Ofertas de la semana" : "Precios TERC"}
              </span>
              <div>
                <p className="text-xl sm:text-4xl font-bold tracking-tight">
                  {maxOffer ? `Hasta −${maxOffer}%` : "Ahorra más"}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-white/90">
                  {offers.length ? "Ver ofertas" : "Ver equipos"}
                  <StoreIcon name="arrow" className="w-4 h-4 transition group-hover:translate-x-1" />
                </p>
              </div>
            </Link>
            <div className="relative flex min-h-36 flex-col justify-between overflow-hidden rounded-3xl bg-gold p-5 sm:p-7 text-pine">
              <StoreIcon name="truck" className="w-8 h-8 sm:w-9 sm:h-9" />
              <div>
                <p className="text-xl sm:text-3xl font-bold leading-tight tracking-tight">Envíos a todo Chile</p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-pine/75">Y todos los equipos con garantía.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 pt-4">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {BENEFITS.map((b) => (
            <li
              key={b.title}
              className="flex items-center gap-3 rounded-2xl bg-white border border-black/[0.06] px-3 py-3 sm:px-4 sm:py-3.5"
            >
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-mint-50 text-pine-700">
                <StoreIcon name={b.icon} className="w-5 h-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">{b.title}</span>
                <span className="hidden sm:block text-xs text-muted">{b.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {!filtering && offers.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="flex items-center gap-2.5 sm:gap-3 text-xl sm:text-3xl font-semibold tracking-tight text-ink">
              <span className="rounded-md bg-sale px-2 sm:px-2.5 py-1 text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                Ofertas
              </span>
              Precios rebajados
            </h2>
            <Link href="/?ofertas=1#equipos" className="shrink-0 text-sm font-semibold text-sale hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {offers.slice(0, 4).map((p) => (
              <div key={p.id} className="w-[70%] shrink-0 snap-start sm:w-auto">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="equipos" className="max-w-6xl mx-auto px-4 pt-12 scroll-mt-40">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
              {onlyOffers ? "Ofertas" : categoria || (q ? `Resultados para “${q}”` : "Todos los equipos")}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {filtered.length} {filtered.length === 1 ? "equipo disponible" : "equipos disponibles"}
            </p>
          </div>
          {filtering && (
            <Link href="/#equipos" className="text-sm font-medium text-pine-700 hover:underline">
              Quitar filtros
            </Link>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Link
              href={link({ categoria: null, ofertas: null })}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm ${!categoria && !onlyOffers ? "border-pine bg-pine text-white" : "border-black/10 bg-white text-ink hover:border-pine-700/40"}`}
            >
              Todos
            </Link>
            {offers.length > 0 && (
              <Link
                href={link({ ofertas: onlyOffers ? null : "1" })}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold ${onlyOffers ? "border-sale bg-sale text-white" : "border-sale/30 bg-sale-50 text-sale hover:border-sale"}`}
              >
                Ofertas
              </Link>
            )}
            {categories.map((c) => (
              <Link
                key={c}
                href={link({ categoria: c === categoria ? null : c })}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm ${c === categoria ? "border-pine bg-pine text-white" : "border-black/10 bg-white text-ink hover:border-pine-700/40"}`}
              >
                {c}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-1 overflow-x-auto text-sm">
            <span className="shrink-0 text-muted">Ordenar:</span>
            {Object.entries(SORTS).map(([key, label]) => (
              <Link
                key={key}
                href={link({ orden: key === "recientes" ? null : key })}
                className={`shrink-0 rounded-full px-3 py-1.5 ${sort === key ? "bg-white font-semibold text-ink ring-1 ring-black/10" : "text-muted hover:text-ink"}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-black/15 bg-white p-10 text-center">
            <p className="font-medium text-ink">
              {filtering ? "No encontramos equipos con esa búsqueda." : "Pronto tendremos equipos disponibles."}
            </p>
            <Link href="/#equipos" className="mt-2 inline-block text-sm font-medium text-pine-700 hover:underline">
              Ver todos los equipos
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {!filtering && (
        <section className="max-w-6xl mx-auto px-4 pt-14">
          <Link
            href="/por-que-terc"
            className="group flex flex-col items-start justify-between gap-4 rounded-3xl bg-white border border-black/[0.06] px-8 py-8 transition hover:shadow-lg sm:flex-row sm:items-center sm:px-12"
          >
            <div className="flex items-center gap-5">
              <Mark className="hidden w-20 sm:block" />
              <div>
                <p className="text-xl font-semibold text-ink">¿Por qué comprar reacondicionado en TERC?</p>
                <p className="mt-1 text-sm text-muted">
                  Cómo revisamos cada equipo, qué significa cada grado y cómo funciona la garantía.
                </p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-white">
              Conocer más
              <StoreIcon name="arrow" className="w-4 h-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        </section>
      )}
    </div>
  );
}
