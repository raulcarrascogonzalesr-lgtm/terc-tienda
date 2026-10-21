import { formatCLP } from "@/lib/format";
import { toggleCampaign } from "../actions";
import { loadBusiness } from "../data";
import {
  campaignStats,
  CHANNEL_LABELS,
  CPA_GOOD,
  CPA_LOSS,
  lastMonths,
  monthLabel,
  VERDICT_LABELS,
} from "../finance";
import { Badge, Card, PageHeader } from "../ui";
import { CampaignForm } from "./CampaignForm";

export const dynamic = "force-dynamic";

const VERDICT_TONE = { bien: "good", ojo: "warn", pierde: "bad", "sin-datos": "muted" } as const;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://terc.cl";

export default async function CampaignsPage() {
  const { orders, movements, campaigns } = await loadBusiness();
  const month = lastMonths(1)[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campañas"
        subtitle={`Cuánto gastas en cada anuncio y cuántas ventas trae. Hasta ${formatCLP(CPA_GOOD)} por venta va bien; sobre ${formatCLP(CPA_LOSS)} pierdes plata.`}
      />

      <Card title="Nueva campaña">
        <CampaignForm />
        <p className="text-xs text-[#6b716f] mt-3">
          Cada campaña tiene un enlace propio. Úsalo como destino del anuncio para saber qué ventas
          trajo. El gasto lo anotas en Caja como &quot;Publicidad&quot; y eliges la campaña.
        </p>
      </Card>

      {campaigns.length === 0 ? (
        <p className="text-sm text-[#6b716f]">Todavía no hay campañas.</p>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => {
            const m = campaignStats(c, orders, movements, month);
            const all = campaignStats(c, orders, movements);
            const link = `${SITE_URL}/?utm_source=${c.channel}&utm_campaign=${c.code}`;
            return (
              <Card key={c.id} className={c.active ? "" : "opacity-60"}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{c.name}</h2>
                    <p className="text-xs text-[#6b716f]">
                      {CHANNEL_LABELS[c.channel as keyof typeof CHANNEL_LABELS] ?? c.channel}
                      {c.monthly_budget ? ` · presupuesto ${formatCLP(c.monthly_budget)}/mes` : ""}
                      {c.active ? "" : " · pausada"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={VERDICT_TONE[m.verdict]}>{VERDICT_LABELS[m.verdict]}</Badge>
                    <form action={toggleCampaign.bind(null, c.id, !c.active)}>
                      <button
                        type="submit"
                        className="text-xs text-[#6b716f] hover:text-black underline"
                      >
                        {c.active ? "Pausar" : "Reactivar"}
                      </button>
                    </form>
                  </div>
                </div>

                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
                  <div>
                    <dt className="text-[#6b716f] capitalize">
                      Gastado ({monthLabel(month, true)})
                    </dt>
                    <dd className="font-semibold text-lg">{formatCLP(m.spend)}</dd>
                    {c.monthly_budget ? (
                      <div className="h-1.5 rounded-full bg-[#efede8] mt-1 overflow-hidden">
                        <div
                          className="h-full bg-[#eb6834]"
                          style={{ width: `${Math.min(100, (m.spend / c.monthly_budget) * 100)}%` }}
                        />
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <dt className="text-[#6b716f]">Ventas</dt>
                    <dd className="font-semibold text-lg">{m.sales}</dd>
                  </div>
                  <div>
                    <dt className="text-[#6b716f]">Costo por venta</dt>
                    <dd className="font-semibold text-lg">
                      {m.costPerSale === null ? "—" : formatCLP(m.costPerSale)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#6b716f]">Cada $1 trajo</dt>
                    <dd className="font-semibold text-lg">
                      {m.returnPerPeso === null ? "—" : `$${m.returnPerPeso.toFixed(1)}`}
                    </dd>
                  </div>
                </dl>

                <p className="text-xs text-[#6b716f] mt-4">
                  Desde que partió: {formatCLP(all.spend)} gastados, {all.sales}{" "}
                  {all.sales === 1 ? "venta" : "ventas"} por {formatCLP(all.revenue)}.
                </p>
                <p className="text-xs mt-2 break-all">
                  <span className="text-[#6b716f]">Enlace para el anuncio: </span>
                  <code className="bg-[#efede8] rounded px-1.5 py-0.5 select-all">{link}</code>
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
