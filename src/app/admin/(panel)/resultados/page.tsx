import { formatCLP } from "@/lib/format";
import { loadBusiness } from "../data";
import { EXPENSE_CATEGORIES, lastMonths, monthLabel, monthResult } from "../finance";
import { Card, PageHeader, Result } from "../ui";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const { orders, products, movements } = await loadBusiness();
  const results = lastMonths(6).map((m) => monthResult(m, orders, movements, products));
  const current = results[results.length - 1];
  const total = results.reduce((s, r) => s + r.result, 0);

  const rows: { label: string; values: number[]; strong?: boolean; negative?: boolean }[] = [
    { label: "Ventas (con envío cobrado)", values: results.map((r) => r.sales) },
    {
      label: "Costo de los equipos vendidos",
      values: results.map((r) => r.costOfGoods),
      negative: true,
    },
    { label: "Margen de los equipos", values: results.map((r) => r.grossProfit), strong: true },
    ...Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => ({
      label,
      values: results.map((r) => r.expenses[key as keyof typeof EXPENSE_CATEGORIES]),
      negative: true,
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="¿Gané o perdí?"
        subtitle="Ventas menos el costo de los equipos y los gastos, mes a mes."
      />

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <p className="text-sm text-black/60 first-letter:uppercase">
            {monthLabel(current.month)}
          </p>
          <p className="text-3xl font-bold mt-1">
            {current.result > 0
              ? "Vas ganando "
              : current.result < 0
                ? "Vas perdiendo "
                : "Vas en cero "}
            <Result value={current.result} />
          </p>
          <p className="text-sm text-black/60 mt-2">
            Vendiste {formatCLP(current.sales)}, los equipos te costaron{" "}
            {formatCLP(current.costOfGoods)} y gastaste {formatCLP(current.totalExpenses)}.
          </p>
        </Card>
        <Card>
          <p className="text-sm text-black/60">Últimos 6 meses</p>
          <p className="text-3xl font-bold mt-1">
            <Result value={total} />
          </p>
          <p className="text-sm text-black/60 mt-2">
            Comprar equipos y devolver el préstamo no cuentan como gasto: el equipo se descuenta
            cuando lo vendes, y el préstamo solo baja la deuda.
          </p>
        </Card>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-black/50 border-b border-black/10">
              <th className="text-left py-2 pr-3 font-medium">Concepto</th>
              {results.map((r) => (
                <th key={r.month} className="text-right py-2 px-2 font-medium capitalize">
                  {monthLabel(r.month, true)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                className={`border-b border-black/5 ${row.strong ? "font-semibold" : ""}`}
              >
                <td className="py-2 pr-3">{row.label}</td>
                {row.values.map((v, i) => (
                  <td key={i} className="py-2 px-2 text-right whitespace-nowrap text-black/80">
                    {v === 0 ? "—" : `${row.negative ? "−" : ""}${formatCLP(v)}`}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="font-bold text-base">
              <td className="pt-3 pr-3">Resultado</td>
              {results.map((r) => (
                <td key={r.month} className="pt-3 px-2 text-right whitespace-nowrap">
                  <Result value={r.result} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        {results.some((r) => r.missingCost) && (
          <p className="text-xs text-[#7a5200] mt-4">
            ! Algunos productos vendidos no tienen costo cargado, así que la ganancia aparece más
            alta de lo real. Agrégalo en Productos.
          </p>
        )}
      </Card>
    </div>
  );
}
