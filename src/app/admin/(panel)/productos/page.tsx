import Link from "next/link";
import { formatCLP } from "@/lib/format";
import { listAllProducts } from "../data";
import { PageHeader } from "../ui";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await listAllProducts();
  return (
    <section className="space-y-4">
      <PageHeader
        eyebrow="Tienda"
        title="Productos"
        subtitle="Precio, costo, margen y stock de cada equipo."
      >
        <Link href="/admin/productos/nuevo" className="btn-primary">
          + Nuevo producto
        </Link>
      </PageHeader>
      <div className="bg-white rounded-xl border border-[#e4e2dc] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[#6b716f] border-b border-[#e4e2dc]">
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
                  className="border-b border-[#efede8] last:border-0 hover:bg-[#fafaf8]"
                >
                  <td className="p-3">
                    <Link href={`/admin/productos/${p.id}`} className="text-[#0f5f59] underline">
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
                  <td className={`p-3 text-right ${p.stock === 0 ? "text-[#b3362a]" : ""}`}>
                    {p.stock}
                  </td>
                  <td className="p-3">{p.active ? "Sí" : "No"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-[#6b716f]">
        En la tienda solo aparecen los productos visibles y con stock. El costo nunca se muestra al
        cliente.
      </p>
    </section>
  );
}
