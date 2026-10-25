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

// Lo que paga el cliente por cada opción. En la RM se ofrece solo la más barata, gratis;
// en regiones, cada opción con el descuento, pero nunca menos de MIN_REGION_SHIPPING. `cost` guarda lo que cobra el courier.
export function withShippingFund(options: ShippingOption[], region: string, fundTotal: number): ShippingOption[] {
  if (fundTotal <= 0 || options.length === 0) return options;
  if (isMetropolitana(region)) {
    const cheapest = options.reduce((a, b) => (b.price < a.price ? b : a));
    return [{ ...cheapest, label: "Envío gratis", price: 0, cost: cheapest.price }];
  }
  return options.map((o) => ({ ...o, price: Math.max(MIN_REGION_SHIPPING, o.price - fundTotal), cost: o.price }));
}
