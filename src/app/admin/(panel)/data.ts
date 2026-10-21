import { getAdminClient } from "@/lib/supabase";
import type { AdminProduct, Campaign, Movement, Order } from "@/lib/types";

function db() {
  const supabase = getAdminClient();
  if (!supabase) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY");
  return supabase;
}

export async function listOrders(limit = 200): Promise<Order[]> {
  const { data, error } = await db()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as Order[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getOrder(id: string): Promise<Order | null> {
  if (!UUID.test(id)) return null;
  const { data, error } = await db().from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Order | null;
}

export async function listAllProducts(): Promise<AdminProduct[]> {
  const { data, error } = await db()
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as AdminProduct[];
}

export async function getProduct(id: string): Promise<AdminProduct | null> {
  if (!UUID.test(id)) return null;
  const { data, error } = await db().from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as AdminProduct | null;
}

export async function listMovements(): Promise<Movement[]> {
  const { data, error } = await db()
    .from("movements")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Movement[];
}

export async function listCampaigns(): Promise<Campaign[]> {
  const { data, error } = await db()
    .from("campaigns")
    .select("*")
    .order("active", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Campaign[];
}

// Todo lo que necesitan las páginas de números, en una sola llamada.
export async function loadBusiness() {
  const [orders, products, movements, campaigns] = await Promise.all([
    listOrders(1000), // máximo que entrega Supabase por consulta
    listAllProducts(),
    listMovements(),
    listCampaigns(),
  ]);
  return { orders, products, movements, campaigns };
}

// Ajustes guardados del panel (por ahora, la tasa de PPM de Wiremax).
export async function getSettings(): Promise<Record<string, string>> {
  const { data, error } = await db().from("settings").select("key, value");
  if (error) return {}; // la tabla puede no existir todavía
  return Object.fromEntries(data.map((row) => [row.key, row.value]));
}
