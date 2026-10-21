import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente que recuerda la sesión del administrador en una cookie.
// Solo sirve para saber quién entró; los datos se leen con getAdminClient().
export async function getAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // En páginas (no acciones) no se pueden escribir cookies; el middleware las renueva.
        }
      },
    },
  });
}
