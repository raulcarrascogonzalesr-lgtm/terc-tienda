import Link from "next/link";
import { formatCLP, GRADE_LABELS } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/producto/${product.slug}`}
      className="bg-white rounded-xl border border-black/10 overflow-hidden hover:shadow-md transition-shadow"
    >
      <ProductImage product={product} />
      <div className="p-4 space-y-1">
        <p className="text-xs text-black/60">{GRADE_LABELS[product.grade]}</p>
        <h2 className="font-medium leading-snug">{product.name}</h2>
        <p className="text-lg font-semibold">{formatCLP(product.price)}</p>
      </div>
    </Link>
  );
}
