import { todayInChile } from "./format";
import { getPublicClient } from "./supabase";
import { SAMPLE_PRODUCTS } from "./sample-products";
import type { Product } from "./types";

// Columnas públicas. El costo del proveedor nunca se envía al navegador.
const PRODUCT_COLUMNS =
  "id, slug, name, brand, category, grade, price, list_price, compare_price, offer_ends_at, stock, on_demand, battery_health, warranty_months, description, image_url, images, ship_weight_kg, ship_length_cm, ship_width_cm, ship_height_cm";

// Cuando pasa el último día de la oferta, el equipo vuelve solo a su precio de antes
// (también al pagar, porque el pago lee el precio desde aquí).
function withOfferExpiry(product: Product): Product {
  if (!product.offer_ends_at || product.offer_ends_at >= todayInChile()) return product;
  const before = product.compare_price && product.compare_price > product.price ? product.compare_price : product.price;
  return { ...product, price: before, compare_price: null, offer_ends_at: null };
}

export async function listProducts(): Promise<Product[]> {
  const supabase = getPublicClient();
  if (!supabase) return SAMPLE_PRODUCTS.map(withOfferExpiry);

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("active", true)
    .gt("stock", 0)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Product[]).map(withOfferExpiry);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = getPublicClient();
  if (!supabase) {
    const sample = SAMPLE_PRODUCTS.find((p) => p.slug === slug);
    return sample ? withOfferExpiry(sample) : null;
  }

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return data ? withOfferExpiry(data as Product) : null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const supabase = getPublicClient();
  if (!supabase) return SAMPLE_PRODUCTS.filter((p) => ids.includes(p.id)).map(withOfferExpiry);

  // Solo productos visibles: si uno se ocultó mientras estaba en un carrito, ya no se puede pagar.
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .in("id", ids)
    .eq("active", true);
  if (error) throw error;
  return (data as Product[]).map(withOfferExpiry);
}
