// Tarifas de envío fijas mientras se despacha a mano.
// Ajustar según las cotizaciones de Blue Express / Starken / Chilexpress.
export const SHIPPING_ZONES = {
  rm: { label: "Región Metropolitana", price: 4990 },
  regiones: { label: "Otras regiones", price: 6990 },
} as const;

export type ShippingZone = keyof typeof SHIPPING_ZONES;

export function isShippingZone(value: unknown): value is ShippingZone {
  return typeof value === "string" && value in SHIPPING_ZONES;
}
