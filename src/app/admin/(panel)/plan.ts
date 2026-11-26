import { energyCategory } from "@/lib/energy";
import type { AdminProduct, Campaign, Movement, Order } from "@/lib/types";
import {
  EXPENSE_CATEGORIES,
  isSold,
  monthOf,
  movementNet,
  netOf,
  paidWithDadCard,
  saleMonth,
  vatIn,
} from "./finance";

// "Plan del mes": ¿ya cubrimos los gastos del mes? Todo va sin IVA, igual que en "¿Gané o perdí?",
// pero sin los gastos de apertura (esos se devuelven aparte, con una cuota mensual).

export const LINES = {
  bat: "Baterías",
  inv: "Inversores",
  ene: "Otra energía",
  pc: "Computadores",
  emp: "Empresas",
} as const;
export type Line = keyof typeof LINES;
const LINE_KEYS = Object.keys(LINES) as Line[];

export const SPEND = {
  google: "Google Ads",
  meta: "Meta",
  otra_publicidad: "Otra publicidad",
  envios: "Envíos",
  comisiones: "Comisiones",
  embalaje: "Cajas y embalaje",
  otros: "Otros gastos",
} as const;
export type SpendKey = keyof typeof SPEND;
const SPEND_KEYS = Object.keys(SPEND) as SpendKey[];

// Cuota de apertura que se suma a los gastos de cada mes (se puede apagar en la página).
export const OPENING_QUOTA = 60_000;

// Ganancia por venta de ejemplo, por si el catálogo no tiene costos cargados.
const FALLBACK_UNIT: Record<Line, number> = { bat: 118_000, inv: 96_400, ene: 40_000, pc: 31_500, emp: 38_000 };

function zeros<K extends string>(keys: K[]): Record<K, number> {
  return Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>;
}

// Línea de un producto: energía por categoría; computadores con factura cuentan como Empresas.
function lineOf(category: string | null | undefined, invoice: boolean): Line {
  const energy = energyCategory(category);
  if (energy) {
    if (energy.short === "Baterías") return "bat";
    if (energy.short === "Inversores") return "inv";
    return "ene";
  }
  return invoice ? "emp" : "pc";
}

export type PlanMonth = {
  month: string;
  profit: Record<Line, number>; // ganancia neta (venta sin IVA − costo) por línea
  sales: Record<Line, number>; // unidades vendidas por línea
  spend: Record<SpendKey, number>; // gastos del mes sin apertura
  totalProfit: number;
  totalSpend: number;
  missingCost: boolean;
};

export function planMonth(
  month: string,
  orders: Order[],
  movements: Movement[],
  products: AdminProduct[],
  campaigns: Campaign[],
): PlanMonth {
  const byId = new Map(products.map((p) => [p.id, p]));
  const profit = zeros(LINE_KEYS);
  const sales = zeros(LINE_KEYS);
  let missingCost = false;

  for (const o of orders) {
    if (!isSold(o) || saleMonth(o) !== month) continue;
    const invoice = o.customer?.document === "Factura";
    const gross = o.items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
    // Lo cobrado por los productos, ya con el descuento del cupón; el envío cobrado se reparte igual.
    const paid = o.total;
    for (const item of o.items) {
      const product = byId.get(item.product_id);
      const line = lineOf(product?.category, invoice);
      const share = gross > 0 ? (item.unit_price * item.quantity) / gross : 1 / o.items.length;
      const unitCost = item.unit_cost ?? product?.cost ?? null;
      if (unitCost === null) missingCost = true;
      profit[line] += Math.round(netOf(paid) * share) - (unitCost ?? 0) * item.quantity;
      sales[line] += item.quantity;
    }
  }

  const spend = zeros(SPEND_KEYS);
  const channel = new Map(campaigns.map((c) => [c.id, c.channel]));
  for (const m of movements) {
    if (monthOf(m.date) !== month) continue;
    if (m.category === "venta_directa" || m.category === "devolucion_cliente") {
      const product = m.product_id ? byId.get(m.product_id) : undefined;
      const line = lineOf(product?.category, m.doc_type === "factura");
      const net = m.amount - (m.vat ?? vatIn(m.amount));
      if (m.category === "venta_directa") {
        if (m.unit_cost == null) missingCost = true;
        profit[line] += net - (m.unit_cost ?? 0);
        sales[line] += 1;
      } else profit[line] -= net;
      continue;
    }
    if (m.kind !== "egreso" || m.apertura || !(m.category in EXPENSE_CATEGORIES)) continue;
    const amount = movementNet(m);
    if (m.category === "publicidad") {
      const ch = m.campaign_id ? channel.get(m.campaign_id) : undefined;
      if (ch === "google" || (!ch && paidWithDadCard(m))) spend.google += amount;
      else if (ch === "meta") spend.meta += amount;
      else spend.otra_publicidad += amount;
    } else if (m.category === "envios" || m.category === "comisiones" || m.category === "embalaje") {
      spend[m.category] += amount;
    } else spend.otros += amount;
  }

  return {
    month,
    profit,
    sales,
    spend,
    totalProfit: LINE_KEYS.reduce((s, k) => s + profit[k], 0),
    totalSpend: SPEND_KEYS.reduce((s, k) => s + spend[k], 0),
    missingCost,
  };
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

// Ganancia típica de una venta por línea, para el simulador: la mediana del catálogo visible
// (precio sin IVA − costo). Si no hay costos cargados, un ejemplo.
export function unitProfits(products: AdminProduct[]): Record<Line, number> {
  const out = { ...FALLBACK_UNIT };
  const groups: Record<Line, number[]> = { bat: [], inv: [], ene: [], pc: [], emp: [] };
  for (const p of products) {
    if (!p.active || p.cost == null || p.price <= 0) continue;
    const margin = netOf(p.price) - p.cost;
    if (margin <= 0) continue;
    const line = lineOf(p.category, false);
    groups[line].push(margin);
    if (line === "pc") groups.emp.push(margin);
  }
  for (const k of LINE_KEYS) {
    const m = median(groups[k]);
    if (m !== null) out[k] = m;
  }
  return out;
}

// Gastos de apertura registrados (los marcados como apertura), para la tarjeta de abajo.
export function openingStatus(movements: Movement[]) {
  const spent = movements
    .filter((m) => m.kind === "egreso" && m.apertura)
    .reduce((s, m) => s + m.amount, 0);
  const repaid = movements
    .filter((m) => m.kind === "egreso" && m.category === "devolucion_prestamo")
    .reduce((s, m) => s + m.amount, 0);
  return { spent, repaid };
}
