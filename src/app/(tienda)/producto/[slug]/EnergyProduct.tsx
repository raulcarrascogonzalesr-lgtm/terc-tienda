import Link from "next/link";
import { AddToCartButton, BuyNowButton } from "@/components/AddToCartButton";
import { EnergySteps } from "@/components/energy/EnergyParts";
import { StoreIcon, WhatsAppIcon } from "@/components/icons";
import { ProductGallery } from "@/components/ProductGallery";
import { Terqui } from "@/components/Terqui";
import { TrackView } from "@/components/TrackView";
import { ENERGY_INFO, energyCategory, energyHref, WIRESUN_URL } from "@/lib/energy";
import { formatCLP } from "@/lib/format";
import { jsonLdScript, productJsonLd } from "@/lib/seo";
import { SITE, whatsappLink } from "@/lib/site";
import type { Product } from "@/lib/types";
import { warrantyLabel } from "@/lib/warranty";
import { StickyBuyBar } from "./StickyBuyBar";

// Ficha de un producto de Energía (TERC 2.1): nuevo, con garantía de fábrica, sin instalación y
// con compra por solicitud (se confirma stock y total y se paga por transferencia).
export function EnergyProduct({ product }: { product: Product }) {
  const cat = energyCategory(product.category)!;
  const whatsapp = whatsappLink(`Hola, me interesa ${product.name}. ¿Me pueden ayudar?`);
  const warranty = product.warranty_months ? `${warrantyLabel(product.warranty_months)} de garantía de fábrica` : "Garantía de fábrica";

  return (
    <div className="shell py-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(productJsonLd(product))} />
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
              <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-pine">
                Nuevo
              </span>
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

          <div className="space-y-3 rounded-3xl bg-surface p-5 shadow-[0_10px_30px_-18px_rgba(10,42,42,0.4)]">
            <p className="font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight tabular-nums text-ink sm:text-5xl">
              {formatCLP(product.price)}
            </p>
            <p className="text-[13px] text-muted">IVA incluido · producto nuevo · factura o boleta</p>
            <p className="flex items-start gap-2.5 rounded-2xl bg-mint-50 px-3 py-2.5 text-sm text-ink">
              <StoreIcon name="bank" className="mt-0.5 h-5 w-5 text-pine-700" />
              <span>
                <strong>Compra con aprobación:</strong> envías tu solicitud, te confirmamos stock y total el mismo día hábil y pagas
                por transferencia. No se cobra nada al enviarla.
              </span>
            </p>
          </div>

          {cat.install && (
            <div className="flex items-start gap-3 rounded-3xl border-2 border-mint-50 bg-surface p-5">
              <StoreIcon name="repair" className="mt-0.5 h-6 w-6 text-pine-700" />
              <div>
                <p className="font-bold text-ink">Instalación no incluida</p>
                <p className="text-[13px] text-muted">
                  Te recomendamos un instalador eléctrico autorizado SEC. ¿Lo necesitas instalado?{" "}
                  <a href={WIRESUN_URL} target="_blank" rel="noopener" className="font-semibold text-pine-700 hover:underline">
                    WireSun Energy te hace el kit con instalación
                  </a>
                  .
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 rounded-3xl border-2 border-mint-50 bg-surface p-5">
            <StoreIcon name="truck" className="mt-0.5 h-6 w-6 text-pine-700" />
            <div>
              <p className="font-bold text-ink">Entrega</p>
              <p className="text-[13px] text-muted">{ENERGY_INFO.delivery}</p>
            </div>
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
                La da el fabricante. Si algo falla, escríbenos y te acompañamos para hacerla válida. No hay cambios por
                arrepentimiento: por eso te ayudamos a elegir antes de comprar.{" "}
                <Link href="/garantia-y-devoluciones" className="underline">
                  Ver garantía y devoluciones
                </Link>
              </small>
            </Row>
            <Row label="Instalación">
              {cat.install ? "No incluida" : "No necesita: se enchufa y funciona"}
              {cat.install && <small>TERC vende el producto; no hacemos instalaciones.</small>}
            </Row>
            <Row label="Vende">
              TERC, de {SITE.company}
              <small>Empresa chilena. Boleta o factura en cada compra.</small>
            </Row>
            <Row label="Disponibles">{product.stock}</Row>
          </dl>

          {product.description && (
            <div className="space-y-2">
              <h2 className="font-semibold text-ink">Descripción</h2>
              <p className="whitespace-pre-line leading-relaxed text-muted">{product.description}</p>
            </div>
          )}

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
