import { offer } from "./format";
import type { Product } from "./types";

// Black Friday (27 al 30-11-2026). Todo el diseño negro y dorado se enciende solo cuando hay
// productos con una oferta vigente llamada "Black Friday" (columna offer_name), y se apaga solo
// cuando termina (lib/products.ts quita la oferta al pasar offer_ends_at). Sin ofertas, la tienda
// se ve como siempre.
export function isBlackFriday(p: Pick<Product, "price" | "compare_price" | "offer_name">) {
  return Boolean(offer(p) && p.offer_name && /black\s*friday/i.test(p.offer_name));
}

// Las ofertas de Black Friday, la de mayor descuento primero, y cuándo termina la primera en vencer.
export function blackFriday(products: Product[]) {
  const deals = products
    .filter(isBlackFriday)
    .sort((a, b) => (offer(b)?.percent ?? 0) - (offer(a)?.percent ?? 0) || b.price - a.price);
  const ends = deals.map((p) => p.offer_ends_at).filter((d): d is string => Boolean(d)).sort()[0] ?? null;
  const maxPercent = deals.reduce((m, p) => Math.max(m, offer(p)?.percent ?? 0), 0);
  const maxSaving = deals.reduce((m, p) => Math.max(m, offer(p)?.amount ?? 0), 0);
  return { active: deals.length > 0, deals, ends, maxPercent, maxSaving };
}
