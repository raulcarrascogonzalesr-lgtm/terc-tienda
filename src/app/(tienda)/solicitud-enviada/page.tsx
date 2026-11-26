import type { Metadata } from "next";
import Link from "next/link";
import { EnergySteps, WireSunCard } from "@/components/energy/EnergyParts";
import { StoreIcon, WhatsAppIcon } from "@/components/icons";
import { Terqui } from "@/components/Terqui";
import { TransferDetails } from "@/components/TransferDetails";
import { SITE, whatsappLink } from "@/lib/site";
import { getAdminClient } from "@/lib/supabase";

export const metadata: Metadata = { title: "Transfiere para completar tu compra | TERC", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ n?: string; id?: string; nombre?: string }> };

// Después de enviar un pedido de Energía (TERC 2.1). Desde el 26-11-2026 (Raúl) se muestran al tiro
// la cuenta y el monto; TERC confirma stock al ver la transferencia y, si no hay, devuelve el 100%.
export default async function RequestSentPage({ searchParams }: Props) {
  const { n, id = "", nombre } = await searchParams;
  const number = (n ?? "").slice(0, 12);
  const name = (nombre ?? "").slice(0, 40);
  const supabase = /^[0-9a-f-]{36}$/.test(id) ? getAdminClient() : null;
  const { data } = supabase ? await supabase.from("orders").select("total").eq("id", id).maybeSingle() : { data: null };
  const total = (data as { total: number } | null)?.total ?? null;
  const wa = whatsappLink(`Hola TERC, transferí mi pedido ${number}. Te mando el comprobante.`);
  return (
    <div className="shell py-10">
      <section className="mx-auto max-w-3xl rounded-3xl bg-surface p-6 text-center shadow-[0_16px_40px_-24px_rgba(10,42,42,0.45)] sm:p-10">
        <Terqui pose="celebra" className="mx-auto h-36 w-36" />
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-mint-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-pine-700">
          <StoreIcon name="check" className="h-4 w-4" /> Pedido recibido{number ? ` ${number}` : ""}
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          ¡Gracias{name ? `, ${name}` : ""}! Solo falta tu transferencia
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
          Transfiere a la cuenta de abajo y mándanos el comprobante. Al recibirla confirmamos stock con el proveedor y coordinamos la
          entrega contigo. <strong className="text-ink">Si no tenemos stock, te devolvemos el 100% en máximo{" "}
          {SITE.transfer.refundDays} días hábiles.</strong> También te mandamos estos datos a tu correo.
        </p>
        <div className="mt-6">
          <TransferDetails number={number} total={total} />
        </div>
        <EnergySteps done={1} className="mt-6 text-left" />
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full bg-cta px-5 py-3 text-sm font-bold text-white hover:bg-cta-hover"
            >
              <WhatsAppIcon className="h-4 w-4" /> Mandar el comprobante por WhatsApp
            </a>
          )}
          <Link href="/energia" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-pine-700 ring-1 ring-pine-700/30 hover:bg-mint-50">
            Seguir mirando <StoreIcon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
      </section>
      <div className="mx-auto mt-8 max-w-5xl">
        <WireSunCard />
      </div>
    </div>
  );
}
