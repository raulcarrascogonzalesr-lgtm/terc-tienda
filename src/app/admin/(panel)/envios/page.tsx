import Link from "next/link";
import { formatCLP, formatDateTime } from "@/lib/format";
import { saveShippingReal } from "../actions";
import { getSettings, listOrders } from "../data";
import { fundOrders, monthLabel, monthOf, saleMonth } from "../finance";
import { Card, PageHeader, Result, Stat, Tip } from "../ui";
import { FundForm } from "./FundForm";

export const dynamic = "force-dynamic";

const sum = (rows: { left: number }[]) => rows.reduce((s, r) => s + r.left, 0);

export default async function ShippingFundPage() {
  const [orders, settings] = await Promise.all([listOrders(1000), getSettings()]);
  const amount = Number(settings.shipping_fund) || 0;
  const rows = fundOrders(orders);
  const thisMonth = monthOf(new Date());
  const monthRows = rows.filter((r) => saleMonth(r.order) === thisMonth);
  const total = sum(rows);
  const losses = rows.filter((r) => r.left < 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tienda"
        title="Fondo de envío"
        subtitle="Cada equipo trae un monto para pagar su envío. En la Región Metropolitana el envío es gratis y a regiones se descuenta ese monto. Aquí ves si lo que trajeron los equipos alcanzó para pagarle al courier."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Te queda en el fondo"
          value={`${total < 0 ? "−" : ""}${formatCLP(Math.abs(total))}`}
          tone={total > 0 ? "good" : total < 0 ? "bad" : "neutral"}
          note={rows.length ? `En ${rows.length} ${rows.length === 1 ? "venta" : "ventas"} con envío gratis` : "Todavía no hay ventas con envío gratis"}
        />
        <Stat
          label={`En ${monthLabel(thisMonth)}`}
          value={`${sum(monthRows) < 0 ? "−" : ""}${formatCLP(Math.abs(sum(monthRows)))}`}
          tone={sum(monthRows) > 0 ? "good" : sum(monthRows) < 0 ? "bad" : "neutral"}
          note={`${monthRows.length} ${monthRows.length === 1 ? "venta" : "ventas"} este mes`}
        />
        <Stat
          label="Envíos que no alcanzaron"
          value={String(losses.length)}
          note={losses.length ? `Faltaron ${formatCLP(-sum(losses))} en total; los tapan los que sobraron` : "Todos los envíos quedaron cubiertos"}
        />
      </div>

      <Card title="Monto por equipo">
        <div className="space-y-4">
          <FundForm amount={amount} />
          <p className="text-sm text-[#6b716f]">
            {amount > 0
              ? `Hoy cada equipo se ve en la tienda ${formatCLP(amount)} más caro que el precio que tienes en Productos. Ese monto no cuenta en el margen: es solo para el envío. Escribe 0 para apagar el envío gratis.`
              : "El envío gratis está apagado: los clientes pagan el envío completo, como antes."}
          </p>
        </div>
      </Card>

      <Tip title="¿Cómo leer la tabla?">
        “Entró” es lo que trajo el equipo para el envío más lo que pagó el cliente (en regiones). “Courier”
        es lo que cotizó Shipit al momento de pagar. Si al final pagaste otro monto, corrígelo en la
        fila. El pago al courier igual lo anotas en Registrar movimiento → Pagué un gasto → Envíos.
      </Tip>

      <Card title="Ventas con envío gratis o con descuento">
        {rows.length === 0 ? (
          <p className="text-sm text-[#6b716f]">Cuando alguien compre, aquí aparece cada envío con su resultado.</p>
        ) : (
          <div className="overflow-x-auto -mx-5 sm:-mx-6">
            <table className="w-full text-sm">
              <thead className="text-left text-[#6b716f] border-b border-[#e4e2dc]">
                <tr>
                  <th className="px-5 sm:px-6 py-2">Fecha</th>
                  <th className="p-2">Destino</th>
                  <th className="p-2 text-right">Entró</th>
                  <th className="p-2 text-right">Courier</th>
                  <th className="p-2 text-right">Resultado</th>
                  <th className="px-5 sm:px-6 py-2">¿Pagaste otro monto?</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ order: o, came, paid, left }) => (
                  <tr key={o.id} className="border-b border-[#efede8] last:border-0">
                    <td className="px-5 sm:px-6 py-2.5 whitespace-nowrap">
                      <Link href={`/admin/pedidos/${o.id}`} className="text-[#288868] underline">
                        {formatDateTime(o.paid_at ?? o.created_at)}
                      </Link>
                    </td>
                    <td className="p-2">
                      {o.customer.comuna}
                      <span className="block text-xs text-[#6b716f]">
                        {o.customer.region} · {o.shipping_cost === 0 ? "gratis" : `cliente pagó ${formatCLP(o.shipping_cost)}`}
                      </span>
                    </td>
                    <td className="p-2 text-right tabular-nums">{formatCLP(came)}</td>
                    <td className="p-2 text-right tabular-nums">
                      {formatCLP(paid)}
                      {o.shipping_real != null && <span className="block text-xs text-[#6b716f]">corregido</span>}
                    </td>
                    <td className="p-2 text-right font-semibold">
                      <Result value={left} />
                    </td>
                    <td className="px-5 sm:px-6 py-2">
                      <form action={saveShippingReal.bind(null, o.id)} className="flex items-center gap-2">
                        <input
                          name="shipping_real"
                          defaultValue={o.shipping_real ?? ""}
                          inputMode="numeric"
                          placeholder={String(o.shipping_quote ?? "")}
                          aria-label="Lo que realmente pagaste al courier"
                          className="input w-28"
                        />
                        <button type="submit" className="btn-secondary !px-3 !py-1.5 text-xs">
                          Guardar
                        </button>
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
