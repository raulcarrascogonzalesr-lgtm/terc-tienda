import { redirect } from "next/navigation";
import { cache } from "react";
import { getAuthClient } from "./supabase-auth";

// Correos con acceso al panel, separados por coma (variable ADMIN_EMAILS).
export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

// Se pregunta a Supabase una sola vez por visita, aunque varias partes de la página lo pidan.
export const getAdminUser = cache(async () => {
  const supabase = await getAuthClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user && isAdminEmail(user.email) ? user : null;
});

// Usar al inicio de cada página, acción y lectura de datos del panel. No basta con el
// layout: al navegar dentro del panel, Next.js puede pedir solo la página sin el layout.
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}
