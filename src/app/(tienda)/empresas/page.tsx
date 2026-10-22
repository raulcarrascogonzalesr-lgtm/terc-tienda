import type { Metadata } from "next";
import { StoreIcon, WhatsAppIcon, type IconName } from "@/components/icons";
import { SITE, whatsappLink } from "@/lib/site";
import type { QuoteKind } from "@/lib/types";
import { QuoteForm } from "./QuoteForm";

export const metadata: Metadata = {
  title: "Empresas y cotizaciones | TERC",
  description:
    "Compras por volumen, arriendo de equipos y pedidos especiales de tecnología reacondicionada con garantía.",
};

type Props = { searchParams: Promise<{ tipo?: string }> };

const SERVICES: { kind: QuoteKind; icon: IconName; title: string; text: string }[] = [
  {
    kind: "volumen",
    icon: "truck",
    title: "Compras por volumen",
    text: "Varios equipos para tu oficina, colegio o pyme. Te armamos una cotización con precio por cantidad y factura a nombre de tu empresa.",
  },
  {
    kind: "arriendo",
    icon: "clock",
    title: "Arriendo de equipos",
    text: "¿Necesitas equipos por un tiempo, para un proyecto o un evento? Consúltanos y vemos juntos qué alternativa te sirve.",
  },
  {
    kind: "otro",
    icon: "checklist",
    title: "Pedidos especiales",
    text: "¿Buscas un modelo o una configuración que no está en la tienda? Cuéntanos y lo buscamos por ti.",
  },
];

const PERKS = [
  "Factura a nombre de tu empresa",
  "Garantía TERC en cada equipo",
  "Equipos revisados antes de entregar",
  "Despacho a todo Chile",
];

export default async function BusinessPage({ searchParams }: Props) {
  const { tipo } = await searchParams;
  const kind: QuoteKind = tipo === "arriendo" || tipo === "otro" ? tipo : "volumen";
  const whatsapp = whatsappLink("Hola, quiero cotizar equipos para mi empresa");

  return (
    <div className="shell pt-6 pb-16 space-y-8">
      <header className="max-w-2xl space-y-3 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-700">Empresas y cotizaciones</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">Pedidos especiales y por volumen</h1>
        <p className="text-muted leading-relaxed">
          Si necesitas varios equipos para tu empresa o institución, arrendar por un tiempo o algo que no
          está en la tienda, cuéntanos y te preparamos una cotización.
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 pt-1">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-1.5 text-sm text-ink/80">
              <StoreIcon name="check" className="w-4 h-4 text-pine-700" /> {perk}
            </li>
          ))}
        </ul>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {SERVICES.map((s, i) => (
          <a
            key={s.kind}
            data-reveal
            style={{ "--d": `${i * 80}ms` } as React.CSSProperties}
            href={`?tipo=${s.kind}#cotizar`}
            className="group rounded-2xl bg-white p-5 ring-1 ring-black/[0.06] transition hover:ring-pine-700/30"
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
            Completa el formulario y te contactamos dentro de un día hábil. Sin compromiso.
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
