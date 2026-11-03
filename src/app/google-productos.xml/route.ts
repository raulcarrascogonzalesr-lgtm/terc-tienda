import { todayInChile } from "@/lib/format";
import { listProducts } from "@/lib/products";
import { productMargins } from "@/lib/ranking";
import { productDescription, SITE_URL } from "@/lib/seo";
import { KIND_LABEL, productSpecs } from "@/lib/specs";
import type { Product } from "@/lib/types";

export const revalidate = 3600;

// Lista de productos para Google Merchant Center (fichas gratis y anuncios de Shopping).
// Merchant Center la lee sola cada día desde https://terc.cl/google-productos.xml.
// Solo trae equipos visibles y con stock, con el mismo precio que ve el cliente.

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const tag = (name: string, value: string | number) => `<g:${name}>${escape(String(value))}</g:${name}>`;

// Categoría de Google: 278 = Computadores, 328 = Notebooks, 325 = PC de escritorio, 305 = Monitores.
function googleCategory(product: Product): number {
  const text = `${product.category} ${product.name}`.toLowerCase();
  if (text.includes("notebook")) return 328;
  if (text.includes("monitor")) return 305;
  if (text.includes("computador") || text.includes("all-in-one") || text.includes("pc")) return 325;
  return 278;
}

// Las fotos PNG pueden tener fondo transparente, que en Shopping o Instagram se ve negro.
// Esas pasan por terc.cl/google-img, que les pone fondo blanco (ver google-img/[file]/route.ts).
function feedImage(src: string): string {
  const file = src.match(/\/storage\/v1\/object\/public\/productos\/([\w-]+\.png)$/i)?.[1];
  return file ? `${SITE_URL}/google-img/${file}` : src;
}

// Grupo según cuánto deja cada venta (custom_label_0). En Google Ads permite pagar anuncios
// solo por los equipos que aguantan publicidad (ver el estudio de precios del 2-nov-2026).
function marginLabel(margin: number | undefined): string {
  if (margin === undefined) return "ganancia-sin-costo";
  if (margin >= 90000) return "ganancia-alta";
  if (margin >= 50000) return "ganancia-media";
  return "ganancia-baja";
}

function item(product: Product, margin: number | undefined): string {
  const images = [product.image_url, ...product.images].filter((src): src is string => Boolean(src)).map(feedImage);
  const specs = productSpecs(product);
  const months = product.warranty_months || 12;
  const highlights = [
    `${months} meses de garantía TERC`,
    "Revisado y probado uno por uno",
    "Windows Pro original (licencia OEM)",
    specs.kind === "notebook" ? "Incluye cargador" : "Incluye cable de poder",
    "Soporte por WhatsApp antes y después de la compra",
    "Boleta o factura de Wiremax Telecomunicaciones SpA",
  ];
  const details: [string, string | null][] = [
    ["Tipo", KIND_LABEL[specs.kind]],
    ["Procesador", specs.cpu],
    ["Memoria RAM", specs.ram?.replace(/ RAM$/, "") ?? null],
    ["Almacenamiento", specs.storage],
    ["Pantalla", specs.screen && specs.kind !== "desktop" && specs.kind !== "mini" ? specs.screen : null],
    ["Garantía", `${months} meses`],
  ];
  const lines = [
    tag("id", product.id),
    tag("title", `${product.name} reacondicionado`.slice(0, 150)),
    tag("description", (product.description || productDescription(product)).slice(0, 5000)),
    tag("link", `${SITE_URL}/producto/${product.slug}`),
    ...(images[0] ? [tag("image_link", images[0])] : []),
    ...images.slice(1, 11).map((src) => tag("additional_image_link", src)),
    tag("availability", product.stock > 0 ? "in_stock" : "out_of_stock"),
    tag("condition", "refurbished"),
    tag("brand", product.brand),
    tag("google_product_category", googleCategory(product)),
    tag("product_type", product.category),
    // Los equipos reacondicionados no tienen código de barras (GTIN).
    tag("identifier_exists", "no"),
    ...highlights.map((text) => tag("product_highlight", text)),
    ...details
      .filter((d): d is [string, string] => Boolean(d[1]))
      .map(
        ([name, value]) =>
          `<g:product_detail>${tag("section_name", "Características")}${tag("attribute_name", name)}${tag("attribute_value", value)}</g:product_detail>`,
      ),
    tag("custom_label_0", marginLabel(margin)),
    tag("custom_label_1", KIND_LABEL[specs.kind]),
  ];
  if (product.compare_price && product.compare_price > product.price) {
    lines.push(tag("price", `${product.compare_price} CLP`), tag("sale_price", `${product.price} CLP`));
    // La oferta termina sola a medianoche del último día (hora de Chile).
    if (product.offer_ends_at) lines.push(tag("sale_price_effective_date", `${todayInChile()}T00:00-03:00/${product.offer_ends_at}T23:59-03:00`));
  } else {
    lines.push(tag("price", `${product.price} CLP`));
  }
  return `<item>${lines.join("")}</item>`;
}

export async function GET() {
  const [products, { margins }] = await Promise.all([
    listProducts().catch(() => []),
    productMargins().catch(() => ({ margins: new Map<string, number>() })),
  ]);
  // Sin foto, Google rechaza el producto: mejor no enviarlo.
  const items = products.filter((p) => p.image_url).map((p) => item(p, margins.get(p.id)));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>TERC</title><link>${SITE_URL}</link><description>Equipos reacondicionados con garantía</description>${items.join("")}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
