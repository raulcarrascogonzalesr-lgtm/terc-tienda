import Link from "next/link";
import { StoreIcon, WhatsAppIcon, type IconName } from "@/components/icons";
import { Mark } from "@/components/Mark";
import { ProductCard } from "@/components/ProductCard";
import { savings } from "@/lib/format";
import { listProducts } from "@/lib/products";
import { SITE, whatsappLink } from "@/lib/site";

export const revalidate = 60;

type Props = { searchParams: Promise<{ q?: string; categoria?: string }> };

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

const GRADES = [
  { grade: "A", title: "Como nuevo", text: "Sin marcas visibles a simple vista. Se ve y funciona como uno nuevo." },
  { grade: "B", title: "Detalles leves", text: "Pequeños roces o rayitas que no afectan en nada su funcionamiento." },
  { grade: "C", title: "Marcas visibles", text: "Marcas de uso evidentes, funcionamiento perfecto y el mejor precio." },
];

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export default async function HomePage({ searchParams }: Props) {
  const { q = "", categoria = "" } = await searchParams;
  const all = await listProducts();
  const query = normalize(q.trim());
  const filtered = all.filter(
    (p) =>
      (!categoria || p.category === categoria) &&
      (!query || normalize(`${p.name} ${p.brand} ${p.category}`).includes(query)),
  );
  const filtering = Boolean(query || categoria);
  const categories = [...new Set(all.map((p) => p.category))].sort();
  const bestSaving = Math.max(0, ...all.map((p) => savings(p)?.percent ?? 0));
  const whatsapp = whatsappLink("Hola, quiero ayuda para elegir un equipo");

  return (
    <div className="pb-16">
      {!filtering && (
        <section className="max-w-6xl mx-auto px-4 pt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="relative overflow-hidden rounded-3xl bg-pine px-7 py-12 sm:px-12 sm:py-16 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_40%,rgba(127,196,168,0.18),transparent_60%)]" />
            <Mark
              className="absolute right-6 top-1/2 hidden w-[250px] -translate-y-1/2 opacity-90 sm:block"
              ink="rgba(255,255,255,0.08)"
              stroke={2}
            />
            <div className="relative max-w-md space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
                {SITE.slogan}
              </p>
              <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight">
                Tecnología premium, a un precio que sí tiene sentido.
              </h1>
              <p className="text-white/75 leading-relaxed">
                Celulares, notebooks y tablets reacondicionados, revisados uno por uno y con
                garantía.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="#equipos"
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-pine transition hover:bg-[#d8ca9f]"
                >
                  Ver equipos <StoreIcon name="arrow" className="w-4 h-4" />
                </Link>
                <Link
                  href="#como"
                  className="inline-flex items-center rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Cómo revisamos
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="relative overflow-hidden rounded-3xl bg-mint-50 p-7 flex flex-col justify-between gap-6">
              <StoreIcon name="leaf" className="w-8 h-8 text-pine-700" />
              <div>
                <p className="text-3xl font-semibold tracking-tight text-pine">
                  {bestSaving >= 10 ? `Ahorra hasta ${bestSaving}%` : "Ahorra sin arriesgar"}
                </p>
                <p className="mt-2 text-sm text-pine/75">
                  frente a un equipo nuevo, con la misma tranquilidad: garantía y pago seguro.
                </p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl bg-white border border-black/[0.06] p-7 flex flex-col justify-between gap-6">
              <StoreIcon name="card" className="w-8 h-8 text-gold-700" />
              <div>
                <p className="text-3xl font-semibold tracking-tight text-pine">Paga en cuotas</p>
                <p className="mt-2 text-sm text-muted">
                  Con tarjeta de crédito o débito a través de Mercado Pago.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {!filtering && (
        <section className="max-w-6xl mx-auto px-4 pt-4">
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-black/[0.06] bg-black/[0.06]">
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
        </section>
      )}

      <section id="equipos" className="max-w-6xl mx-auto px-4 pt-14 scroll-mt-40">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-700">
              {filtering ? "Resultados" : "Disponibles hoy"}
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
              {categoria || (q ? `“${q}”` : "Nuestros equipos")}
            </h2>
          </div>
          {filtering && (
            <Link href="/#equipos" className="text-sm font-medium text-pine-700 hover:underline">
              Ver todos los equipos
            </Link>
          )}
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/15 bg-white p-10 text-center">
            <p className="font-medium text-ink">
              {filtering ? "No encontramos equipos con esa búsqueda." : "Pronto tendremos equipos disponibles."}
            </p>
            <p className="mt-1 text-sm text-muted">
              Escríbenos y te avisamos cuando llegue lo que buscas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {!filtering && categories.length > 1 && (
        <section className="max-w-6xl mx-auto px-4 pt-16">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Explora por categoría</h2>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((c) => (
              <Link
                key={c}
                href={`/?categoria=${encodeURIComponent(c)}#equipos`}
                className="group flex items-center justify-between rounded-2xl border border-black/[0.06] bg-white px-5 py-6 transition hover:border-pine-700/30 hover:shadow-md"
              >
                <span>
                  <span className="block font-semibold text-ink">{c}</span>
                  <span className="text-xs text-muted">
                    {(() => {
                      const n = all.filter((p) => p.category === c).length;
                      return `${n} ${n === 1 ? "disponible" : "disponibles"}`;
                    })()}
                  </span>
                </span>
                <StoreIcon
                  name="arrow"
                  className="w-5 h-5 text-pine-700 transition group-hover:translate-x-1"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {!filtering && (
        <section id="como" className="max-w-6xl mx-auto px-4 pt-16 scroll-mt-40">
          <div className="rounded-3xl bg-white border border-black/[0.06] p-8 sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-700">
              Cómo funciona TERC
            </p>
            <h2 className="mt-1 max-w-xl text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
              Le damos una segunda vida a cada equipo, con la calidad del primer día.
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
              <h3 className="font-semibold text-ink">¿Qué significa cada grado?</h3>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {GRADES.map((g) => (
                  <div key={g.grade} className="rounded-2xl bg-paper p-5">
                    <p className="text-sm font-semibold text-pine">
                      Grado {g.grade} · {g.title}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{g.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {!filtering && (
        <section className="max-w-6xl mx-auto px-4 pt-16">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-pine-700 px-8 py-10 text-white sm:flex-row sm:items-center sm:px-12">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">¿No sabes cuál elegir?</h2>
              <p className="mt-1 text-white/75">
                Cuéntanos para qué lo necesitas y te recomendamos el equipo ideal.
              </p>
            </div>
            <a
              href={whatsapp ?? `mailto:${SITE.email}`}
              target={whatsapp ? "_blank" : undefined}
              rel={whatsapp ? "noopener" : undefined}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-pine transition hover:bg-paper"
            >
              {whatsapp ? <WhatsAppIcon className="w-5 h-5 text-[#25d366]" /> : <StoreIcon name="mail" />}
              {whatsapp ? "Escríbenos por WhatsApp" : "Escríbenos"}
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
