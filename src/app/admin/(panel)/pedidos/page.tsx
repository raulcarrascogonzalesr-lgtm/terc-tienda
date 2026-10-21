import Link from "next/link";
import { formatCLP, formatDateTime, ORDER_STATUS_LABELS } from "@/lib/format";
import { listOrders } from "../data";
import { PageHeader } from "../ui";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await listOrders();
  return (
    <section className="space-y-4">
      <PageHeader
        eyebrow="Tienda"
        title="Pedidos"
        subtitle="Las compras hechas en terc.cl. Abre uno para cambiar su estado o agregar el seguimiento."
      />
      {orders.length === 0 ? (
        <p className="text-[#6b716f]">Todavía no hay pedidos.</p>
      ) : (
        <div className="bg-white rounded-xl border border-[#e4e2dc] overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[#6b716f] border-b border-[#e4e2dc]">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Comuna</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-[#efede8] last:border-0 hover:bg-[#fafaf8]"
                >
                  <td className="p-3 whitespace-nowrap">
                    <Link href={`/admin/pedidos/${o.id}`} className="text-[#0f5f59] underline">
                      {formatDateTime(o.created_at)}
                    </Link>
                  </td>
                  <td className="p-3">{o.customer.name}</td>
                  <td className="p-3">{o.customer.comuna}</td>
                  <td className="p-3 text-right whitespace-nowrap">{formatCLP(o.total)}</td>
                  <td className="p-3">{ORDER_STATUS_LABELS[o.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
