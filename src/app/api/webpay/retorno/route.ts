import { after, NextResponse } from "next/server";
import { sendOrderEmailOnce } from "@/lib/order-emails";
import { getAdminClient } from "@/lib/supabase";
import {
  commitWebpayTransaction,
  getWebpayConfig,
  getWebpayTransaction,
  isWebpayApproved,
  type WebpayResult,
} from "@/lib/webpay";

// Webpay devuelve aquí al cliente, por POST o por GET según el caso:
// - token_ws: el cliente pagó (o la tarjeta fue rechazada) y hay que confirmar.
// - TBK_TOKEN: el cliente anuló el pago en Webpay.
// - solo TBK_ID_SESION: se acabó el tiempo en el formulario de Webpay.
async function handle(request: Request) {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);
  if (request.method === "POST") {
    const form = await request.formData().catch(() => null);
    form?.forEach((value, key) => typeof value === "string" && params.set(key, value));
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? url.origin;
  const go = (estado: string, orderId?: string) =>
    NextResponse.redirect(
      `${siteUrl}/pago/${estado}${orderId ? `?external_reference=${orderId}` : ""}`,
      303,
    );

  const config = getWebpayConfig();
  const supabase = getAdminClient();
  const token = params.get("token_ws");

  if (!token) {
    const orderId = params.get("TBK_ID_SESION");
    if (orderId && supabase) {
      await supabase.from("orders").update({ status: "failed" }).eq("id", orderId).eq("status", "pending");
    }
    return go("error");
  }
  if (!config || !supabase) return go("error");

  // Confirmar el pago. Si ya se había confirmado (el cliente recargó), se consulta el estado.
  let result: WebpayResult;
  try {
    result = await commitWebpayTransaction(config, token);
  } catch (err) {
    try {
      result = await getWebpayTransaction(config, token);
    } catch {
      console.error("No se pudo confirmar el pago Webpay", err);
      return go("error");
    }
  }

  const orderId = result.session_id;
  const { data: order } = await supabase.from("orders").select("id, total").eq("id", orderId).maybeSingle();
  if (!order) {
    console.error("Pago Webpay sin pedido", result.buy_order);
    return go("error");
  }

  const paymentId = `webpay${config.isTest ? "-prueba" : ""}:${result.buy_order}:${result.authorization_code ?? ""}`;
  // El monto cobrado debe coincidir con el total del pedido guardado.
  if (isWebpayApproved(result) && result.amount === order.total) {
    // La función mark_order_paid descuenta stock una sola vez por pedido.
    const { error } = await supabase.rpc("mark_order_paid", {
      p_order_id: orderId,
      p_payment_id: paymentId,
    });
    if (error) console.error("No se pudo marcar el pedido como pagado", error);
    else after(() => sendOrderEmailOnce(orderId, "paid"));
    return go("exito", orderId);
  }

  if (isWebpayApproved(result)) console.error("Webpay cobró un monto distinto al pedido", orderId, result.amount);
  await supabase
    .from("orders")
    .update({ status: "failed", payment_id: paymentId })
    .eq("id", orderId)
    .eq("status", "pending");
  return go("error");
}

export const GET = handle;
export const POST = handle;
