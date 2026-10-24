import { emailEnabled, escapeHtml, layout, sendMail } from "./email";
import { formatCLP, QUOTE_KIND_LABELS } from "./format";
import { courierLabel, isShippingZone } from "./shipping";
import { SITE } from "./site";
import { getAdminClient } from "./supabase";
import type { Order, Quote } from "./types";

type EmailKind = "paid" | "shipped";
const COLUMN = { paid: "paid_email_at", shipped: "shipped_email_at" } as const;
// Estados en que corresponde cada correo.
const STATUSES = { paid: ["paid", "shipped", "delivered"], shipped: ["shipped", "delivered"] } as const;

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://terc.cl";

// Número corto que ve el cliente, ej. "#3F9A1C2B".
export function orderNumber(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

function firstName(order: Order): string {
  return (order.customer.name ?? "").trim().split(/\s+/)[0] ?? "";
}

function courierOf(order: Order): string | null {
  if (order.shipping_zone.startsWith("shipit:")) return courierLabel(order.shipping_zone.slice(7));
  return isShippingZone(order.shipping_zone) ? null : order.shipping_zone;
}

function itemsTable(order: Order): string {
  const row = (left: string, right: string, style = "") =>
    `<tr><td style="padding:6px 0;${style}">${left}</td><td align="right" style="padding:6px 0;white-space:nowrap;${style}">${right}</td></tr>`;
  const lines = order.items
    .map((i) => row(`${i.quantity} × ${escapeHtml(i.name)}`, formatCLP(i.unit_price * i.quantity)))
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin:12px 0">
    ${lines}
    ${row("Envío", formatCLP(order.shipping_cost), "color:#6b716f")}
    ${row("<strong>Total pagado</strong>", `<strong>${formatCLP(order.total)}</strong>`, "border-top:1px solid #e4e2dc")}
  </table>`;
}

function itemsText(order: Order): string {
  return [
    ...order.items.map((i) => `${i.quantity} x ${i.name}: ${formatCLP(i.unit_price * i.quantity)}`),
    `Envío: ${formatCLP(order.shipping_cost)}`,
    `Total pagado: ${formatCLP(order.total)}`,
  ].join("\n");
}

function addressOf(order: Order): string {
  const c = order.customer;
  return [c.address, c.comuna, c.region].filter(Boolean).join(", ");
}

const help = `<p style="margin:20px 0 0">¿Tienes alguna duda? Responde este correo${
  SITE.whatsapp ? ` o escríbenos por <a href="https://wa.me/${SITE.whatsapp}" style="color:#288868">WhatsApp</a>` : ""
}.</p>`;
const helpText = `¿Tienes alguna duda? Responde este correo${SITE.whatsapp ? ` o escríbenos por WhatsApp: https://wa.me/${SITE.whatsapp}` : ""}.`;

export function paidEmail(order: Order) {
  const number = orderNumber(order.id);
  const name = firstName(order);
  const html = layout(
    "Recibimos tu pago",
    `<p style="margin:0 0 12px;font-size:18px"><strong>¡Gracias por tu compra${name ? `, ${escapeHtml(name)}` : ""}!</strong></p>
    <p style="margin:0 0 12px">Recibimos tu pago y ya estamos preparando tu pedido <strong>${number}</strong>.</p>
    ${itemsTable(order)}
    <p style="margin:12px 0"><strong>Lo enviamos a:</strong><br>${escapeHtml(addressOf(order))}</p>
    <p style="margin:12px 0"><strong>¿Qué sigue?</strong> Revisamos y embalamos tu equipo. Cuando salga, te enviamos otro correo con el código de seguimiento.</p>
    <p style="margin:12px 0;color:#6b716f;font-size:13px">Guarda este correo como respaldo de tu compra.</p>
    ${help}`,
  );
  const text = [
    `¡Gracias por tu compra${name ? `, ${name}` : ""}!`,
    `Recibimos tu pago y ya estamos preparando tu pedido ${number}.`,
    "",
    itemsText(order),
    "",
    `Lo enviamos a: ${addressOf(order)}`,
    "",
    "¿Qué sigue? Revisamos y embalamos tu equipo. Cuando salga, te enviamos otro correo con el código de seguimiento.",
    "Guarda este correo como respaldo de tu compra.",
    "",
    helpText,
    "",
    "TERC · terc.cl",
  ].join("\n");
  return { subject: `Recibimos tu pago · Pedido TERC ${number}`, html, text };
}

export function shippedEmail(order: Order) {
  const number = orderNumber(order.id);
  const name = firstName(order);
  const courier = courierOf(order);
  const code = order.tracking_code ?? "";
  const where = courier ? `en el sitio de ${courier}` : "en el sitio del courier";
  const html = layout(
    "Tu pedido va en camino",
    `<p style="margin:0 0 12px;font-size:18px"><strong>¡Tu pedido va en camino${name ? `, ${escapeHtml(name)}` : ""}!</strong></p>
    <p style="margin:0 0 12px">Tu pedido <strong>${number}</strong> ya salió${courier ? ` por <strong>${escapeHtml(courier)}</strong>` : ""}.</p>
    <p style="margin:16px 0;padding:14px;background:#eef6f2;border-radius:8px;text-align:center">
      Código de seguimiento<br><span style="font-size:20px;font-weight:bold;letter-spacing:1px">${escapeHtml(code)}</span>
    </p>
    <p style="margin:12px 0">Puedes ver dónde va ${escapeHtml(where)} con ese código.</p>
    <p style="margin:12px 0"><strong>Dirección de entrega:</strong><br>${escapeHtml(addressOf(order))}</p>
    ${help}`,
  );
  const text = [
    `¡Tu pedido va en camino${name ? `, ${name}` : ""}!`,
    `Tu pedido ${number} ya salió${courier ? ` por ${courier}` : ""}.`,
    "",
    `Código de seguimiento: ${code}`,
    `Puedes ver dónde va ${where} con ese código.`,
    "",
    `Dirección de entrega: ${addressOf(order)}`,
    "",
    helpText,
    "",
    "TERC · terc.cl",
  ].join("\n");
  return { subject: `Tu pedido va en camino · Pedido TERC ${number}`, html, text };
}

// Aviso para TERC de que entró una venta.
function saleNotice(order: Order) {
  const number = orderNumber(order.id);
  const c = order.customer;
  const link = `${siteUrl()}/admin/pedidos/${order.id}`;
  const html = layout(
    "Nueva venta",
    `<p style="margin:0 0 12px;font-size:18px"><strong>Nueva venta ${number}</strong></p>
    ${itemsTable(order)}
    <p style="margin:12px 0"><strong>Cliente:</strong> ${escapeHtml(c.name ?? "")}<br>
    ${escapeHtml(c.email ?? "")} · ${escapeHtml(c.phone ?? "")}<br>
    ${escapeHtml(addressOf(order))}</p>
    <p style="margin:16px 0"><a href="${link}" style="display:inline-block;background:#288868;color:#ffffff;padding:10px 18px;border-radius:999px;text-decoration:none">Ver el pedido en el panel</a></p>`,
  );
  const text = [
    `Nueva venta ${number}`,
    "",
    itemsText(order),
    "",
    `Cliente: ${c.name ?? ""} · ${c.email ?? ""} · ${c.phone ?? ""}`,
    addressOf(order),
    "",
    `Ver el pedido: ${link}`,
  ].join("\n");
  return { subject: `Nueva venta ${formatCLP(order.total)} · ${number}`, html, text };
}

async function sendOrderEmail(order: Order, kind: EmailKind): Promise<boolean> {
  const to = order.customer.email;
  if (!to) return false;
  const mail = kind === "paid" ? paidEmail(order) : shippedEmail(order);
  const sent = await sendMail({ to, replyTo: SITE.email, ...mail });
  if (sent && kind === "paid") await sendMail({ to: SITE.email, replyTo: to, ...saleNotice(order) });
  return sent;
}

// Envía el correo de un pedido una sola vez, aunque se llame varias veces
// (Mercado Pago puede avisar el mismo pago más de una vez).
// Primero se marca el pedido; si el envío falla, se desmarca para poder reintentar.
export async function sendOrderEmailOnce(orderId: string, kind: EmailKind): Promise<void> {
  const supabase = getAdminClient();
  if (!supabase || !emailEnabled()) return;
  let claim = supabase
    .from("orders")
    .update({ [COLUMN[kind]]: new Date().toISOString() })
    .eq("id", orderId)
    .is(COLUMN[kind], null)
    .in("status", [...STATUSES[kind]]);
  if (kind === "shipped") claim = claim.not("tracking_code", "is", null);
  const { data, error } = await claim.select("*").maybeSingle();
  if (error) {
    console.error("No se pudo preparar el correo del pedido (¿falta ejecutar supabase/correos.sql?)", error);
    return;
  }
  if (!data) return; // ya enviado, o el pedido no está en el estado que corresponde
  if (!(await sendOrderEmail(data as Order, kind))) {
    await supabase.from("orders").update({ [COLUMN[kind]]: null }).eq("id", orderId);
  }
}

// Reenvío a pedido del administrador (por ejemplo, si el cliente no lo recibió).
export async function resendOrderEmail(orderId: string, kind: EmailKind): Promise<boolean> {
  const supabase = getAdminClient();
  if (!supabase) return false;
  const { data } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  const order = data as Order | null;
  if (!order || !(STATUSES[kind] as readonly string[]).includes(order.status)) return false;
  if (kind === "shipped" && !order.tracking_code) return false;
  const mail = kind === "paid" ? paidEmail(order) : shippedEmail(order);
  const sent = order.customer.email ? await sendMail({ to: order.customer.email, replyTo: SITE.email, ...mail }) : false;
  if (sent) await supabase.from("orders").update({ [COLUMN[kind]]: new Date().toISOString() }).eq("id", orderId);
  return sent;
}

// Aviso para TERC de una nueva solicitud de cotización. Responder el correo le escribe al cliente.
export async function sendQuoteNotice(quote: Omit<Quote, "id" | "created_at" | "status">): Promise<void> {
  const kind = QUOTE_KIND_LABELS[quote.kind] ?? quote.kind;
  const link = `${siteUrl()}/admin/cotizaciones`;
  const details = [
    ["Nombre", quote.name],
    ["Empresa", quote.company],
    ["Correo", quote.email],
    ["Teléfono", quote.phone],
    ["Necesita", kind],
    ["Cantidad", quote.quantity ? String(quote.quantity) : null],
  ].filter((d): d is [string, string] => Boolean(d[1]));
  const html = layout(
    "Nueva cotización",
    `<p style="margin:0 0 12px;font-size:18px"><strong>Nueva solicitud de cotización</strong></p>
    <p style="margin:0 0 12px">${details.map(([k, v]) => `<strong>${k}:</strong> ${escapeHtml(v)}`).join("<br>")}</p>
    <p style="margin:12px 0;white-space:pre-line;padding:12px;background:#f4f3ef;border-radius:8px">${escapeHtml(quote.message)}</p>
    <p style="margin:12px 0;color:#6b716f;font-size:13px">Si respondes este correo, la respuesta le llega directo al cliente.</p>
    <p style="margin:16px 0"><a href="${link}" style="display:inline-block;background:#288868;color:#ffffff;padding:10px 18px;border-radius:999px;text-decoration:none">Ver cotizaciones en el panel</a></p>`,
  );
  const text = [
    "Nueva solicitud de cotización",
    "",
    ...details.map(([k, v]) => `${k}: ${v}`),
    "",
    quote.message,
    "",
    `Ver cotizaciones: ${link}`,
  ].join("\n");
  await sendMail({
    to: SITE.email,
    replyTo: quote.email,
    subject: `Nueva cotización: ${quote.company || quote.name} (${kind})`,
    html,
    text,
  });
}
