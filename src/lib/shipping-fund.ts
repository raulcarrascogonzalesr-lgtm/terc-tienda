import { MIN_REGION_SHIPPING, type ShippingOption } from "./shipping";
import { getPublicClient } from "./supabase";

// Envío gratis en la Región Metropolitana: cada equipo trae un monto fijo para el envío
// (ajuste "shipping_fund", se cambia en el panel). La tienda lo suma al precio que ve el
// cliente; el precio guardado del producto y su margen no cambian. En la RM el envío sale
// gratis y en regiones se descuenta lo que ya trajeron los equipos. 0 = apagado.
export async function getShippingFund(): Promise<number> {
  const supabase = getPublicClient();
  if (!supabase) return 0;
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "shipping_fund")
    .maybeSingle();
  if (error || !data) return 0; // sin el ajuste, la tienda sigue como antes
  const amount = Math.round(Number(data.value));
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

export function isMetropolitana(region: string) {
  return region.startsWith("Metropolitana");
}

// Lo que paga el cliente por cada opción. `cost` guarda lo que cobra el courier.
// En regiones, a cada opción se le descuenta el fondo, pero nunca queda en menos de MIN_REGION_SHIPPING.
// En la RM el cliente igual elige courier: la más barata siempre sale gratis, y las demás también,
// salvo que cuesten más que lo que cubre TERC (el fondo o la más barata, lo que sea mayor); ahí el
// cliente paga solo la diferencia.
export function withShippingFund(options: ShippingOption[], region: string, fundTotal: number): ShippingOption[] {
  if (fundTotal <= 0 || options.length === 0) return options;
  if (isMetropolitana(region)) {
    const covered = Math.max(fundTotal, Math.min(...options.map((o) => o.price)));
    return options.map((o) => ({ ...o, price: Math.max(0, o.price - covered), cost: o.price }));
  }
  return options.map((o) => ({ ...o, price: Math.max(MIN_REGION_SHIPPING, o.price - fundTotal), cost: o.price }));
}
