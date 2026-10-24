import nodemailer, { type Transporter } from "nodemailer";
import { SITE } from "./site";

// Los correos salen desde la casilla contacto@terc.cl del hosting (cPanel), por SMTP.
// Solo hace falta cargar SMTP_PASSWORD en la app Node de cPanel; lo demás tiene valores por defecto.
// Sin contraseña la tienda funciona igual, pero no envía correos.
let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;
  const password = process.env.SMTP_PASSWORD;
  if (!password) return (transporter = null);
  const port = Number(process.env.SMTP_PORT ?? 465);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "s510.v2nets.com",
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER ?? SITE.email, pass: password },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
  return transporter;
}

export function emailEnabled(): boolean {
  return Boolean(process.env.SMTP_PASSWORD);
}

export type Mail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

// Envía un correo. Devuelve false si no está configurado o si el servidor lo rechazó.
export async function sendMail(mail: Mail): Promise<boolean> {
  const mailer = getTransporter();
  if (!mailer) return false;
  try {
    await mailer.sendMail({
      from: { name: "TERC", address: process.env.SMTP_USER ?? SITE.email },
      to: mail.to,
      replyTo: mail.replyTo,
      subject: mail.subject.replace(/[\r\n]+/g, " "),
      html: mail.html,
      text: mail.text,
    });
    return true;
  } catch (err) {
    console.error("No se pudo enviar el correo", mail.subject, err);
    return false;
  }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://terc.cl";

// Colores de la marca. Los programas de correo ignoran las hojas de estilo: todo va en línea.
export const C = {
  pine: "#0a2a2a",
  leaf: "#288868",
  mint: "#eaf5f0",
  gold: "#b3a26a",
  paper: "#f6f4ef",
  line: "#e4e2dc",
  muted: "#5f6866",
  whatsapp: "#1fa855",
};

const FONT = "'Montserrat',Arial,Helvetica,sans-serif";

export function button(href: string, label: string, color = C.leaf): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:${color};color:#ffffff;font-family:${FONT};font-size:15px;font-weight:bold;padding:13px 26px;border-radius:999px;text-decoration:none">${label}</a>`;
}

// Terqui animado (GIF en terc.cl/correo). Funciona en Gmail, Apple Mail y celulares;
// Outlook de escritorio muestra el primer cuadro.
export type MailPose = "celebra" | "listo" | "caja" | "corazon" | "guino" | "lupa" | "hola" | "carrito";

export function layout({
  preheader,
  pose,
  title,
  intro,
  body,
}: {
  preheader: string; // texto que se ve junto al asunto en la bandeja de entrada
  pose: MailPose;
  title: string;
  intro: string;
  body: string;
}): string {
  const whatsapp = SITE.whatsapp
    ? ` · <a href="https://wa.me/${SITE.whatsapp}" style="color:${C.leaf}">WhatsApp</a>`
    : "";
  return `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${C.paper};font-family:${FONT};color:${C.pine}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};padding:20px 10px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid ${C.line}">
        <tr><td align="center" style="background:${C.pine};padding:16px 24px">
          <a href="${siteUrl()}"><img src="${siteUrl()}/correo/logo.png" width="120" height="56" alt="TERC" style="display:block;border:0"></a>
        </td></tr>
        <tr><td align="center" style="background:${C.mint};padding:22px 24px 26px">
          <img src="${siteUrl()}/correo/terqui-${pose}.gif" width="170" height="170" alt="Terqui, la mascota de TERC" style="display:block;border:0;margin:0 auto">
          <h1 style="margin:10px 0 6px;font-size:24px;line-height:1.25;color:${C.pine}">${title}</h1>
          <p style="margin:0;font-size:15px;line-height:1.5;color:${C.muted}">${intro}</p>
        </td></tr>
        <tr><td style="padding:24px;font-size:15px;line-height:1.55">${body}</td></tr>
        <tr><td align="center" style="padding:18px 24px 22px;border-top:1px solid ${C.line};font-size:12px;color:${C.muted};line-height:1.6">
          <strong style="color:${C.pine}">TERC</strong> · ${escapeHtml(SITE.slogan)}<br>
          <a href="${siteUrl()}" style="color:${C.leaf}">terc.cl</a> · ${escapeHtml(SITE.email)}${whatsapp}<br>
          ${escapeHtml(SITE.company)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
