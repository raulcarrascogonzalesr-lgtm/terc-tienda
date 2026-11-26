import Link from "next/link";
import { isBlackFriday } from "@/lib/black-friday";
import { energyCategory } from "@/lib/energy";
import { cardPrice, formatCLP, offer, savings, shortDate } from "@/lib/format";
import type { Product } from "@/lib/types";
import { warrantyLabel } from "@/lib/warranty";
import { AddToCartButton } from "./AddToCartButton";
import { DiscountSticker } from "./DiscountSticker";
import { StoreIcon } from "./icons";
import { HoverPhotos } from "./HoverPhotos";

export function ProductCard({ product }: { product: Product }) {
  const sale = offer(product);
  const bf = isBlackFriday(product);
  // Energía: producto nuevo, con garantía de fábrica (no es reacondicionado ni se compara con uno nuevo).
  const energy = energyCategory(product.category);
  const vsNew = energy ? null : savings(product);
  const href = `/producto/${product.slug}`;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line/[0.06] bg-surface transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-pine/10">
      <Link href={href} className="relative block overflow-hidden">
        <div className="transition duration-[1200ms] ease-out group-hover:scale-[1.03]">
          <HoverPhotos product={product} />
        </div>
        {energy && !sale && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-pine">
            Nuevo
          </span>
        )}
        {(sale ?? vsNew) && (
          <DiscountSticker
            percent={(sale ?? vsNew)!.percent}
            label={bf ? "black" : sale ? "dcto." : "vs. nuevo"}
            tone={bf ? "black" : sale ? "sale" : "gold"}
            size="sm"
            className="stamp absolute left-3 top-3"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          {product.brand}
          {energy && <span className="font-normal normal-case tracking-normal"> · {energy.short}</span>}
        </p>
        <Link href={href} className="line-clamp-2 font-medium leading-snug text-ink hover:text-pine-700">
          {product.name}
        </Link>
        <div className="mt-auto pt-3">
          {sale && (
            <p
              className={`mb-1 inline-block rounded px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${bf ? "bg-[#0b0b0a] text-gold" : "bg-sale-50 text-sale"}`}
            >
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
          <p className="-mt-0.5 text-[11px] text-muted/70">{energy ? "IVA incluido" : "Transferencia · IVA incluido"}</p>
          {!energy && cardPrice(product.price) !== product.price && (
            <p className="text-[11px] text-muted/50">Otros medios de pago {formatCLP(cardPrice(product.price))}</p>
          )}
          {(sale ?? vsNew) && (
            <p className={`text-xs font-semibold ${sale ? "text-sale" : "text-pine-700"}`}>
              Ahorras {formatCLP((sale ?? vsNew)!.amount)}
            </p>
          )}
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
            <StoreIcon name="shield" className="w-3.5 h-3.5 text-pine-700" />
            {energy
              ? product.warranty_months
                ? `${warrantyLabel(product.warranty_months)} de garantía de fábrica`
                : "Garantía de fábrica"
              : `${warrantyLabel(product.warranty_months)} de garantía`}
          </p>
          <div className="mt-3">
            <AddToCartButton product={product} compact />
          </div>
        </div>
      </div>
    </article>
  );
}
