import { NextResponse } from "next/server";
import { checkCoupon } from "@/lib/coupons";
import { getProductsByIds } from "@/lib/products";
import { getAdminClient } from "@/lib/supabase";

// El carrito pregunta aquí si un cupón sirve, para mostrar el descuento antes de pagar.
// Al pagar se vuelve a revisar todo en /api/checkout.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { code?: unknown; productIds?: unknown; email?: unknown }
    | null;
  const ids = Array.isArray(body?.productIds) ? body.productIds.map(String).slice(0, 50) : [];
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Los cupones no están disponibles" }, { status: 503 });

  const products = ids.length ? await getProductsByIds(ids) : [];
  const email = typeof body?.email === "string" ? body.email.trim() : undefined;
  const result = await checkCoupon(supabase, body?.code, products, undefined, email);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({
    code: result.coupon.code,
    productId: result.product.id,
    productName: result.product.name,
    discount: result.discount,
  });
}
