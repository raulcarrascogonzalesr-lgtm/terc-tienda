import type { Metadata } from "next";
import { StoreIcon, WhatsAppIcon, type IconName } from "@/components/icons";
import { SITE, whatsappLink } from "@/lib/site";
import type { QuoteKind } from "@/lib/types";
import { QuoteForm } from "./QuoteForm";

export const metadata: Metadata = {
  title: "Equipos para empresas y oficinas | TERC",
  description:
    "Computadores y notebooks reacondicionados para tu empresa: precio especial por volumen, factura, garantía TERC y entrega gratis en la Región Metropolitana.",
};

type Props = { searchParams: Promise<{ tipo?: string }> };

const SERVICES: { kind: QuoteKind; icon: IconName; title: string; text: string }[] = [
  {
    kind: "volumen",
    icon: "truck",
    title: "Compras por volumen",
    text: "Varios equipos para tu oficina, colegio o pyme. Te armamos una cotización con precio especial por cantidad y factura a nombre de tu empresa.",
  },
  {
    kind: "otro",
    icon: "checklist",
    title: "Pedidos especiales",
    text: "¿Buscas un modelo o una configuración que no está en la tienda? Cuéntanos y lo buscamos por ti.",
  },
];

const PERKS = [
  "Precio especial por volumen",
  "Factura a nombre de tu empresa",
  "Garantía TERC en cada equipo",
  "Entrega gratis en la Región Metropolitana",
];

// Beneficios para empresas, en grande.
const REASONS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "tag",
    title: "Precio especial por volumen",
    text: "Mientras más equipos, mejor precio. Te lo damos en una cotización hecha a la medida de tu pedido.",
  },
  {
    icon: "truck",
    title: "Entrega gratis en la Región Metropolitana",
    text: "Desde 3 equipos te los llevamos nosotros mismos a tu oficina, sin costo. A regiones despachamos a todo Chile.",
  },
  {
    icon: "receipt",
    title: "Factura y garantía TERC",
    text: "Factura a nombre de tu empresa y la misma garantía en cada equipo: si algo falla, lo reparamos o lo cambiamos.",
  },
  {
    icon: "checklist",
    title: "Modelos equivalentes",
    text: "Si no hay suficientes unidades del mismo modelo, te proponemos equipos equivalentes para completar tu pedido.",
  },
];

const STEPS = [
  { title: "Nos cuentas qué necesitas", text: "Cuántos equipos, para qué los usarán y cuándo los necesitas." },
  { title: "Te enviamos la cotización", text: "Te respondemos el mismo día hábil con los equipos disponibles y tu precio." },
  { title: "Confirmas y pagas", text: "Por transferencia, con factura a nombre de tu empresa." },
  { title: "Te los entregamos listos", text: "Revisados, con Windows instalado, en caja TERC." },
];

export default async function BusinessPage({ searchParams }: Props) {
  const { tipo } = await searchParams;
  const kind: QuoteKind = tipo === "otro" ? "otro" : "volumen";
  const whatsapp = whatsappLink("Hola, quiero cotizar equipos para mi empresa");

  return (
    <div className="shell pt-6 pb-16 space-y-8">
      <header className="max-w-2xl space-y-3 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-700">TERC para empresas</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">¿Necesitas varios equipos para tu oficina?</h1>
        <p className="text-muted leading-relaxed">
          Cuenta con TERC. Te hacemos un precio especial por volumen, con factura, garantía en cada equipo y
          entrega gratis en la Región Metropolitana.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href="#cotizar"
            className="inline-flex items-center gap-2 rounded-full bg-pine px-6 py-3 text-sm font-bold text-white transition hover:bg-cta"
          >
            Pedir cotización <StoreIcon name="arrow" className="w-4 h-4" />
          </a>
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full bg-surface px-6 py-3 text-sm font-bold text-ink ring-1 ring-line/10 transition hover:ring-pine-700/30"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25d366]" /> Cotizar por WhatsApp
            </a>
          )}
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 pt-1">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-1.5 text-sm text-ink/80">
              <StoreIcon name="check" className="w-4 h-4 text-pine-700" /> {perk}
            </li>
          ))}
        </ul>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {REASONS.map((r, i) => (
          <div
            key={r.title}
            data-reveal
            style={{ "--d": `${i * 80}ms` } as React.CSSProperties}
            className="rounded-2xl bg-pine p-5 text-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-gold">
              <StoreIcon name={r.icon} className="w-5 h-5" />
            </span>
            <h2 className="mt-3 text-base font-bold">{r.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-white/75">{r.text}</p>
          </div>
        ))}
      </section>

      <section data-reveal className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-ink">Cómo funciona</h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-2xl bg-surface p-5 ring-1 ring-line/[0.06]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint-50 text-sm font-bold text-pine-700">
                {i + 1}
              </span>
              <h3 className="mt-3 text-base font-bold text-ink">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {SERVICES.map((s, i) => (
          <a
            key={s.kind}
            data-reveal
            style={{ "--d": `${i * 80}ms` } as React.CSSProperties}
            href={`?tipo=${s.kind}#cotizar`}
            className="group rounded-2xl bg-surface p-5 ring-1 ring-line/[0.06] transition hover:ring-pine-700/30"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint-50 text-pine-700">
              <StoreIcon name={s.icon} className="w-5 h-5" />
            </span>
            <h2 className="mt-3 text-base font-bold text-ink">{s.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.text}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-pine-700">
              Cotizar <StoreIcon name="arrow" className="w-4 h-4 transition group-hover:translate-x-1" />
            </span>
          </a>
        ))}
      </section>

      <section id="cotizar" data-reveal className="grid scroll-mt-40 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-ink">Pide tu cotización</h2>
          <p className="text-muted">
            Completa el formulario y te respondemos el mismo día hábil. Sin compromiso.
          </p>
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-ink">¿Prefieres hablar directo?</p>
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 text-pine-700 hover:underline"
              >
                <WhatsAppIcon className="w-4 h-4 text-[#25d366]" /> Escríbenos por WhatsApp
              </a>
            )}
            <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 text-pine-700 hover:underline">
              <StoreIcon name="mail" className="w-4 h-4" /> {SITE.email}
            </a>
          </div>
        </div>
        <QuoteForm key={kind} kind={kind} />
      </section>
    </div>
  );
}
