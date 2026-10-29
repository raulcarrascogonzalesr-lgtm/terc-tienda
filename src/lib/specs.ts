import type { Product } from "./types";

// Lee las características de un equipo desde su nombre y descripción, que siempre se escriben igual:
// "Notebook Dell Latitude 5430 i7-1255U, 16 GB, SSD 512 GB" y "…con Intel Core i7-1255U de 12ª generación…".
// Sirve para mostrar un nombre corto ("Latitude 5430") y etiquetas ("Core i7 12ª gen", "16 GB RAM").

export type ProductKind = "notebook" | "aio" | "desktop" | "mini";

export const KIND_LABEL: Record<ProductKind, string> = {
  notebook: "Notebook",
  aio: "All-in-One",
  desktop: "Computador de escritorio",
  mini: "Mini PC",
};

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function productKind(p: Pick<Product, "name" | "category">): ProductKind {
  const text = normalize(`${p.category} ${p.name}`);
  if (text.includes("notebook") || text.includes("laptop")) return "notebook";
  if (text.includes("all-in-one") || text.includes("todo en uno")) return "aio";
  if (text.includes("mini")) return "mini";
  return "desktop";
}

// Generación de un procesador Intel por su número de modelo: 8650U → 8, 10210U → 10, 1255U → 12.
function intelGeneration(model: string) {
  if (model.length >= 4 && model[0] === "1" && "01234".includes(model[1])) return Number(model.slice(0, 2));
  return Number(model[0]);
}

export type ProductSpecs = {
  kind: ProductKind;
  shortName: string; // sin la categoría, la marca ni las características
  cpu: string | null; // "Core i7 12ª gen"
  ram: string | null; // "16 GB RAM"
  storage: string | null; // "SSD 512 GB" o "Disco 1 TB"
  screen: string | null; // '14"'
  chips: string[];
};

export function productSpecs(p: Pick<Product, "name" | "category" | "brand" | "description">): ProductSpecs {
  const kind = productKind(p);
  const name = p.name.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  // Las partes van separadas por ", " (con espacio: "23,8" es un solo número).
  const [head, ...parts] = name.split(/\s*,\s+/);
  const desc = p.description ?? "";

  // Procesador: "i7-1255U", "i5 12ª gen" o "Ryzen 5 5600U".
  let cpu: string | null = null;
  let cpuAt = -1;
  const intel = head.match(/\b(i[3579])(?:-(\d{4,5})[a-z0-9]*|\s+(\d{1,2})\s*[ªº°]?\s*gen\b)?/i);
  const ryzen = head.match(/\bryzen\s*([3579])\b/i);
  if (intel) {
    const fromDesc = desc.match(/(\d{1,2})\s*[ªº°]\s*generaci/i);
    const gen = intel[3] ? Number(intel[3]) : intel[2] ? intelGeneration(intel[2]) : fromDesc ? Number(fromDesc[1]) : null;
    cpu = `Core ${intel[1].toLowerCase()}${gen ? ` ${gen}ª gen` : ""}`;
    cpuAt = intel.index ?? -1;
  } else if (ryzen) {
    cpu = `Ryzen ${ryzen[1]}`;
    cpuAt = ryzen.index ?? -1;
  }

  // Pantalla: '23,8"' en el nombre o "de 14 pulgadas" en la descripción.
  const inchName = head.match(/(\d{2}(?:[.,]\d)?)\s*(?:"|”|''|pulgadas)/);
  const inchDesc = desc.match(/(\d{2}(?:[.,]\d)?)\s*pulgadas/i);
  const inches = inchName?.[1] ?? inchDesc?.[1] ?? null;
  const screen = inches ? `${inches.replace(".", ",")}"` : null;

  // Nombre corto: lo que queda entre la marca y el procesador o la pantalla.
  let model = head;
  // Nombres antiguos sin comas: "ThinkPad T480 i5 16 GB 256 GB SSD".
  const sizes = [...head.matchAll(/(?:ssd\s*)?\d+\s*(?:GB|TB)(?:\s*(?:ssd|hdd|nvme))?/gi)];
  const rest = parts.length ? parts : sizes.map((m) => m[0]);
  const cuts = [cpuAt, inchName?.index ?? -1, sizes[0]?.index ?? -1].filter((i) => i > 0);
  if (cuts.length) model = model.slice(0, Math.min(...cuts));
  model = model
    .replace(/^(notebook|laptop|all-in-one|todo en uno|mini pc|pc|computador( de escritorio)?)\s+/i, "")
    .replace(new RegExp(`^${p.brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+`, "i"), "")
    .trim();

  // Memoria y disco: "16 GB" (o "16 GB DDR5") y "SSD 512 GB", "1 TB" o "256 GB".
  let ram: string | null = null;
  let storage: string | null = null;
  const extras: string[] = [];
  for (const part of rest) {
    const size = part.match(/(\d+)\s*(GB|TB)/i);
    if (!size) {
      if (part.length <= 14) extras.push(part[0].toUpperCase() + part.slice(1));
      continue;
    }
    const amount = `${size[1]} ${size[2].toUpperCase()}`;
    const isSsd = /ssd|nvme|m\.2/i.test(part);
    if (!ram && !isSsd && size[2].toUpperCase() === "GB" && Number(size[1]) <= 64) ram = `${amount} RAM`;
    else if (!storage) {
      const disk = isSsd || /ssd de/i.test(desc) ? "SSD" : /disco de/i.test(desc) ? "Disco" : "";
      storage = disk ? `${disk} ${amount}` : amount;
    }
  }

  const chips = [cpu, ram, storage, screen && kind !== "desktop" && kind !== "mini" ? (kind === "aio" ? `Pantalla ${screen}` : screen) : null, ...extras].filter(
    (c): c is string => Boolean(c),
  );
  return { kind, shortName: model || head, cpu, ram, storage, screen, chips };
}
