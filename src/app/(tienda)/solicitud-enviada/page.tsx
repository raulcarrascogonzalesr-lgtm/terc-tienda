import type { Metadata } from "next";
import Link from "next/link";
import { EnergySteps, WireSunCard } from "@/components/energy/EnergyParts";
import { StoreIcon, WhatsAppIcon } from "@/components/icons";
import { Terqui } from "@/components/Terqui";
import { ENERGY_INFO } from "@/lib/energy";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = { title: "Solicitud enviada | TERC", robots: { index: false } };

type Props = { searchParams: Promise<{ n?: string; w?: string; nombre?: string }> };

// Después de enviar una solicitud de compra (productos de Energía, TERC 2.1). No se ha cobrado nada:
// TERC confirma stock y total y le escribe al cliente por WhatsApp con la cuenta y el monto.
export default async function RequestSentPage({ searchParams }: Props) {
  const { n, w, nombre } = await searchParams;
  const number = (n ?? "").slice(0, 12);
  const phone = (w ?? "").slice(0, 20);
  const name = (nombre ?? "").slice(0, 40);
  const wa = whatsappLink(`Hola, envié la solicitud ${number} en terc.cl`);
  return (
    <div className="shell py-10">
      <section className="mx-auto max-w-3xl rounded-3xl bg-surface p-6 text-center shadow-[0_16px_40px_-24px_rgba(10,42,42,0.45)] sm:p-10">
        <Terqui pose="celebra" className="mx-auto h-36 w-36" />
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-mint-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-pine-700">
          <StoreIcon name="check" className="h-4 w-4" /> Solicitud enviada{number ? ` ${number}` : ""}
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          ¡Gracias{name ? `, ${name}` : ""}! Recibimos tu solicitud
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
          Revisamos stock y te escribimos el mismo día hábil por WhatsApp{phone ? ` al ${phone}` : ""} con la cuenta y el monto a
          transferir (vale por {ENERGY_INFO.holdHours} horas). <strong className="text-ink">No se ha cobrado nada.</strong> También
          te llegó un correo con el detalle.
        </p>
        <EnergySteps done={1} className="mt-6 text-left" />
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full bg-cta px-5 py-3 text-sm font-bold text-white hover:bg-cta-hover"
            >
              <WhatsAppIcon className="h-4 w-4" /> ¿Apuro? Escríbenos por WhatsApp
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
