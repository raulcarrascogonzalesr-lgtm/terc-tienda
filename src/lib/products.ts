import { todayInChile } from "./format";
import { getShippingFund } from "./shipping-fund";
import { getPublicClient } from "./supabase";
import { SAMPLE_PRODUCTS } from "./sample-products";
import type { Product } from "./types";

// Columnas públicas. El costo del proveedor nunca se envía al navegador.
const PRODUCT_COLUMNS =
  "id, sku, slug, name, brand, category, grade, price, list_price, compare_price, offer_ends_at, offer_name, offer_warranty_months, warranty_extra_price, stock, on_demand, battery_health, warranty_months, description, image_url, images, ship_weight_kg, ship_length_cm, ship_width_cm, ship_height_cm";

// Antes de correr oferta-4-dias-terqui-2026-11.sql estas dos columnas no existen: la tienda sigue sin ellas.
const BASE_COLUMNS = PRODUCT_COLUMNS.replace(" offer_warranty_months, warranty_extra_price,", "");

type Query = (columns: string) => PromiseLike<{ data: unknown; error: { code?: string } | null }>;
async function selectProducts(query: Query) {
  const first = await query(PRODUCT_COLUMNS);
  return first.error?.code === "42703" ? query(BASE_COLUMNS) : first; // 42703 = columna no existe
}

// Oferta con garantía reducida: mientras dura, el equipo trae menos meses y en el carrito se
// ofrece volver a la garantía normal por un pago único.
function withOfferWarranty(product: Product): Product {
  const reduced = product.offer_warranty_months;
  if (!product.compare_price || !reduced || reduced >= product.warranty_months) return { ...product, warranty_upgrade: null };
  const price = product.warranty_extra_price;
  return {
    ...product,
    warranty_months: reduced,
    warranty_upgrade: price && price > 0 ? { months: product.warranty_months, price } : null,
  };
}

// Cuando pasa el último día de la oferta, el equipo vuelve solo a su precio de antes y a su
// garantía normal (también al pagar, porque el pago lee el precio desde aquí).
function withOfferExpiry(product: Product): Product {
  if (!product.offer_ends_at || product.offer_ends_at >= todayInChile()) return withOfferWarranty(product);
  const before = product.compare_price && product.compare_price > product.price ? product.compare_price : product.price;
  return {
    ...product,
    price: before,
    compare_price: null,
    offer_ends_at: null,
    offer_name: null,
    offer_warranty_months: null,
    warranty_extra_price: null,
    warranty_upgrade: null,
  };
}

// El cliente ve el precio con el fondo de envío incluido (también el precio "antes" de una oferta,
// para que el descuento siga siendo el mismo). El panel sigue mostrando el precio guardado.
function withFund(fund: number) {
  return (product: Product): Product => {
    const p = withOfferExpiry(product);
    if (fund <= 0) return p;
    return { ...p, price: p.price + fund, compare_price: p.compare_price ? p.compare_price + fund : p.compare_price };
  };
}

export async function listProducts(): Promise<Product[]> {
  const supabase = getPublicClient();
  if (!supabase) return SAMPLE_PRODUCTS.map(withOfferExpiry);

  const [{ data, error }, fund] = await Promise.all([
    selectProducts((c) => supabase.from("products").select(c).eq("active", true).gt("stock", 0).order("created_at", { ascending: false })),
    getShippingFund(),
  ]);
  if (error) throw error;
  return (data as Product[]).map(withFund(fund));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = getPublicClient();
  if (!supabase) {
    const sample = SAMPLE_PRODUCTS.find((p) => p.slug === slug);
    return sample ? withOfferExpiry(sample) : null;
  }

  const [{ data, error }, fund] = await Promise.all([
    selectProducts((c) => supabase.from("products").select(c).eq("slug", slug).eq("active", true).maybeSingle()),
    getShippingFund(),
  ]);
  if (error) throw error;
  return data ? withFund(fund)(data as Product) : null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const supabase = getPublicClient();
  if (!supabase) return SAMPLE_PRODUCTS.filter((p) => ids.includes(p.id)).map(withOfferExpiry);

  // Solo productos visibles: si uno se ocultó mientras estaba en un carrito, ya no se puede pagar.
  const [{ data, error }, fund] = await Promise.all([
    selectProducts((c) => supabase.from("products").select(c).in("id", ids).eq("active", true)),
    getShippingFund(),
  ]);
  if (error) throw error;
  return (data as Product[]).map(withFund(fund));
}
