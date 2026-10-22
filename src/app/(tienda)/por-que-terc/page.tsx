import type { Metadata } from "next";
import Link from "next/link";
import { StoreIcon, WhatsAppIcon, type IconName } from "@/components/icons";
import { Mark } from "@/components/Mark";
import { Terqui } from "@/components/Terqui";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Por qué TERC | Tecnología reacondicionada",
  description: "Cómo revisamos cada equipo, cómo describimos su estado y cómo funciona la garantía de TERC.",
};

const TRUST: { icon: IconName; title: string; text: string }[] = [
  { icon: "shield", title: "Garantía en cada equipo", text: "Si algo falla, te respondemos nosotros." },
  { icon: "checklist", title: "Revisado uno por uno", text: "Probamos batería, pantalla y funciones." },
  { icon: "card", title: "Pago seguro", text: "Tarjeta, débito o cuotas con Mercado Pago." },
  { icon: "truck", title: "Envíos a todo Chile", text: "Despachamos tu equipo bien embalado." },
];

const STEPS = [
  {
    title: "Elegimos equipos de calidad",
    text: "Solo trabajamos con marcas y modelos que vale la pena tener por varios años más.",
  },
  {
    title: "Los revisamos a fondo",
    text: "Probamos cada función, revisamos la batería, los limpiamos y te contamos su estado real.",
  },
  {
    title: "Te llegan con garantía",
    text: "Pagas seguro, lo despachamos a tu casa y quedas cubierto por la garantía de TERC.",
  },
];

const CONDITIONS = [
  { title: "Excelente estado", text: "Sin marcas visibles a simple vista. Se ve y funciona como uno nuevo." },
  {
    title: "Detalles estéticos leves",
    text: "Puede tener pequeños roces o rayitas en la carcasa que no afectan en nada su funcionamiento.",
  },
];

export default function WhyTercPage() {
  const whatsapp = whatsappLink("Hola, quiero ayuda para elegir un equipo");
  return (
    <div className="shell pt-6 pb-16 space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-pine px-7 py-12 sm:px-12 sm:py-16 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_40%,rgba(61,181,133,0.18),transparent_60%)]" />
        <Mark
          className="absolute right-6 top-1/2 hidden w-[250px] -translate-y-1/2 opacity-90 sm:block"
          ink="rgba(255,255,255,0.08)"
        />
        <Terqui pose="hola" className="absolute bottom-0 right-[22%] hidden h-44 w-44 lg:block" />
        <div className="relative max-w-lg space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">{SITE.slogan}</p>
          <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight">
            Le damos una segunda vida a cada equipo.
          </h1>
          <p className="text-white/75 leading-relaxed">
            Celulares, notebooks y tablets reacondicionados, revisados uno por uno y con garantía, a un
            precio que sí tiene sentido.
          </p>
        </div>
      </section>

      <ul data-reveal className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-black/[0.06] bg-black/[0.06]">
        {TRUST.map((t) => (
          <li key={t.title} className="flex gap-3 bg-white p-5">
            <StoreIcon name={t.icon} className="w-6 h-6 text-pine-700" />
            <div>
              <p className="text-sm font-semibold text-ink">{t.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{t.text}</p>
            </div>
          </li>
        ))}
      </ul>

      <section data-reveal className="rounded-3xl bg-white border border-black/[0.06] p-8 sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-pine-700">Cómo funciona TERC</p>
        <h2 className="mt-1 max-w-xl text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
          La calidad del primer día, al precio de la segunda vida.
        </h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="space-y-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pine text-sm font-semibold text-gold">
                {i + 1}
              </span>
              <h3 className="font-semibold text-ink">{s.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{s.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 border-t border-black/[0.06] pt-10">
          <h3 className="font-semibold text-ink">¿Cómo describimos el estado de cada equipo?</h3>
          <p className="mt-1.5 text-sm text-muted">
            Todos los equipos están revisados y 100% operativos. Lo único que cambia es cómo se ven.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {CONDITIONS.map((c) => (
              <div key={c.title} className="rounded-2xl bg-paper p-5">
                <p className="text-sm font-semibold text-pine">{c.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-reveal className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-pine-700 px-8 py-10 text-white sm:flex-row sm:items-center sm:px-12">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">¿No sabes cuál elegir?</h2>
          <p className="mt-1 text-white/75">Cuéntanos para qué lo necesitas y te recomendamos el equipo ideal.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={whatsapp ?? `mailto:${SITE.email}`}
            target={whatsapp ? "_blank" : undefined}
            rel={whatsapp ? "noopener" : undefined}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-pine transition hover:bg-paper"
          >
            {whatsapp ? <WhatsAppIcon className="w-5 h-5 text-[#25d366]" /> : <StoreIcon name="mail" />}
            {whatsapp ? "Escríbenos por WhatsApp" : "Escríbenos"}
          </a>
          <Link
            href="/#equipos"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-pine transition hover:bg-[#c4b47f]"
          >
            Ver equipos <StoreIcon name="arrow" className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
