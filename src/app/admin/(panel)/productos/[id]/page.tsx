import { notFound } from "next/navigation";
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
      <PageHeader eyebrow="Productos" title="Editar producto" />
      <ProductForm product={product} />
    </section>
  );
}
