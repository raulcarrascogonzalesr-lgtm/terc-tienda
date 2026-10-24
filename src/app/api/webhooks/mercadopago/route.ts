import { after, NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { getMercadoPagoClient } from "@/lib/mercadopago";
import { sendOrderEmailOnce } from "@/lib/order-emails";
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
    // Solo se da por pagado si Mercado Pago cobró al menos el total del pedido, en pesos.
    const { data: order } = await supabase.from("orders").select("total").eq("id", orderId).maybeSingle();
    if (!order) return NextResponse.json({ ignored: true });
    if (payment.currency_id !== "CLP" || (payment.transaction_amount ?? 0) < order.total) {
      console.error("El pago no coincide con el total del pedido", {
        orderId,
        paymentId: payment.id,
        cobrado: payment.transaction_amount,
        moneda: payment.currency_id,
        total: order.total,
      });
      return NextResponse.json({ ignored: true });
    }
    const { error } = await supabase.rpc("mark_order_paid", {
      p_order_id: orderId,
      p_payment_id: String(payment.id),
    });
    if (error) {
      console.error("No se pudo marcar el pedido como pagado", error);
      return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
    }
    // El correo de confirmación sale después de responder, una sola vez por pedido.
    after(() => sendOrderEmailOnce(orderId, "paid"));
  } else {
    await supabase
      .from("orders")
      .update({ status, payment_id: String(payment.id) })
      .eq("id", orderId)
      .eq("status", "pending");
  }

  return NextResponse.json({ ok: true });
}
