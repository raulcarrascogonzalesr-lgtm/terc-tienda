import type { IconName } from "@/components/icons";
import type { Order, Product } from "./types";

// TERC 2.1: además de equipos reacondicionados, TERC vende productos de energía nuevos (proveedor Esol).
// Un producto es de Energía si su categoría es una de estas (en el panel se escribe tal cual, o el
// nombre corto). TERC SOLO los vende: nunca los instala. Quien quiera un kit con instalación se
// deriva a WireSun Energy.
//
// Se compran distinto: no se pagan con Mercado Pago ni Webpay. El cliente envía una solicitud,
// TERC confirma stock y total, le manda la cuenta y el monto, y el cliente paga por transferencia.

export type EnergyCategory = {
  name: string; // como se escribe en el panel y se ve en la tienda
  short: string; // para el menú
  aliases: string[]; // otras formas de escribirla en el panel
  blurb: string; // una línea para la tarjeta de la categoría
  install: boolean; // se conecta a una instalación eléctrica (Raúl 23-11: no se avisa en la tienda)
  icon: IconName; // para las tarjetas cuando la categoría aún no tiene productos con foto
};

export const ENERGY_CATEGORIES: EnergyCategory[] = [
  {
    name: "Respaldo (UPS)",
    short: "Respaldo (UPS)",
    aliases: ["UPS", "Respaldo", "Respaldo UPS"],
    blurb: "Que el computador no se apague con un corte de luz.",
    install: false,
    icon: "shield",
  },
  {
    // Raúl 24-11: también se venden baterías de gel y AGM de Esol, así que la categoría es "Baterías".
    // Los productos de litio quedan con "Baterías de litio" (alias) y siguen cayendo aquí.
    name: "Baterías",
    short: "Baterías",
    aliases: ["Baterías de litio", "Baterias", "Baterías de litio y AGM", "Baterías de gel", "Baterías GEL y AGM", "Baterías AGM"],
    blurb: "Litio, gel y AGM para respaldo y sistemas solares.",
    install: true,
    icon: "battery",
  },
  {
    name: "Inversores y reguladores",
    short: "Inversores",
    aliases: ["Inversores", "Reguladores", "Inversor"],
    blurb: "Convierten y controlan la energía.",
    install: true,
    icon: "bolt",
  },
  {
    name: "Paneles solares",
    short: "Paneles solares",
    aliases: ["Paneles", "Panel solar"],
    blurb: "Paneles de alta potencia, por unidad.",
    install: true,
    icon: "sun",
  },
  {
    name: "Cables y conectores",
    short: "Cables",
    aliases: ["Cables", "Conectores", "Cable solar"],
    blurb: "Cable solar, MC4 y accesorios.",
    install: true,
    icon: "plug",
  },
  {
    name: "Iluminación",
    short: "Iluminación",
    aliases: ["Iluminacion", "Luces", "Luces de respaldo", "Iluminación y luces de respaldo"],
    blurb: "Focos recargables y luces de respaldo.",
    install: false,
    icon: "bulb",
  },
];

// Empresa de kits solares con instalación (Wiremax). El enlace dice que el visitante llega desde TERC.
export const WIRESUN_URL = "https://www.wiresunenergy.cl/?utm_source=terc&utm_medium=referral&utm_campaign=kits-solares";

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const BY_NAME = new Map<string, EnergyCategory>();
for (const c of ENERGY_CATEGORIES) for (const n of [c.name, c.short, ...c.aliases]) BY_NAME.set(normalize(n), c);

// La categoría de Energía de un producto, o null si es un equipo.
export function energyCategory(category: string | null | undefined): EnergyCategory | null {
  return category ? (BY_NAME.get(normalize(category)) ?? null) : null;
}

export function isEnergy(product: Pick<Product, "category">): boolean {
  return energyCategory(product.category) !== null;
}

// Separa el catálogo en los dos mundos de la tienda.
export function splitWorlds<T extends Pick<Product, "category">>(products: T[]) {
  const energy: T[] = [];
  const pcs: T[] = [];
  for (const p of products) (isEnergy(p) ? energy : pcs).push(p);
  return { pcs, energy };
}

// Las categorías de Energía que tienen productos, en el orden de la tienda.
export function energyCategoriesIn(products: Pick<Product, "category">[]): EnergyCategory[] {
  const present = new Set(products.map((p) => energyCategory(p.category)?.name).filter(Boolean));
  return ENERGY_CATEGORIES.filter((c) => present.has(c.name));
}

// Categorías del menú de Energía. Raúl decidió (23-11) mostrar Energía desde ya, aunque todavía
// no haya productos: mientras no haya ninguno se muestran todas, como "Muy pronto".
export function energyMenu(products: Pick<Product, "category">[]): EnergyCategory[] {
  const present = energyCategoriesIn(products);
  return present.length ? present : ENERGY_CATEGORIES;
}

// Enlace a una categoría de Energía.
export function energyHref(category?: Pick<EnergyCategory, "name"> | null) {
  return category ? `/energia?categoria=${encodeURIComponent(category.name)}#productos` : "/energia#productos";
}

// Frase de precio de Energía (inicio y página de Energía). Raúl (23-11) quiere que quede claro el precio.
// "Entre los mejores" se puede defender aunque Esol venda un poco más barato al público.
export const ENERGY_PRICE_CLAIM = "entre los mejores precios del mercado";

// Cómo se compra Energía (carrito, ficha y página de Energía).
export const ENERGY_STEPS = [
  { title: "Pides", text: "Envías tu carrito con tus datos." },
  { title: "Confirmamos", text: "Stock y total, el mismo día hábil." },
  { title: "Transfieres", text: "Te mandamos la cuenta y el monto." },
  { title: "Recibes", text: "Entrega coordinada contigo." },
] as const;

// Datos que se muestran en la tienda (garantía de fábrica, plazo de entrega).
export const ENERGY_INFO = {
  delivery: "Región Metropolitana: lo llevamos nosotros. Regiones: lo cotizamos según el producto.",
  // Plazo para transferir desde que se le envía la cuenta y el monto al cliente.
  holdHours: 48,
};

// Solicitudes de compra: se guardan como pedidos "Pendiente" con estas marcas.
export const REQUEST_ZONE = "solicitud";
export const REQUEST_COURIER = "Entrega TERC (se coordina por WhatsApp)";

export function isRequestOrder(order: Pick<Order, "customer">): boolean {
  return order.customer?.payment === "transferencia";
}
