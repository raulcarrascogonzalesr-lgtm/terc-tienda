import type { ExtraCost } from "@/lib/types";

// Costos extra que se llevan con cada equipo vendido de esa categoría (sin IVA).
// El porcentaje se calcula sobre el precio con IVA, que es lo que cobra la pasarela de pago.
export function extraCostFor(price: number, category: string, costs: ExtraCost[]): number {
  return costs
    .filter((c) => c.active && (c.category === null || c.category === category))
    .reduce((sum, c) => sum + c.amount + Math.round((price * c.percent) / 100), 0);
}

// Precio con IVA que deja la misma ganancia que el precio actual tenía antes de restar los
// costos por venta, redondeado hacia arriba a $…990. Solo es una sugerencia: no cambia precios.
// El % se cobra sobre el precio nuevo, por eso se despeja: P/1,19 − costo − fijos − P·%/100 = ganancia.
export function suggestedPrice(
  price: number,
  cost: number | null,
  category: string,
  costs: ExtraCost[],
): number | null {
  if (cost === null) return null;
  const active = costs.filter((c) => c.active && (c.category === null || c.category === category));
  const fixed = active.reduce((sum, c) => sum + c.amount, 0);
  const percent = active.reduce((sum, c) => sum + c.percent, 0);
  if (!fixed && !percent) return null;
  const gain = price / 1.19 - cost;
  const exact = (gain + cost + fixed) / (1 / 1.19 - percent / 100);
  return Math.max(990, Math.ceil((exact - 990) / 1000) * 1000 + 990);
}
