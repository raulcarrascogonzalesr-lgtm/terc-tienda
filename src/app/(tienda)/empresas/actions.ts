"use server";

import { revalidatePath } from "next/cache";
import { QUOTE_KIND_LABELS } from "@/lib/format";
import { getAdminClient } from "@/lib/supabase";

export type QuoteState = { ok?: boolean; error?: string } | null;

const text = (form: FormData, key: string, max: number) =>
  String(form.get(key) ?? "")
    .trim()
    .slice(0, max);

// Guarda una solicitud de cotización. La tabla es privada: se escribe con la llave de servicio.
export async function submitQuote(_prev: QuoteState, form: FormData): Promise<QuoteState> {
  // Campo trampa invisible: si viene lleno, es un robot. Se responde como si todo saliera bien.
  if (text(form, "website", 200)) return { ok: true };

  const name = text(form, "name", 120);
  const email = text(form, "email", 160);
  const phone = text(form, "phone", 40);
  const company = text(form, "company", 120);
  const message = text(form, "message", 2000);
  const kind = text(form, "kind", 20);
  const quantityRaw = text(form, "quantity", 10).replace(/\D/g, "");
  const quantity = quantityRaw ? Math.min(Number(quantityRaw), 100000) : null;

  if (name.length < 2) return { error: "Escribe tu nombre." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Revisa tu correo." };
  if (!(kind in QUOTE_KIND_LABELS)) return { error: "Elige qué necesitas." };
  if (message.length < 5) return { error: "Cuéntanos un poco más en el mensaje." };

  const supabase = getAdminClient();
  if (!supabase) return { error: "No pudimos enviar tu solicitud. Escríbenos por WhatsApp o correo." };
  const { error } = await supabase.from("quotes").insert({
    name,
    email,
    phone: phone || null,
    company: company || null,
    kind,
    quantity: quantity || null,
    message,
  });
  if (error) {
    console.error("No se pudo guardar la cotización", error);
    return { error: "No pudimos enviar tu solicitud. Escríbenos por WhatsApp o correo." };
  }
  revalidatePath("/admin", "layout");
  return { ok: true };
}
