import type { SupabaseClient } from "@supabase/supabase-js";
import { todayInChile } from "./format";
import type { Coupon, Product } from "./types";

// Un pedido sin pagar guarda el cupón por este tiempo; si no se paga, el cupón vuelve a quedar libre.
export const COUPON_HOLD_MINUTES = 30;

// Estados en que un pedido ya usó el cupón (los cancelados lo devuelven).
const USED_STATUSES = ["paid", "shipped", "delivered"];

export function normalizeCode(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().toUpperCase().replace(/\s+/g, "") : "";
}

export function describeCoupon(coupon: Pick<Coupon, "kind" | "value">, format: (n: number) => string): string {
  return coupon.kind === "percent" ? `${coupon.value}%` : format(coupon.value);
}

// Precio de una unidad con el cupón. El cupón no se suma a una oferta: se calcula sobre el
// precio de antes de la oferta y el cliente paga el más bajo de los dos.
export function couponUnitPrice(coupon: Pick<Coupon, "kind" | "value">, product: Pick<Product, "price" | "compare_price">) {
  const base = product.compare_price && product.compare_price > product.price ? product.compare_price : product.price;
  const off = coupon.kind === "percent" ? Math.round((base * coupon.value) / 100) : coupon.value;
  return Math.min(product.price, Math.max(base - off, 1));
}

export type CouponCheck =
  | { ok: true; coupon: Coupon; product: Product; unitPrice: number; discount: number }
  | { ok: false; error: string };

// Revisa que el cupón exista, esté vigente, sea para un equipo del carrito y le quede algún uso.
// `orderId` es el pedido que lo está usando, para no contarlo dos veces; `email`, el del cliente.
export async function checkCoupon(
  supabase: SupabaseClient,
  rawCode: unknown,
  products: Product[],
  orderId?: string,
  email?: string,
): Promise<CouponCheck> {
  const code = normalizeCode(rawCode);
  if (!code) return { ok: false, error: "Escribe el código del cupón" };

  const { data: coupon } = await supabase.from("coupons").select("*").eq("code", code).maybeSingle();
  if (!coupon || !coupon.active) return { ok: false, error: "Ese cupón no existe o ya no está activo" };
  if (coupon.expires_on && coupon.expires_on < todayInChile()) return { ok: false, error: "Ese cupón ya venció" };

  // Un cupón sin equipo fijo (código de amigo o su premio) descuenta en el equipo más caro del carrito.
  const product = coupon.product_id
    ? products.find((p) => p.id === coupon.product_id)
    : [...products].sort((a, b) => b.price - a.price)[0];
  if (!product) {
    return {
      ok: false,
      error: coupon.product_id
        ? "Ese cupón es para otro equipo. Agrégalo al carrito para usarlo."
        : "Agrega un equipo al carrito para usar el cupón",
    };
  }
  if (coupon.referrer_email && email && coupon.referrer_email === email.trim().toLowerCase()) {
    return { ok: false, error: "Ese es tu propio código de amigo: es para que lo usen las personas a las que se lo compartes" };
  }

  const used = await countCouponUses(supabase, code, orderId, email).catch(() => null);
  if (used === null) return { ok: false, error: "No pudimos revisar el cupón. Intenta de nuevo." };
  if (used >= coupon.max_uses) {
    return { ok: false, error: "Ese cupón ya fue usado o hay otra compra en curso con él" };
  }

  const unitPrice = couponUnitPrice(coupon, product);
  const discount = product.price - unitPrice;
  if (discount <= 0) {
    return { ok: false, error: "Este equipo ya tiene una oferta mejor que tu cupón: no lo necesitas" };
  }
  return { ok: true, coupon: coupon as Coupon, product, unitPrice, discount };
}

// Pedidos pagados con el cupón, más los que se están pagando ahora (aún dentro del plazo).
// Un pedido sin pagar del mismo correo no cuenta: es el mismo cliente que volvió a intentar.
export async function countCouponUses(
  supabase: SupabaseClient,
  code: string,
  excludeOrderId?: string,
  email?: string,
) {
  const since = Date.now() - COUPON_HOLD_MINUTES * 60_000;
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, created_at, email:customer->>email")
    .eq("coupon_code", code);
  if (error) throw error; // ante la duda, el cupón no se acepta
  const sameCustomer = (e: unknown) => !!email && typeof e === "string" && e.toLowerCase() === email.toLowerCase();
  return data.filter(
    (o) =>
      o.id !== excludeOrderId &&
      (USED_STATUSES.includes(o.status) ||
        (o.status === "pending" && Date.parse(o.created_at) > since && !sameCustomer(o.email))),
  ).length;
}

// Cuántas veces se usó cada cupón (solo pedidos pagados), para el panel.
export function usesByCode(orders: { coupon_code?: string | null; status: string }[]) {
  const uses = new Map<string, number>();
  for (const o of orders) {
    if (o.coupon_code && USED_STATUSES.includes(o.status)) uses.set(o.coupon_code, (uses.get(o.coupon_code) ?? 0) + 1);
  }
  return uses;
}
