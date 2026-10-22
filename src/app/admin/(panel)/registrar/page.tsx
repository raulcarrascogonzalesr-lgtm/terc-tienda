import { loadBusiness } from "../data";
import { cashBalance, loanStatus } from "../finance";
import { PageHeader } from "../ui";
import { isIntent } from "./intents";
import { RegisterWizard } from "./RegisterWizard";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const { orders, products, movements, campaigns } = await loadBusiness();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Caja"
        title="Registrar movimiento"
        subtitle="Anota la plata que entra o sale del negocio. Las ventas de la tienda web se registran solas."
      />
      <RegisterWizard
        campaigns={campaigns.filter((c) => c.active)}
        products={products
          .filter((p) => p.stock > 0)
          .map((p) => ({ id: p.id, name: p.name, stock: p.stock, onDemand: p.on_demand }))}
        today={today}
        cash={cashBalance(orders, movements)}
        loanPending={loanStatus(movements).pending}
        initialIntent={isIntent(tipo) ? tipo : null}
      />
    </div>
  );
}
