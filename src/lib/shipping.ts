import type { Product } from "./types";

// Tarifas de envío fijas mientras se despacha a mano.
// Ajustar según las cotizaciones de Blue Express / Starken / Chilexpress.
export const SHIPPING_ZONES = {
  rm: { label: "Región Metropolitana", price: 4990 },
  regiones: { label: "Otras regiones", price: 6990 },
} as const;

export type ShippingZone = keyof typeof SHIPPING_ZONES;

export function isShippingZone(value: unknown): value is ShippingZone {
  return typeof value === "string" && value in SHIPPING_ZONES;
}

// Comuna desde donde TERC despacha (en mayúsculas y sin tildes). Shipit cotiza entre
// esta comuna y la del cliente. Los paquetes se dejan en una sucursal Starken de Santiago.
export const ORIGIN_COMMUNE = "SANTIAGO";

export type Box = { length: number; width: number; height: number; weight: number }; // cm y kg

// Peso y medidas del paquete listo para despachar, con caja, plumavit y cables.
type Packable = Pick<Product, "category" | "ship_weight_kg" | "ship_length_cm" | "ship_width_cm" | "ship_height_cm">;

// Si el producto no tiene sus medidas cargadas, se usa una estimación por categoría.
const BOXES: Record<string, Box> = {
  Celulares: { length: 18, width: 11, height: 6, weight: 0.4 },
  Tablets: { length: 29, width: 21, height: 5, weight: 0.9 },
  Notebooks: { length: 37, width: 27, height: 7, weight: 2.2 },
  Monitores: { length: 54, width: 38, height: 13, weight: 4.5 },
  Computadores: { length: 35, width: 31, height: 14, weight: 5.4 },
  "All-in-One": { length: 60, width: 45, height: 18, weight: 8.5 },
};
const DEFAULT_BOX: Box = { length: 35, width: 30, height: 12, weight: 2.5 };

export function boxFor(product: Packable): Box {
  const { ship_length_cm: length, ship_width_cm: width, ship_height_cm: height, ship_weight_kg: weight } = product;
  if (length && width && height && weight) return { length, width, height, weight };
  return BOXES[product.category] ?? DEFAULT_BOX;
}

// Un paquete con todo el pedido: las cajas van una encima de otra.
export function packageFor(lines: { product: Packable; quantity: number }[]): Box {
  const parcel = { length: 0, width: 0, height: 0, weight: 0 };
  for (const { product, quantity } of lines) {
    const box = boxFor(product);
    parcel.length = Math.max(parcel.length, box.length);
    parcel.width = Math.max(parcel.width, box.width);
    parcel.height += box.height * quantity;
    parcel.weight += box.weight * quantity;
  }
  parcel.weight = Math.round(parcel.weight * 10) / 10;
  return parcel;
}

export type Commune = { id: number; name: string; region: string };

export type ShippingOption = {
  courier: string; // courier en Shipit, ej. "starken"; o "rm"/"regiones" para la tarifa fija
  label: string; // nombre para mostrar, ej. "Starken"
  price: number; // lo que paga el cliente
  days: number | null;
  cost?: number; // lo que cobra el courier, cuando es distinto (envío gratis en la RM o descuento en regiones)
};

const COURIER_LABELS: Record<string, string> = {
  starken: "Starken",
  chilexpress: "Chilexpress",
  bluexpress: "Blue Express",
  muvsmart: "Muvsmart",
  correos_de_chile: "Correos de Chile",
};

export function courierLabel(courier: string) {
  return COURIER_LABELS[courier] ?? courier.replace(/_/g, " ").replace(/^\p{L}/u, (c) => c.toUpperCase());
}

// Cómo se muestra en el panel el envío guardado en un pedido.
export function shippingLabel(zone: string) {
  if (isShippingZone(zone)) return SHIPPING_ZONES[zone].label;
  if (zone.startsWith("shipit:")) return `${courierLabel(zone.slice(7))} (Shipit)`;
  return zone;
}
