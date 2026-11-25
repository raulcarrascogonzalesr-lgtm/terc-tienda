import type { Product } from "./types";

// Marcas de Energía (TERC 2.1). Raúl pidió (24-11) ordenar Energía por marca y modelo: cada marca en
// su propio apartado, con su nombre, su logo y sus productos. La marca sale del campo "Marca" del
// producto en el panel; aquí solo se dice cómo se ve. Una marca que no está en la lista igual aparece,
// con su nombre y sin logo.
//
// Logos: los oficiales, bajados del sitio de cada marca (Victron, de su kit de prensa), en
// /public/marcas/energia. Siempre sobre fondo blanco, como piden las marcas.

export type EnergyBrand = {
  key: string; // para el enlace: /energia?marca=victron
  name: string; // como se ve en la tienda
  aliases: string[]; // otras formas de escribirla en el panel
  logo?: string; // logo oficial; sin logo se muestra el nombre
  dark?: boolean; // el logo oficial es blanco: va sobre fondo oscuro
};

export const ENERGY_BRANDS: EnergyBrand[] = [
  { key: "victron", name: "Victron Energy", aliases: ["Victron"], logo: "/marcas/energia/victron.svg" },
  { key: "voltronic", name: "Voltronic Power", aliases: ["Voltronic"], logo: "/marcas/energia/voltronic.png" },
  { key: "pylontech", name: "Pylontech", aliases: [], logo: "/marcas/energia/pylontech.svg" },
  { key: "dyness", name: "Dyness", aliases: [], logo: "/marcas/energia/dyness.svg" },
  { key: "huawei", name: "Huawei", aliases: ["Huawei FusionSolar"], logo: "/marcas/energia/huawei.png" },
  { key: "solis", name: "Solis", aliases: ["Ginlong", "Ginlong Solis"], logo: "/marcas/energia/solis.png" },
  // EPSolar es el nombre antiguo de EPEVER (la misma fábrica); los productos de Esol dicen EPSolar.
  { key: "epsolar", name: "EPSolar (EPEVER)", aliases: ["EPSolar", "EPEVER", "EP Solar"], logo: "/marcas/energia/epever.png" },
  { key: "growatt", name: "Growatt", aliases: [], logo: "/marcas/energia/growatt.png" },
  { key: "cotek", name: "Cotek", aliases: [], logo: "/marcas/energia/cotek.png" },
  { key: "ultracell", name: "Ultracell", aliases: [], logo: "/marcas/energia/ultracell.png", dark: true },
  // Nimac no publica su logo en internet: este lo encontró Raúl (25-11).
  { key: "nimac", name: "Nimac", aliases: ["Nimac Power Systems"], logo: "/marcas/energia/nimac.png" },
  // Logos oficiales bajados de hoymiles.com y solaxpower.com (25-11).
  { key: "hoymiles", name: "Hoymiles", aliases: [], logo: "/marcas/energia/hoymiles.png" },
  { key: "solax", name: "SolaX Power", aliases: ["Solax", "SolaX"], logo: "/marcas/energia/solax.png" },
  // Sin logo oficial en internet: se muestra el nombre.
  { key: "must", name: "Must", aliases: ["Must Solar", "Must Power"] },
  { key: "gruntek", name: "Gruntek", aliases: [] },
  { key: "powerstar", name: "PowerStar", aliases: ["Power Star"] },
];

// Productos sin marca (o con "Sin marca" en el panel): van juntos al final.
export const OTHER_BRANDS: EnergyBrand = { key: "otras", name: "Otras marcas", aliases: [] };
const NO_BRAND = new Set(["", "sin marca", "sinmarca", "generico", "generica", "otra", "otras", "na", "n/a"]);

function compact(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const BY_NAME = new Map<string, EnergyBrand>();
for (const b of ENERGY_BRANDS) for (const n of [b.key, b.name, ...b.aliases]) BY_NAME.set(compact(n), b);

// La marca de un producto (siempre devuelve una: si no está en la lista, una sin logo con su nombre).
export function energyBrand(brand: string | null | undefined): EnergyBrand {
  const text = (brand ?? "").trim();
  if (NO_BRAND.has(text.toLowerCase().replace(/\s+/g, " ")) || !compact(text)) return OTHER_BRANDS;
  return BY_NAME.get(compact(text)) ?? { key: compact(text), name: text, aliases: [] };
}

// La marca elegida en el enlace (?marca=victron), o null.
export function brandFromParam(param: string | null | undefined): EnergyBrand | null {
  if (!param) return null;
  const key = compact(param);
  if (key === OTHER_BRANDS.key) return OTHER_BRANDS;
  return BY_NAME.get(key) ?? (key ? { key, name: param.trim(), aliases: [] } : null);
}

// --- Orden por modelo -----------------------------------------------------------------------------
// Los nombres de Esol traen palabras de relleno al principio ("Inv-Carg-Reg. Solar, Axpert VM II …",
// "Bateria de Litio Nimac 12V …"). Para ordenar se quitan esas palabras y la marca, y lo que queda
// (el modelo) se ordena como lo haría una persona: Axpert VM 1000 antes que Axpert VM 2000.
const FILLER = new Set([
  "inversor", "inv", "cargador", "carg", "reg", "solar", "bateria", "baterias", "battery", "de", "litio",
  "hibrid", "hibrido", "hybrid", "offgrid", "bess", "modelo",
]);

export function modelName(product: Pick<Product, "name" | "brand">): string {
  const brand = energyBrand(product.brand);
  const brandWords = new Set([brand.key, ...[brand.name, ...brand.aliases].flatMap((n) => n.split(/\s+/)).map(compact)]);
  const words = product.name.replace(/[-‐–]+/g, " ").split(/\s+/).filter(Boolean);
  let i = 0;
  while (i < words.length - 1 && (FILLER.has(compact(words[i])) || brandWords.has(compact(words[i])))) i++;
  return words.slice(i).join(" ");
}

const collator = new Intl.Collator("es", { numeric: true, sensitivity: "base", ignorePunctuation: true });

export function sortByModel<T extends Pick<Product, "name" | "brand" | "price">>(list: T[]): T[] {
  return [...list].sort((a, b) => collator.compare(modelName(a), modelName(b)) || a.price - b.price);
}

// --- Apartados por marca --------------------------------------------------------------------------
export type BrandGroup<T> = { brand: EnergyBrand; products: T[]; from: number };

// Agrupa por marca: las que tienen más productos primero ("Otras marcas" al final) y, dentro de
// cada marca, los productos ordenados por modelo.
export function groupByBrand<T extends Pick<Product, "name" | "brand" | "price">>(list: T[]): BrandGroup<T>[] {
  const groups = new Map<string, BrandGroup<T>>();
  for (const p of list) {
    const brand = energyBrand(p.brand);
    const group = groups.get(brand.key) ?? { brand, products: [], from: Infinity };
    group.products.push(p);
    group.from = Math.min(group.from, p.price);
    groups.set(brand.key, group);
  }
  return [...groups.values()]
    .map((g) => ({ ...g, products: sortByModel(g.products) }))
    .sort(
      (a, b) =>
        Number(a.brand === OTHER_BRANDS) - Number(b.brand === OTHER_BRANDS) ||
        b.products.length - a.products.length ||
        collator.compare(a.brand.name, b.brand.name),
    );
}
