import Link from "next/link";
import { StoreIcon, WhatsAppIcon, type IconName } from "@/components/icons";
import { Mark } from "@/components/Mark";
import { Terqui } from "@/components/Terqui";
import { ENERGY_CATEGORIES, ENERGY_STEPS, energyCategory, energyHref, WIRESUN_URL } from "@/lib/energy";
import { formatCLP } from "@/lib/format";
import { photoProps } from "@/lib/photo";
import { whatsappLink } from "@/lib/site";
import type { Product } from "@/lib/types";

// Piezas de Energía (TERC 2.1) que se repiten en la portada, la página de Energía, la ficha y el carrito.

// Lo que distingue a Energía de los equipos: nuevo, garantía de fábrica y factura.
// Raúl (23-11): sin "Instalación no incluida"; se entiende que TERC no instala.
export const ENERGY_FACTS: { icon: IconName; text: string }[] = [
  { icon: "box", text: "Productos nuevos" },
  { icon: "shield", text: "Garantía de fábrica" },
  { icon: "receipt", text: "Factura" },
  { icon: "truck", text: "Entrega en la RM" },
];

export function EnergyFacts({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {ENERGY_FACTS.map((f) => (
        <li
          key={f.text}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium ${
            dark ? "bg-white/10 text-white/90" : "bg-mint-50 text-ink"
          }`}
        >
          <StoreIcon name={f.icon} className={`h-4 w-4 ${dark ? "text-gold" : "text-pine-700"}`} />
          {f.text}
        </li>
      ))}
    </ul>
  );
}

// Pides → Confirmamos → Transfieres → Recibes. `done` marca los pasos ya hechos (pantalla de gracias).
export function EnergySteps({ done = 0, className = "" }: { done?: number; className?: string }) {
  return (
    <ol className={`grid grid-cols-2 gap-3 sm:grid-cols-4 ${className}`}>
      {ENERGY_STEPS.map((s, i) => (
        <li
          key={s.title}
          className={`relative rounded-2xl p-4 ${i < done ? "bg-pine text-white" : "bg-surface ring-1 ring-line/[0.06]"}`}
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-extrabold ${
              i < done ? "bg-gold text-pine" : "bg-mint-50 text-pine-700"
            }`}
          >
            {i < done ? "✓" : i + 1}
          </span>
          <b className={`mt-2 block text-[15px] ${i < done ? "text-white" : "text-ink"}`}>{s.title}</b>
          <span className={`text-[13px] leading-snug ${i < done ? "text-white/80" : "text-muted"}`}>{s.text}</span>
        </li>
      ))}
    </ol>
  );
}

// Derivación a WireSun Energy (empresa de kits solares con instalación). TERC solo vende.
export function WireSunCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative grid items-center gap-5 overflow-hidden rounded-3xl bg-gradient-to-br from-mint-50 to-surface p-6 ring-1 ring-pine-700/15 sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:p-8 ${className}`}
    >
      <Terqui pose="apunta" className="mx-auto h-32 w-32 sm:h-36 sm:w-36" />
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-pine-700">¿Lo quieres instalado?</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Kits solares con instalación: <span className="text-pine-700">WireSun Energy</span>
        </h2>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted">
          En TERC vendemos los productos. Si quieres un sistema solar completo, diseñado, instalado y funcionando, WireSun
          Energy se encarga de todo. Es la empresa de energía solar del equipo Wiremax.
        </p>
      </div>
      <a
        href={WIRESUN_URL}
        target="_blank"
        rel="noopener"
        className="inline-flex items-center justify-center gap-2 self-center rounded-full bg-pine px-5 py-3 text-sm font-bold text-white transition hover:bg-cta"
      >
        Ir a WireSun Energy <StoreIcon name="arrow" className="h-4 w-4" />
      </a>
    </div>
  );
}

// Instaladores y compras por volumen: cotización por WhatsApp.
export function InstallerCard({ className = "" }: { className?: string }) {
  const wa = whatsappLink("Hola, soy instalador y quiero cotizar productos de Energía en TERC");
  return (
    <div
      className={`relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-pine p-6 text-white sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <Mark className="absolute -right-6 -top-6 w-32 opacity-[0.07]" ink="#ffffff" />
      <div className="relative">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-mint">Instaladores y compras por volumen</p>
        <p className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">¿Eres instalador o compras para varios proyectos?</p>
        <p className="mt-1 text-sm text-white/80">Precio especial por cotización y respuesta rápida por WhatsApp.</p>
      </div>
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener"
          className="relative inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-pine sm:self-auto"
        >
          <WhatsAppIcon className="h-4 w-4" /> Pedir cotización
        </a>
      )}
    </div>
  );
}

// Tarjeta chica de un producto de Energía (banner de la portada).
function MiniProduct({ product }: { product: Product }) {
  const cat = energyCategory(product.category);
  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-white/10"
    >
      <div className="photo-stage relative aspect-square overflow-hidden">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            {...photoProps(product.image_url, "(min-width: 1024px) 180px, 45vw", 384)}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain p-[12%] mix-blend-multiply transition duration-500 group-hover:scale-105"
          />
        ) : (
          <Mark className="absolute inset-[30%] opacity-40" ink="#0a2a2a" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-3">
        {cat && <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-mint">{cat.short}</span>}
        <span className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-white">{product.name}</span>
        <span className="mt-auto pt-1 font-[family-name:var(--font-display)] text-lg font-extrabold tabular-nums text-white">
          {formatCLP(product.price)}
        </span>
      </div>
    </Link>
  );
}

// Para la portada: primero un par de baterías y de inversores (lo que Raúl quiere mostrar al tiro),
// después lo que haya. Solo productos con foto.
export function bannerProducts(energy: Product[], max = 4): Product[] {
  const withPhoto = energy.filter((p) => p.image_url);
  const of = (name: string) => withPhoto.filter((p) => energyCategory(p.category)?.name === name);
  const picked = [...of("Baterías de litio").slice(0, 2), ...of("Inversores y reguladores").slice(0, 2)];
  for (const p of withPhoto) if (picked.length < max && !picked.includes(p)) picked.push(p);
  return picked.slice(0, max);
}

// Mientras no hay productos de Energía: las categorías que vienen, como "Muy pronto".
export function SoonCategories({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  return (
    <ul className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${className}`}>
      {ENERGY_CATEGORIES.map((c) => (
        <li key={c.name}>
          <Link
            href={energyHref(c)}
            className={`flex h-full flex-col gap-2 rounded-2xl p-3 transition hover:-translate-y-0.5 sm:p-4 ${
              dark ? "bg-white/[0.06] ring-1 ring-white/10 hover:bg-white/10" : "bg-surface ring-1 ring-line/[0.06] hover:shadow-lg hover:shadow-pine/10"
            }`}
          >
            <span className={`flex h-9 w-9 items-center justify-center rounded-full sm:h-10 sm:w-10 ${dark ? "bg-white/10 text-gold" : "bg-mint-50 text-pine-700"}`}>
              <StoreIcon name={c.icon} className="h-5 w-5" />
            </span>
            <b className={`text-[14px] leading-tight ${dark ? "text-white" : "text-ink"}`}>{c.name}</b>
            {/* En el celular la descripción se omite para que el banner no quede tan largo. */}
            <span className={`hidden text-[12px] leading-snug sm:block ${dark ? "text-white/70" : "text-muted"}`}>{c.blurb}</span>
            <span className="mt-auto inline-flex w-fit rounded-full bg-gold px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-pine">
              Muy pronto
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// Banner de Energía entre las filas de equipos de la portada.
export function EnergyBanner({ products, className = "", style }: { products: Product[]; className?: string; style?: React.CSSProperties }) {
  return (
    <section
      aria-labelledby="energia-banner"
      style={style}
      className={`relative grid gap-6 overflow-hidden rounded-3xl bg-pine p-6 text-white sm:p-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center ${className}`}
    >
      <StoreIcon name="bolt" className="pointer-events-none absolute -bottom-10 -left-8 h-52 w-52 text-white/[0.04]" />
      <div className="relative">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
          <StoreIcon name="bolt" className="h-4 w-4" /> {products.length ? "Nuevo en TERC · Energía" : "Muy pronto en TERC · Energía"}
        </p>
        <h2 id="energia-banner" className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl">
          Que un corte de luz no te pare la pega
        </h2>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/80">
          Baterías de litio, inversores y respaldo para tu casa y tu oficina, a buen precio y con la misma atención por
          WhatsApp de siempre.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2 text-[13px]">
          {["Productos nuevos", "Factura", "Garantía de fábrica"].map((t) => (
            <li key={t} className="rounded-full bg-white/10 px-3 py-1 text-white/90">
              {t}
            </li>
          ))}
        </ul>
        <Link
          href="/energia"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-pine transition hover:brightness-105"
        >
          Ver Energía <StoreIcon name="arrow" className="h-4 w-4" />
        </Link>
        <p className="mt-4 text-sm text-white/75">
          ¿Kit solar con instalación?{" "}
          <a href={WIRESUN_URL} target="_blank" rel="noopener" className="font-semibold text-gold underline underline-offset-2">
            Te lo hace WireSun Energy
          </a>
        </p>
      </div>
      {products.length > 0 ? (
        <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {products.map((p) => (
            <MiniProduct key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <SoonCategories dark className="relative" />
      )}
    </section>
  );
}
