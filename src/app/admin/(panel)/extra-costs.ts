import type { ExtraCost } from "@/lib/types";

// Costos extra que se llevan con cada equipo vendido de esa categoría (sin IVA).
// El porcentaje se calcula sobre el precio con IVA, que es lo que cobra la pasarela de pago.
export function extraCostFor(price: number, category: string, costs: ExtraCost[]): number {
  return costs
    .filter((c) => c.active && (c.category === null || c.category === category))
    .reduce((sum, c) => sum + c.amount + Math.round((price * c.percent) / 100), 0);
}
