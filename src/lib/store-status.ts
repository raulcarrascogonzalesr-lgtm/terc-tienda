import { getPublicClient } from "./supabase";

// Las compras se pueden cerrar desde el panel mientras TERC no puede atender pedidos.
// Con la tienda cerrada, los visitantes ven los equipos y precios, pero no pueden pagar.
export async function storeIsOpen(): Promise<boolean> {
  const supabase = getPublicClient();
  if (!supabase) return true;
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "store_open")
    .maybeSingle();
  if (error) return true; // si no se puede leer el ajuste, la tienda sigue como siempre
  return data?.value !== "false";
}
