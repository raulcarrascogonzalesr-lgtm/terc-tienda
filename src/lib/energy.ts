import { hasRealPhoto } from "./photo";
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
  // Para Google (24-11): las palabras que la gente escribe al buscar, ej. "batería de litio 48v".
  seo: { title: string; description: string; heading: string };
};

export const ENERGY_CATEGORIES: EnergyCategory[] = [
  {
    name: "Respaldo (UPS)",
    short: "Respaldo (UPS)",
    aliases: ["UPS", "Respaldo", "Respaldo UPS"],
    blurb: "Que el computador no se apague con un corte de luz.",
    install: false,
    icon: "shield",
    seo: {
      title: "UPS y respaldo para cortes de luz: precios en Chile",
      description: "UPS nuevas para que tu computador, router o servidor no se apague con un corte de luz. Garantía de fábrica, factura y entrega en la Región Metropolitana.",
      heading: "UPS y respaldo para cortes de luz",
    },
  },
  {
    // Raúl 24-11: solo baterías de litio; las de plomo (gel y AGM) quedaron ocultas ("son un cacho y muy baratas").
    // "Baterías" sigue como alias porque esas 22 ocultas tienen esa categoría.
    name: "Baterías de litio",
    short: "Baterías",
    aliases: ["Baterías", "Baterias", "Baterías de litio y AGM", "Baterías de gel", "Baterías GEL y AGM", "Baterías AGM"],
    blurb: "Litio para respaldo y sistemas solares.",
    install: true,
    icon: "battery",
    seo: {
      title: "Baterías de litio 12V, 24V y 48V: precios en Chile",
      description: "Baterías de litio nuevas de 12V, 24V, 48V y alto voltaje (Pylontech, Dyness, Huawei, Nimac y más) para respaldo y sistemas solares. Garantía de fábrica y factura.",
      heading: "Baterías de litio para respaldo y energía solar",
    },
  },
  {
    name: "Inversores y reguladores",
    short: "Inversores",
    aliases: ["Inversores", "Reguladores", "Inversor"],
    blurb: "Convierten y controlan la energía.",
    install: true,
    icon: "bolt",
    seo: {
      title: "Inversores y reguladores solares: precios en Chile",
      description: "Inversores híbridos, inversores de corriente y reguladores de carga nuevos para sistemas solares y respaldo. Garantía de fábrica, factura y entrega en la Región Metropolitana.",
      heading: "Inversores y reguladores de carga",
    },
  },
  {
    name: "Paneles solares",
    short: "Paneles solares",
    aliases: ["Paneles", "Panel solar"],
    blurb: "Paneles de alta potencia, por unidad.",
    install: true,
    icon: "sun",
    seo: {
      title: "Paneles solares por unidad: precios en Chile",
      description: "Paneles solares nuevos de alta potencia, por unidad. Garantía de fábrica, factura y entrega en la Región Metropolitana.",
      heading: "Paneles solares por unidad",
    },
  },
  {
    name: "Cables y conectores",
    short: "Cables",
    aliases: ["Cables", "Conectores", "Cable solar"],
    blurb: "Cable solar, MC4 y accesorios.",
    install: true,
    icon: "plug",
    seo: {
      title: "Cable solar y conectores MC4: precios en Chile",
      description: "Cable solar y conectores MC4 nuevos para instalaciones fotovoltaicas. Con factura y entrega en la Región Metropolitana.",
      heading: "Cable solar y conectores MC4",
    },
  },
  {
    name: "Iluminación",
    short: "Iluminación",
    aliases: ["Iluminacion", "Luces", "Luces de respaldo", "Iluminación y luces de respaldo"],
    blurb: "Focos recargables y luces de respaldo.",
    install: false,
    icon: "bulb",
    seo: {
      title: "Luces de emergencia y focos recargables: precios en Chile",
      description: "Luces de emergencia, focos recargables y luces de respaldo para cortes de luz. Nuevos, con garantía de fábrica y factura.",
      heading: "Luces de emergencia y focos recargables",
    },
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

// Las UPS (para el apartado "Que un corte de luz no te corte la pega"), de la más barata a la más cara.
export const UPS_CATEGORY = "Respaldo (UPS)";
export function upsProducts<T extends Pick<Product, "category" | "price">>(products: T[]): T[] {
  return products.filter((p) => energyCategory(p.category)?.name === UPS_CATEGORY).sort((a, b) => a.price - b.price);
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

// Las fotos más lindas de Energía, en orden, para portadas, banners y tarjetas de categoría
// (elegidas el 24-11 mirando todas). Después van las demás con foto real, de la más cara a la más barata.
const SHOWCASE = [
  "bateria-litio-pylontech-fidus-plus-16-kwh-incl-ruedas-y-cable",
  "bateria-litio-nimac-51-2v-nm51-2-200-wall-10-24kwh",
  "bateria-de-litio-voltronic-lio-ii-4810e-5kwh",
  "dyness-powerbrick-wheel-top-cover-battery-51-2v-280ah-14-341kwh",
  "bateria-litio-solis-intellihome-16-kwh",
  "bateria-de-litio-nimac-12v-300ah",
  "bateria-litio-nimac-51-2v-nm51-2-300-15-36kwh",
  "bateria-de-litio-dyness-dl5-0f-100ah-5-12kwh",
];

// Solo productos con foto real (sin la de Terqui "aún no tiene foto"), las más lindas primero.
export function showcaseOrder<T extends Pick<Product, "slug" | "price" | "image_url">>(products: T[]): T[] {
  const rank = (p: T) => {
    const i = SHOWCASE.indexOf(p.slug);
    return i < 0 ? SHOWCASE.length : i;
  };
  return products.filter(hasRealPhoto).sort((a, b) => rank(a) - rank(b) || b.price - a.price);
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
