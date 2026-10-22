import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { DiscountSticker } from "@/components/DiscountSticker";
import { StoreIcon, WhatsAppIcon, type IconName } from "@/components/icons";
import { OfferCountdown } from "@/components/OfferCountdown";
import { ProductGallery } from "@/components/ProductGallery";
import { CONDITION, formatCLP, offer, savings } from "@/lib/format";
import { getProductBySlug } from "@/lib/products";
import { boxFor } from "@/lib/shipping";
import { SITE, whatsappLink } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  return { title: product ? `${product.name} | TERC` : "Producto no encontrado" };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const sale = offer(product);
  const off = savings(product);
  const box = boxFor(product);
  const whatsapp = whatsappLink(`Hola, me interesa el ${product.name}. ¿Me pueden dar más información?`);
  const trust: { icon: IconName; text: string }[] = [
    { icon: "shield", text: `${product.warranty_months} meses de garantía TERC` },
    {
      icon: "checklist",
      text: product.on_demand ? "Lo revisamos antes de enviártelo" : "Revisado y probado uno por uno",
    },
    { icon: "card", text: "Pago seguro con Mercado Pago, también en cuotas" },
    {
      icon: "truck",
      text: product.on_demand
        ? `Envío a todo Chile. Despacho en ${SITE.onDemandLeadTime}`
        : "Envío a todo Chile",
    },
  ];

  return (
    <div className="shell py-6 sm:py-10">
      <nav aria-label="Ruta" className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-ink">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/?categoria=${encodeURIComponent(product.category)}#equipos`} className="hover:text-ink">
          {product.category}
        </Link>
      </nav>

      <div className="grid gap-8 lg:gap-14 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="relative self-start">
          <ProductGallery
            product={product}
            badges={
              (sale ?? off) && (
                <DiscountSticker
                  percent={(sale ?? off)!.percent}
                  label={sale ? "dcto." : "vs. nuevo"}
                  tone={sale ? "sale" : "gold"}
                  size="lg"
                  className="absolute left-4 top-4"
                />
              )
            }
          />
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-mint-50 px-3 py-1 text-xs font-semibold text-pine">
                Reacondicionado
              </span>
              {product.stock <= 3 && (
                <span className="rounded-full bg-pine px-3 py-1 text-xs font-semibold text-white">
                  {product.stock === 1 ? "¡Última unidad!" : `¡Quedan ${product.stock}!`}
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

          {sale && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-sale px-4 py-3 text-white">
              <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                <StoreIcon name="tag" className="w-4 h-4" /> Oferta irresistible
              </span>
              {product.offer_ends_at && (
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  <StoreIcon name="clock" className="w-4 h-4" />
                  <OfferCountdown endsOn={product.offer_ends_at} />
                </span>
              )}
            </div>
          )}

          <div className="space-y-1">
            {sale && (
              <p className="text-sm text-muted">
                Antes <span className="line-through">{formatCLP(sale.before)}</span>
              </p>
            )}
            <p className={`font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold tracking-tight ${sale ? "text-sale" : "text-ink"}`}>
              {formatCLP(product.price)}
            </p>
            {sale && (
              <p className="text-sm font-semibold text-sale">
                Oferta: ahorras {formatCLP(sale.amount)} ({sale.percent}%)
              </p>
            )}
            {off && (
              <p className="text-sm text-pine-700">
                Un equipo nuevo cuesta <span className="line-through">{formatCLP(off.before)}</span>:{" "}
                <strong>ahorras {formatCLP(off.amount)} ({off.percent}%)</strong>
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
                {CONDITION[product.grade].label}
                <span className="block text-xs text-muted mt-0.5">
                  {CONDITION[product.grade].text} Revisado y 100% operativo.
                </span>
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
              <dt className="text-muted">Paquete de envío</dt>
              <dd className="text-ink">
                {box.weight.toLocaleString("es-CL")} kg · {box.length} × {box.width} × {box.height} cm
                <span className="block text-xs text-muted mt-0.5">
                  Aproximado, con caja y protección. El costo del envío se calcula en el carrito según tu comuna.
                </span>
              </dd>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-3 px-5 py-3">
              <dt className="text-muted">Disponibles</dt>
              <dd className="text-ink">
                {product.stock}
              </dd>
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
