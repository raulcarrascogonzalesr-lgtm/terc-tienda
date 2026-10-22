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

// Comuna desde donde TERC despacha. Shipit cotiza entre esta comuna y la del cliente.
export const ORIGIN_COMMUNE = "LAS CONDES";

// Medidas aproximadas de la caja según el tipo de equipo (cm y kg), para cotizar con Shipit.
type Box = { length: number; width: number; height: number; weight: number };
const BOXES: Record<string, Box> = {
  Celulares: { length: 20, width: 12, height: 8, weight: 0.7 },
  Tablets: { length: 32, width: 24, height: 8, weight: 1.3 },
  Notebooks: { length: 45, width: 33, height: 10, weight: 3 },
};
const DEFAULT_BOX: Box = { length: 30, width: 25, height: 10, weight: 1.5 };

// Un paquete con todo el pedido: las cajas van una encima de otra.
export function packageFor(lines: { category: string; quantity: number }[]): Box {
  const parcel = { length: 0, width: 0, height: 0, weight: 0 };
  for (const { category, quantity } of lines) {
    const box = BOXES[category] ?? DEFAULT_BOX;
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
  courier: string; // identificador del courier en Shipit, ej. "starken"
  label: string; // nombre para mostrar, ej. "Starken"
  price: number;
  days: number | null;
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
