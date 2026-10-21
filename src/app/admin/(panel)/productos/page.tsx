import Link from "next/link";
import { formatCLP } from "@/lib/format";
import { listAllProducts } from "../data";
import { netOf } from "../finance";
import { ICONS } from "../icons";
import { Icon, PageHeader } from "../ui";
import { DeleteProductButton } from "./DeleteProductButton";

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
              <th className="p-3 text-right">Precio con IVA</th>
              <th className="p-3 text-right">Costo neto</th>
              <th className="p-3 text-right">Margen neto</th>
              <th className="p-3 text-right">Stock</th>
              <th className="p-3">Visible</th>
              <th className="p-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              // Se compara sin IVA: precio neto menos costo neto.
              const priceNet = netOf(p.price);
              const margin = p.cost === null ? null : priceNet - p.cost;
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
                      : `${formatCLP(margin)} (${priceNet ? Math.round((margin / priceNet) * 100) : 0}%)`}
                  </td>
                  <td className={`p-3 text-right ${p.stock === 0 ? "text-[#b3362a]" : ""}`}>
                    {p.stock}
                  </td>
                  <td className="p-3">{p.active ? "Sí" : "No"}</td>
                  <td className="px-3 py-1.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        title="Editar producto"
                        aria-label={`Editar ${p.name}`}
                        className="rounded-lg p-1.5 text-[#6b716f] transition hover:bg-[#eef5f3] hover:text-[#0f5f59]"
                      >
                        <Icon path={ICONS.editar} className="w-[18px] h-[18px]" />
                      </Link>
                      <DeleteProductButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-[#6b716f]">
        En la tienda solo aparecen los productos visibles y con stock. El costo nunca se muestra al
        cliente. El margen compara el precio sin IVA con el costo sin IVA.
      </p>
    </section>
  );
}
