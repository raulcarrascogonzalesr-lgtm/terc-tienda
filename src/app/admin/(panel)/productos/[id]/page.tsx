import { notFound } from "next/navigation";
import { getProduct } from "../../data";
import { ProductForm } from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  return (
    <section className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Editar producto</h1>
      <ProductForm product={product} />
    </section>
  );
}
