import Link from "next/link";
import { formatCLP } from "@/lib/format";
import { listAllProducts, listExtraCosts } from "../data";
import { extraCostFor } from "../extra-costs";
import { netOf } from "../finance";
import { ICONS } from "../icons";
import { Icon, PageHeader } from "../ui";
import { DeleteProductButton } from "./DeleteProductButton";
import { ImportPhotosButton } from "./ImportPhotosButton";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, extraCosts] = await Promise.all([listAllProducts(), listExtraCosts()]);
  const ours = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos/`;
  const isExternal = (url: string | null) => !!url?.startsWith("https://") && !url.startsWith(ours);
  const externalPhotos = products.filter(
    (p) => isExternal(p.image_url) || p.images.some(isExternal),
  ).length;
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
      <ImportPhotosButton pending={externalPhotos} />
      <div className="bg-white rounded-xl border border-[#e4e2dc] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[#6b716f] border-b border-[#e4e2dc]">
            <tr>
              <th className="p-3">Producto</th>
              <th className="p-3">Grado</th>
              <th className="p-3 text-right">Precio con IVA</th>
              <th className="p-3 text-right">Costo neto</th>
              <th className="p-3 text-right">Costos por venta</th>
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
              // Se compara sin IVA: precio neto menos costo neto y menos los costos por venta.
              const priceNet = netOf(p.price);
              const extra = extraCostFor(p.price, p.category, extraCosts);
              const margin = p.cost === null ? null : priceNet - p.cost - extra;
              return (
                <tr
                  key={p.id}
                  className="border-b border-[#efede8] last:border-0 hover:bg-[#fafaf8]"
                >
                  <td className="p-3">
                    <Link href={`/admin/productos/${p.id}`} className="text-[#288868] underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="p-3">{p.grade}</td>
                  <td className="p-3 text-right whitespace-nowrap">{formatCLP(p.price)}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {p.cost === null ? "—" : formatCLP(p.cost)}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap text-[#6b716f]">
                    {extra ? `−${formatCLP(extra)}` : "—"}
                  </td>
                  <td
                    className={`p-3 text-right whitespace-nowrap ${margin !== null && margin < 0 ? "text-[#b3362a]" : ""}`}
                  >
                    {margin === null
                      ? "—"
                      : `${formatCLP(margin)} (${priceNet ? Math.round((margin / priceNet) * 100) : 0}%)`}
                  </td>
                  <td
                    className={`p-3 text-right whitespace-nowrap ${p.stock === 0 ? "text-[#b3362a]" : ""}`}
                  >
                    {p.stock}
                    {p.on_demand && <span className="block text-xs text-[#6b716f]">del proveedor</span>}
                  </td>
                  <td className="p-3">{p.active ? "Sí" : "No"}</td>
                  <td className="px-3 py-1.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        title="Editar producto"
                        aria-label={`Editar ${p.name}`}
                        className="rounded-lg p-1.5 text-[#6b716f] transition hover:bg-[#eef5f3] hover:text-[#288868]"
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
        En la tienda solo aparecen los productos visibles y con stock. Los del proveedor no cuentan como plata invertida. El costo nunca se muestra al
        cliente. El margen compara el precio sin IVA con el costo sin IVA, y le resta los{" "}
        <Link href="/admin/costos-extra" className="underline">
          costos por venta
        </Link>{" "}
        (caja, embalaje, comisión).
      </p>
    </section>
  );
}
