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

// Plantilla común: encabezado con la marca, el contenido y el pie con los datos de contacto.
// Estilos en línea porque los programas de correo ignoran las hojas de estilo.
export function layout(title: string, body: string): string {
  const whatsapp = SITE.whatsapp ? ` · WhatsApp +${SITE.whatsapp.replace(/^(\d{2})(\d)(\d{4})(\d{4})$/, "$1 $2 $3 $4")}` : "";
  return `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f4f3ef;font-family:Arial,Helvetica,sans-serif;color:#1d2422">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3ef;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e4e2dc">
        <tr><td style="background:#288868;border-radius:12px 12px 0 0;padding:18px 24px;color:#ffffff">
          <div style="font-size:22px;font-weight:bold;letter-spacing:1px">TERC</div>
          <div style="font-size:12px;opacity:.85">${escapeHtml(SITE.slogan)}</div>
        </td></tr>
        <tr><td style="padding:24px;font-size:15px;line-height:1.5">${body}</td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #e4e2dc;font-size:12px;color:#6b716f;line-height:1.5">
          TERC · Tecnología y Equipos Reacondicionados Chile<br>
          <a href="https://terc.cl" style="color:#288868">terc.cl</a> · ${escapeHtml(SITE.email)}${whatsapp}<br>
          ${escapeHtml(SITE.company)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
