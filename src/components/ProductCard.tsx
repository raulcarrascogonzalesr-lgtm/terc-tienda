import Link from "next/link";
import { formatCLP, savings } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductImage } from "./ProductImage";

export const GRADE_SHORT = { A: "Como nuevo", B: "Detalles leves", C: "Marcas visibles" } as const;

export function ProductCard({ product }: { product: Product }) {
  const off = savings(product);
  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-pine/10"
    >
      <div className="relative overflow-hidden">
        <div className="transition duration-500 group-hover:scale-[1.03]">
          <ProductImage product={product} />
        </div>
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-pine shadow-sm">
            Grado {product.grade}
            <span className="hidden sm:inline"> · {GRADE_SHORT[product.grade]}</span>
          </span>
          {off && (
            <span className="rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold text-pine shadow-sm">
              −{off.percent}%
            </span>
          )}
        </div>
        {product.stock === 1 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-pine px-2.5 py-1 text-[11px] font-semibold text-white">
            Última unidad
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          {product.brand}
        </p>
        <h3 className="line-clamp-2 font-medium leading-snug text-ink">{product.name}</h3>
        <div className="mt-auto pt-3">
          {off && (
            <p className="text-xs text-muted">
              Nuevo <span className="line-through">{formatCLP(product.list_price!)}</span>
            </p>
          )}
          <p className="text-xl font-bold tracking-tight text-ink">{formatCLP(product.price)}</p>
          <p className="mt-1 text-xs text-pine-700">Garantía {product.warranty_months} meses</p>
        </div>
      </div>
    </Link>
  );
}
