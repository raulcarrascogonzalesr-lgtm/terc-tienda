const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function formatCLP(value: number): string {
  // "|| 0" evita que un -0 se muestre como "-$0".
  return value < 0 ? `−${clp.format(-value)}` : clp.format(value || 0);
}

function discount(price: number, before: number | null) {
  if (!before || before <= price) return null;
  const amount = before - price;
  return { before, amount, percent: Math.round((amount / before) * 100) };
}

// Ahorro frente al precio de un equipo nuevo, solo si ese precio es mayor.
export function savings(product: { price: number; list_price: number | null }) {
  return discount(product.price, product.list_price);
}

// Rebaja frente al precio anterior de TERC, cuando el equipo está en oferta.
export function offer(product: { price: number; compare_price: number | null }) {
  return discount(product.price, product.compare_price);
}

// Los productos a pedido se pueden comprar aunque no haya stock propio, hasta este máximo.
const ON_DEMAND_MAX = 5;

export function maxUnits(product: { stock: number; on_demand: boolean }): number {
  return product.on_demand ? Math.max(product.stock, ON_DEMAND_MAX) : product.stock;
}

export const GRADE_LABELS = {
  A: "Grado A · como nuevo",
  B: "Grado B · detalles leves",
  C: "Grado C · marcas visibles",
} as const;

export const ORDER_STATUS_LABELS = {
  pending: "Pendiente de pago",
  paid: "Pagado",
  failed: "Pago rechazado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
} as const;

const dateTime = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Santiago",
});

export function formatDateTime(value: string): string {
  return dateTime.format(new Date(value));
}
