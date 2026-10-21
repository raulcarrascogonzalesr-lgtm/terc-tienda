import Link from "next/link";
import { formatCLP, formatDateTime, ORDER_STATUS_LABELS } from "@/lib/format";
import { listAllProducts, listOrders } from "./data";
import { summarize } from "./summary";

export const dynamic = "force-dynamic";

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="bg-white rounded-xl border border-black/10 p-4 space-y-1">
      <p className="text-sm text-black/60">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {note && <p className="text-xs text-black/50">{note}</p>}
    </div>
  );
}

export default async function SummaryPage() {
  const [orders, products] = await Promise.all([listOrders(), listAllProducts()]);
  const s = summarize(orders, products);
  const monthName = new Intl.DateTimeFormat("es-CL", {
    month: "long",
    timeZone: "America/Santiago",
  }).format(new Date());

  return (
    <section className="space-y-8">
      <h1 className="text-2xl font-bold">Resumen</h1>

      {(s.toShip > 0 || s.awaitingPayment > 0) && (
        <div className="flex flex-wrap gap-3 text-sm">
          {s.toShip > 0 && (
            <Link
              href="/admin/pedidos"
              className="rounded-full bg-amber-100 text-amber-900 px-3 py-1"
            >
              {s.toShip} {s.toShip === 1 ? "pedido pagado" : "pedidos pagados"} por despachar
            </Link>
          )}
          {s.awaitingPayment > 0 && (
            <Link href="/admin/pedidos" className="rounded-full bg-black/5 px-3 py-1">
              {s.awaitingPayment} esperando pago
            </Link>
          )}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="font-semibold capitalize">Ventas de {monthName}</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Stat label="Vendido" value={formatCLP(s.month.sales)} note="Sin contar el envío" />
          <Stat
            label="Ganancia estimada"
            value={formatCLP(s.month.profit.total)}
            note={
              s.month.profit.missingCost ? "Hay productos sin costo cargado" : "Venta menos costo"
            }
          />
          <Stat label="Pedidos pagados" value={String(s.month.orders)} />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Stock</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Stat
            label="Invertido en stock"
            value={formatCLP(s.stock.invested)}
            note={
              s.stock.missingCost
                ? `${s.stock.missingCost} productos sin costo cargado`
                : "Lo que pagaste por lo que tienes"
            }
          />
          <Stat
            label="Si vendes todo"
            value={formatCLP(s.stock.atPrice)}
            note={`Ganarías ${formatCLP(s.stock.atPrice - s.stock.invested)}`}
          />
          <Stat label="Equipos disponibles" value={String(s.stock.units)} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-black/10 p-4 space-y-3 text-sm">
          <h2 className="font-semibold">Por agotarse</h2>
          {s.lowStock.length === 0 ? (
            <p className="text-black/60">Todo con stock.</p>
          ) : (
            s.lowStock.map((p) => (
              <Link
                key={p.id}
                href={`/admin/productos/${p.id}`}
                className="flex justify-between gap-4 hover:text-brand"
              >
                <span>{p.name}</span>
                <span className={p.stock === 0 ? "text-red-700" : ""}>
                  {p.stock === 0 ? "Agotado" : `Queda ${p.stock}`}
                </span>
              </Link>
            ))
          )}
        </div>

        <div className="bg-white rounded-xl border border-black/10 p-4 space-y-3 text-sm">
          <h2 className="font-semibold">Últimos pedidos</h2>
          {s.recent.length === 0 ? (
            <p className="text-black/60">Todavía no hay pedidos.</p>
          ) : (
            s.recent.map((o) => (
              <Link
                key={o.id}
                href={`/admin/pedidos/${o.id}`}
                className="flex justify-between gap-4 hover:text-brand"
              >
                <span>
                  {formatDateTime(o.created_at)} · {o.customer.name}
                </span>
                <span className="whitespace-nowrap">
                  {formatCLP(o.total)} · {ORDER_STATUS_LABELS[o.status]}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>

      <p className="text-sm text-black/60">
        Desde que abriste: {formatCLP(s.allTime.sales)} vendidos en {s.allTime.orders} pedidos, con
        ganancia estimada de {formatCLP(s.allTime.profit.total)}.
      </p>
    </section>
  );
}
