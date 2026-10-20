import { ProductCard } from "@/components/ProductCard";
import { listProducts } from "@/lib/products";

export const revalidate = 60;

export default async function HomePage() {
  const products = await listProducts();

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">Tecnología reacondicionada con garantía</h1>
        <p className="text-black/70">
          Equipos revisados uno por uno, con garantía y envío a todo Chile.
        </p>
      </section>

      {products.length === 0 ? (
        <p>Pronto tendremos productos disponibles.</p>
      ) : (
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </section>
      )}
    </div>
  );
}
