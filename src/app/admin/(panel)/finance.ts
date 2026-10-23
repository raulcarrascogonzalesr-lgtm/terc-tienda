import type { AdminProduct, Campaign, Movement, Order } from "@/lib/types";

export const INCOME_CATEGORIES = {
  prestamo: "Préstamo recibido",
  aporte: "Aporte de capital",
  venta_directa: "Venta fuera de la web",
  otro_ingreso: "Otro ingreso",
} as const;

// Gastos que cuentan para saber si ganaste o perdiste en el mes.
export const EXPENSE_CATEGORIES = {
  publicidad: "Publicidad",
  envios: "Envíos",
  comisiones: "Comisiones (Mercado Pago, ML)",
  garantia: "Garantías y reparaciones",
  herramientas: "Hosting, dominio y servicios",
  embalaje: "Cajas y embalaje",
  otro_gasto: "Otro gasto",
} as const;

// Salidas de plata que no son gasto: la compra de equipos pasa a ser stock
// (se descuenta como costo cuando el equipo se vende), la devolución del
// préstamo solo baja la deuda y la devolución a un cliente resta ventas.
export const OTHER_OUTFLOWS = {
  compra_equipos: "Compra de equipos",
  devolucion_prestamo: "Devolución del préstamo",
  devolucion_cliente: "Devolución a un cliente",
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

// En Chile los precios incluyen 19% de IVA: el IVA es 19/119 del total.
export function vatIn(gross: number): number {
  return Math.round((gross * 19) / 119);
}

export function netOf(gross: number): number {
  return gross - vatIn(gross);
}

// Ventas fuera de la web y devoluciones a clientes (con nota de crédito).
const SALE_MOVES = new Set(["venta_directa", "devolucion_cliente"]);

// IVA de compras que Wiremax puede rebajar (crédito fiscal): solo facturas.
export function creditVat(m: Movement): number {
  if (m.kind !== "egreso" || SALE_MOVES.has(m.category) || m.doc_type !== "factura") return 0;
  return m.vat ?? vatIn(m.amount);
}

// IVA de ventas fuera de la web (+) y de notas de crédito a clientes (−).
export function debitVat(m: Movement): number {
  if (!SALE_MOVES.has(m.category)) return 0;
  const vat = m.vat ?? vatIn(m.amount);
  return m.category === "venta_directa" ? vat : -vat;
}

// Neto de una venta fuera de la web (+) o de una devolución a un cliente (−).
export function directSaleNet(m: Movement): number {
  if (!SALE_MOVES.has(m.category)) return 0;
  const net = m.amount - (m.vat ?? vatIn(m.amount));
  return m.category === "venta_directa" ? net : -net;
}

// IVA de un movimiento, sea de compra (crédito) o de venta (débito), para mostrarlo.
export function movementTaxVat(m: Movement): number {
  return creditVat(m) || Math.abs(debitVat(m));
}

// Lo que realmente cuesta un gasto: sin el IVA que se recupera con la factura.
export function movementNet(m: Movement): number {
  return m.amount - creditVat(m);
}

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
  sales: number; // ventas netas (sin IVA): productos + envío cobrado
  salesGross: number; // lo cobrado, con IVA
  salesVat: number;
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
  let salesGross = sold.reduce((s, o) => s + o.total, 0);
  let salesVat = sold.reduce((s, o) => s + vatIn(o.total), 0);
  for (const m of movements) {
    if (!SALE_MOVES.has(m.category) || monthOf(m.date) !== month) continue;
    const sign = m.category === "venta_directa" ? 1 : -1;
    salesGross += sign * m.amount;
    salesVat += debitVat(m);
    if (m.category === "venta_directa") {
      if (m.unit_cost == null) missingCost = true;
      else costOfGoods += m.unit_cost;
    }
  }
  const sales = salesGross - salesVat;

  const expenses = Object.fromEntries(
    Object.keys(EXPENSE_CATEGORIES).map((k) => [k, 0]),
  ) as MonthResult["expenses"];
  for (const m of movements) {
    if (m.kind === "egreso" && monthOf(m.date) === month && m.category in expenses) {
      expenses[m.category as keyof typeof EXPENSE_CATEGORIES] += movementNet(m);
    }
  }
  const totalExpenses = Object.values(expenses).reduce((s, v) => s + v, 0);
  const grossProfit = sales - costOfGoods;

  return {
    month,
    sales,
    salesGross,
    salesVat,
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
  const inStock = products.filter((p) => p.active && !p.on_demand && p.stock > 0);
  const invested = inStock.reduce((s, p) => s + (p.cost ?? 0) * p.stock, 0);
  // Costo y precio en neto, para compararlos sin IVA.
  const atPrice = inStock.reduce((s, p) => s + netOf(p.price) * p.stock, 0);
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

function nextMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}

export type VatMonth = {
  month: string;
  salesNet: number;
  debit: number; // IVA de las ventas, menos notas de crédito
  purchasesNet: number; // neto de las facturas de compra y gastos
  credit: number; // IVA de esas facturas
  carryIn: number; // IVA a favor que venía del mes anterior
  toPay: number; // lo que TERC le traspasa a Wiremax para su F29
  carryOut: number; // IVA a favor que pasa al mes siguiente
};

// IVA estimado de TERC mes a mes, desde el primer mes con datos hasta `until`.
// El IVA a favor de un mes se descuenta en el siguiente (sin reajuste).
export function vatMonths(orders: Order[], movements: Movement[], until: string): VatMonth[] {
  const sold = orders.filter(isSold);
  const taxed = movements.filter((m) => creditVat(m) !== 0 || debitVat(m) !== 0);
  const first = [...sold.map(saleMonth), ...taxed.map((m) => monthOf(m.date))].sort()[0];
  const rows: VatMonth[] = [];
  let carry = 0;
  for (
    let month = first && first < until ? first : until;
    month <= until;
    month = nextMonth(month)
  ) {
    const sales = sold.filter((o) => saleMonth(o) === month);
    const moves = taxed.filter((m) => monthOf(m.date) === month);
    const debit =
      sales.reduce((s, o) => s + vatIn(o.total), 0) + moves.reduce((s, m) => s + debitVat(m), 0);
    const bills = moves.filter((m) => creditVat(m) > 0);
    const credit = bills.reduce((s, m) => s + creditVat(m), 0);
    const balance = debit - credit - carry;
    rows.push({
      month,
      salesNet:
        sales.reduce((s, o) => s + netOf(o.total), 0) +
        moves.reduce((s, m) => s + directSaleNet(m), 0),
      debit,
      purchasesNet: bills.reduce((s, m) => s + movementNet(m), 0),
      credit,
      carryIn: carry,
      toPay: Math.max(balance, 0),
      carryOut: Math.max(-balance, 0),
    });
    carry = Math.max(-balance, 0);
  }
  return rows;
}
