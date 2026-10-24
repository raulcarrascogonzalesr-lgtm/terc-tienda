import { requireAdmin } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase";
import type { AdminProduct, Campaign, Coupon, ExtraCost, Movement, Order, Quote } from "@/lib/types";

// Estos datos son privados: cada lectura revisa primero que entró el administrador.
function db() {
  const supabase = getAdminClient();
  if (!supabase) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY");
  return supabase;
}

export async function listOrders(limit = 200): Promise<Order[]> {
  await requireAdmin();
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
  await requireAdmin();
  if (!UUID.test(id)) return null;
  const { data, error } = await db().from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Order | null;
}

export async function listAllProducts(): Promise<AdminProduct[]> {
  await requireAdmin();
  const { data, error } = await db()
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as AdminProduct[];
}

export async function getProduct(id: string): Promise<AdminProduct | null> {
  await requireAdmin();
  if (!UUID.test(id)) return null;
  const { data, error } = await db().from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as AdminProduct | null;
}

export async function listMovements(): Promise<Movement[]> {
  await requireAdmin();
  const { data, error } = await db()
    .from("movements")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Movement[];
}

export async function listCampaigns(): Promise<Campaign[]> {
  await requireAdmin();
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
  await requireAdmin();
  const { data, error } = await db().from("settings").select("key, value");
  if (error) return {}; // la tabla puede no existir todavía
  return Object.fromEntries(data.map((row) => [row.key, row.value]));
}

// Solicitudes del formulario "Empresas y cotizaciones", las nuevas primero.
export async function listQuotes(): Promise<Quote[]> {
  await requireAdmin();
  const { data, error } = await db()
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return data as Quote[];
}

// Cuántas solicitudes faltan por responder, para el aviso del inicio.
export async function countNewQuotes(): Promise<number> {
  await requireAdmin();
  const { count, error } = await db()
    .from("quotes")
    .select("id", { count: "exact", head: true })
    .eq("status", "nueva");
  if (error) return 0; // la tabla puede no existir todavía
  return count ?? 0;
}

// Costos extra por venta (caja, relleno, comisión…), los de todos los productos primero.
export async function listExtraCosts(): Promise<ExtraCost[]> {
  const { data, error } = await db()
    .from("extra_costs")
    .select("*")
    .order("category", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: true });
  if (error) return []; // la tabla puede no existir todavía
  return (data as ExtraCost[]).map((c) => ({ ...c, percent: Number(c.percent) }));
}

// Cupones de descuento, los más nuevos primero.
export async function listCoupons(): Promise<Coupon[]> {
  await requireAdmin();
  const { data, error } = await db().from("coupons").select("*").order("created_at", { ascending: false });
  if (error) return []; // la tabla puede no existir todavía
  return data as Coupon[];
}
