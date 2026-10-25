import { CONDITION } from "./format";
import { SITE } from "./site";
import type { Product } from "./types";

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
    `${product.warranty_months} meses de garantía`,
  ].filter(Boolean);
  const text = `${parts.join(", ")}. Envío a todo Chile y pago en cuotas.`;
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
}

// Ficha del producto para Google (datos estructurados). Permite que el resultado
// muestre precio, disponibilidad y "reacondicionado".
export function productJsonLd(product: Product) {
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
