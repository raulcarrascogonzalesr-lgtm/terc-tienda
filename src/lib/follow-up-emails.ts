import { randomInt } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { button, C, emailEnabled, escapeHtml, layout, sendMail, siteUrl } from "./email";
import { getPreference, oneClickUnsubscribeUrl, unsubscribeUrl, type EmailPreference } from "./email-preferences";
import { formatCLP, todayInChile } from "./format";
import {
  firstName,
  infoBox,
  itemInfo,
  orderNumber,
  POLICY_URL,
  warrantyMonths,
  whatsappUrl,
} from "./order-emails";
import { SITE } from "./site";
import { getAdminClient } from "./supabase";
import type { Order } from "./types";

// Correos de seguimiento después de la entrega. Los revisa una vez al día la alarma de cPanel
// (Cron Job) que llama a /api/correos/seguimiento.
//
//   Día 10:  consejos para cuidar el equipo + pedir reseña        (a todos, salvo quien se dio de baja)
//   Día 30:  código para recomendar a un amigo                     (solo a quien aceptó recibir novedades)
//   Un mes antes de que venza la garantía: aviso para revisarlo   (a todos, salvo quien se dio de baja)
//   Cuando un amigo compra con el código (y pasan 10 días desde que le llega): premio para quien recomendó.

// Descuento del código de amigo y premio para quien recomienda, en pesos con IVA.
export const REFERRAL_AMOUNT = 10_000;
const REFERRAL_MAX_USES = 10;
const REWARD_VALID_DAYS = 365;

// Cuántos correos salen como máximo cada vez que corre la alarma (el hosting limita los envíos por hora).
const MAX_SENDS_PER_RUN = 20;

const DAY = 24 * 60 * 60 * 1000;

type FollowUpKind = "care" | "referral" | "warranty";
const COLUMN = { care: "care_email_at", referral: "referral_email_at", warranty: "warranty_email_at" } as const;

const longDate = new Intl.DateTimeFormat("es-CL", { dateStyle: "long", timeZone: "America/Santiago" });

function addMonths(iso: string, months: number): Date {
  const d = new Date(iso);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

// --- los correos ---

const CARE_TIPS: [string, string][] = [
  ["Que respire", "Úsalo sobre una superficie dura y deja libres las rejillas. El calor es lo que más acorta la vida de un equipo."],
  ["Limpieza suave", "Con el equipo apagado, pasa un paño seco o apenas húmedo por la pantalla y el teclado. Nada de alcohol puro ni limpiavidrios en la pantalla."],
  ["Al día", "Deja que Windows termine sus actualizaciones: traen arreglos de seguridad. Y reinícialo de vez en cuando, en vez de solo suspenderlo."],
];

export function careEmail(order: Order, unsubscribe: string) {
  const name = firstName(order);
  const review = SITE.reviewUrl
    ? `<p style="margin:0 0 6px;text-align:center">${button(SITE.reviewUrl, "Dejar mi reseña en Google")}</p>
       <p style="margin:0 0 18px;text-align:center;color:${C.muted};font-size:13px">Te toma un minuto y ayuda a que otros confíen en TERC.</p>`
    : `<p style="margin:0 0 18px;text-align:center">${button(
        whatsappUrl(`Hola TERC, les cuento cómo me ha ido con mi equipo (pedido ${orderNumber(order.id)}):`) ?? `mailto:${SITE.email}`,
        "Contarle a Terqui cómo me ha ido",
        SITE.whatsapp ? C.whatsapp : C.leaf,
      )}</p>`;
  const tips = CARE_TIPS.map(
    ([title, text], i) => `<tr>
      <td width="40" valign="top" style="padding:8px 0"><div style="width:30px;height:30px;line-height:30px;border-radius:50%;background:${C.leaf};color:#fff;font-weight:bold;text-align:center">${i + 1}</div></td>
      <td style="padding:8px 0;font-size:14px;line-height:1.5"><strong>${title}</strong><br>${text}</td>
    </tr>`,
  ).join("");
  const html = layout({
    preheader: "Tres consejos simples para que tu equipo te dure años.",
    pose: "listo",
    title: `¿Cómo va tu equipo${name ? `, ${escapeHtml(name)}` : ""}?`,
    intro: "Ya llevas unos días con él. Terqui te deja tres consejos para que te dure muchos años.",
    body: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:${C.paper};border-radius:14px;padding:6px 14px">${tips}</table>
      ${infoBox("¿Nos ayudas con tu opinión?", "Si te ha ido bien, contarlo ayuda muchísimo a una tienda que recién parte. Y si algo no te convence, también queremos saberlo.")}
      ${review}`,
    unsubscribeUrl: unsubscribe,
  });
  const text = [
    `¿Cómo va tu equipo${name ? `, ${name}` : ""}?`,
    "Terqui te deja tres consejos para que te dure muchos años:",
    "",
    ...CARE_TIPS.map(([title, tip], i) => `${i + 1}. ${title}: ${tip}`),
    "",
    SITE.reviewUrl
      ? `¿Nos ayudas con tu opinión? Deja tu reseña aquí: ${SITE.reviewUrl}`
      : "¿Nos ayudas con tu opinión? Responde este correo y cuéntanos cómo te ha ido.",
    "",
    "TERC · terc.cl",
    `No quiero recibir más correos: ${unsubscribe}`,
  ].join("\n");
  return { subject: "Terqui te deja 3 consejos para tu equipo", html, text };
}

export function referralEmail(order: Order, code: string, unsubscribe: string) {
  const name = firstName(order);
  const amount = formatCLP(REFERRAL_AMOUNT);
  const share = `Te recomiendo TERC (terc.cl), ahí compré mi equipo reacondicionado con garantía. Con mi código ${code} tienes ${amount} de descuento: ${siteUrl()}`;
  const html = layout({
    preheader: `Tu amigo recibe ${amount} de descuento y tú también.`,
    pose: "corazon",
    title: `Un regalo para compartir${name ? `, ${escapeHtml(name)}` : ""}`,
    intro: "¿Conoces a alguien que necesite un computador? Con tu código, los dos ganan.",
    body: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;background:${C.pine};border-radius:14px">
        <tr><td align="center" style="padding:18px 16px;color:#ffffff">
          <div style="font-size:12px;letter-spacing:1px;color:${C.gold};font-weight:bold">TU CÓDIGO DE AMIGO</div>
          <div style="font-size:26px;font-weight:bold;letter-spacing:2px;margin:6px 0">${escapeHtml(code)}</div>
          <div style="font-size:13px;opacity:.8">${amount} de descuento en cualquier equipo de terc.cl</div>
        </td></tr>
      </table>
      ${infoBox(
        "Así funciona",
        `1. Compártelo con quien quieras.<br>2. Tu amigo lo escribe en el carrito y paga ${amount} menos.<br>3. Cuando su equipo llegue y pasen 10 días, te mandamos un cupón de ${amount} para tu próxima compra.`,
      )}
      <p style="margin:0 0 8px;text-align:center">${button(`https://wa.me/?text=${encodeURIComponent(share)}`, "Compartir por WhatsApp", C.whatsapp)}</p>
      <p style="margin:0;text-align:center;color:${C.muted};font-size:12px">Sirve para ${REFERRAL_MAX_USES} compras de tus amigos. No se suma a otros cupones.</p>`,
    unsubscribeUrl: unsubscribe,
  });
  const text = [
    `Un regalo para compartir${name ? `, ${name}` : ""}`,
    "",
    `Tu código de amigo: ${code}`,
    `Tu amigo lo escribe en el carrito de terc.cl y paga ${amount} menos en cualquier equipo.`,
    `Cuando su equipo llegue y pasen 10 días, te mandamos un cupón de ${amount} para tu próxima compra.`,
    `Sirve para ${REFERRAL_MAX_USES} compras de tus amigos. No se suma a otros cupones.`,
    "",
    "TERC · terc.cl",
    `No quiero recibir más correos: ${unsubscribe}`,
  ].join("\n");
  return { subject: `Un regalo para tus amigos (y para ti): ${amount}`, html, text };
}

export function warrantyEmail(order: Order, ends: Date, unsubscribe: string) {
  const name = firstName(order);
  const date = longDate.format(ends);
  const wa = whatsappUrl(`Hola TERC, quiero revisar mi equipo antes de que venza la garantía (pedido ${orderNumber(order.id)}):`);
  const html = layout({
    preheader: `Si notas algo raro en tu equipo, escríbenos antes del ${date}.`,
    pose: "lupa",
    title: `Tu garantía vence el ${date}`,
    intro: `${name ? `${escapeHtml(name)}, te` : "Te"} avisamos con tiempo para que la aproveches si la necesitas.`,
    body: `${infoBox(
        "¿Notas algo raro?",
        "Una batería que dura menos, un ruido nuevo, una tecla que falla, algo en la pantalla o en los puertos. Si es así, escríbenos antes de esa fecha y lo revisamos sin costo, según la política de garantía.",
      )}
      ${infoBox("¿Todo bien?", "¡Genial! No tienes que hacer nada. Igual seguimos aquí si nos necesitas más adelante.")}
      ${wa ? `<p style="margin:0 0 10px;text-align:center">${button(wa, "Quiero que revisen mi equipo", C.whatsapp)}</p>` : ""}
      <p style="margin:0;text-align:center;font-size:14px"><a href="${POLICY_URL}" style="color:${C.pine}">Así funciona la garantía</a></p>`,
    unsubscribeUrl: unsubscribe,
  });
  const text = [
    `Tu garantía TERC vence el ${date}.`,
    "",
    "Si notas algo raro (batería, ruidos, teclado, pantalla o puertos), escríbenos antes de esa fecha y lo revisamos sin costo, según la política de garantía.",
    `Pedido ${orderNumber(order.id)}. Responde este correo${SITE.whatsapp ? ` o escríbenos por WhatsApp: https://wa.me/${SITE.whatsapp}` : "."}`,
    `Así funciona la garantía: ${POLICY_URL}`,
    "",
    "TERC · terc.cl",
    `No quiero recibir más correos: ${unsubscribe}`,
  ].join("\n");
  return { subject: `Tu garantía TERC vence el ${date}`, html, text };
}

export function rewardEmail(code: string, expires: string, unsubscribe: string) {
  const amount = formatCLP(REFERRAL_AMOUNT);
  const date = longDate.format(new Date(`${expires}T12:00:00Z`));
  const html = layout({
    preheader: `Un amigo compró con tu código. Aquí van ${amount} para ti.`,
    pose: "celebra",
    title: "¡Gracias por recomendarnos!",
    intro: "Un amigo tuyo compró en TERC con tu código. Como lo prometido es deuda, aquí va tu regalo.",
    body: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;border:2px dashed ${C.gold};border-radius:14px">
        <tr><td align="center" style="padding:16px">
          <div style="font-size:12px;letter-spacing:1px;color:${C.gold};font-weight:bold">TU CUPÓN DE ${amount}</div>
          <div style="font-size:26px;font-weight:bold;letter-spacing:2px;margin:6px 0">${escapeHtml(code)}</div>
          <div style="font-size:13px;color:${C.muted}">Para cualquier equipo de terc.cl, una vez, hasta el ${date}.</div>
        </td></tr>
      </table>
      <p style="margin:0;text-align:center">${button(`${siteUrl()}/#equipos`, "Ver equipos")}</p>`,
    unsubscribeUrl: unsubscribe,
  });
  const text = [
    "¡Gracias por recomendarnos!",
    "Un amigo tuyo compró en TERC con tu código. Aquí va tu regalo:",
    "",
    `Cupón de ${amount}: ${code}`,
    `Para cualquier equipo de terc.cl, una vez, hasta el ${date}.`,
    "",
    "TERC · terc.cl",
    `No quiero recibir más correos: ${unsubscribe}`,
  ].join("\n");
  return { subject: `¡Gracias! Aquí van ${amount} para tu próxima compra`, html, text };
}

// --- códigos de amigo y premios ---

function codeName(order: Order): string {
  const clean = firstName(order)
    .normalize("NFD")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase()
    .slice(0, 12);
  return clean || "TERC";
}

// Código de amigo del cliente: uno por correo, se crea la primera vez.
async function referralCode(supabase: SupabaseClient, email: string, order: Order): Promise<string | null> {
  const find = async () =>
    (await supabase.from("coupons").select("code").eq("referrer_email", email).maybeSingle()).data?.code as
      | string
      | undefined;
  const existing = await find();
  if (existing) return existing;
  for (let i = 0; i < 4; i++) {
    const code = `AMIGO-${codeName(order)}-${randomInt(100, 1000)}`;
    const { error } = await supabase.from("coupons").insert({
      code,
      product_id: null,
      kind: "amount",
      value: REFERRAL_AMOUNT,
      max_uses: REFERRAL_MAX_USES,
      note: `Código de amigo de ${email}`,
      referrer_email: email,
    });
    if (!error) return code;
    // Otro proceso ya le creó su código al mismo cliente.
    const raced = await find();
    if (raced) return raced;
  }
  console.error("No se pudo crear el código de amigo de", email);
  return null;
}

async function rewardCoupon(supabase: SupabaseClient, order: Order, referrer: string) {
  const expires = new Date(Date.now() + REWARD_VALID_DAYS * DAY);
  const expiresOn = todayInChile(expires);
  for (let i = 0; i < 4; i++) {
    const code = `GRACIAS-${randomInt(100000, 1000000)}`;
    const { error } = await supabase.from("coupons").insert({
      code,
      product_id: null,
      kind: "amount",
      value: REFERRAL_AMOUNT,
      max_uses: 1,
      expires_on: expiresOn,
      note: `Premio de ${referrer} por recomendar (pedido ${orderNumber(order.id)})`,
    });
    if (!error) return { code, expiresOn };
  }
  return null;
}

// --- la revisión diaria ---

// Marca el correo como enviado antes de mandarlo, para que dos revisiones a la vez no lo repitan.
async function claim(supabase: SupabaseClient, orderId: string, column: string): Promise<boolean> {
  const { data } = await supabase
    .from("orders")
    .update({ [column]: new Date().toISOString() })
    .eq("id", orderId)
    .is(column, null)
    .select("id")
    .maybeSingle();
  return Boolean(data);
}

async function release(supabase: SupabaseClient, orderId: string, column: string) {
  await supabase.from("orders").update({ [column]: null }).eq("id", orderId);
}

const emailOf = (order: Order) => (order.customer.email ?? "").trim().toLowerCase();

export type FollowUpReport = {
  sent: Record<FollowUpKind | "reward", number>;
  skipped: number; // marcados sin enviar: se dio de baja, sin permiso, o ya era tarde
  failed: number;
};

export async function runFollowUps(now = new Date()): Promise<FollowUpReport | { error: string }> {
  const supabase = getAdminClient();
  if (!supabase) return { error: "Falta SUPABASE_SERVICE_ROLE_KEY" };
  if (!emailEnabled()) return { error: "Falta SMTP_PASSWORD" };

  const report: FollowUpReport = { sent: { care: 0, referral: 0, warranty: 0, reward: 0 }, skipped: 0, failed: 0 };
  const total = () => Object.values(report.sent).reduce((a, b) => a + b, 0) + report.failed;
  const ago = (days: number) => new Date(now.getTime() - days * DAY).toISOString();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "delivered")
    .not("delivered_at", "is", null)
    .gte("delivered_at", ago(26 * 31)) // garantías de hasta 24 meses
    .lte("delivered_at", ago(10))
    .order("delivered_at");
  if (error) return { error: `No se pudieron leer los pedidos (¿falta ejecutar supabase/correos-seguimiento.sql?): ${error.message}` };
  const orders = (data ?? []) as Order[];

  const prefs = new Map<string, EmailPreference | null>();
  const pref = async (email: string) => {
    if (!prefs.has(email)) prefs.set(email, await getPreference(email));
    return prefs.get(email) ?? null;
  };

  // Envía un correo de seguimiento una sola vez; `send: false` lo deja marcado sin enviarlo.
  async function once(order: Order, kind: FollowUpKind, build: (() => Promise<Parameters<typeof sendMail>[0] | null>) | false) {
    const column = COLUMN[kind];
    if (!(await claim(supabase!, order.id, column))) return;
    if (!build) {
      report.skipped++;
      return;
    }
    const mail = await build();
    if (!mail) {
      report.skipped++;
      return;
    }
    if (await sendMail(mail)) report.sent[kind]++;
    else {
      report.failed++;
      await release(supabase!, order.id, column);
    }
  }

  for (const order of orders) {
    if (total() >= MAX_SENDS_PER_RUN) break;
    const email = emailOf(order);
    if (!email) continue;
    const delivered = new Date(order.delivered_at!).getTime();
    const days = (now.getTime() - delivered) / DAY;
    const p = await pref(email);
    const unsubscribed = Boolean(p?.unsubscribed_at);
    const unsubscribe = unsubscribeUrl(email);
    const base = { to: email, replyTo: SITE.email, listUnsubscribeUrl: oneClickUnsubscribeUrl(email) };

    // Día 10 a 30: cuidado del equipo. Pasado el día 30 ya no tiene sentido mandarlo.
    if (!order.care_email_at && days >= 10) {
      const late = days > 30;
      await once(order, "care", unsubscribed || late ? false : async () => ({ ...base, ...careEmail(order, unsubscribe) }));
    }

    // Día 30 a 60: código para recomendar. Es publicidad: solo con permiso.
    if (!order.referral_email_at && days >= 30 && total() < MAX_SENDS_PER_RUN) {
      const allowed = Boolean(p?.marketing_consent_at) && !unsubscribed && days <= 60;
      await once(
        order,
        "referral",
        allowed
          ? async () => {
              const code = await referralCode(supabase!, email, order);
              return code ? { ...base, ...referralEmail(order, code, unsubscribe) } : null;
            }
          : false,
      );
    }

    // Un mes antes de que venza la garantía (contada desde que recibió el equipo).
    if (!order.warranty_email_at && total() < MAX_SENDS_PER_RUN) {
      const info = await itemInfo(order);
      const months = warrantyMonths(order, info);
      const ends = months ? addMonths(order.delivered_at!, months) : null;
      const left = ends ? (ends.getTime() - now.getTime()) / DAY : 0;
      // Con garantías de 1 mes el aviso llegaría casi junto con el equipo: no se manda.
      const useless = !ends || months! < 2 || left < 3 || unsubscribed;
      if (useless) await once(order, "warranty", false);
      else if (left <= 30) await once(order, "warranty", async () => ({ ...base, ...warrantyEmail(order, ends, unsubscribe) }));
    }
  }

  // Premios: pedidos de amigos que usaron un código y ya pasaron 10 días desde que les llegó
  // (el plazo para arrepentirse de la compra).
  const withCode = orders.filter((o) => o.coupon_code && !o.referral_reward_at);
  if (withCode.length) {
    const codes = [...new Set(withCode.map((o) => o.coupon_code!))];
    const { data: referrals } = await supabase
      .from("coupons")
      .select("code, referrer_email")
      .in("code", codes)
      .not("referrer_email", "is", null);
    const referrerOf = new Map((referrals ?? []).map((c) => [c.code as string, c.referrer_email as string]));
    for (const order of withCode) {
      if (total() >= MAX_SENDS_PER_RUN) break;
      const referrer = referrerOf.get(order.coupon_code!);
      if (!referrer) continue;
      if (!(await claim(supabase, order.id, "referral_reward_at"))) continue;
      if (referrer === emailOf(order)) {
        report.skipped++; // se usó su propio código: no hay premio
        continue;
      }
      const reward = await rewardCoupon(supabase, order, referrer);
      if (!reward) {
        report.failed++;
        await release(supabase, order.id, "referral_reward_at");
        continue;
      }
      // El cupón queda creado aunque se haya dado de baja; solo no se le avisa por correo.
      if ((await pref(referrer))?.unsubscribed_at) {
        report.skipped++;
        continue;
      }
      const unsubscribe = unsubscribeUrl(referrer);
      const sent = await sendMail({
        to: referrer,
        replyTo: SITE.email,
        listUnsubscribeUrl: oneClickUnsubscribeUrl(referrer),
        ...rewardEmail(reward.code, reward.expiresOn, unsubscribe),
      });
      if (sent) report.sent.reward++;
      else report.failed++; // el cupón ya existe: se puede reenviar a mano desde el panel de cupones
    }
  }

  return report;
}
