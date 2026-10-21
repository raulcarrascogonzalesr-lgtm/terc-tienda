import Link from "next/link";
import { formatCLP, formatDateTime, ORDER_STATUS_LABELS } from "@/lib/format";
import { loadBusiness } from "./data";
import {
  campaignStats,
  cashBalance,
  lastMonths,
  loanStatus,
  monthLabel,
  monthResult,
  stockValue,
  VERDICT_LABELS,
} from "./finance";
import { SalesChart } from "./SalesChart";
import { Badge, Card, PageHeader, Stat } from "./ui";

export const dynamic = "force-dynamic";

const VERDICT_TONE = { bien: "good", ojo: "warn", pierde: "bad", "sin-datos": "muted" } as const;

export default async function HomePage() {
  const { orders, products, movements, campaigns } = await loadBusiness();
  const months = lastMonths(6);
  const thisMonth = months[months.length - 1];
  const results = months.map((m) => monthResult(m, orders, movements, products));
  const current = results[results.length - 1];
  const cash = cashBalance(orders, movements);
  const loan = loanStatus(movements);
  const stock = stockValue(products);

  const toShip = orders.filter((o) => o.status === "paid");
  const lowStock = products
    .filter((p) => p.active && p.stock <= 1)
    .sort((a, b) => a.stock - b.stock);
  const activeCampaigns = campaigns.filter((c) => c.active);

  return (
    <div className="space-y-6">
      <PageHeader title="Inicio" subtitle={`Así va TERC en ${monthLabel(thisMonth)}`} />

      {(toShip.length > 0 || lowStock.some((p) => p.stock === 0)) && (
        <div className="flex flex-wrap gap-2">
          {toShip.length > 0 && (
            <Link href="/admin/pedidos">
              <Badge tone="warn">
                {toShip.length} {toShip.length === 1 ? "pedido pagado" : "pedidos pagados"} por
                despachar
              </Badge>
            </Link>
          )}
          {lowStock.some((p) => p.stock === 0) && (
            <Link href="/admin/productos">
              <Badge tone="bad">Hay productos agotados</Badge>
            </Link>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat
          tone="brand"
          label="Caja disponible"
          value={formatCLP(cash)}
          note="Según lo registrado en Caja"
        />
        <Stat
          tone={current.result > 0 ? "good" : current.result < 0 ? "bad" : "neutral"}
          label={current.result >= 0 ? "Ganancia del mes" : "Pérdida del mes"}
          value={formatCLP(Math.abs(current.result))}
          note={
            current.missingCost ? "Faltan costos de algunos productos" : "Ventas − costos − gastos"
          }
        />
        <Stat
          label="Ventas del mes"
          value={formatCLP(current.sales)}
          note={`${current.orders} pedidos pagados`}
        />
        <Stat
          label="Préstamo por devolver"
          value={formatCLP(loan.pending)}
          note={
            loan.received
              ? `Devuelto ${formatCLP(loan.repaid)} de ${formatCLP(loan.received)}`
              : "Registra el préstamo en Caja"
          }
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card title="Ventas y publicidad, últimos 6 meses" className="lg:col-span-2">
          <SalesChart
            data={results.map((r) => ({
              label: monthLabel(r.month, true),
              sales: r.sales,
              ads: r.expenses.publicidad,
            }))}
          />
        </Card>
        <Card title="Stock">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-black/60">Invertido en equipos</dt>
              <dd className="font-semibold">{formatCLP(stock.invested)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-black/60">Si vendes todo</dt>
              <dd className="font-semibold">{formatCLP(stock.atPrice)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-black/60">Equipos disponibles</dt>
              <dd className="font-semibold">{stock.units}</dd>
            </div>
          </dl>
          {stock.missingCost > 0 && (
            <p className="text-xs text-[#7a5200] mt-3">
              {stock.missingCost} productos sin costo cargado.
            </p>
          )}
          <div className="border-t border-black/5 mt-4 pt-4 space-y-2 text-sm">
            <p className="font-medium">Por agotarse</p>
            {lowStock.length === 0 ? (
              <p className="text-black/60">Todo con stock.</p>
            ) : (
              lowStock.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/productos/${p.id}`}
                  className="flex justify-between gap-3 hover:text-brand"
                >
                  <span className="min-w-0 truncate">{p.name}</span>
                  <span className={p.stock === 0 ? "text-[#c0392b]" : "text-black/60"}>
                    {p.stock === 0 ? "Agotado" : `Queda ${p.stock}`}
                  </span>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title={`Campañas activas en ${monthLabel(thisMonth, true)}`}>
          {activeCampaigns.length === 0 ? (
            <p className="text-sm text-black/60">
              Aún no hay campañas.{" "}
              <Link href="/admin/campanas" className="text-brand underline">
                Crea la primera
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-3 text-sm">
              {activeCampaigns.slice(0, 5).map((c) => {
                const s = campaignStats(c, orders, movements, thisMonth);
                return (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"
                  >
                    <span className="min-w-0 truncate">{c.name}</span>
                    <span className="flex items-center gap-3 whitespace-nowrap">
                      <span className="text-black/60">
                        {formatCLP(s.spend)} · {s.sales} ventas
                      </span>
                      <Badge tone={VERDICT_TONE[s.verdict]}>{VERDICT_LABELS[s.verdict]}</Badge>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card title="Últimos pedidos">
          {orders.length === 0 ? (
            <p className="text-sm text-black/60">Todavía no hay pedidos.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {orders.slice(0, 5).map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/pedidos/${o.id}`}
                    className="flex flex-col sm:flex-row sm:justify-between gap-x-3 hover:text-brand"
                  >
                    <span className="min-w-0 truncate">
                      {formatDateTime(o.created_at)} · {o.customer.name}
                    </span>
                    <span className="whitespace-nowrap text-black/70">
                      {formatCLP(o.total)} · {ORDER_STATUS_LABELS[o.status]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <p className="text-xs text-black/50">
        Los números se calculan con los pedidos pagados y lo que registras en Caja.
      </p>
    </div>
  );
}
