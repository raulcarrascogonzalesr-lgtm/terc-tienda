import { CONDITION } from "./format";
import { SHIPPING_ZONES } from "./shipping";
import { SITE } from "./site";
import type { Product } from "./types";
import { warrantyLabel } from "./warranty";

// Dirección pública de la tienda, para enlaces que lee Google.
export const SITE_URL = "https://terc.cl";

// Lo que Google muestra bajo el título cuando no hay una descripción propia.
export const DEFAULT_DESCRIPTION =
  "Computadores, notebooks y equipos reacondicionados baratos, revisados uno por uno y con garantía. Paga en cuotas y recibe en todo Chile.";

// Texto corto de un producto para el resultado de Google (unos 155 caracteres como máximo).
export function productDescription(product: Product): string {
  const parts = [
    `${product.name} reacondicionado`,
    CONDITION[product.grade].label.toLowerCase(),
    product.battery_health ? `batería ${product.battery_health}%` : "",
    `${warrantyLabel(product.warranty_months)} de garantía`,
  ].filter(Boolean);
  const text = `${parts.join(", ")}. Envío a todo Chile y pago en cuotas.`;
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
}

// Ficha del producto para Google (datos estructurados). Permite que el resultado
// muestre precio, disponibilidad y "reacondicionado".
// Envío y devoluciones, para que Google los muestre junto al precio.
// A regiones el costo real lo cotiza el courier al pagar; aquí va la tarifa de referencia.
function shippingDetails(product: Product, fund: number) {
  const [min, max] = SITE.deliveryDays[product.on_demand ? "onDemand" : "stock"];
  const deliveryTime = {
    "@type": "ShippingDeliveryTime",
    handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
    transitTime: { "@type": "QuantitativeValue", minValue: min, maxValue: max, unitCode: "DAY" },
  };
  const zone = (price: number, region?: string) => ({
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: price, currency: "CLP" },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "CL", ...(region ? { addressRegion: region } : {}) },
    deliveryTime,
  });
  return [zone(fund > 0 ? 0 : SHIPPING_ZONES.rm.price, "RM"), zone(SHIPPING_ZONES.regiones.price)];
}

// TERC no acepta devoluciones por arrepentimiento (ver /garantia-y-devoluciones); las fallas las cubre la garantía.
const RETURN_POLICY = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "CL",
  returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
};

export function productJsonLd(product: Product, fund = 0) {
  const url = `${SITE_URL}/producto/${product.slug}`;
  const images = [product.image_url, ...product.images].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || productDescription(product),
    sku: product.id,
    category: product.category,
    brand: { "@type": "Brand", name: product.brand },
    ...(images.length ? { image: images } : {}),
    offers: {
      "@type": "Offer",
      url,
      price: product.price,
      priceCurrency: "CLP",
      itemCondition: "https://schema.org/RefurbishedCondition",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      ...(product.offer_ends_at ? { priceValidUntil: product.offer_ends_at } : {}),
      seller: { "@type": "Organization", name: "TERC" },
      shippingDetails: shippingDetails(product, fund),
      hasMerchantReturnPolicy: RETURN_POLICY,
    },
  };
}

// Quién es la tienda, para el panel de información de Google cuando buscan "TERC".
export function storeJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "OnlineStore",
      name: "TERC",
      alternateName: "Tecnología y Equipos Reacondicionados Chile",
      url: SITE_URL,
      logo: `${SITE_URL}/correo/logo.png`,
      slogan: SITE.slogan,
      email: SITE.email,
      ...(SITE.whatsapp ? { telephone: `+${SITE.whatsapp}` } : {}),
      areaServed: { "@type": "Country", name: "Chile" },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "TERC",
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

// Inserta los datos estructurados en la página. "<" se escapa para que un nombre
// de producto nunca pueda cerrar la etiqueta <script>.
export function jsonLdScript(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
