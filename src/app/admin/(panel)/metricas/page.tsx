import { formatCLP, todayInChile } from "@/lib/format";
import { ga4Connected, getTraffic, type Traffic } from "@/lib/ga4";
import { getAdSpend, metaAdsConnected, type AdSpend } from "@/lib/meta-ads";
import { loadBusiness } from "../data";
import {
  CPA_GOOD,
  CPA_LOSS,
  lastMonths,
  monthLabel,
  monthOf,
  monthResult,
  movementNet,
} from "../finance";
import { MonthPicker } from "../MonthPicker";
import { Card, PageHeader, Stat, Tip } from "../ui";

export const dynamic = "force-dynamic";

const number = new Intl.NumberFormat("es-CL");
const pct = (part: number, total: number) =>
  total > 0 ? `${Math.round((part / total) * 1000) / 10}%` : "—";

// Si una conexión falla, la página igual se muestra con lo demás.
async function safely<T>(
  load: () => Promise<T | null>,
): Promise<{ data: T | null; error: string | null }> {
  try {
    return { data: await load(), error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Error desconocido",
    };
  }
}

function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  const today = todayInChile();
  return { start: `${month}-01`, end: last < today ? last : today };
}

export default async function MetricsPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const months = lastMonths(6);
  const requested = (await searchParams).mes;
  const month =
    requested && months.includes(requested)
      ? requested
      : months[months.length - 1];
  const { start, end } = monthRange(month);

  const [{ orders, products, movements }, traffic, ads] = await Promise.all([
    loadBusiness(),
    safely<Traffic>(() => getTraffic(start, end)),
    safely<AdSpend>(() => getAdSpend(start, end)),
  ]);

  const result = monthResult(month, orders, movements, products);
  // Gasto en publicidad: lo que informa Meta si está conectado; si no, lo anotado a mano.
  const manualAds = movements
    .filter(
      (m) =>
        m.kind === "egreso" &&
        m.category === "publicidad" &&
        monthOf(m.date) === month,
    )
    .reduce((s, m) => s + movementNet(m), 0);
  const adSpend = ads.data ? ads.data.spend : manualAds;
  const adSource = ads.data ? "según Meta" : "anotado en Registrar movimiento";

  const perPesoSold = adSpend > 0 ? result.salesGross / adSpend : null;
  const perPesoProfit =
    adSpend > 0 ? (result.grossProfit - adSpend) / adSpend : null;
  const costPerSale =
    adSpend > 0 && result.orders > 0
      ? Math.round(adSpend / result.orders)
      : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tienda"
        title="Métricas"
        subtitle="Cuánta gente entra, cuántos compran y si la publicidad deja plata."
      >
        <MonthPicker
          months={months.map((m) => ({ value: m, label: monthLabel(m) }))}
          value={month}
        />
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Ventas"
          value={formatCLP(result.salesGross)}
          note={`${result.orders} pedidos, con IVA`}
          tone="brand"
        />
        <Stat
          label="Margen de los equipos"
          value={formatCLP(result.grossProfit)}
          note={
            result.missingCost
              ? "Falta el costo de algún equipo"
              : "Sin IVA, ya restado el costo"
          }
        />
        <Stat
          label="Gasto en publicidad"
          value={formatCLP(adSpend)}
          note={adSource}
        />
        <Stat
          label="Ganancia después de publicidad"
          value={formatCLP(result.grossProfit - adSpend)}
          tone={
            result.grossProfit - adSpend > 0
              ? "good"
              : result.grossProfit - adSpend < 0
                ? "bad"
                : "neutral"
          }
        />
      </div>

      <Card title="¿Rinde la publicidad?">
        {adSpend === 0 ? (
          <p className="text-sm text-[#6b716f]">
            Este mes no hay gasto en publicidad{" "}
            {ads.data ? "en Meta" : "registrado"}.
          </p>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-[#6b716f]">
                Por cada $1 en publicidad vendiste
              </p>
              <p className="text-2xl font-semibold mt-1">
                {perPesoSold === null
                  ? "—"
                  : formatCLP(Math.round(perPesoSold))}
              </p>
            </div>
            <div>
              <p className="text-[#6b716f]">
                Por cada $1 en publicidad te quedaron
              </p>
              <p
                className={`text-2xl font-semibold mt-1 ${perPesoProfit !== null && perPesoProfit < 0 ? "text-[#b3362a]" : "text-[#0a6b38]"}`}
              >
                {perPesoProfit === null
                  ? "—"
                  : `${perPesoProfit < 0 ? "−" : ""}$${Math.abs(perPesoProfit).toFixed(2).replace(".", ",")}`}
              </p>
              <p className="text-xs text-[#6b716f]">
                de ganancia, ya pagada la publicidad
              </p>
            </div>
            <div>
              <p className="text-[#6b716f]">Costo por venta</p>
              <p className="text-2xl font-semibold mt-1">
                {costPerSale === null ? "—" : formatCLP(costPerSale)}
              </p>
              <p className="text-xs text-[#6b716f]">
                {costPerSale === null
                  ? "Sin ventas este mes"
                  : costPerSale <= CPA_GOOD
                    ? "Va bien"
                    : costPerSale <= CPA_LOSS
                      ? "Revisar"
                      : "Pierde plata"}
              </p>
            </div>
          </div>
        )}
        <div className="mt-5">
          <Tip>
            Cuenta todas las ventas del mes, también las que no vinieron por un
            anuncio. Para ver cada anuncio por separado, usa Campañas.
          </Tip>
        </div>
      </Card>

      <Card title="Visitas y compras (Google Analytics)">
        {traffic.error ? (
          <p className="text-sm text-[#b3362a]">
            No se pudo leer Google Analytics: {traffic.error}
          </p>
        ) : !traffic.data ? (
          <NotConnected what="Google Analytics" connected={ga4Connected()} />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Visitantes", value: traffic.data.visitors },
                {
                  label: "Vieron un equipo",
                  value: traffic.data.funnel.view_item,
                },
                {
                  label: "Agregaron al carrito",
                  value: traffic.data.funnel.add_to_cart,
                },
                {
                  label: "Fueron a pagar",
                  value: traffic.data.funnel.begin_checkout,
                },
                { label: "Compraron", value: traffic.data.funnel.purchase },
                {
                  label: "Escribieron por WhatsApp",
                  value: traffic.data.funnel.contact_whatsapp,
                },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-[#f6f5f1] p-3">
                  <p className="text-xs text-[#6b716f]">{s.label}</p>
                  <p className="text-xl font-semibold tabular-nums mt-1">
                    {number.format(s.value)}
                  </p>
                  <p className="text-xs text-[#6b716f]">
                    {pct(s.value, traffic.data!.visitors)} de las visitas
                  </p>
                </div>
              ))}
            </div>
            {traffic.data.sources.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-medium mb-2">De dónde llegan</p>
                <ul className="text-sm divide-y divide-[#e4e2dc]">
                  {traffic.data.sources.map((s) => (
                    <li key={s.source} className="flex justify-between py-1.5">
                      <span>{s.source}</span>
                      <span className="tabular-nums text-[#6b716f]">
                        {number.format(s.sessions)} visitas
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-5">
              <Tip>
                Solo cuenta a quienes aceptan las cookies y no usan bloqueador,
                así que las visitas reales son algo más. Las ventas de arriba sí
                son exactas.
              </Tip>
            </div>
          </>
        )}
      </Card>

      <Card title="Anuncios en Meta (Facebook e Instagram)">
        {ads.error ? (
          <p className="text-sm text-[#b3362a]">
            No se pudo leer Meta: {ads.error}
          </p>
        ) : !ads.data ? (
          <NotConnected what="Meta" connected={metaAdsConnected()} />
        ) : ads.data.campaigns.length === 0 ? (
          <p className="text-sm text-[#6b716f]">
            Sin anuncios activos este mes.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-[#6b716f]">
              <tr>
                <th className="font-normal pb-2">Campaña</th>
                <th className="font-normal pb-2 text-right">Gasto</th>
                <th className="font-normal pb-2 text-right">Vistas</th>
                <th className="font-normal pb-2 text-right">Clics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e2dc]">
              {ads.data.campaigns.map((c) => (
                <tr key={c.name}>
                  <td className="py-1.5">{c.name}</td>
                  <td className="py-1.5 text-right tabular-nums">
                    {formatCLP(c.spend)}
                  </td>
                  <td className="py-1.5 text-right tabular-nums">
                    {number.format(c.impressions)}
                  </td>
                  <td className="py-1.5 text-right tabular-nums">
                    {number.format(c.clicks)}
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

function NotConnected({
  what,
  connected,
}: {
  what: string;
  connected: boolean;
}) {
  return (
    <p className="text-sm text-[#6b716f]">
      {connected
        ? `La llave de ${what} está, pero no se pudo leer.`
        : `Falta conectar ${what}. Se hace una vez, pegando su llave de solo lectura en cPanel.`}
    </p>
  );
}
