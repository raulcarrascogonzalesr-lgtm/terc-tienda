import type { Product } from "@/lib/types";

export function ProductImage({ product }: { product: Product }) {
  if (!product.image_url) {
    return (
      <div className="aspect-square bg-black/5 flex items-center justify-center text-black/40 text-sm">
        {product.brand}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={product.image_url} alt={product.name} className="aspect-square w-full object-cover" />
  );
}
