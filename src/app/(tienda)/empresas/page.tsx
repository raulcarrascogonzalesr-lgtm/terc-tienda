import type { Metadata } from "next";
import * as Escenas from "@/components/empresas/escenas";
import { EmpresasVivo } from "@/components/empresas/EmpresasVivo";
import { StoreIcon, WhatsAppIcon, type IconName } from "@/components/icons";
import { formatCLP } from "@/lib/format";
import { photoProps } from "@/lib/photo";
import { listProducts } from "@/lib/products";
import { SITE, whatsappLink } from "@/lib/site";
import type { EmpresaEquipo } from "@/lib/terqui-anim/empresas";
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
    kind: "energia",
    icon: "bolt",
    title: "Energía y eléctricos",
    text: "Baterías de litio, inversores, UPS, paneles, cables y más. Te cotizamos los equipos que necesitas; la instalación no está incluida.",
  },
  {
    kind: "otro",
    icon: "checklist",
    title: "Pedidos especiales",
    text: "¿Buscas un modelo o una configuración que no está en la tienda? Cuéntanos y lo buscamos por ti.",
  },
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

// Cómo se pide: la cotización paso a paso.
const STEPS = [
  { title: "Nos cuentas qué necesitas", text: "Cuántos equipos, para qué los usarán y cuándo los necesitas." },
  { title: "Te enviamos la cotización", text: "Te respondemos el mismo día hábil con los equipos disponibles y tu precio." },
  { title: "Confirmas y pagas", text: "Por transferencia, con factura a nombre de tu empresa." },
  { title: "Te los entregamos listos", text: "Revisados, con Windows instalado, en caja TERC." },
];

// Lo que hacemos con cada pedido, con un dibujo de Terqui en cada paso.
const PASOS = [
  {
    html: Escenas.PASO_REVISAMOS,
    title: "Revisamos cada equipo",
    text: "Antes de salir, lo probamos uno a uno y lo dejamos con Windows instalado y su cargador.",
  },
  {
    html: Escenas.PASO_ENTREGAMOS,
    title: "Te lo llevamos a tu oficina",
    text: "Embalado en caja TERC. En Santiago lo entregamos nosotros mismos, en auto y en mano.",
  },
  {
    html: Escenas.PASO_ACOMPANAMOS,
    title: "Te acompañamos después",
    text: "Garantía TERC en cada equipo y soporte por WhatsApp o videollamada con personas reales.",
  },
];

// Equipos dibujados en las escenas (clave del dibujo → producto de la tienda). Si uno se agota o
// cambia de dirección, su punto simplemente no aparece; para cambiarlo, pon aquí el nuevo producto.
const DIBUJADOS: Record<string, string> = {
  "aio-hp": "all-in-one-hp-proone-440-g9-23-8-i5-12500-16-gb-ssd-512-gb",
  "aio-len": "all-in-one-lenovo-v50a-24-i5-10a-gen-16-gb-1-tb",
  "nb-830": "notebook-hp-elitebook-830-g7-i7-10510u-8-gb-ssd-256-gb",
  "nb-440": "notebook-hp-probook-440-g8-i5-1135g7-16-gb-ssd-256-gb",
  "pc-800": "pc-hp-elite-sff-800-g9-i5-12500-16-gb-ddr5-1-tb",
  "mini-3000": "mini-pc-dell-optiplex-3000-micro-i5-12a-gen-8-gb-ssd-256-gb",
};

async function equiposDibujados(): Promise<Record<string, EmpresaEquipo>> {
  const products = await listProducts().catch(() => []);
  const out: Record<string, EmpresaEquipo> = {};
  for (const [key, slug] of Object.entries(DIBUJADOS)) {
    const p = products.find((x) => x.slug === slug);
    if (!p) continue;
    out[key] = {
      name: p.name,
      line: `Garantía TERC de ${p.warranty_months} meses`,
      price: formatCLP(p.price),
      url: `/producto/${p.slug}`,
      photo: p.image_url ? photoProps(p.image_url, "240px", 640) : null,
    };
  }
  return out;
}

// Pone el enlace a cada equipo dibujado; los que no están a la venta quedan sin punto.
function conEnlaces(html: string, equipos: Record<string, EmpresaEquipo>) {
  return html.replace(/<a class="emp-dev" data-p="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g, (_, key: string, attrs: string, inner: string) =>
    equipos[key] ? `<a class="emp-dev" data-p="${key}" href="${equipos[key].url}"${attrs}>${inner}</a>` : "",
  );
}

function Escena({ html, className, delay }: { html: string; className: string; delay?: number }) {
  return (
    <div
      className={`emp-stage ${className}`}
      {...(delay !== undefined ? { "data-reveal": true, style: { "--d": `${delay}ms` } as React.CSSProperties } : {})}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default async function BusinessPage({ searchParams }: Props) {
  const { tipo } = await searchParams;
  const kind: QuoteKind = tipo === "otro" || tipo === "energia" ? tipo : "volumen";
  const whatsapp = whatsappLink("Hola, quiero cotizar equipos para mi empresa");
  const equipos = await equiposDibujados();

  return (
    <EmpresasVivo equipos={equipos}>
    <div className="shell pt-6 pb-16 space-y-8">
      <div aria-hidden dangerouslySetInnerHTML={{ __html: Escenas.DEFS }} />
      <section aria-label="TERC para empresas" className="emp-banner grid overflow-hidden rounded-[28px] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.32fr)]">
        <div className="flex flex-col justify-center gap-4 px-6 pt-8 pb-6 sm:px-10 lg:py-12 lg:pr-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#288868]">TERC para empresas</p>
          <h1 className="text-[32px] font-extrabold leading-[1.06] tracking-tight sm:text-4xl lg:text-[44px]">Equipa tu oficina con TERC</h1>
          <p className="max-w-[38ch] leading-relaxed text-[#4d6461]">
            Precio especial por volumen, factura a nombre de tu empresa y entrega gratis en la Región Metropolitana
            desde 3 equipos.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href="#cotizar"
              className="inline-flex items-center gap-2 rounded-full bg-[#0a2a2a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#164a42]"
            >
              Pedir cotización <StoreIcon name="arrow" className="w-4 h-4" />
            </a>
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#0a2a2a] ring-1 ring-black/10 transition hover:ring-black/20"
              >
                <WhatsAppIcon className="w-4 h-4 text-[#25d366]" /> Cotizar por WhatsApp
              </a>
            )}
          </div>
        </div>
        <Escena html={conEnlaces(Escenas.BANNER, equipos)} className="emp-scene" />
      </section>

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

      <section className="space-y-4 pt-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-pine-700">Cómo trabajamos</p>
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Revisado por nosotros, entregado en tu oficina</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {PASOS.map((paso, i) => (
            <article
              key={paso.title}
              data-reveal
              style={{ "--d": `${i * 120}ms` } as React.CSSProperties}
              className="space-y-2 rounded-[22px] bg-surface p-3 pb-5 ring-1 ring-line/[0.06]"
            >
              <Escena html={paso.html} className="emp-pic rounded-[14px]" />
              <div className="space-y-1.5 px-2 pt-1.5">
                <p className="text-xs font-extrabold tracking-[0.14em] text-pine-700">PASO {i + 1}</p>
                <h3 className="text-[17px] font-bold text-ink">{paso.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{paso.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Puestos de trabajo con equipos TERC" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Equipos para cada puesto de tu oficina</h2>
          <p className="text-sm text-muted">
            <span className="emp-on-hover">Pasa el mouse sobre un equipo para ver su foto. Haz clic para abrir su página.</span>
            <span className="emp-on-touch">Toca un equipo para ver su foto. Tócalo otra vez para abrir su página.</span>
          </p>
        </div>
        <div className="emp-collage">
          <Escena html={conEnlaces(Escenas.RECEPCION, equipos)} className="emp-tile emp-big" delay={0} />
          <Escena html={conEnlaces(Escenas.PUESTO_MOVIL, equipos)} className="emp-tile" delay={100} />
          <Escena html={conEnlaces(Escenas.CONTABILIDAD, equipos)} className="emp-tile" delay={200} />
          <Escena html={conEnlaces(Escenas.OFICINA, equipos)} className="emp-tile emp-wide" delay={150} />
        </div>
      </section>

      <section data-reveal className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-ink">Cómo cotizar</h2>
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

      <section className="grid gap-4 md:grid-cols-3">
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
    </EmpresasVivo>
  );
}
