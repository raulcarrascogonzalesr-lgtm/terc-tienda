import { createHmac, timingSafeEqual } from "node:crypto";
import { MARKETING_CONSENT_TEXT } from "./consent";
import { siteUrl } from "./email";
import { getAdminClient } from "./supabase";

export type EmailPreference = {
  email: string;
  marketing_consent_at: string | null;
  marketing_consent_text: string | null;
  unsubscribed_at: string | null;
};

const normalize = (email: string) => email.trim().toLowerCase();

// Firma del enlace para darse de baja: sin ella, cualquiera podría dar de baja un correo ajeno.
function signature(email: string): string {
  const key = process.env.EMAIL_LINK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createHmac("sha256", key).update(`baja:${normalize(email)}`).digest("base64url").slice(0, 32);
}

const linkQuery = (email: string) => `e=${Buffer.from(normalize(email)).toString("base64url")}&t=${signature(email)}`;

// Página donde el cliente confirma la baja (enlace al pie de cada correo de seguimiento).
export function unsubscribeUrl(email: string): string {
  return `${siteUrl()}/correos/baja?${linkQuery(email)}`;
}

// Baja con un clic desde el botón de Gmail u Outlook: ellos lo llaman con POST, sin abrir la página.
export function oneClickUnsubscribeUrl(email: string): string {
  return `${siteUrl()}/api/correos/baja?${linkQuery(email)}`;
}

// Devuelve el correo del enlace si la firma es válida; si no, null.
export function readUnsubscribeLink(e: unknown, t: unknown): string | null {
  if (typeof e !== "string" || typeof t !== "string" || !e || !t) return null;
  const email = Buffer.from(e, "base64url").toString("utf8");
  if (!email.includes("@")) return null;
  const expected = Buffer.from(signature(email));
  const given = Buffer.from(t);
  return expected.length === given.length && timingSafeEqual(expected, given) ? normalize(email) : null;
}

export async function getPreference(email: string): Promise<EmailPreference | null> {
  const supabase = getAdminClient();
  if (!supabase) return null;
  const { data } = await supabase.from("email_preferences").select("*").eq("email", normalize(email)).maybeSingle();
  return (data as EmailPreference | null) ?? null;
}

// El cliente marcó la casilla al pagar. Si antes se había dado de baja, vuelve a recibir.
export async function saveMarketingConsent(email: string): Promise<void> {
  const supabase = getAdminClient();
  if (!supabase || !email) return;
  const now = new Date().toISOString();
  const { error } = await supabase.from("email_preferences").upsert({
    email: normalize(email),
    marketing_consent_at: now,
    marketing_consent_text: MARKETING_CONSENT_TEXT,
    unsubscribed_at: null,
    updated_at: now,
  });
  if (error) console.error("No se pudo guardar el permiso de correos (¿falta ejecutar supabase/correos-seguimiento.sql?)", error);
}

// Darse de baja: deja de recibir todos los correos que no son de un pedido en curso.
export async function unsubscribe(email: string): Promise<boolean> {
  const supabase = getAdminClient();
  if (!supabase) return false;
  const now = new Date().toISOString();
  const current = await getPreference(email);
  const { error } = current
    ? await supabase.from("email_preferences").update({ unsubscribed_at: now, updated_at: now }).eq("email", normalize(email))
    : await supabase.from("email_preferences").insert({ email: normalize(email), unsubscribed_at: now, updated_at: now });
  if (error) console.error("No se pudo registrar la baja", error);
  return !error;
}
