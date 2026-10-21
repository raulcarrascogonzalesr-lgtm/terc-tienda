const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function formatCLP(value: number): string {
  // "|| 0" evita que un -0 se muestre como "-$0".
  return value < 0 ? `−${clp.format(-value)}` : clp.format(value || 0);
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
