import Link from "next/link";
import { formatCLP, formatDateTime, ORDER_STATUS_LABELS } from "@/lib/format";
import { listOrders } from "../data";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await listOrders();
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Pedidos</h1>
      {orders.length === 0 ? (
        <p className="text-black/60">Todavía no hay pedidos.</p>
      ) : (
        <div className="bg-white rounded-xl border border-black/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-black/60 border-b border-black/10">
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
                  className="border-b border-black/5 last:border-0 hover:bg-black/[.02]"
                >
                  <td className="p-3 whitespace-nowrap">
                    <Link href={`/admin/pedidos/${o.id}`} className="text-brand underline">
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
