// Eventos para el píxel de Meta y Google Analytics 4. Solo se envían si el visitante
// aceptó las cookies (ver src/components/Analytics.tsx); si no, estas funciones no hacen nada.
//
// Cada evento dice de qué "mundo" es el producto (Computadores o Energía). Así en Meta y Google
// se pueden armar públicos y conversiones separados, por ejemplo "vio baterías de litio".

import { energyCategory } from "./energy";

type Fbq = (...args: unknown[]) => void;
type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    fbq?: Fbq;
    gtag?: Gtag;
    dataLayer?: unknown[];
  }
}

export const CONSENT_KEY = "terc-cookies"; // "si" o "no"

export function readConsent(): "si" | "no" | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "si" || v === "no" ? v : null;
  } catch {
    return null;
  }
}

export type TrackItem = { id: string; name: string; price: number; quantity: number; category?: string };

const CURRENCY = "CLP";

function send(meta: [string, Record<string, unknown>, string?] | null, ga: [string, Record<string, unknown>] | null) {
  if (typeof window === "undefined") return;
  if (meta && window.fbq) {
    const [name, params, eventId] = meta;
    if (eventId) window.fbq("track", name, params, { eventID: eventId });
    else window.fbq("track", name, params);
  }
  if (ga && window.gtag) window.gtag("event", ga[0], ga[1]);
}

// "Energía" o "Computadores" según la categoría del producto (sin categoría = no se sabe).
export function worldOf(category?: string): string | undefined {
  if (!category) return undefined;
  return energyCategory(category) ? "Energía" : "Computadores";
}

// En Google Analytics: item_category = el mundo, item_category2 = la categoría de la tienda.
function gaItems(items: TrackItem[]) {
  return items.map((i) => ({
    item_id: i.id,
    item_name: i.name,
    item_category: worldOf(i.category),
    item_category2: i.category,
    price: i.price,
    quantity: i.quantity,
  }));
}

// En Meta: content_category = el mundo y la categoría, ej. "Energía > Baterías de litio".
function metaCategory(category?: string): Record<string, string> {
  const world = worldOf(category);
  if (!world) return {};
  const name = energyCategory(category)?.name ?? category;
  return { content_category: `${world} > ${name}` };
}

function total(items: TrackItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function trackViewItem(item: TrackItem) {
  send(
    ["ViewContent", { content_ids: [item.id], content_name: item.name, content_type: "product", ...metaCategory(item.category), value: item.price, currency: CURRENCY }],
    ["view_item", { currency: CURRENCY, value: item.price, items: gaItems([item]) }],
  );
}

export function trackAddToCart(item: TrackItem) {
  send(
    ["AddToCart", { content_ids: [item.id], content_name: item.name, content_type: "product", ...metaCategory(item.category), value: item.price * item.quantity, currency: CURRENCY }],
    ["add_to_cart", { currency: CURRENCY, value: item.price * item.quantity, items: gaItems([item]) }],
  );
}

export function trackBeginCheckout(items: TrackItem[]) {
  send(
    ["InitiateCheckout", { content_ids: items.map((i) => i.id), content_type: "product", num_items: items.reduce((n, i) => n + i.quantity, 0), value: total(items), currency: CURRENCY }],
    ["begin_checkout", { currency: CURRENCY, value: total(items), items: gaItems(items) }],
  );
}

// value es el total pagado (con envío). El ID del pedido sirve también como event_id,
// para que Meta no lo cuente dos veces cuando llegue además desde el servidor.
export function trackPurchase(orderId: string, value: number, items: TrackItem[]) {
  send(
    ["Purchase", { content_ids: items.map((i) => i.id), content_type: "product", value, currency: CURRENCY }, orderId],
    ["purchase", { transaction_id: orderId, currency: CURRENCY, value, items: gaItems(items) }],
  );
}

// Solicitud de compra de Energía (se paga después por transferencia) o pedido de cotización
// de Empresas. No es una venta todavía: Meta la cuenta como "Lead" y Google como "generate_lead".
// value = total de la solicitud (0 si es una cotización sin precio). El número de la solicitud
// evita que se cuente dos veces.
export function trackLead(source: "solicitud-energia" | "cotizacion-empresas", value: number, detail?: string, leadId?: string) {
  send(
    ["Lead", { content_name: source, content_category: detail ?? source, value, currency: CURRENCY }, leadId],
    ["generate_lead", { currency: CURRENCY, value, lead_source: source, ...(detail ? { lead_detail: detail } : {}) }],
  );
}

export function trackWhatsApp() {
  send(["Contact", {}], ["contact_whatsapp", {}]);
}
