import { ENERGY_INFO, energyCategory, type EnergyCategory } from "@/lib/energy";
import { cardPrice, todayInChile, windowsLabel } from "@/lib/format";
import { hasRealPhoto } from "@/lib/photo";
import { listProducts } from "@/lib/products";
import { productMargins } from "@/lib/ranking";
import { productDescription, SITE_URL } from "@/lib/seo";
import { KIND_LABEL, productSpecs } from "@/lib/specs";
import type { Product } from "@/lib/types";

export const revalidate = 3600;

// Lista de productos para Google Merchant Center (fichas gratis y anuncios de Shopping).
// Merchant Center la lee sola cada día desde https://terc.cl/google-productos.xml.
// Trae los productos visibles y con stock (equipos y Energía), con el mismo precio que ve el cliente.

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

// Categoría de Google para Energía (lista oficial de Google, ver
// https://www.google.com/basepages/producttype/taxonomy-with-ids.es-ES.txt).
// 1348 = UPS, 276 = Pilas y baterías, 5142 = Inversores de corriente, 6817 = Controladores de carga,
// 4714 = Paneles solares, 2345 = Cables eléctricos, 503729 = Conectores y terminales,
// 1436 = Alumbrado de emergencia, 594 = Iluminación.
function energyGoogleCategory(cat: EnergyCategory, product: Product): number {
  const text = product.name.toLowerCase();
  switch (cat.name) {
    case "Respaldo (UPS)":
      return 1348;
    case "Baterías de litio":
      return 276;
    case "Inversores y reguladores":
      return /regulador|controlador|mppt|pwm/.test(text) ? 6817 : 5142;
    case "Paneles solares":
      return 4714;
    case "Cables y conectores":
      return /conector|mc4|terminal/.test(text) && !/cable/.test(text) ? 503729 : 2345;
    default:
      return /emergencia|respaldo|recargable/.test(text) ? 1436 : 594;
  }
}

// Ficha de Energía (TERC 2.1): producto NUEVO, garantía de fábrica, solo venta (nunca instalación).
// - No dice "reacondicionado" ni promete envío a todo Chile.
// - shipping_label "energia": en Merchant Center se le crea un envío aparte (solo Región
//   Metropolitana), para que Google no muestre la tarifa de courier de los computadores.
// - Sin GTIN: los productos de Esol no traen código de barras en la lista. Google igual los
//   muestra (con un aviso de "rendimiento limitado"); si un fabricante lo publica, se puede agregar.
function energyItem(product: Product, cat: EnergyCategory, margin: number | undefined): string {
  const images = [product.image_url, ...product.images].filter((src): src is string => Boolean(src)).map(feedImage);
  const warranty = product.warranty_months ? `${product.warranty_months} meses de garantía de fábrica` : "Garantía de fábrica";
  const highlights = [
    "Producto nuevo, sellado de fábrica",
    warranty,
    "Boleta o factura de Wiremax Telecomunicaciones SpA",
    "Entrega coordinada en la Región Metropolitana",
    "Asesoría por WhatsApp antes de comprar",
  ];
  const lines = [
    tag("id", product.id),
    tag("title", product.name.slice(0, 150)),
    tag("description", (product.description || productDescription(product)).slice(0, 5000)),
    tag("link", `${SITE_URL}/producto/${product.slug}`),
    ...(images[0] ? [tag("image_link", images[0])] : []),
    ...images.slice(1, 11).map((src) => tag("additional_image_link", src)),
    // Energía se pide al proveedor después de la compra (stock "sin límite" en la tienda): a Google
    // se informa "a pedido" con fecha estimada, para no decir "en stock" de algo no confirmado.
    tag("availability", product.stock > 0 ? "backorder" : "out_of_stock"),
    ...(product.stock > 0 ? [tag("availability_date", energyAvailabilityDate())] : []),
    tag("condition", "new"),
    tag("brand", product.brand),
    tag("google_product_category", energyGoogleCategory(cat, product)),
    tag("product_type", `Energía > ${cat.name}`),
    tag("shipping_label", "energia"),
    ...highlights.map((text) => tag("product_highlight", text)),
    tag("custom_label_0", marginLabel(margin)),
    tag("custom_label_1", cat.name),
    tag("custom_label_2", "energia"),
    tag("custom_label_3", priceRange(product.price)),
  ];
  if (product.compare_price && product.compare_price > product.price) {
    lines.push(tag("price", `${product.compare_price} CLP`), tag("sale_price", `${product.price} CLP`));
    if (product.offer_ends_at) lines.push(tag("sale_price_effective_date", `${todayInChile()}T00:00-03:00/${product.offer_ends_at}T23:59-03:00`));
  } else {
    lines.push(tag("price", `${product.price} CLP`));
  }
  return `<item>${lines.join("")}</item>`;
}

// Rango de precio (custom_label_3), para no gastar anuncios en productos de millones que casi
// nadie compra por internet, o para pujar distinto según el ticket.
function priceRange(price: number): string {
  if (price < 1_000_000) return "bajo-1-millon";
  if (price < 5_000_000) return "1-a-5-millones";
  return "sobre-5-millones";
}

// Energía: disponible a pedido en unos 3 días hábiles desde hoy (plazo aproximado del proveedor).
function energyAvailabilityDate(): string {
  const d = new Date(`${todayInChile()}T12:00:00Z`);
  for (let left = ENERGY_INFO.deliveryDays; left > 0; ) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) left--;
  }
  return `${d.toISOString().slice(0, 10)}T12:00-03:00`;
}

// Computadores: a Google va el precio con tarjeta (otros medios de pago), que es el que cualquiera
// puede pagar; el de transferencia es un descuento por medio de pago (Raúl, 26-11-2026).
function item(product: Product, margin: number | undefined): string {
  const cat = energyCategory(product.category);
  if (cat) return energyItem(product, cat, margin);
  const images = [product.image_url, ...product.images].filter((src): src is string => Boolean(src)).map(feedImage);
  const specs = productSpecs(product);
  const months = product.warranty_months || 12;
  const highlights = [
    `${months} meses de garantía TERC`,
    "Revisado y probado uno por uno",
    windowsLabel((product.description ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")),
    specs.kind === "notebook" ? "Incluye cargador" : "Incluye cable de poder",
    "Soporte por WhatsApp antes y después de la compra",
    "Boleta o factura de Wiremax Telecomunicaciones SpA",
  ].filter((x): x is string => Boolean(x));
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
    // Envío por courier a todo Chile (en Merchant Center: política "Computadores - courier").
    tag("shipping_label", "computadores"),
    tag("custom_label_1", KIND_LABEL[specs.kind]),
    tag("custom_label_2", "computadores"),
    tag("custom_label_3", priceRange(product.price)),
  ];
  if (product.compare_price && product.compare_price > product.price) {
    lines.push(tag("price", `${cardPrice(product.compare_price!)} CLP`), tag("sale_price", `${cardPrice(product.price)} CLP`));
    // La oferta termina sola a medianoche del último día (hora de Chile).
    if (product.offer_ends_at) lines.push(tag("sale_price_effective_date", `${todayInChile()}T00:00-03:00/${product.offer_ends_at}T23:59-03:00`));
  } else {
    lines.push(tag("price", `${cardPrice(product.price)} CLP`));
  }
  return `<item>${lines.join("")}</item>`;
}

export async function GET() {
  const [products, { margins }] = await Promise.all([
    listProducts().catch(() => []),
    productMargins().catch(() => ({ margins: new Map<string, number>() })),
  ]);
  // Sin foto real, Google rechaza el producto (la imagen de Terqui "aún no tiene foto" tampoco
  // sirve): mejor no enviarlo. Desde el 24-11-2026 también van los de Energía (pedido de Raúl).
  const items = products.filter(hasRealPhoto).map((p) => item(p, margins.get(p.id)));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>TERC</title><link>${SITE_URL}</link><description>Equipos reacondicionados con garantía y productos de Energía nuevos</description>${items.join("")}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
