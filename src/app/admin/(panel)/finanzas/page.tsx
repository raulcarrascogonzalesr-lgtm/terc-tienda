import Link from "next/link";
import { formatCLP } from "@/lib/format";
import { deleteMovement } from "../actions";
import { ConfirmButton } from "../ConfirmButton";
import { DocumentInfo } from "../DocumentInfo";
import { loadBusiness } from "../data";
import {
  CATEGORY_LABELS,
  cashBalance,
  lastMonths,
  loanStatus,
  monthLabel,
  monthOf,
  stockValue,
} from "../finance";
import { ICONS } from "../icons";
import { MonthPicker } from "../MonthPicker";
import { INTENTS, type IntentKey } from "../registrar/intents";
import { Card, Icon, PageHeader, Stat } from "../ui";

export const dynamic = "force-dynamic";

export default async function CashPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes } = await searchParams;
  const { orders, products, movements, campaigns } = await loadBusiness();
  const months = lastMonths(12);
  const month = mes && /^\d{4}-\d{2}$/.test(mes) ? mes : months[months.length - 1];

  const cash = cashBalance(orders, movements);
  const loan = loanStatus(movements);
  const stock = stockValue(products);
  const listed = movements.filter((m) => monthOf(m.date) === month);
  const monthIn = listed.filter((m) => m.kind === "ingreso").reduce((s, m) => s + m.amount, 0);
  const monthOut = listed.filter((m) => m.kind === "egreso").reduce((s, m) => s + m.amount, 0);
  const campaignName = new Map(campaigns.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finanzas"
        title="Caja"
        subtitle="Toda la plata que entra o sale del negocio y no es una venta de la web."
      >
        <Link href="/admin/registrar" className="btn-primary">
          <Icon path={ICONS.mas} className="w-4 h-4" />
          Registrar movimiento
        </Link>
      </PageHeader>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat
          tone="brand"
          label="Caja disponible"
          value={formatCLP(cash)}
          note="Entradas + ventas cobradas − salidas"
        />
        <Stat label="Préstamo recibido" value={formatCLP(loan.received)} />
        <Stat
          label="Préstamo por devolver"
          value={formatCLP(loan.pending)}
          note={
            loan.received
              ? `Devuelto ${formatCLP(loan.repaid)} (${Math.round((loan.repaid / loan.received) * 100)}%)`
              : undefined
          }
        />
        <Stat
          label="Invertido en stock"
          value={formatCLP(stock.invested)}
          note={
            stock.missingCost > 0
              ? `${stock.units} equipos · ${stock.missingCost} sin costo`
              : `${stock.units} equipos`
          }
          href="/admin/productos"
        />
      </div>

      <div>
        <p className="eyebrow mb-3">Registro rápido</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.keys(INTENTS) as IntentKey[]).map((key) => (
            <Link
              key={key}
              href={`/admin/registrar?tipo=${key}`}
              className="flex items-center gap-3 rounded-xl border border-[#e4e2dc] bg-white px-4 py-3.5 text-sm font-medium transition hover:border-[#0f5f59]"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  INTENTS[key].kind === "ingreso"
                    ? "bg-[#e6f2ea] text-[#0a6b38]"
                    : "bg-[#f3f2ee] text-[#0c2f2c]"
                }`}
              >
                <Icon path={INTENTS[key].icon} className="w-[18px] h-[18px]" />
              </span>
              <span className="min-w-0">{INTENTS[key].title}</span>
            </Link>
          ))}
        </div>
      </div>

      {loan.received > 0 && (
        <Card>
          <div className="flex flex-wrap justify-between gap-2 text-sm mb-3">
            <span className="font-medium">Devolución del préstamo</span>
            <span className="text-[#6b716f] tabular-nums">
              {formatCLP(loan.repaid)} de {formatCLP(loan.received)}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#efede8] overflow-hidden">
            <div
              className="h-full bg-[#0f5f59] rounded-full"
              style={{ width: `${Math.min(100, (loan.repaid / loan.received) * 100)}%` }}
            />
          </div>
        </Card>
      )}

      <Card
        title="Movimientos"
        action={
          <MonthPicker
            value={month}
            months={[...months].reverse().map((m) => ({ value: m, label: monthLabel(m) }))}
          />
        }
      >
        {listed.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <p className="text-sm text-[#6b716f]">No hay movimientos en este mes.</p>
            <Link href="/admin/registrar" className="btn-secondary">
              Registrar el primero
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-1 px-1">
              <table className="data-table min-w-[720px]">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Detalle</th>
                    <th>Documento</th>
                    <th className="!text-right">Monto</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {listed.map((m) => (
                    <tr key={m.id}>
                      <td className="whitespace-nowrap text-[#6b716f]">
                        {m.date.split("-").reverse().join("-")}
                      </td>
                      <td className="whitespace-nowrap font-medium">
                        {CATEGORY_LABELS[m.category] ?? m.category}
                      </td>
                      <td className="text-[#3b4442]">
                        {m.description || (m.supplier ? "" : "—")}
                        {m.supplier && (
                          <span className="block text-xs text-[#6b716f]">{m.supplier}</span>
                        )}
                        {m.campaign_id && campaignName.get(m.campaign_id) && (
                          <span className="block text-xs text-[#6b716f]">
                            Campaña: {campaignName.get(m.campaign_id)}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap">
                        <DocumentInfo movement={m} />
                      </td>
                      <td
                        className={`text-right whitespace-nowrap font-semibold ${m.kind === "ingreso" ? "text-[#0a6b38]" : ""}`}
                      >
                        {m.kind === "ingreso" ? "+" : "−"}
                        {formatCLP(m.amount)}
                      </td>
                      <td className="text-right">
                        <form action={deleteMovement.bind(null, m.id)}>
                          <ConfirmButton
                            message="¿Borrar este movimiento? Si tiene archivo, también se borra."
                            className="text-xs text-[#a3a8a5] hover:text-[#b3362a]"
                          >
                            Borrar
                          </ConfirmButton>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap justify-end gap-x-8 gap-y-1 border-t border-[#e4e2dc] mt-2 pt-4 text-sm tabular-nums">
              <span className="text-[#6b716f]">
                Entró <span className="font-semibold text-[#0a6b38]">{formatCLP(monthIn)}</span>
              </span>
              <span className="text-[#6b716f]">
                Salió <span className="font-semibold text-[#14201f]">{formatCLP(monthOut)}</span>
              </span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
