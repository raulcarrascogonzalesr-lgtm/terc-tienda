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

// Fecha de hoy en Chile, como AAAA-MM-DD (igual que offer_ends_at).
export function todayInChile(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(now);
}

// "2026-10-31" → "31/10".
export function shortDate(date: string): string {
  const [, month, day] = date.split("-");
  return `${day}/${month}`;
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

export const QUOTE_KIND_LABELS = {
  volumen: "Compra por volumen",
  arriendo: "Arriendo de equipos",
  otro: "Otro pedido",
} as const;

export const QUOTE_STATUS_LABELS = {
  nueva: "Nueva",
  respondida: "Respondida",
  cerrada: "Cerrada",
} as const;
