import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton, BuyNowButton } from "@/components/AddToCartButton";
import { DiscountSticker } from "@/components/DiscountSticker";
import { StoreIcon, WhatsAppIcon, type IconName } from "@/components/icons";
import { OfferCountdown } from "@/components/OfferCountdown";
import { ProductGallery } from "@/components/ProductGallery";
import { Terqui } from "@/components/Terqui";
import { TrackView } from "@/components/TrackView";
import { deliveryText } from "@/lib/delivery";
import { CONDITION, formatCLP, offer, savings } from "@/lib/format";
import { getProductBySlug } from "@/lib/products";
import { boxFor } from "@/lib/shipping";
import { jsonLdScript, productDescription, productJsonLd } from "@/lib/seo";
import { getShippingFund } from "@/lib/shipping-fund";
import { SITE, whatsappLink } from "@/lib/site";
import { KIND_LABEL, productSpecs } from "@/lib/specs";
import { StickyBuyBar } from "./StickyBuyBar";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Producto no encontrado" };
  const title = `${product.name} reacondicionado | TERC`;
  const description = productDescription(product);
  return {
    title,
    description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `/producto/${product.slug}`,
      ...(product.image_url ? { images: [product.image_url] } : {}),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const [product, fund] = await Promise.all([getProductBySlug((await params).slug), getShippingFund()]);
  if (!product) notFound();

  const sale = offer(product);
  const off = savings(product);
  const deal = sale ?? off;
  const box = boxFor(product);
  const specs = productSpecs(product);
  const kind = KIND_LABEL[specs.kind];
  const whatsapp = whatsappLink(`Hola, me interesa el ${product.name}. ¿Me pueden dar más información?`);
  // El precio en algo cotidiano: lo que cuesta por día durante un año (redondeado hacia arriba).
  const perDay = Math.ceil(product.price / 365 / 100) * 100;
  const desc = normalize(product.description ?? "");
  // Lo que incluye: solo lo que dice la descripción, más lo que siempre va (embalaje, boleta y garantía).
  const included = [
    `${kind} revisado y limpio`,
    desc.includes("cargador") ? "Cargador" : null,
    desc.includes("windows") ? "Windows Pro original" : null,
    "Embalaje con caja y protección",
    "Boleta o factura",
    `${product.warranty_months} meses de garantía TERC`,
  ].filter((x): x is string => Boolean(x));
  const assurances: { icon: IconName; title: string; text: string }[] = [
    { icon: "shield", title: `${product.warranty_months} meses de garantía`, text: "Si algo falla, te respondemos nosotros." },
    {
      icon: "checklist",
      title: product.on_demand ? "Revisado antes de enviarlo" : "Revisado uno a uno",
      text: "Batería, pantalla, puertos y disco.",
    },
    { icon: "lock", title: "Pago seguro", text: "Tarjeta, débito o en cuotas. Boleta o factura." },
  ];

  return (
    <div className="shell py-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(productJsonLd(product))} />
      <TrackView item={{ id: product.id, name: product.name, price: product.price, quantity: 1, category: product.category }} />
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
        <div className="relative self-start md:sticky md:top-28">
          <ProductGallery
            product={product}
            badges={
              deal && (
                <DiscountSticker
                  percent={deal.percent}
                  label={sale ? "dcto." : "vs. nuevo"}
                  tone={sale ? "sale" : "gold"}
                  size="lg"
                  className="absolute left-4 top-4"
                />
              )
            }
          />
        </div>

        <div className="min-w-0 space-y-5">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-pine px-3 py-1 text-xs font-semibold text-white">
                <StoreIcon name="checklist" className="h-3.5 w-3.5 text-gold" /> Revisado por TERC
              </span>
              {product.stock <= 3 && (
                <span className="rounded-full bg-mint-50 px-3 py-1 text-xs font-semibold text-ink">
                  {product.stock === 1 ? "¡Última unidad!" : `¡Quedan ${product.stock}!`}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {product.brand} · {kind}
              <span className="ml-2 font-normal normal-case tracking-normal">SKU {product.sku}</span>
            </p>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink text-balance">{product.name}</h1>
            {specs.chips.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Características">
                {specs.chips.map((c) => (
                  <li key={c} className="rounded-full border border-line/10 bg-surface px-3 py-1.5 text-[13px] font-semibold text-ink">
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {sale && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-sale px-4 py-3 text-white">
              <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                <StoreIcon name="tag" className="w-4 h-4" /> {product.offer_name ?? "Oferta irresistible"}
              </span>
              {product.offer_ends_at && (
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  <StoreIcon name="clock" className="w-4 h-4" />
                  <OfferCountdown endsOn={product.offer_ends_at} />
                </span>
              )}
            </div>
          )}

          {/* Precio: al lado de lo que cuesta uno nuevo y en pesos por día, para dimensionarlo. */}
          <div className="space-y-3 rounded-3xl bg-surface p-5 shadow-[0_10px_30px_-18px_rgba(10,42,42,0.4)]">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
              <p
                className={`font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums ${sale ? "text-sale" : "text-ink"}`}
              >
                {formatCLP(product.price)}
              </p>
              {deal && (
                <span className={`rounded-full px-3 py-1.5 text-[13px] font-extrabold text-white ${sale ? "bg-sale" : "bg-pine-700"}`}>
                  Ahorras {formatCLP(deal.amount)}
                </span>
              )}
            </div>
            {sale && (
              <p className="text-sm text-muted">
                Antes <span className="line-through">{formatCLP(sale.before)}</span>: rebaja de {sale.percent}%.
              </p>
            )}
            {off && (
              <p className="text-sm text-muted">
                Uno nuevo parecido cuesta <span className="line-through">{formatCLP(off.before)}</span>. Con TERC pagas{" "}
                <strong className="text-pine-700">{off.percent >= 50 ? "menos de la mitad" : `${off.percent}% menos`}</strong>.
              </p>
            )}
            <p className="flex items-center gap-2.5 rounded-2xl bg-mint-50 px-3 py-2.5 text-sm text-ink">
              <StoreIcon name="receipt" className="h-5 w-5 text-pine-700" />
              <span>
                Son <strong>menos de {formatCLP(perDay)} al día</strong> durante un año, con garantía incluida.
              </span>
            </p>
            <p className="text-[13px] text-muted">IVA incluido · Paga con débito, crédito o en cuotas</p>
          </div>

          {/* Envío y fecha de llegada: la persona ya se imagina recibiéndolo. */}
          <div className="space-y-3 rounded-3xl border-2 border-mint-50 bg-surface p-5">
            <div className="flex items-start gap-3">
              <StoreIcon name="truck" className="mt-0.5 h-6 w-6 text-pine-700" />
              <div>
                <p className="font-bold text-ink">{fund > 0 ? "Envío gratis en la Región Metropolitana" : "Envío a todo Chile"}</p>
                <p className="text-[13px] text-muted">
                  {fund > 0 ? "A regiones, con descuento: se calcula en el carrito." : "El costo se calcula en el carrito según tu comuna."}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <StoreIcon name="clock" className="mt-0.5 h-6 w-6 text-pine-700" />
              <div>
                <p className="text-sm font-bold text-pine-700">Llega aprox. {deliveryText(product.on_demand)}</p>
                <p className="text-[13px] text-muted">
                  Fecha estimada para la Región Metropolitana; a regiones puede tardar 1 o 2 días más. Te enviamos el
                  seguimiento por correo.
                </p>
              </div>
            </div>
          </div>

          <div id="comprar" className="space-y-2.5">
            <BuyNowButton product={product} />
            <AddToCartButton product={product} secondary />
            {whatsapp && (
              <p className="flex items-center justify-center gap-2 pt-1 text-sm text-ink">
                <WhatsAppIcon className="h-5 w-5 text-[#25d366]" />
                <span>
                  ¿Dudas?{" "}
                  <a href={whatsapp} target="_blank" rel="noopener" className="font-bold text-pine-700 hover:underline">
                    Te responde una persona por WhatsApp
                  </a>
                </span>
              </p>
            )}
          </div>

          <ul className="grid gap-2.5 sm:grid-cols-3">
            {assurances.map((a) => (
              <li
                key={a.title}
                className="grid grid-cols-[auto_1fr] items-center gap-x-3 rounded-2xl bg-surface p-3.5 sm:grid-cols-1 sm:items-start sm:gap-y-1.5"
              >
                <StoreIcon name={a.icon} className="row-span-2 h-6 w-6 text-pine-700 sm:row-span-1" />
                <b className="text-sm leading-tight text-ink">{a.title}</b>
                <span className="text-[13px] text-muted">{a.text}</span>
              </li>
            ))}
          </ul>

          <div className="relative overflow-hidden rounded-3xl bg-pine p-5 text-white">
            <h2 className="text-lg font-extrabold">Lo que llega a tu casa</h2>
            <ul className="mt-3 grid gap-x-4 gap-y-2 pr-20 sm:grid-cols-2 sm:pr-24">
              {included.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-white/90">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-mint" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <Terqui pose="caja" className="absolute -bottom-2 right-1 h-24 w-24 sm:h-28 sm:w-28" />
          </div>

          <dl className="divide-y divide-line/[0.06] rounded-3xl bg-surface text-sm">
            <Row label="Estado">
              {CONDITION[product.grade].label}
              <small>{CONDITION[product.grade].text} Revisado y 100% operativo.</small>
            </Row>
            {product.battery_health !== null && (
              <Row label="Salud de batería">
                <span className="flex items-center gap-2">
                  <StoreIcon name="battery" className="w-5 h-5 text-pine-700" />
                  {product.battery_health}%
                </span>
              </Row>
            )}
            <Row label="Garantía">
              {product.warranty_months} meses por fallas
              <small>
                No hay cambios por arrepentimiento: por eso revisamos todo antes de enviarlo y te resolvemos cualquier
                duda antes de comprar.{" "}
                <Link href="/garantia-y-devoluciones" className="underline">
                  Ver garantía y devoluciones
                </Link>
              </small>
            </Row>
            <Row label="Vende">
              TERC, de {SITE.company}
              <small>Empresa chilena. Boleta o factura en cada compra.</small>
            </Row>
            <Row label="Paquete de envío">
              {box.weight.toLocaleString("es-CL")} kg · {box.length} × {box.width} × {box.height} cm
              <small>Aproximado, con caja y protección.</small>
            </Row>
            <Row label="Disponibles">{product.stock}</Row>
          </dl>

          {product.description && (
            <div className="space-y-2">
              <h2 className="font-semibold text-ink">Descripción</h2>
              <p className="whitespace-pre-line leading-relaxed text-muted">{product.description}</p>
            </div>
          )}
        </div>
      </div>
      <StickyBuyBar product={product} note={deal ? `Ahorras ${formatCLP(deal.amount)}` : null} />
    </div>
  );
}

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-0.5 px-5 py-3.5 sm:grid-cols-[140px_1fr] sm:gap-3 [&_small]:mt-0.5 [&_small]:block [&_small]:text-xs [&_small]:text-muted">
      <dt className="text-muted">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}
