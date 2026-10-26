import { button, C, emailEnabled, escapeHtml, layout, sendMail, siteUrl, type MailPose } from "./email";
import { formatCLP, QUOTE_KIND_LABELS } from "./format";
import { courierLabel, isShippingZone } from "./shipping";
import { SITE } from "./site";
import { getAdminClient } from "./supabase";
import type { Order, Quote } from "./types";

export type EmailKind = "paid" | "shipped" | "delivered";
const COLUMN = { paid: "paid_email_at", shipped: "shipped_email_at", delivered: "delivered_email_at" } as const;
// Estados en que corresponde cada correo.
const STATUSES = {
  paid: ["paid", "shipped", "delivered"],
  shipped: ["shipped", "delivered"],
  delivered: ["delivered"],
} as const;

// Datos del catálogo que el pedido no guarda: foto y meses de garantía.
export type ItemInfo = { image_url: string | null; warranty_months: number | null };

// Número corto que ve el cliente, ej. "#3F9A1C2B".
export function orderNumber(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

// Elige siempre la misma variante para un mismo pedido, pero distinta entre pedidos.
function pick<T>(seed: string, options: T[]): T {
  const n = [...seed].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return options[n % options.length];
}

function firstName(order: Order): string {
  return (order.customer.name ?? "").trim().split(/\s+/)[0] ?? "";
}

function courierOf(order: Order): string | null {
  if (order.customer.courier) return order.customer.courier;
  if (order.shipping_zone.startsWith("shipit:")) return courierLabel(order.shipping_zone.slice(7));
  return isShippingZone(order.shipping_zone) ? null : order.shipping_zone;
}

function addressOf(order: Order): string {
  const c = order.customer;
  return [c.address, c.comuna, c.region].filter(Boolean).join(", ");
}

function whatsappUrl(text: string): string | null {
  return SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}` : null;
}

const DATOS_TERQUI = [
  "Antes de volver a la cancha, cada equipo pasa por revisión de batería, pantalla, teclado y puertos.",
  "Un equipo reacondicionado le da una segunda vida a la tecnología y evita que termine como basura electrónica.",
  "Si algo no te convence, escríbenos: te responde una persona de verdad, no un robot.",
];

// --- piezas de los correos ---

// Línea de avance del pedido: Pago recibido → En camino → Entregado.
function tracker(step: 0 | 1 | 2): string {
  const steps = ["Pago recibido", "En camino", "Entregado"];
  const cell = (label: string, i: number) => {
    const done = i <= step;
    const dot = done
      ? `<div style="width:30px;height:30px;line-height:30px;border-radius:50%;background:${i === step ? C.leaf : C.pine};color:#fff;font-weight:bold;font-size:15px;margin:0 auto">${i < step ? "&#10003;" : i + 1}</div>`
      : `<div style="width:26px;height:26px;line-height:26px;border-radius:50%;border:2px solid ${C.line};color:#b5bab8;font-weight:bold;font-size:14px;margin:0 auto">${i + 1}</div>`;
    return `<td align="center" width="33%" style="font-size:12px;color:${done ? C.pine : "#9aa09e"};font-weight:${i === step ? "bold" : "normal"}">${dot}<div style="margin-top:6px">${label}</div></td>`;
  };
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px">
    <tr>${steps.map(cell).join("")}</tr>
  </table>`;
}

function itemsCard(order: Order, info: Map<string, ItemInfo>): string {
  const rows = order.items
    .map((i) => {
      const img = info.get(i.product_id)?.image_url;
      const photo = img
        ? `<img src="${escapeHtml(img)}" width="64" height="64" alt="" style="display:block;width:64px;height:64px;object-fit:contain;border-radius:10px;background:#fff;border:1px solid ${C.line}">`
        : `<div style="width:64px;height:64px;border-radius:10px;background:${C.mint}"></div>`;
      return `<tr>
        <td width="76" style="padding:8px 0">${photo}</td>
        <td style="padding:8px 8px;font-size:14px;line-height:1.4">${escapeHtml(i.name)}<br><span style="color:${C.muted};font-size:13px">Cantidad: ${i.quantity}</span></td>
        <td align="right" style="padding:8px 0;font-size:14px;white-space:nowrap">${formatCLP(i.unit_price * i.quantity)}</td>
      </tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};border-radius:14px;padding:6px 14px;margin:0 0 18px">
    ${rows}${
      order.discount
        ? `
    <tr><td colspan="2" style="padding:10px 0 0;border-top:1px solid ${C.line};font-size:14px;color:${C.muted}">Cupón ${escapeHtml(order.coupon_code ?? "")}</td>
      <td align="right" style="padding:10px 0 0;border-top:1px solid ${C.line};font-size:14px;color:${C.muted}">−${formatCLP(order.discount)}</td></tr>`
        : ""
    }
    <tr><td colspan="2" style="padding:10px 0 4px;border-top:1px solid ${C.line};font-size:14px;color:${C.muted}">Envío</td>
      <td align="right" style="padding:10px 0 4px;border-top:1px solid ${C.line};font-size:14px;color:${C.muted}">${formatCLP(order.shipping_cost)}</td></tr>
    <tr><td colspan="2" style="padding:4px 0 10px;font-size:16px;font-weight:bold">Total pagado</td>
      <td align="right" style="padding:4px 0 10px;font-size:16px;font-weight:bold">${formatCLP(order.total)}</td></tr>
  </table>`;
}

function itemsText(order: Order): string {
  return [
    ...order.items.map((i) => `${i.quantity} x ${i.name}: ${formatCLP(i.unit_price * i.quantity)}`),
    ...(order.discount ? [`Cupón ${order.coupon_code ?? ""}: −${formatCLP(order.discount)}`] : []),
    `Envío: ${formatCLP(order.shipping_cost)}`,
    `Total pagado: ${formatCLP(order.total)}`,
  ].join("\n");
}

function warrantyMonths(order: Order, info: Map<string, ItemInfo>): number | null {
  const months = order.items.map((i) => info.get(i.product_id)?.warranty_months ?? 0).filter((m) => m > 0);
  return months.length ? Math.min(...months) : null;
}

const POLICY_URL = "https://terc.cl/garantia-y-devoluciones";

function warrantyCard(months: number | null): string {
  if (!months) return "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;border:2px dashed ${C.gold};border-radius:14px">
    <tr><td style="padding:14px 16px;font-size:14px;line-height:1.5">
      <div style="font-size:12px;letter-spacing:1px;color:${C.gold};font-weight:bold">TU GARANTÍA TERC</div>
      <div style="font-size:20px;font-weight:bold;margin:2px 0">${months} ${months === 1 ? "mes" : "meses"}</div>
      Guarda este correo: es el respaldo de tu compra si alguna vez necesitas usar la garantía.
      <a href="${POLICY_URL}" style="color:${C.pine}">Así funciona la garantía</a>.
    </td></tr>
  </table>`;
}

function infoBox(title: string, html: string): string {
  return `<p style="margin:0 0 18px"><strong>${title}</strong><br>${html}</p>`;
}

function terquiTip(order: Order): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:${C.mint};border-radius:14px">
    <tr><td style="padding:14px 16px;font-size:14px;line-height:1.5"><strong>Dato de Terqui:</strong> ${pick(order.id.split("").reverse().join(""), DATOS_TERQUI)}</td></tr>
  </table>`;
}

function contact(order: Order): string {
  const wa = whatsappUrl(`Hola TERC, tengo una consulta sobre mi pedido ${orderNumber(order.id)}`);
  return `<p style="margin:6px 0 0;text-align:center;color:${C.muted};font-size:14px">¿Dudas? Responde este correo${wa ? " o" : "."}</p>
    ${wa ? `<p style="margin:12px 0 0;text-align:center">${button(wa, "Escríbenos por WhatsApp", C.whatsapp)}</p>` : ""}`;
}

const helpText = `¿Dudas? Responde este correo${SITE.whatsapp ? ` o escríbenos por WhatsApp: https://wa.me/${SITE.whatsapp}` : "."}`;

// --- los correos ---

export function paidEmail(order: Order, info: Map<string, ItemInfo>) {
  const number = orderNumber(order.id);
  const name = firstName(order);
  const months = warrantyMonths(order, info);
  const pose = pick<MailPose>(order.id, ["celebra", "listo"]);
  const html = layout({
    preheader: `Recibimos tu pago del pedido ${number}. Ya lo estamos preparando.`,
    pose,
    title: `¡Gracias por tu compra${name ? `, ${escapeHtml(name)}` : ""}!`,
    intro: `Recibimos tu pago y ya estamos preparando tu pedido <strong style="color:${C.pine}">${number}</strong>.`,
    body: `${tracker(0)}
      ${itemsCard(order, info)}
      ${warrantyCard(months)}
      ${infoBox("Lo enviamos a", escapeHtml(addressOf(order)))}
      ${infoBox("¿Qué sigue?", "Revisamos tu equipo una última vez y lo embalamos con cariño. Cuando salga, te mandamos otro correo con el código de seguimiento.")}
      ${terquiTip(order)}
      ${contact(order)}`,
  });
  const text = [
    `¡Gracias por tu compra${name ? `, ${name}` : ""}!`,
    `Recibimos tu pago y ya estamos preparando tu pedido ${number}.`,
    "",
    itemsText(order),
    months ? `Garantía TERC: ${months} meses. Guarda este correo como respaldo. Cómo funciona: ${POLICY_URL}` : "",
    "",
    `Lo enviamos a: ${addressOf(order)}`,
    "Cuando salga, te mandamos otro correo con el código de seguimiento.",
    "",
    helpText,
    "",
    "TERC · terc.cl",
  ].join("\n");
  return { subject: `¡Recibimos tu pago! Pedido TERC ${number}`, html, text };
}

export function shippedEmail(order: Order) {
  const number = orderNumber(order.id);
  const name = firstName(order);
  const courier = courierOf(order);
  const code = order.tracking_code ?? "";
  const where = courier ? `en el sitio de ${courier}` : "en el sitio del courier";
  const html = layout({
    preheader: `Tu pedido ${number} ya salió. Código de seguimiento: ${code}`,
    pose: "caja",
    title: `¡Tu pedido va en camino${name ? `, ${escapeHtml(name)}` : ""}!`,
    intro: `Terqui ya lo entregó${courier ? ` a <strong style="color:${C.pine}">${escapeHtml(courier)}</strong>` : " al courier"} y va directo a tu casa.`,
    body: `${tracker(1)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;background:${C.pine};border-radius:14px">
        <tr><td align="center" style="padding:18px 16px;color:#ffffff">
          <div style="font-size:12px;letter-spacing:1px;color:${C.gold};font-weight:bold">CÓDIGO DE SEGUIMIENTO</div>
          <div style="font-size:26px;font-weight:bold;letter-spacing:2px;margin:6px 0">${escapeHtml(code)}</div>
          <div style="font-size:13px;opacity:.8">Puedes ver dónde va ${escapeHtml(where)} con este código.</div>
        </td></tr>
      </table>
      ${infoBox("Dirección de entrega", escapeHtml(addressOf(order)))}
      ${infoBox(
        "Cuando llegue",
        "Revisa que la caja venga cerrada y en buen estado. Si ves algo raro, sácale una foto antes de abrirla y escríbenos.",
      )}
      ${contact(order)}`,
  });
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

export function deliveredEmail(order: Order, info: Map<string, ItemInfo>) {
  const number = orderNumber(order.id);
  const name = firstName(order);
  const months = warrantyMonths(order, info);
  const pose = pick<MailPose>(order.id, ["corazon", "guino"]);
  const reactions: [string, string, string][] = [
    ["&#128525;", "Me encantó", `Hola TERC, ya me llegó el pedido ${number} ¡y me encantó!`],
    ["&#128578;", "Todo bien", `Hola TERC, ya me llegó el pedido ${number} y todo bien.`],
    ["&#128533;", "Un problema", `Hola TERC, me llegó el pedido ${number} pero tuve un problema:`],
  ];
  const buttons = SITE.whatsapp
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px"><tr>
        ${reactions
          .map(
            ([emoji, label, msg]) =>
              `<td align="center" width="33%" style="padding:0 4px"><a href="${escapeHtml(whatsappUrl(msg) ?? "")}" style="display:block;background:${C.paper};border:1px solid ${C.line};border-radius:14px;padding:12px 4px;text-decoration:none;color:${C.pine};font-size:13px"><span style="font-size:30px;line-height:1.2">${emoji}</span><br>${label}</a></td>`,
          )
          .join("")}
      </tr></table>`
    : "";
  const html = layout({
    preheader: `Tu pedido ${number} ya llegó. ¿Cómo te fue?`,
    pose,
    title: `¡Llegó tu pedido${name ? `, ${escapeHtml(name)}` : ""}!`,
    intro: "Esperamos que lo disfrutes mucho. Cuéntale a Terqui, ¿cómo te fue?",
    body: `${tracker(2)}
      ${buttons}
      ${warrantyCard(months)}
      ${infoBox(
        "Primeros pasos",
        "Cárgalo por completo antes de usarlo harto, revisa que esté todo lo que pediste y, si es un computador, deja que Windows termine sus actualizaciones.",
      )}
      ${terquiTip(order)}
      <p style="margin:0;text-align:center">${button(`${siteUrl()}/#equipos`, "Ver más equipos")}</p>`,
  });
  const text = [
    `¡Llegó tu pedido${name ? `, ${name}` : ""}!`,
    `Esperamos que disfrutes tu compra (pedido ${number}).`,
    "¿Cómo te fue? Responde este correo o escríbenos por WhatsApp, nos encanta saber.",
    months ? `Recuerda: tu equipo tiene ${months} meses de garantía TERC.` : "",
    "",
    helpText,
    "",
    "TERC · terc.cl",
  ].join("\n");
  return { subject: `¡Llegó tu pedido! ¿Cómo te fue? · TERC ${number}`, html, text };
}

// Aviso para TERC de que entró una venta.
export function saleNotice(order: Order, info: Map<string, ItemInfo>) {
  const number = orderNumber(order.id);
  const c = order.customer;
  const link = `${siteUrl()}/admin/pedidos/${order.id}`;
  const html = layout({
    preheader: `${formatCLP(order.total)} · ${c.name ?? ""}`,
    pose: "celebra",
    title: `¡Nueva venta ${number}!`,
    intro: `${formatCLP(order.total)} · ${escapeHtml(c.name ?? "")}`,
    body: `${itemsCard(order, info)}
      ${infoBox("Cliente", `${escapeHtml(c.name ?? "")}${c.rut ? ` · RUT ${escapeHtml(c.rut)}` : ""}<br>${escapeHtml(c.email ?? "")} · ${escapeHtml(c.phone ?? "")}<br>${escapeHtml(addressOf(order))}${c.references ? `<br>Indicaciones: ${escapeHtml(c.references)}` : ""}${c.courier ? `<br>Courier que eligió: <strong>${escapeHtml(c.courier)}</strong>` : ""}`)}
      <p style="margin:0;text-align:center">${button(link, "Ver el pedido en el panel")}</p>`,
  });
  const text = [
    `Nueva venta ${number}`,
    "",
    itemsText(order),
    "",
    `Cliente: ${c.name ?? ""}${c.rut ? ` · RUT ${c.rut}` : ""} · ${c.email ?? ""} · ${c.phone ?? ""}`,
    addressOf(order),
    ...(c.references ? [`Indicaciones: ${c.references}`] : []),
    ...(c.courier ? [`Courier que eligió: ${c.courier}`] : []),
    "",
    `Ver el pedido: ${link}`,
  ].join("\n");
  return { subject: `Nueva venta ${formatCLP(order.total)} · ${number}`, html, text };
}

async function itemInfo(order: Order): Promise<Map<string, ItemInfo>> {
  const supabase = getAdminClient();
  const ids = order.items.map((i) => i.product_id);
  if (!supabase || !ids.length) return new Map();
  const { data } = await supabase.from("products").select("id, image_url, warranty_months").in("id", ids);
  return new Map((data ?? []).map((p) => [p.id as string, p as ItemInfo]));
}

async function sendOrderEmail(order: Order, kind: EmailKind): Promise<boolean> {
  const to = order.customer.email;
  if (!to) return false;
  const info = await itemInfo(order);
  const mail = kind === "paid" ? paidEmail(order, info) : kind === "shipped" ? shippedEmail(order) : deliveredEmail(order, info);
  const sent = await sendMail({ to, replyTo: SITE.email, ...mail });
  if (sent && kind === "paid") await sendMail({ to: SITE.email, replyTo: to, ...saleNotice(order, info) });
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
// No repite el aviso de venta para TERC.
export async function resendOrderEmail(orderId: string, kind: EmailKind): Promise<boolean> {
  const supabase = getAdminClient();
  if (!supabase) return false;
  const { data } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  const order = data as Order | null;
  if (!order || !(STATUSES[kind] as readonly string[]).includes(order.status)) return false;
  if (kind === "shipped" && !order.tracking_code) return false;
  const to = order.customer.email;
  if (!to) return false;
  const info = await itemInfo(order);
  const mail = kind === "paid" ? paidEmail(order, info) : kind === "shipped" ? shippedEmail(order) : deliveredEmail(order, info);
  const sent = await sendMail({ to, replyTo: SITE.email, ...mail });
  if (sent) await supabase.from("orders").update({ [COLUMN[kind]]: new Date().toISOString() }).eq("id", orderId);
  return sent;
}

// Aviso para TERC de una nueva solicitud de cotización. Responder el correo le escribe al cliente.
export function quoteNotice(quote: Omit<Quote, "id" | "created_at" | "status">) {
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
  const html = layout({
    preheader: `${quote.company || quote.name}: ${kind}`,
    pose: "lupa",
    title: "Nueva solicitud de cotización",
    intro: escapeHtml(`${quote.company || quote.name} · ${kind}`),
    body: `${infoBox("Datos", details.map(([k, v]) => `${k}: ${escapeHtml(v)}`).join("<br>"))}
      <p style="margin:0 0 18px;white-space:pre-line;padding:14px 16px;background:${C.paper};border-radius:14px">${escapeHtml(quote.message)}</p>
      <p style="margin:0 0 18px;color:${C.muted};font-size:13px">Si respondes este correo, la respuesta le llega directo al cliente.</p>
      <p style="margin:0;text-align:center">${button(link, "Ver cotizaciones en el panel")}</p>`,
  });
  const text = [
    "Nueva solicitud de cotización",
    "",
    ...details.map(([k, v]) => `${k}: ${v}`),
    "",
    quote.message,
    "",
    `Ver cotizaciones: ${link}`,
  ].join("\n");
  return { subject: `Nueva cotización: ${quote.company || quote.name} (${kind})`, html, text };
}

export async function sendQuoteNotice(quote: Omit<Quote, "id" | "created_at" | "status">): Promise<void> {
  await sendMail({ to: SITE.email, replyTo: quote.email, ...quoteNotice(quote) });
}
