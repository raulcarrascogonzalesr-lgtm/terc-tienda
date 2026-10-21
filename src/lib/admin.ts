import { redirect } from "next/navigation";
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

export async function getAdminUser() {
  const supabase = await getAuthClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user && isAdminEmail(user.email) ? user : null;
}

// Usar al inicio de cada página y acción del panel.
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}
