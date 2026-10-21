import { formatCLP, formatDateTime } from "@/lib/format";
import { loadBusiness } from "../data";
import { CATEGORY_LABELS, EXPENSE_CATEGORIES, lastMonths, monthLabel } from "../finance";
import { DocumentInfo } from "../DocumentInfo";
import { MonthPicker } from "../MonthPicker";
import { Card, PageHeader, Result } from "../ui";
import { PrintButton } from "./PrintButton";
import { monthReport } from "./report";

export const dynamic = "force-dynamic";

function Line({
  label,
  value,
  strong,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-4 py-1.5 ${strong ? "font-semibold border-t border-[#e4e2dc] mt-1 pt-2" : ""}`}
    >
      <span>{label}</span>
      <span className="whitespace-nowrap">{value}</span>
    </div>
  );
}

export default async function SettlementPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes } = await searchParams;
  const { orders, products, movements } = await loadBusiness();
  const months = lastMonths(12);
  const month = mes && /^\d{4}-\d{2}$/.test(mes) ? mes : months[months.length - 1];
  const r = monthReport(month, orders, movements, products);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Liquidación de ${monthLabel(month)}`}
        subtitle="TERC · centro de costos dentro de Wiremax"
      >
        <div className="flex flex-wrap gap-2 print:hidden">
          <MonthPicker
            value={month}
            months={[...months].reverse().map((m) => ({ value: m, label: monthLabel(m) }))}
          />
          <a href={`/admin/liquidacion/csv?mes=${month}`} className="btn-secondary">
            Descargar Excel (CSV)
          </a>
          <PrintButton />
        </div>
      </PageHeader>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Caja del mes">
          <div className="text-sm">
            <Line label="Saldo al inicio del mes" value={formatCLP(r.opening)} />
            <Line label="+ Ventas cobradas" value={formatCLP(r.salesIn)} />
            <Line label="+ Otros ingresos" value={formatCLP(r.otherIn)} />
            <Line label="− Salidas" value={formatCLP(r.out)} />
            <Line label="Saldo al cierre" value={formatCLP(r.closing)} strong />
          </div>
        </Card>
        <Card title="Resultado del mes">
          <div className="text-sm">
            <Line label="Ventas" value={formatCLP(r.result.sales)} />
            <Line label="− Costo de los equipos" value={formatCLP(r.result.costOfGoods)} />
            {Object.entries(EXPENSE_CATEGORIES).map(([k, label]) =>
              r.result.expenses[k as keyof typeof EXPENSE_CATEGORIES] ? (
                <Line
                  key={k}
                  label={`− ${label}`}
                  value={formatCLP(r.result.expenses[k as keyof typeof EXPENSE_CATEGORIES])}
                />
              ) : null,
            )}
            <Line
              label={r.result.result >= 0 ? "Ganancia" : "Pérdida"}
              value={<Result value={r.result.result} />}
              strong
            />
          </div>
          <p className="text-xs text-[#6b716f] mt-3">
            Referencial para la contabilidad de Wiremax: IVA en las ventas {formatCLP(r.vatInSales)}
            , IVA en facturas de compra {formatCLP(r.vatCredit)}. Préstamo pendiente al cierre:{" "}
            {formatCLP(r.loan.pending)}.
          </p>
        </Card>
      </div>

      <Card title={`Ventas (${r.sales.length})`}>
        {r.sales.length === 0 ? (
          <p className="text-sm text-[#6b716f]">Sin ventas este mes.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-[#6b716f] border-b border-[#e4e2dc]">
              <tr>
                <th className="py-2 pr-3">Fecha</th>
                <th className="py-2 pr-3">Cliente</th>
                <th className="py-2 pr-3">Productos</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {r.sales.map((o) => (
                <tr key={o.id} className="border-b border-[#efede8] last:border-0 align-top">
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {formatDateTime(o.paid_at ?? o.created_at)}
                  </td>
                  <td className="py-2 pr-3">{o.customer.name}</td>
                  <td className="py-2 pr-3 text-[#3b4442]">
                    {o.items.map((i) => `${i.quantity} × ${i.name}`).join(", ")}
                  </td>
                  <td className="py-2 text-right whitespace-nowrap">{formatCLP(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card title={`Movimientos de caja (${r.moves.length})`}>
        {r.moves.length === 0 ? (
          <p className="text-sm text-[#6b716f]">Sin movimientos este mes.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-[#6b716f] border-b border-[#e4e2dc]">
              <tr>
                <th className="py-2 pr-3">Fecha</th>
                <th className="py-2 pr-3">Tipo</th>
                <th className="py-2 pr-3">Detalle</th>
                <th className="py-2 pr-3">Documento</th>
                <th className="py-2 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {r.moves.map((m) => (
                <tr key={m.id} className="border-b border-[#efede8] last:border-0">
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {m.date.split("-").reverse().join("-")}
                  </td>
                  <td className="py-2 pr-3">{CATEGORY_LABELS[m.category] ?? m.category}</td>
                  <td className="py-2 pr-3 text-[#3b4442]">
                    {m.description}
                    {m.supplier && (
                      <span className="block text-xs text-[#6b716f]">{m.supplier}</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    <DocumentInfo movement={m} />
                  </td>
                  <td className="py-2 text-right whitespace-nowrap">
                    {m.kind === "ingreso" ? "+" : "−"}
                    {formatCLP(m.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
