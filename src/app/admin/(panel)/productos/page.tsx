import Link from "next/link";
import { formatCLP } from "@/lib/format";
import { listAllProducts } from "../data";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await listAllProducts();
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link href="/admin/productos/nuevo" className="btn-primary">
          + Nuevo producto
        </Link>
      </div>
      <div className="bg-white rounded-xl border border-black/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-black/60 border-b border-black/10">
            <tr>
              <th className="p-3">Producto</th>
              <th className="p-3">Grado</th>
              <th className="p-3 text-right">Precio</th>
              <th className="p-3 text-right">Costo</th>
              <th className="p-3 text-right">Margen</th>
              <th className="p-3 text-right">Stock</th>
              <th className="p-3">Visible</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const margin = p.cost === null ? null : p.price - p.cost;
              return (
                <tr
                  key={p.id}
                  className="border-b border-black/5 last:border-0 hover:bg-black/[.02]"
                >
                  <td className="p-3">
                    <Link href={`/admin/productos/${p.id}`} className="text-brand underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="p-3">{p.grade}</td>
                  <td className="p-3 text-right whitespace-nowrap">{formatCLP(p.price)}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {p.cost === null ? "—" : formatCLP(p.cost)}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {margin === null
                      ? "—"
                      : `${formatCLP(margin)} (${p.price ? Math.round((margin / p.price) * 100) : 0}%)`}
                  </td>
                  <td className={`p-3 text-right ${p.stock === 0 ? "text-red-700" : ""}`}>
                    {p.stock}
                  </td>
                  <td className="p-3">{p.active ? "Sí" : "No"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-black/60">
        En la tienda solo aparecen los productos visibles y con stock. El costo nunca se muestra al
        cliente.
      </p>
    </section>
  );
}
