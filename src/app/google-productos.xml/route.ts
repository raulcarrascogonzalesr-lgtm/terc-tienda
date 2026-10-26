import { listProducts } from "@/lib/products";
import { productDescription, SITE_URL } from "@/lib/seo";
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

function item(product: Product): string {
  const images = [product.image_url, ...product.images].filter((src): src is string => Boolean(src));
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
  ];
  if (product.compare_price && product.compare_price > product.price) {
    lines.push(tag("price", `${product.compare_price} CLP`), tag("sale_price", `${product.price} CLP`));
  } else {
    lines.push(tag("price", `${product.price} CLP`));
  }
  return `<item>${lines.join("")}</item>`;
}

export async function GET() {
  const products = await listProducts().catch(() => []);
  // Sin foto, Google rechaza el producto: mejor no enviarlo.
  const items = products.filter((p) => p.image_url).map(item);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>TERC</title><link>${SITE_URL}</link><description>Equipos reacondicionados con garantía</description>${items.join("")}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
