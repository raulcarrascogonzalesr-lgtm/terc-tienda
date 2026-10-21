"use server";

import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import { getAuthClient } from "@/lib/supabase-auth";

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  const supabase = await getAuthClient();
  if (!supabase) return "Supabase no está configurado.";

  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return "Correo o contraseña incorrectos.";

  if (!isAdminEmail(email)) {
    await supabase.auth.signOut();
    return "Este correo no tiene acceso al panel.";
  }
  redirect("/admin");
}

export async function logout() {
  const supabase = await getAuthClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}
