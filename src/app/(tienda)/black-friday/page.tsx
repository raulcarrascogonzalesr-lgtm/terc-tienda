import type { Metadata } from "next";
import Link from "next/link";
import { BlackFridayBand } from "@/components/black-friday/BlackFridayBand";
import { StoreIcon, type IconName } from "@/components/icons";
import { ProductCard } from "@/components/ProductCard";
import { Terqui } from "@/components/Terqui";
import { blackFriday } from "@/lib/black-friday";
import { splitWorlds } from "@/lib/energy";
import { todayInChile } from "@/lib/format";
import { listProducts } from "@/lib/products";
import { whatsappLink } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Black Friday TERC: computadores reacondicionados, baterías e inversores en oferta",
  description:
    "Ofertas reales de Black Friday del 27 al 30 de noviembre: computadores reacondicionados con garantía y baterías de litio e inversores nuevos. Precio de antes real y misma garantía.",
  alternates: { canonical: "/black-friday" },
};

// Por qué confiar en estas ofertas (la estrategia de TERC es la confianza, no el precio más bajo).
const PROMISES: { icon: IconName; title: string; text: string }[] = [
  { icon: "tag", title: "Precio de antes real", text: "Es el que tenía la tienda antes del Black Friday. No lo subimos para inflar el descuento." },
  { icon: "shield", title: "Misma garantía", text: "La oferta no recorta la garantía: es la misma de siempre." },
  { icon: "chat", title: "Te confirmamos stock", text: "Son pocas unidades. Te confirmamos por WhatsApp antes de despachar." },
];

export default async function BlackFridayPage() {
  const bf = blackFriday(await listProducts());
  const { pcs, energy } = splitWorlds(bf.deals);

  // Llegan desde anuncios: sin ofertas, explicarlo en vez de mostrar una página vacía.
  // Antes del 1 de diciembre dice que parte pronto; después, que ya terminó.
  const soon = todayInChile() < "2026-12-01";
  if (!bf.active)
    return (
      <div className="shell flex flex-col items-center py-20 text-center">
        <Terqui pose={soon ? "guino" : "duda"} className="h-40 w-40" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink">
          {soon ? "El Black Friday de TERC parte muy pronto" : "El Black Friday de TERC ya terminó"}
        </h1>
        <p className="mt-2 max-w-md text-muted">
          {soon
            ? "Del 27 al 30 de noviembre. Mientras tanto, mira nuestros equipos con garantía y la energía para tu casa u oficina."
            : "Gracias por pasar. Igual tenemos equipos con garantía y energía para tu casa u oficina."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/#equipos" className="rounded-full bg-pine px-5 py-2.5 text-sm font-bold text-white">Ver equipos</Link>
          <Link href="/energia" className="rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-pine">Ver energía</Link>
        </div>
      </div>
    );

  const groups = [
    { id: "energia", title: "Energía", subtitle: "Baterías de litio e inversores nuevos, con garantía de fábrica y factura.", icon: "bolt" as IconName, items: energy },
    { id: "equipos", title: "Computadores", subtitle: "Reacondicionados, revisados uno por uno, con garantía TERC.", icon: "shield" as IconName, items: pcs },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="pb-16">
      <div className="shell pt-5">
        <div className="rise">
          <BlackFridayBand deals={bf.deals} ends={bf.ends} maxPercent={bf.maxPercent} showDeals={false} heading="h1" />
        </div>
      </div>

      {groups.length > 1 && (
        <nav className="shell pt-5" aria-label="Secciones">
          <div className="flex gap-2">
            {groups.map((g) => (
              <a key={g.id} href={`#${g.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#0b0b0a] px-4 py-2 text-sm font-bold text-gold">
                <StoreIcon name={g.icon} className="h-4 w-4" /> {g.title} ({g.items.length})
              </a>
            ))}
          </div>
        </nav>
      )}

      {groups.map((g) => (
        <section key={g.id} id={g.id} className="shell scroll-mt-40 pt-10">
          <div data-reveal>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#0b0b0a] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-gold">
              <StoreIcon name="tag" className="h-4 w-4" /> Black Friday
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-4xl">{g.title}</h2>
            <p className="mt-1 text-sm text-muted">{g.subtitle}</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {g.items.map((p) => (
              <div key={p.id} data-reveal>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="shell pt-12">
        <ul className="grid gap-3 sm:grid-cols-3">
          {PROMISES.map((p) => (
            <li key={p.title} data-reveal className="flex gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line/[0.06]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0b0b0a] text-gold">
                <StoreIcon name={p.icon} className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-ink">{p.title}</span>
                <span className="block text-sm text-muted">{p.text}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-sm text-muted">
          ¿Dudas con una oferta?{" "}
          <a href={whatsappLink("Hola, vengo del Black Friday de TERC y tengo una consulta") ?? "/por-que-terc"} className="font-semibold text-pine-700 hover:underline">
            Escríbenos por WhatsApp
          </a>
        </p>
      </section>
    </div>
  );
}
