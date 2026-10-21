import { ProductForm } from "../ProductForm";

export default function NewProductPage() {
  return (
    <section className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Nuevo producto</h1>
      <ProductForm />
    </section>
  );
}
