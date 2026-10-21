import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { StoreIcon, WhatsAppIcon, type IconName } from "@/components/icons";
import { GRADE_SHORT } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import { formatCLP, GRADE_LABELS, savings } from "@/lib/format";
import { getProductBySlug } from "@/lib/products";
import { whatsappLink } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

const GRADE_TEXT = {
  A: "Sin marcas visibles a simple vista. Se ve y funciona como uno nuevo.",
  B: "Pequeños roces o rayitas que no afectan en nada su funcionamiento.",
  C: "Marcas de uso evidentes, funcionamiento perfecto y el mejor precio.",
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  return { title: product ? `${product.name} | TERC` : "Producto no encontrado" };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const off = savings(product);
  const whatsapp = whatsappLink(`Hola, me interesa el ${product.name}. ¿Me pueden dar más información?`);
  const trust: { icon: IconName; text: string }[] = [
    { icon: "shield", text: `${product.warranty_months} meses de garantía TERC` },
    { icon: "checklist", text: "Revisado y probado uno por uno" },
    { icon: "card", text: "Pago seguro con Mercado Pago, también en cuotas" },
    { icon: "truck", text: "Envío a todo Chile" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
      <nav aria-label="Ruta" className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-ink">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/?categoria=${encodeURIComponent(product.category)}#equipos`} className="hover:text-ink">
          {product.category}
        </Link>
      </nav>

      <div className="grid gap-8 lg:gap-12 md:grid-cols-2">
        <div className="relative self-start overflow-hidden rounded-3xl border border-black/[0.06] bg-white">
          <ProductImage product={product} />
          {off && (
            <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-xs font-bold text-pine">
              −{off.percent}% vs. nuevo
            </span>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-mint-50 px-3 py-1 text-xs font-semibold text-pine">
                Reacondicionado
              </span>
              <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-pine">
                Grado {product.grade} · {GRADE_SHORT[product.grade]}
              </span>
              {product.stock === 1 && (
                <span className="rounded-full bg-pine px-3 py-1 text-xs font-semibold text-white">
                  Última unidad
                </span>
              )}
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {product.brand}
            </p>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-ink">
              {product.name}
            </h1>
          </div>

          <div className="space-y-1">
            {off && (
              <p className="text-sm text-muted">
                Nuevo cuesta <span className="line-through">{formatCLP(product.list_price!)}</span>
              </p>
            )}
            <p className="text-4xl font-bold tracking-tight text-ink">{formatCLP(product.price)}</p>
            {off && (
              <p className="text-sm font-semibold text-pine-700">
                Ahorras {formatCLP(off.amount)} ({off.percent}%)
              </p>
            )}
            <p className="text-sm text-muted">IVA incluido. Paga con tarjeta, débito o en cuotas.</p>
          </div>

          <div className="space-y-3">
            <AddToCartButton product={product} />
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
              >
                <WhatsAppIcon className="w-5 h-5 text-[#25d366]" /> Preguntar por WhatsApp
              </a>
            )}
          </div>

          <ul className="space-y-2.5 rounded-2xl bg-white border border-black/[0.06] p-5">
            {trust.map((t) => (
              <li key={t.text} className="flex items-center gap-3 text-sm text-ink">
                <StoreIcon name={t.icon} className="w-5 h-5 text-pine-700" />
                {t.text}
              </li>
            ))}
          </ul>

          <dl className="divide-y divide-black/[0.06] rounded-2xl bg-white border border-black/[0.06] text-sm">
            <div className="grid grid-cols-[140px_1fr] gap-3 px-5 py-3">
              <dt className="text-muted">Estado</dt>
              <dd className="text-ink">
                {GRADE_LABELS[product.grade]}
                <span className="block text-xs text-muted mt-0.5">{GRADE_TEXT[product.grade]}</span>
              </dd>
            </div>
            {product.battery_health !== null && (
              <div className="grid grid-cols-[140px_1fr] gap-3 px-5 py-3">
                <dt className="text-muted">Salud de batería</dt>
                <dd className="flex items-center gap-2 text-ink">
                  <StoreIcon name="battery" className="w-5 h-5 text-pine-700" />
                  {product.battery_health}%
                </dd>
              </div>
            )}
            <div className="grid grid-cols-[140px_1fr] gap-3 px-5 py-3">
              <dt className="text-muted">Garantía</dt>
              <dd className="text-ink">{product.warranty_months} meses</dd>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-3 px-5 py-3">
              <dt className="text-muted">Disponibles</dt>
              <dd className="text-ink">{product.stock}</dd>
            </div>
          </dl>

          {product.description && (
            <div className="space-y-2">
              <h2 className="font-semibold text-ink">Descripción</h2>
              <p className="whitespace-pre-line leading-relaxed text-muted">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
