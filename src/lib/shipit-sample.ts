import type { Commune, ShippingOption } from "./shipping";

// Datos de ejemplo para probar el carrito sin conexión a Shipit (solo en desarrollo).
export const SAMPLE_COMMUNES: Commune[] = [
  { id: 1, name: "Antofagasta", region: "Antofagasta" },
  { id: 2, name: "Concepción", region: "Biobío" },
  { id: 3, name: "Temuco", region: "La Araucanía" },
  { id: 4, name: "Las Condes", region: "Metropolitana de Santiago" },
  { id: 5, name: "Maipú", region: "Metropolitana de Santiago" },
  { id: 6, name: "Providencia", region: "Metropolitana de Santiago" },
  { id: 7, name: "Valparaíso", region: "Valparaíso" },
  { id: 8, name: "Viña del Mar", region: "Valparaíso" },
];

export function sampleOptions(destiny: Commune): ShippingOption[] {
  const far = destiny.region.startsWith("Metropolitana") ? 0 : destiny.region === "Valparaíso" ? 1 : 2;
  return [
    { courier: "starken", label: "Starken", price: 3803 + far * 1900, days: 1 + far },
    { courier: "chilexpress", label: "Chilexpress", price: 3915 + far * 2100, days: 1 + far },
    { courier: "bluexpress", label: "Blue Express", price: 4154 + far * 1700, days: 1 + Math.max(0, far - 1) },
  ];
}
