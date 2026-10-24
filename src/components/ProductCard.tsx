import Link from "next/link";
import { formatCLP, offer, savings, shortDate } from "@/lib/format";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "./AddToCartButton";
import { DiscountSticker } from "./DiscountSticker";
import { StoreIcon } from "./icons";
import { HoverPhotos } from "./HoverPhotos";

export function ProductCard({ product }: { product: Product }) {
  const sale = offer(product);
  const vsNew = savings(product);
  const href = `/producto/${product.slug}`;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-pine/10">
      <Link href={href} className="relative block overflow-hidden">
        <div className="transition duration-[1200ms] ease-out group-hover:scale-[1.03]">
          <HoverPhotos product={product} />
        </div>
        {(sale ?? vsNew) && (
          <DiscountSticker
            percent={(sale ?? vsNew)!.percent}
            label={sale ? "dcto." : "vs. nuevo"}
            tone={sale ? "sale" : "gold"}
            size="sm"
            className="stamp absolute left-3 top-3"
          />
        )}
        {product.stock <= 3 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-pine px-2.5 py-1 text-[11px] font-semibold text-white">
            {product.stock === 1 ? "¡Última unidad!" : `¡Quedan ${product.stock}!`}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          {product.brand}
        </p>
        <Link href={href} className="line-clamp-2 font-medium leading-snug text-ink hover:text-pine-700">
          {product.name}
        </Link>
        <div className="mt-auto pt-3">
          {sale && (
            <p className="mb-1 inline-block rounded bg-sale-50 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-sale">
              {product.offer_name ??
                (product.offer_ends_at ? `Oferta hasta el ${shortDate(product.offer_ends_at)}` : "Oferta")}
            </p>
          )}
          {sale ? (
            <p className="text-xs text-muted">
              Antes <span className="line-through">{formatCLP(sale.before)}</span>
            </p>
          ) : (
            vsNew && (
              <p className="text-xs text-muted">
                Nuevo <span className="line-through">{formatCLP(vsNew.before)}</span>
              </p>
            )
          )}
          <p className={`text-2xl font-bold tracking-tight ${sale ? "text-sale" : "text-ink"}`}>
            {formatCLP(product.price)}
          </p>
          {(sale ?? vsNew) && (
            <p className={`text-xs font-semibold ${sale ? "text-sale" : "text-pine-700"}`}>
              Ahorras {formatCLP((sale ?? vsNew)!.amount)}
            </p>
          )}
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
            <StoreIcon name="shield" className="w-3.5 h-3.5 text-pine-700" />
            {product.warranty_months} meses de garantía
          </p>
          <div className="mt-3">
            <AddToCartButton product={product} compact />
          </div>
        </div>
      </div>
    </article>
  );
}
