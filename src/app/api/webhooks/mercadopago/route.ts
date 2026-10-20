import { NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { getMercadoPagoClient } from "@/lib/mercadopago";
import { getAdminClient } from "@/lib/supabase";

// Mercado Pago avisa aquí cuando cambia el estado de un pago.
// No confiamos en el contenido del aviso: consultamos el pago a Mercado Pago.
export async function POST(request: Request) {
  const url = new URL(request.url);
  const body = await request.json().catch(() => ({}));
  const type = body?.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const paymentId = body?.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");

  if (type !== "payment" || !paymentId) {
    return NextResponse.json({ ignored: true });
  }

  const mp = getMercadoPagoClient();
  const supabase = getAdminClient();
  if (!mp || !supabase) {
    return NextResponse.json({ error: "No configurado" }, { status: 503 });
  }

  const payment = await new Payment(mp).get({ id: String(paymentId) });
  const orderId = payment.external_reference;
  if (!orderId) return NextResponse.json({ ignored: true });

  const status =
    payment.status === "approved"
      ? "paid"
      : payment.status === "rejected" || payment.status === "cancelled"
        ? "failed"
        : "pending";

  // La función mark_order_paid descuenta stock una sola vez por pedido.
  if (status === "paid") {
    const { error } = await supabase.rpc("mark_order_paid", {
      p_order_id: orderId,
      p_payment_id: String(payment.id),
    });
    if (error) {
      console.error("No se pudo marcar el pedido como pagado", error);
      return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
    }
  } else {
    await supabase
      .from("orders")
      .update({ status, payment_id: String(payment.id) })
      .eq("id", orderId)
      .eq("status", "pending");
  }

  return NextResponse.json({ ok: true });
}
