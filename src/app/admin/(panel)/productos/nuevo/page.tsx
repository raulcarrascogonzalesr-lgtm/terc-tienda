import { ProductForm } from "../ProductForm";
import { PageHeader } from "../../ui";

export default function NewProductPage() {
  return (
    <section className="space-y-4 max-w-3xl">
      <PageHeader eyebrow="Productos" title="Nuevo producto" />
      <ProductForm />
    </section>
  );
}
