import { formatCLP } from "@/lib/format";
import { deleteMovement } from "../actions";
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
import { ConfirmButton } from "../ConfirmButton";
import { MonthPicker } from "../MonthPicker";
import { Card, PageHeader, Stat } from "../ui";
import { MovementForm } from "./MovementForm";

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
  const campaignName = new Map(campaigns.map((c) => [c.id, c.name]));
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Caja"
        subtitle="Anota aquí cada peso que entra o sale y no es una venta de la web."
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat
          tone="brand"
          label="Caja disponible"
          value={formatCLP(cash)}
          note="Entradas + ventas cobradas − salidas"
        />
        <Stat label="Préstamo recibido" value={formatCLP(loan.received)} />
        <Stat
          label="Préstamo devuelto"
          value={formatCLP(loan.repaid)}
          note={
            loan.received
              ? `${Math.round((loan.repaid / loan.received) * 100)}% devuelto`
              : undefined
          }
        />
        <Stat
          label="Invertido en stock"
          value={formatCLP(stock.invested)}
          note={`${stock.units} equipos`}
        />
      </div>

      {loan.received > 0 && (
        <Card>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Devolución del préstamo</span>
            <span className="text-black/60">Faltan {formatCLP(loan.pending)}</span>
          </div>
          <div className="h-3 rounded-full bg-black/5 overflow-hidden">
            <div
              className="h-full bg-brand rounded-full"
              style={{ width: `${Math.min(100, (loan.repaid / loan.received) * 100)}%` }}
            />
          </div>
        </Card>
      )}

      <Card title="Registrar movimiento">
        <MovementForm campaigns={campaigns} today={today} />
        <p className="text-xs text-black/50 mt-3">
          Las ventas de la web se suman solas. Aquí van, por ejemplo: el préstamo de tu papá, las
          facturas del proveedor, lo que pagas en anuncios, envíos y comisiones.
        </p>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold">Movimientos</h2>
          <MonthPicker
            value={month}
            months={[...months].reverse().map((m) => ({ value: m, label: monthLabel(m) }))}
          />
        </div>
        {listed.length === 0 ? (
          <p className="text-sm text-black/60">No hay movimientos este mes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-black/50 border-b border-black/10">
                <tr>
                  <th className="py-2 pr-3">Fecha</th>
                  <th className="py-2 pr-3">Tipo</th>
                  <th className="py-2 pr-3">Detalle</th>
                  <th className="py-2 pr-3 text-right">Monto</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {listed.map((m) => (
                  <tr key={m.id} className="border-b border-black/5 last:border-0">
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {m.date.split("-").reverse().join("-")}
                    </td>
                    <td className="py-2 pr-3">{CATEGORY_LABELS[m.category] ?? m.category}</td>
                    <td className="py-2 pr-3 text-black/70">
                      {m.description}
                      {m.campaign_id && campaignName.get(m.campaign_id) && (
                        <span className="text-black/50"> · {campaignName.get(m.campaign_id)}</span>
                      )}
                    </td>
                    <td
                      className={`py-2 pr-3 text-right whitespace-nowrap font-medium ${m.kind === "ingreso" ? "text-[#0a7a3c]" : ""}`}
                    >
                      {m.kind === "ingreso" ? "+" : "−"}
                      {formatCLP(m.amount)}
                    </td>
                    <td className="py-2 text-right">
                      <form action={deleteMovement.bind(null, m.id)}>
                        <ConfirmButton
                          message="¿Borrar este movimiento?"
                          className="text-xs text-black/40 hover:text-red-700"
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
        )}
      </Card>
    </div>
  );
}
