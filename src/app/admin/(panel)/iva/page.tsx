import { formatCLP } from "@/lib/format";
import type { Movement } from "@/lib/types";
import { getSettings, loadBusiness } from "../data";
import { DocumentInfo } from "../DocumentInfo";
import {
  CATEGORY_LABELS,
  EXPENSE_CATEGORIES,
  creditVat,
  isSold,
  lastMonths,
  monthLabel,
  monthOf,
  saleMonth,
  vatIn,
  vatMonths,
} from "../finance";
import { MonthPicker } from "../MonthPicker";
import { Card, PageHeader, Stat, Tip } from "../ui";
import { PpmForm } from "./PpmForm";

export const dynamic = "force-dynamic";

function Line({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-4 py-2 tabular-nums ${
        strong ? "font-semibold border-t border-[#e4e2dc] mt-1 pt-3" : ""
      } ${muted ? "text-[#6b716f]" : ""}`}
    >
      <span>{label}</span>
      <span className="whitespace-nowrap">{value}</span>
    </div>
  );
}

type DocRow = { label: string; count: number; net: number; vat: number };

function sumDocs(label: string, items: { total: number; vat: number }[], sign = 1): DocRow {
  return {
    label,
    count: items.length,
    net: sign * items.reduce((s, i) => s + i.total - i.vat, 0),
    vat: sign * items.reduce((s, i) => s + i.vat, 0),
  };
}

const moveVat = (m: Movement) => ({ total: m.amount, vat: m.vat ?? vatIn(m.amount) });

export default async function VatPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes } = await searchParams;
  const [{ orders, movements }, settings] = await Promise.all([loadBusiness(), getSettings()]);
  const months = lastMonths(12);
  const month = mes && /^\d{4}-\d{2}$/.test(mes) ? mes : months[months.length - 1];

  const history = vatMonths(orders, movements, month);
  const row = history[history.length - 1];
  const rate = settings.ppm_rate ? Number(settings.ppm_rate) : null;
  const ppm = rate === null ? null : Math.round((row.salesNet * rate) / 100);
  const [y, m] = month.split("-").map(Number);
  const due = monthLabel(m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`);

  const inMonth = movements.filter((mv) => monthOf(mv.date) === month);
  const web = orders.filter((o) => isSold(o) && saleMonth(o) === month);
  const direct = inMonth.filter((mv) => mv.category === "venta_directa");
  const docRows: DocRow[] = [
    sumDocs(
      "Boletas de la tienda web",
      web.map((o) => ({ total: o.total, vat: vatIn(o.total) })),
    ),
    sumDocs(
      "Boletas fuera de la web",
      direct.filter((mv) => mv.doc_type === "boleta").map(moveVat),
    ),
    sumDocs("Facturas de venta", direct.filter((mv) => mv.doc_type === "factura").map(moveVat)),
    sumDocs(
      "Notas de crédito",
      inMonth.filter((mv) => mv.category === "devolucion_cliente").map(moveVat),
      -1,
    ),
  ];
  const bills = inMonth.filter((mv) => creditVat(mv) > 0);
  const noCredit = inMonth.filter(
    (mv) =>
      mv.kind === "egreso" &&
      (mv.category in EXPENSE_CATEGORIES || mv.category === "compra_equipos") &&
      creditVat(mv) === 0,
  );
  const months6 = history.slice(-6).reverse();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finanzas"
        title="IVA e impuestos"
        subtitle="Cuánto IVA cobraste, cuánto rebajas con facturas y cuánto le traspasas a Wiremax para su declaración mensual (F29)."
      >
        <MonthPicker
          value={month}
          months={[...months].reverse().map((mm) => ({ value: mm, label: monthLabel(mm) }))}
        />
      </PageHeader>

      <Tip title="Es un estimado de TERC">
        TERC es parte de Wiremax, y el F29 lo declara Wiremax junto con el resto de su negocio.
        Estos números son lo que TERC aporta a esa declaración. El monto final lo confirma el
        contador de Wiremax.
      </Tip>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat
          label="IVA de tus ventas"
          value={formatCLP(row.debit)}
          note={`Débito · ventas netas ${formatCLP(row.salesNet)}`}
        />
        <Stat
          label="IVA de tus facturas"
          value={formatCLP(row.credit)}
          note={`Crédito · compras netas ${formatCLP(row.purchasesNet)}`}
        />
        <Stat
          tone="brand"
          label="IVA a traspasar a Wiremax"
          value={formatCLP(row.toPay)}
          note={
            row.carryOut > 0
              ? `Quedan ${formatCLP(row.carryOut)} a favor para el próximo mes`
              : `Wiremax lo paga hasta el 20 de ${due}`
          }
        />
        <Stat
          label="PPM estimado"
          value={ppm === null ? "Falta la tasa" : formatCLP(ppm)}
          note="Anticipo del impuesto a la renta, aparte del IVA"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Cómo se calcula">
          <div className="text-sm">
            <Line label="IVA de tus ventas (débito)" value={formatCLP(row.debit)} />
            <Line label="− IVA de tus facturas (crédito)" value={formatCLP(row.credit)} />
            <Line
              label="− IVA a favor del mes anterior"
              value={formatCLP(row.carryIn)}
              muted={row.carryIn === 0}
            />
            {row.carryOut > 0 ? (
              <Line
                label="= IVA a favor para el próximo mes"
                value={formatCLP(row.carryOut)}
                strong
              />
            ) : (
              <Line label="= IVA a traspasar a Wiremax" value={formatCLP(row.toPay)} strong />
            )}
          </div>
          <div className="text-sm mt-5 pt-4 border-t border-[#efede8]">
            <p className="eyebrow mb-1">Aparte del IVA</p>
            <Line
              label={
                rate === null
                  ? "PPM (falta la tasa)"
                  : `PPM: ${String(rate).replace(".", ",")}% de ${formatCLP(row.salesNet)}`
              }
              value={ppm === null ? "—" : formatCLP(ppm)}
            />
            {ppm !== null && (
              <Line
                label="Total estimado que TERC aporta al F29"
                value={formatCLP(row.toPay + ppm)}
                strong
              />
            )}
          </div>
        </Card>

        <Card title="Ventas del mes, por documento">
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="data-table min-w-[420px]">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th className="!text-right">Cant.</th>
                  <th className="!text-right">Neto</th>
                  <th className="!text-right">IVA</th>
                </tr>
              </thead>
              <tbody>
                {docRows.map((d) => (
                  <tr key={d.label} className={d.count === 0 ? "text-[#a3a8a5]" : ""}>
                    <td>{d.label}</td>
                    <td className="text-right">{d.count}</td>
                    <td className="text-right whitespace-nowrap">{formatCLP(d.net)}</td>
                    <td className="text-right whitespace-nowrap">{formatCLP(d.vat)}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td>Total</td>
                  <td />
                  <td className="text-right whitespace-nowrap">{formatCLP(row.salesNet)}</td>
                  <td className="text-right whitespace-nowrap">{formatCLP(row.debit)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#6b716f] mt-3">
            Las ventas de la web se cuentan como boletas en la fecha de pago, con el envío incluido.
            Las ventas fuera de la web y las notas de crédito se anotan en Registrar movimiento.
          </p>
        </Card>
      </div>

      <Card title={`Facturas que rebajan IVA (${bills.length})`}>
        {bills.length === 0 ? (
          <p className="text-sm text-[#6b716f]">
            No hay facturas de compra este mes. Anótalas en Registrar movimiento con el documento
            «Factura».
          </p>
        ) : (
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="data-table min-w-[720px]">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Proveedor</th>
                  <th>Documento</th>
                  <th>Tipo</th>
                  <th className="!text-right">Neto</th>
                  <th className="!text-right">IVA</th>
                  <th className="!text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b.id}>
                    <td className="whitespace-nowrap text-[#6b716f]">
                      {b.date.split("-").reverse().join("-")}
                    </td>
                    <td>
                      {b.supplier}
                      {b.supplier_rut && (
                        <span className="block text-xs text-[#6b716f]">{b.supplier_rut}</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap">
                      <DocumentInfo movement={b} />
                    </td>
                    <td>{CATEGORY_LABELS[b.category] ?? b.category}</td>
                    <td className="text-right whitespace-nowrap">
                      {formatCLP(b.amount - creditVat(b))}
                    </td>
                    <td className="text-right whitespace-nowrap font-semibold">
                      {formatCLP(creditVat(b))}
                    </td>
                    <td className="text-right whitespace-nowrap">{formatCLP(b.amount)}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td colSpan={4}>Total</td>
                  <td className="text-right whitespace-nowrap">{formatCLP(row.purchasesNet)}</td>
                  <td className="text-right whitespace-nowrap">{formatCLP(row.credit)}</td>
                  <td className="text-right whitespace-nowrap">
                    {formatCLP(row.purchasesNet + row.credit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {noCredit.length > 0 && (
        <Card title="Gastos que no rebajan IVA">
          <p className="text-sm text-[#6b716f] mb-4">
            Se pagaron con boleta, otro comprobante o sin documento, así que su IVA no se recupera y
            cuentan completos como gasto. Cuando puedas, pide factura a nombre de Wiremax.
          </p>
          <ul className="divide-y divide-[#efede8] text-sm">
            {noCredit.map((mv) => (
              <li key={mv.id} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2.5">
                <span className="min-w-0">
                  {CATEGORY_LABELS[mv.category] ?? mv.category}
                  <span className="text-[#6b716f]">
                    {" "}
                    · {mv.supplier || mv.description || "sin detalle"}
                  </span>
                </span>
                <span className="tabular-nums whitespace-nowrap">{formatCLP(mv.amount)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="Mes a mes">
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="data-table min-w-[640px]">
            <thead>
              <tr>
                <th>Mes</th>
                <th className="!text-right">Ventas netas</th>
                <th className="!text-right">IVA ventas</th>
                <th className="!text-right">IVA facturas</th>
                <th className="!text-right">A traspasar</th>
                <th className="!text-right">A favor</th>
              </tr>
            </thead>
            <tbody>
              {months6.map((h) => (
                <tr key={h.month}>
                  <td className="first-letter:uppercase whitespace-nowrap">
                    {monthLabel(h.month)}
                  </td>
                  <td className="text-right whitespace-nowrap">{formatCLP(h.salesNet)}</td>
                  <td className="text-right whitespace-nowrap">{formatCLP(h.debit)}</td>
                  <td className="text-right whitespace-nowrap">{formatCLP(h.credit)}</td>
                  <td className="text-right whitespace-nowrap font-semibold">
                    {formatCLP(h.toPay)}
                  </td>
                  <td className="text-right whitespace-nowrap text-[#0a6b38]">
                    {h.carryOut ? formatCLP(h.carryOut) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[#6b716f] mt-3">
          El IVA a favor de un mes se descuenta el mes siguiente. Aquí no se reajusta por UTM.
        </p>
      </Card>

      <Card title="PPM (pago provisional mensual)">
        <p className="text-sm text-[#6b716f] mb-4 max-w-2xl">
          Es un anticipo del impuesto a la renta que se paga junto con el IVA, calculado como un
          porcentaje de las ventas netas. No es un gasto: se descuenta en la declaración anual. La
          tasa depende de Wiremax: pídesela a su contador y anótala aquí. Mientras esté vacía, el
          panel no la calcula.
        </p>
        <PpmForm rate={settings.ppm_rate ?? ""} />
      </Card>
    </div>
  );
}
