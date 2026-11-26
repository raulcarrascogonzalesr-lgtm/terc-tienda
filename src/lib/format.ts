import { SITE } from "./site";

const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function formatCLP(value: number): string {
  // "|| 0" evita que un -0 se muestre como "-$0".
  return value < 0 ? `−${clp.format(-value)}` : clp.format(value || 0);
}

// Precio pagando con tarjeta (Mercado Pago o Webpay): el de transferencia + SITE.cardExtraPercent,
// redondeado hacia arriba a la decena. Se usa igual en la tienda, el carrito y el cobro.
export function cardPrice(price: number): number {
  const pct = SITE.cardExtraPercent;
  return pct > 0 ? Math.ceil((price * (1 + pct / 100)) / 10) * 10 : price;
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

// Windows que se muestra en "Qué incluye", según lo que dice la descripción del equipo (ya normalizada:
// minúsculas y sin tildes). Solo dice "Pro" si la descripción lo dice; si no menciona Windows, nada.
export function windowsLabel(desc: string): string | null {
  if (!desc.includes("windows")) return null;
  if (/windows\s*(10|11)?\s*pro\b/.test(desc)) return "Windows Pro original (licencia OEM)";
  if (/windows\s*(10|11)?\s*home\b/.test(desc)) return "Windows Home original";
  return "Windows original";
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

// Cómo ve el cliente el estado del equipo: sin letras, porque un "Grado C" asusta y todos
// los equipos funcionan al 100%. B y C se muestran igual.
export const CONDITION = {
  A: { label: "Excelente estado", text: "Sin marcas visibles a simple vista." },
  B: { label: "Detalles estéticos leves", text: "Puede tener pequeños roces o rayitas que no afectan en nada su funcionamiento." },
  C: { label: "Detalles estéticos leves", text: "Puede tener pequeños roces o rayitas que no afectan en nada su funcionamiento." },
} as const;

// Grados para el panel de administración.
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
  arriendo: "Arriendo de equipos", // ya no se ofrece; queda para leer solicitudes antiguas
  otro: "Otro pedido",
  energia: "Energía y eléctricos",
} as const;

// Lo que se puede pedir hoy en el formulario de Empresas (TERC no arrienda equipos).
export const QUOTE_KINDS_OFFERED = ["volumen", "energia", "otro"] as const;

export const QUOTE_STATUS_LABELS = {
  nueva: "Nueva",
  respondida: "Respondida",
  cerrada: "Cerrada",
} as const;
