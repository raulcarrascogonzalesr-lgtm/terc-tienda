import { getAdminClient } from "@/lib/supabase";
import type { AdminProduct, Order } from "@/lib/types";

function db() {
  const supabase = getAdminClient();
  if (!supabase) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY");
  return supabase;
}

export async function listOrders(): Promise<Order[]> {
  const { data, error } = await db()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
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
