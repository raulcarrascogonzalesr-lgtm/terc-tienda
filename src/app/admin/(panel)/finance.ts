import type { AdminProduct, Campaign, Movement, Order } from "@/lib/types";

export const INCOME_CATEGORIES = {
  prestamo: "Préstamo recibido",
  aporte: "Aporte de capital",
  otro_ingreso: "Otro ingreso",
} as const;

// Gastos que cuentan para saber si ganaste o perdiste en el mes.
export const EXPENSE_CATEGORIES = {
  publicidad: "Publicidad",
  envios: "Envíos",
  comisiones: "Comisiones (Mercado Pago, ML)",
  garantia: "Garantías y reparaciones",
  herramientas: "Hosting, dominio y servicios",
  otro_gasto: "Otro gasto",
} as const;

// Salidas de plata que no son gasto: la compra de equipos pasa a ser stock
// (se descuenta como costo cuando el equipo se vende) y la devolución del
// préstamo solo baja la deuda.
export const OTHER_OUTFLOWS = {
  compra_equipos: "Compra de equipos",
  devolucion_prestamo: "Devolución del préstamo",
} as const;

export const CATEGORY_LABELS: Record<string, string> = {
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
  ...OTHER_OUTFLOWS,
};

export const CHANNEL_LABELS = {
  meta: "Facebook / Instagram",
  google: "Google",
  mercadolibre: "Mercado Libre",
  tiktok: "TikTok",
  otro: "Otro",
} as const;

// Reglas del plan de marketing: hasta 55.000 por venta está bien,
// sobre 95.000 por venta se pierde plata.
export const CPA_GOOD = 55_000;
export const CPA_LOSS = 95_000;

const SOLD = new Set(["paid", "shipped", "delivered"]);

const monthFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Santiago",
  year: "numeric",
  month: "2-digit",
});

// "AAAA-MM" en hora de Chile.
export function monthOf(date: Date | string): string {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date.slice(0, 7);
  return monthFormat.format(new Date(date));
}

export function lastMonths(count: number, now = new Date()): string[] {
  const [y, m] = monthOf(now).split("-").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - (count - 1 - i), 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  });
}

const monthName = new Intl.DateTimeFormat("es-CL", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const monthShort = new Intl.DateTimeFormat("es-CL", { month: "short", timeZone: "UTC" });

export function monthLabel(month: string, short = false): string {
  const date = new Date(`${month}-01T12:00:00Z`);
  return (short ? monthShort : monthName).format(date);
}

export function isSold(order: Order): boolean {
  return SOLD.has(order.status);
}

export function saleMonth(order: Order): string {
  return monthOf(order.paid_at ?? order.created_at);
}

function orderCost(order: Order, costById: Map<string, number | null>) {
  let cost = 0;
  let missing = false;
  for (const item of order.items) {
    const unit = item.unit_cost ?? costById.get(item.product_id) ?? null;
    if (unit === null) missing = true;
    else cost += unit * item.quantity;
  }
  return { cost, missing };
}

export type MonthResult = {
  month: string;
  sales: number; // productos + envío cobrado
  orders: number;
  costOfGoods: number;
  grossProfit: number;
  expenses: Record<keyof typeof EXPENSE_CATEGORIES, number>;
  totalExpenses: number;
  result: number;
  missingCost: boolean;
};

export function monthResult(
  month: string,
  orders: Order[],
  movements: Movement[],
  products: AdminProduct[],
): MonthResult {
  const costById = new Map(products.map((p) => [p.id, p.cost]));
  const sold = orders.filter((o) => isSold(o) && saleMonth(o) === month);

  let costOfGoods = 0;
  let missingCost = false;
  for (const o of sold) {
    const c = orderCost(o, costById);
    costOfGoods += c.cost;
    missingCost ||= c.missing;
  }
  const sales = sold.reduce((s, o) => s + o.total, 0);

  const expenses = Object.fromEntries(
    Object.keys(EXPENSE_CATEGORIES).map((k) => [k, 0]),
  ) as MonthResult["expenses"];
  for (const m of movements) {
    if (m.kind === "egreso" && monthOf(m.date) === month && m.category in expenses) {
      expenses[m.category as keyof typeof EXPENSE_CATEGORIES] += m.amount;
    }
  }
  const totalExpenses = Object.values(expenses).reduce((s, v) => s + v, 0);
  const grossProfit = sales - costOfGoods;

  return {
    month,
    sales,
    orders: sold.length,
    costOfGoods,
    grossProfit,
    expenses,
    totalExpenses,
    result: grossProfit - totalExpenses,
    missingCost,
  };
}

// Plata disponible según lo registrado: ingresos + ventas cobradas − salidas.
// Si untilMonth viene, cuenta solo hasta antes de ese mes (saldo inicial).
export function cashBalance(orders: Order[], movements: Movement[], beforeMonth?: string): number {
  const include = (month: string) => !beforeMonth || month < beforeMonth;
  let balance = 0;
  for (const o of orders) if (isSold(o) && include(saleMonth(o))) balance += o.total;
  for (const m of movements) {
    if (!include(monthOf(m.date))) continue;
    balance += m.kind === "ingreso" ? m.amount : -m.amount;
  }
  return balance;
}

export function loanStatus(movements: Movement[]) {
  const received = movements
    .filter((m) => m.kind === "ingreso" && m.category === "prestamo")
    .reduce((s, m) => s + m.amount, 0);
  const repaid = movements
    .filter((m) => m.kind === "egreso" && m.category === "devolucion_prestamo")
    .reduce((s, m) => s + m.amount, 0);
  return { received, repaid, pending: Math.max(received - repaid, 0) };
}

export function stockValue(products: AdminProduct[]) {
  const inStock = products.filter((p) => p.active && p.stock > 0);
  const invested = inStock.reduce((s, p) => s + (p.cost ?? 0) * p.stock, 0);
  const atPrice = inStock.reduce((s, p) => s + p.price * p.stock, 0);
  return {
    units: inStock.reduce((s, p) => s + p.stock, 0),
    invested,
    atPrice,
    missingCost: inStock.filter((p) => p.cost == null).length,
  };
}

export type Verdict = "sin-datos" | "bien" | "ojo" | "pierde";

export const VERDICT_LABELS: Record<Verdict, string> = {
  "sin-datos": "Sin datos aún",
  bien: "Va bien",
  ojo: "Revisar",
  pierde: "Pierde plata",
};

export function campaignStats(
  campaign: Campaign,
  orders: Order[],
  movements: Movement[],
  month?: string,
) {
  const inMonth = (m: string) => !month || m === month;
  const spend = movements
    .filter(
      (m) =>
        m.kind === "egreso" &&
        m.category === "publicidad" &&
        m.campaign_id === campaign.id &&
        inMonth(monthOf(m.date)),
    )
    .reduce((s, m) => s + m.amount, 0);
  const sold = orders.filter(
    (o) =>
      isSold(o) &&
      o.utm?.utm_campaign?.toLowerCase() === campaign.code.toLowerCase() &&
      inMonth(saleMonth(o)),
  );
  const revenue = sold.reduce((s, o) => s + o.total, 0);
  const costPerSale = sold.length > 0 ? Math.round(spend / sold.length) : null;

  let verdict: Verdict = "sin-datos";
  if (sold.length === 0) verdict = spend > CPA_LOSS ? "pierde" : "sin-datos";
  else if (costPerSale! <= CPA_GOOD) verdict = "bien";
  else if (costPerSale! <= CPA_LOSS) verdict = "ojo";
  else verdict = "pierde";

  return {
    spend,
    sales: sold.length,
    revenue,
    costPerSale,
    returnPerPeso: spend > 0 ? revenue / spend : null,
    verdict,
  };
}
