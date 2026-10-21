import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductImage } from "@/components/ProductImage";
import { formatCLP, GRADE_LABELS } from "@/lib/format";
import { getProductBySlug } from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  return { title: product ? `${product.name} | TERC` : "Producto no encontrado" };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl border border-black/10 overflow-hidden">
        <ProductImage product={product} />
      </div>
      <div className="space-y-4">
        <p className="text-sm text-black/60">
          {product.brand} · {product.category}
        </p>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-3xl font-semibold">{formatCLP(product.price)}</p>

        <ul className="text-sm space-y-1">
          <li>
            <strong>Estado:</strong> {GRADE_LABELS[product.grade]}
          </li>
          {product.battery_health !== null && (
            <li>
              <strong>Salud de batería:</strong> {product.battery_health}%
            </li>
          )}
          <li>
            <strong>Garantía:</strong> {product.warranty_months} meses
          </li>
          <li>
            <strong>Disponibles:</strong> {product.stock}
          </li>
        </ul>

        <p className="text-black/80">{product.description}</p>
        <AddToCartButton product={product} />
      </div>
    </div>
  );
}
