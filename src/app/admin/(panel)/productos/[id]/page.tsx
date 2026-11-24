import Link from "next/link";
import { notFound } from "next/navigation";
import { isEnergy } from "@/lib/energy";
import { getProduct } from "../../data";
import { ProductForm } from "../ProductForm";
import { PageHeader } from "../../ui";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  return (
    <section className="space-y-4 max-w-3xl">
      <PageHeader eyebrow="Productos" title="Editar producto">
        {isEnergy(product) && (
          <Link
            href={`/admin/precios?sku=${product.sku}#sku-${product.sku}`}
            className="inline-flex items-center gap-2 rounded-md border border-[#cfd8d3] bg-white px-4 py-2 text-sm font-semibold text-[#0a2a2a] hover:bg-[#f1efe8]"
          >
            Ver en la tabla de precios
          </Link>
        )}
      </PageHeader>
      <ProductForm product={product} />
    </section>
  );
}
