import Link from "next/link";
import { storeIsOpen } from "@/lib/store-status";
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
  vatMonths,
  VERDICT_LABELS,
} from "./finance";
import { ICONS } from "./icons";
import { SalesChart } from "./SalesChart";
import { StoreSwitch } from "./StoreSwitch";
import { Badge, Card, Icon, PageHeader, Stat } from "./ui";

export const dynamic = "force-dynamic";

const VERDICT_TONE = { bien: "good", ojo: "warn", pierde: "bad", "sin-datos": "muted" } as const;

export default async function HomePage() {
  const [{ orders, products, movements, campaigns }, open] = await Promise.all([
    loadBusiness(),
    storeIsOpen(),
  ]);
  const months = lastMonths(6);
  const thisMonth = months[months.length - 1];
  const results = months.map((m) => monthResult(m, orders, movements, products));
  const current = results[results.length - 1];
  const cash = cashBalance(orders, movements);
  const loan = loanStatus(movements);
  const stock = stockValue(products);
  const vat = vatMonths(orders, movements, thisMonth).at(-1)!;

  const toShip = orders.filter((o) => o.status === "paid");
  const lowStock = products
    .filter((p) => p.active && p.stock <= 1)
    .sort((a, b) => a.stock - b.stock);
  const activeCampaigns = campaigns.filter((c) => c.active);

  const steps = [
    {
      title: "Registra el préstamo de tu papá",
      text: "Caja → Entró plata → Préstamo recibido.",
      href: "/admin/registrar?tipo=entrada",
      done: loan.received > 0,
    },
    {
      title: "Registra la compra de tus equipos",
      text: "Con el número de factura del proveedor.",
      href: "/admin/registrar?tipo=compra",
      done: movements.some((m) => m.category === "compra_equipos"),
    },
    {
      title: "Pon el costo a cada producto",
      text: "Así el panel calcula tu ganancia por venta.",
      href: "/admin/productos",
      done: products.length > 0 && products.every((p) => p.cost !== null),
    },
    {
      title: "Crea tu primera campaña",
      text: "Para saber qué anuncio te trae ventas.",
      href: "/admin/campanas",
      done: campaigns.length > 0,
    },
  ];
  const pendingSteps = steps.filter((s) => !s.done).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={monthLabel(thisMonth)}
        title="Resumen del negocio"
        subtitle="Cómo va TERC este mes: plata disponible, ganancia, ventas y deuda."
      >
        <Link href="/admin/registrar" className="btn-primary">
          <Icon path={ICONS.mas} className="w-4 h-4" />
          Registrar movimiento
        </Link>
      </PageHeader>
      <StoreSwitch open={open} />

      {pendingSteps > 0 && (
        <Card
          title="Primeros pasos"
          action={
            <span className="text-xs text-[#6b716f] tabular-nums">
              {steps.length - pendingSteps} de {steps.length} listos
            </span>
          }
        >
          <ol className="grid sm:grid-cols-2 gap-3">
            {steps.map((step, i) => (
              <li key={step.title}>
                <Link
                  href={step.href}
                  className={`flex items-start gap-3 rounded-lg border p-4 transition ${
                    step.done
                      ? "border-[#e4e2dc] bg-[#fafaf8]"
                      : "border-[#e4e2dc] hover:border-[#0f5f59]"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      step.done
                        ? "bg-[#0a6b38] text-white"
                        : "border border-[#b5b2a8] text-[#6b716f]"
                    }`}
                  >
                    {step.done ? <Icon path={ICONS.check} className="w-3.5 h-3.5" /> : i + 1}
                  </span>
                  <span>
                    <span
                      className={`block text-sm font-medium ${step.done ? "text-[#6b716f] line-through" : ""}`}
                    >
                      {step.title}
                    </span>
                    {!step.done && (
                      <span className="block text-xs text-[#6b716f] mt-0.5">{step.text}</span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Card>
      )}

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
            current.missingCost
              ? "Faltan costos de algunos productos"
              : "Ventas − costos − gastos, sin IVA"
          }
        />
        <Stat
          label="Ventas netas del mes"
          value={formatCLP(current.sales)}
          note={`Sin IVA · ${formatCLP(current.salesGross)} con IVA`}
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

      <Link
        href="/admin/iva"
        className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-xl border border-[#e4e2dc] bg-white px-5 py-4 text-sm transition hover:border-[#0f5f59]"
      >
        <span className="flex items-center gap-3 font-medium">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3f2ee] text-[#0c2f2c]">
            <Icon path={ICONS.iva} className="w-4 h-4" />
          </span>
          IVA estimado de {monthLabel(thisMonth)}
        </span>
        <span className="flex flex-wrap gap-x-6 gap-y-1 tabular-nums text-[#6b716f]">
          <span>
            Ventas <span className="font-semibold text-[#14201f]">{formatCLP(vat.debit)}</span>
          </span>
          <span>
            Facturas <span className="font-semibold text-[#14201f]">−{formatCLP(vat.credit)}</span>
          </span>
          <span>
            {vat.carryOut > 0 ? "A favor " : "A traspasar a Wiremax "}
            <span className="font-semibold text-[#0f5f59]">
              {formatCLP(vat.carryOut > 0 ? vat.carryOut : vat.toPay)}
            </span>
          </span>
          <span aria-hidden>→</span>
        </span>
      </Link>

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
              <dt className="text-[#6b716f]">Invertido en equipos (neto)</dt>
              <dd className="font-semibold tabular-nums">{formatCLP(stock.invested)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6b716f]">Si vendes todo (neto)</dt>
              <dd className="font-semibold tabular-nums">{formatCLP(stock.atPrice)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6b716f]">Equipos disponibles</dt>
              <dd className="font-semibold tabular-nums">{stock.units}</dd>
            </div>
          </dl>
          {stock.missingCost > 0 && (
            <p className="text-xs text-[#7a5200] mt-3">
              {stock.missingCost} {stock.missingCost === 1 ? "producto" : "productos"} sin costo
              cargado.
            </p>
          )}
          <div className="border-t border-[#efede8] mt-4 pt-4 space-y-2 text-sm">
            <p className="font-medium">Por agotarse</p>
            {lowStock.length === 0 ? (
              <p className="text-[#6b716f]">Todo con stock.</p>
            ) : (
              lowStock.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/productos/${p.id}`}
                  className="flex justify-between gap-3 hover:text-[#0f5f59]"
                >
                  <span className="min-w-0 truncate">{p.name}</span>
                  <span className={p.stock === 0 ? "text-[#b3362a]" : "text-[#6b716f]"}>
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
            <p className="text-sm text-[#6b716f]">
              Aún no hay campañas.{" "}
              <Link href="/admin/campanas" className="text-[#0f5f59] underline">
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
                      <span className="text-[#6b716f]">
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
            <p className="text-sm text-[#6b716f]">Todavía no hay pedidos.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {orders.slice(0, 5).map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/pedidos/${o.id}`}
                    className="flex flex-col sm:flex-row sm:justify-between gap-x-3 hover:text-[#0f5f59]"
                  >
                    <span className="min-w-0 truncate">
                      {formatDateTime(o.created_at)} · {o.customer.name}
                    </span>
                    <span className="whitespace-nowrap text-[#3b4442]">
                      {formatCLP(o.total)} · {ORDER_STATUS_LABELS[o.status]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <p className="text-xs text-[#6b716f]">
        Los números se calculan con los pedidos pagados y lo que registras en Caja. Ventas, costos y
        ganancia van sin IVA; el IVA está en su propia sección.
      </p>
    </div>
  );
}
