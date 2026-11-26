import { loadBusiness } from "../data";
import { dadCardStatus, lastMonths, monthLabel, monthOf } from "../finance";
import { openingStatus, planMonth, unitProfits } from "../plan";
import { PageHeader } from "../ui";
import { PlanView } from "./PlanView";

export const dynamic = "force-dynamic";

export default async function PlanPage() {
  const { orders, products, movements, campaigns } = await loadBusiness();
  const months = lastMonths(4).map((m) => ({
    ...planMonth(m, orders, movements, products, campaigns),
    label: monthLabel(m),
    short: monthLabel(m, true),
  }));
  const card = dadCardStatus(movements);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finanzas"
        title="Plan del mes"
        subtitle="¿Ya cubrimos los gastos del mes? Todo lo que pase de la línea del 0 es ganancia. Sin IVA y sin los gastos de apertura."
      />
      <PlanView
        months={months}
        current={monthOf(new Date())}
        units={unitProfits(products)}
        card={{
          charged: card.charged,
          repaid: card.repaid,
          owed: card.owed,
          log: card.log
            .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.created_at.localeCompare(a.created_at)))
            .slice(0, 30)
            .map((m) => ({
              id: m.id,
              date: m.date,
              repayment: m.category === "devolucion_tarjeta",
              amount: m.amount,
              text: m.description,
            })),
        }}
        opening={openingStatus(movements)}
        googleCampaigns={campaigns
          .filter((c) => c.channel === "google")
          .map((c) => ({ id: c.id, name: c.name }))}
        today={today}
      />
    </div>
  );
}
