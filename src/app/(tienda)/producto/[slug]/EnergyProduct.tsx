import Link from "next/link";
import { AddToCartButton, BuyNowButton } from "@/components/AddToCartButton";
import { EnergySteps } from "@/components/energy/EnergyParts";
import { StoreIcon, WhatsAppIcon } from "@/components/icons";
import { PickupNote } from "@/components/PickupNote";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductDocs } from "@/components/ProductDocs";
import { TechSheet } from "@/components/TechSheet";
import { Terqui } from "@/components/Terqui";
import { TrackView } from "@/components/TrackView";
import { ENERGY_INFO, energyCategory, energyHref } from "@/lib/energy";
import { DiscountSticker } from "@/components/DiscountSticker";
import { OfferCountdown } from "@/components/OfferCountdown";
import { isBlackFriday } from "@/lib/black-friday";
import { formatCLP, offer } from "@/lib/format";
import { breadcrumbJsonLd, jsonLdScript, productJsonLd } from "@/lib/seo";
import { SITE, whatsappLink } from "@/lib/site";
import type { Product } from "@/lib/types";
import { warrantyLabel } from "@/lib/warranty";
import { StickyBuyBar } from "./StickyBuyBar";

// Ficha de un producto de Energía (TERC 2.1): nuevo, con garantía de fábrica, sin instalación y
// con compra por solicitud (se confirma stock y total y se paga por transferencia).
export function EnergyProduct({ product }: { product: Product }) {
  const cat = energyCategory(product.category)!;
  // Oferta (por ejemplo Black Friday): precio de antes tachado, sello y cuenta regresiva.
  const sale = offer(product);
  const bf = isBlackFriday(product);
  const whatsapp = whatsappLink(`Hola, me interesa ${product.name}. ¿Me pueden ayudar?`);
  const warranty = product.warranty_months ? `${warrantyLabel(product.warranty_months)} de garantía de fábrica` : "Garantía de fábrica";

  return (
    <div className="shell py-6 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          productJsonLd(product),
          breadcrumbJsonLd([
            { name: "Inicio", path: "/" },
            { name: "Energía", path: "/energia" },
            { name: cat.name, path: `/energia?categoria=${encodeURIComponent(cat.name)}` },
            { name: product.name, path: `/producto/${product.slug}` },
          ]),
        ])}
      />
      <TrackView item={{ id: product.id, name: product.name, price: product.price, quantity: 1, category: product.category }} />
      <nav aria-label="Ruta" className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-ink">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <Link href="/energia" className="hover:text-ink">
          Energía
        </Link>
        <span className="mx-2">/</span>
        <Link href={energyHref(cat)} className="hover:text-ink">
          {cat.name}
        </Link>
      </nav>

      <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
        <div className="relative self-start md:sticky md:top-28">
          <ProductGallery
            product={product}
            badges={
              sale ? (
                <DiscountSticker
                  percent={sale.percent}
                  label={bf ? "black" : "dcto."}
                  tone={bf ? "black" : "sale"}
                  size="lg"
                  className="stamp absolute left-4 top-4"
                />
              ) : (
                <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-pine">
                  Nuevo
                </span>
              )
            }
          />
        </div>

        <div className="min-w-0 space-y-5">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-pine px-3 py-1 text-xs font-semibold text-white">
                <StoreIcon name="bolt" className="h-3.5 w-3.5 text-gold" /> Energía TERC
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-50 px-3 py-1 text-xs font-semibold text-ink">
                <StoreIcon name="shield" className="h-3.5 w-3.5 text-pine-700" /> {warranty}
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {product.brand} · {cat.name}
              <span className="ml-2 font-normal normal-case tracking-normal">SKU {product.sku}</span>
            </p>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink text-balance">{product.name}</h1>
          </div>

          {sale && (
            <div
              className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-3 ${bf ? "bf-bar text-gold ring-1 ring-gold/40" : "bg-sale text-white"}`}
            >
              <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                <StoreIcon name="tag" className="h-4 w-4" /> {product.offer_name ?? "Oferta"}
              </span>
              {product.offer_ends_at && (
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  <StoreIcon name="clock" className="h-4 w-4" />
                  <OfferCountdown endsOn={product.offer_ends_at} />
                </span>
              )}
            </div>
          )}

          <div className="space-y-3 rounded-3xl bg-surface p-5 shadow-[0_10px_30px_-18px_rgba(10,42,42,0.4)]">
            {sale && (
              <p className="text-sm text-muted">
                Antes <span className="line-through">{formatCLP(sale.before)}</span>
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <p
                className={`font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl ${sale ? "text-sale" : "text-ink"}`}
              >
                {formatCLP(product.price)}
              </p>
              {sale && (
                <span className="rounded-full bg-sale px-3 py-1.5 text-[13px] font-extrabold text-white">Ahorras {formatCLP(sale.amount)}</span>
              )}
            </div>
            <p className="text-[13px] text-muted">
              <span className="text-[15px] font-semibold text-ink">IVA incluido</span> · producto nuevo · factura o boleta
            </p>
            <p className="flex items-start gap-2.5 rounded-2xl bg-mint-50 px-3 py-2.5 text-sm text-ink">
              <StoreIcon name="bank" className="mt-0.5 h-5 w-5 text-pine-700" />
              <span>
                <strong>Compra por transferencia:</strong> envías tu pedido, ves la cuenta y transfieres. Te damos boleta o
                factura y te lo entregamos en hasta {ENERGY_INFO.deliveryDays} días hábiles en la RM.
              </span>
            </p>
          </div>

          {/* Raúl (23-11): sin recuadro de "Instalación no incluida"; se entiende que TERC no instala. */}
          <div className="space-y-3 rounded-3xl border-2 border-mint-50 bg-surface p-5">
            <div className="flex items-start gap-3">
              <StoreIcon name="truck" className="mt-0.5 h-6 w-6 text-pine-700" />
              <div>
                <p className="font-bold text-ink">Entrega</p>
                <p className="text-[13px] text-muted">{ENERGY_INFO.delivery}</p>
              </div>
            </div>
            <PickupNote />
          </div>

          <div id="comprar" className="space-y-2.5">
            <BuyNowButton product={product} />
            <AddToCartButton product={product} secondary />
            {whatsapp && (
              <p className="flex items-center justify-center gap-2 pt-1 text-sm text-ink">
                <WhatsAppIcon className="h-5 w-5 text-[#25d366]" />
                <span>
                  ¿No sabes cuál necesitas?{" "}
                  <a href={whatsapp} target="_blank" rel="noopener" className="font-bold text-pine-700 hover:underline">
                    Te ayudamos por WhatsApp
                  </a>
                </span>
              </p>
            )}
            {/* Raúl (23-11): no mostrar cuántas unidades quedan; solo este aviso, chico y tenue. */}
            <p className="text-right text-[11px] text-muted/60">Stock no actualizado en tiempo real</p>
          </div>

          <div className="space-y-3">
            <h2 className="font-semibold text-ink">¿Cómo se compra?</h2>
            <EnergySteps />
          </div>

          <dl className="divide-y divide-line/[0.06] rounded-3xl bg-surface text-sm">
            <Row label="Estado">
              Nuevo
              <small>Producto nuevo, en su caja de fábrica.</small>
            </Row>
            <Row label="Garantía">
              {warranty}
              <small>
                {/* Raúl 27-11: sin la frase del retracto en la ficha (el retracto sigue en Garantía y devoluciones). */}
                La da el fabricante. Si algo falla, escríbenos y te acompañamos para hacerla válida.{" "}
                <Link href="/garantia-y-devoluciones" className="underline">
                  Ver garantía y devoluciones
                </Link>
              </small>
            </Row>
            <Row label="Vende">
              TERC, de {SITE.company}
              <small>Empresa chilena. Boleta o factura en cada compra.</small>
            </Row>
          </dl>

          {product.description && (
            <div className="space-y-2">
              <h2 className="font-semibold text-ink">Descripción</h2>
              <p className="whitespace-pre-line leading-relaxed text-muted">{product.description}</p>
            </div>
          )}

          <TechSheet text={product.tech_sheet} />
          <ProductDocs text={product.documents} />

          <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-3 rounded-3xl bg-mint-50 p-4">
            <Terqui pose="lupa" className="h-[72px] w-[72px]" />
            <p className="text-sm text-ink">
              ¿Necesitas varios o eres instalador?{" "}
              <a
                href={whatsappLink(`Hola, soy instalador y quiero cotizar varios ${product.name}`) ?? "/empresas#cotizar"}
                target="_blank"
                rel="noopener"
                className="font-bold text-pine-700 hover:underline"
              >
                Pide precio por volumen
              </a>
              .
            </p>
          </div>
        </div>
      </div>
      <StickyBuyBar product={product} note="Pagas por transferencia" />
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-0.5 px-5 py-3.5 sm:grid-cols-[140px_1fr] sm:gap-3 [&_small]:mt-0.5 [&_small]:block [&_small]:text-xs [&_small]:text-muted">
      <dt className="text-muted">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}
