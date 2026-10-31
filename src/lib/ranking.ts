import { extraCostFor } from "@/app/admin/(panel)/extra-costs";
import { netOf } from "@/app/admin/(panel)/finance";
import { getAdminClient } from "./supabase";
import type { ExtraCost } from "./types";

// Orden "Destacados" de la tienda (pedido de Raúl, 31-10-2026): primero los equipos que más
// ganancia dejan por venta, para mostrarlos harto y hacerles ofertas. Los de poco margen o con
// poco stock van más abajo. Se calcula en el servidor: el navegador solo recibe el orden, nunca
// el costo.
//
// La ganancia se mide con el precio normal (el "antes" si está en oferta). Así, poner en oferta
// un buen equipo no lo hace bajar en la lista.

// Con poco stock el equipo baja un poco: 1 unidad pesa 80% y 2 unidades 90%.
const STOCK_WEIGHT = [0, 0.8, 0.9];

type Row = {
  id: string;
  price: number;
  compare_price: number | null;
  cost: number | null;
  category: string;
  stock: number;
};

/** Puntaje de cada equipo visible (más alto = más arriba). Vacío si no hay acceso a los costos. */
export async function productRanking(): Promise<Map<string, number>> {
  const db = getAdminClient();
  if (!db) return new Map();
  const [products, costs] = await Promise.all([
    db.from("products").select("id, price, compare_price, cost, category, stock").eq("active", true).gt("stock", 0),
    db.from("extra_costs").select("*"),
  ]);
  if (products.error) return new Map();
  const extra = ((costs.data ?? []) as ExtraCost[]).map((c) => ({ ...c, percent: Number(c.percent) }));

  const scores = new Map<string, number>();
  const unknown: string[] = [];
  for (const p of products.data as Row[]) {
    if (p.cost === null) {
      unknown.push(p.id);
      continue;
    }
    const regular = p.compare_price && p.compare_price > p.price ? p.compare_price : p.price;
    const margin = netOf(regular) - p.cost - extraCostFor(regular, p.category, extra);
    scores.set(p.id, margin * (STOCK_WEIGHT[p.stock] ?? 1));
  }
  // Sin costo cargado no se sabe cuánto deja: queda al medio de la lista.
  const sorted = [...scores.values()].sort((a, b) => a - b);
  const middle = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
  for (const id of unknown) scores.set(id, middle);
  return scores;
}
