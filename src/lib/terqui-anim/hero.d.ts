// Tipos del banner de la portada (hero.js).
export type HeroItem = {
  id: string;
  slug: string;
  kind: "notebook" | "aio" | "desktop" | "mini";
  brand: string;
  cat: string; // "Notebook", "All-in-One"…
  name: string; // nombre corto, sin la marca ni las características
  chips: string[];
  price: number;
  before: number | null; // precio anterior (oferta) o de uno nuevo
  deal: "oferta" | "nuevo" | null;
  warranty: number;
  img: string;
};

export type Photo = { url: string; ar: number };

export const HERO_RATIO: { d: number; m: number };

export function startHero(
  root: HTMLElement,
  opts: {
    products: HeroItem[];
    warranty: number;
    music?: string;
    startDelay?: number;
    cutout: (src: string) => Promise<Photo>;
  },
): { start(): void; stop(): void };
