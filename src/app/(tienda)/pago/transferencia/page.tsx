import type { Metadata } from "next";
import Link from "next/link";
import { StoreIcon, WhatsAppIcon } from "@/components/icons";
import { Terqui } from "@/components/Terqui";
import { TransferDetails } from "@/components/TransferDetails";
import { orderNumber } from "@/lib/order-emails";
import { SITE, whatsappLink } from "@/lib/site";
import { getAdminClient } from "@/lib/supabase";
import { ClearCartOnSuccess } from "../[estado]/ClearCartOnSuccess";

export const metadata: Metadata = { title: "Transfiere para completar tu compra | TERC", robots: { index: false } };
export const dynamic = "force-dynamic";

// Después de elegir "Transferencia" en el carrito (computadores): el pedido queda guardado y se
// muestran la cuenta, el monto y el asunto. Se confirma cuando TERC ve la plata en el banco.
export default async function TransferPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id = "" } = await searchParams;
  const supabase = /^[0-9a-f-]{36}$/.test(id) ? getAdminClient() : null;
  const { data } = supabase
    ? await supabase.from("orders").select("id, total, customer").eq("id", id).maybeSingle()
    : { data: null };
  const order = data as { id: string; total: number; customer: Record<string, string> } | null;
  const number = order ? orderNumber(order.id) : "";
  const name = order?.customer?.name?.trim().split(/\s+/)[0] ?? "";
  const wa = whatsappLink(`Hola TERC, transferí mi pedido ${number}. Te mando el comprobante.`);
  return (
    <div className="shell py-10">
      <ClearCartOnSuccess />
      <section className="mx-auto max-w-2xl rounded-3xl bg-surface p-6 text-center shadow-[0_16px_40px_-24px_rgba(10,42,42,0.45)] sm:p-10">
        <Terqui pose="listo" className="mx-auto h-32 w-32" />
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-mint-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-pine-700">
          <StoreIcon name="check" className="h-4 w-4" /> Pedido guardado{number ? ` ${number}` : ""}
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          ¡Gracias{name ? `, ${name}` : ""}! Solo falta tu transferencia
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
          Guardamos tu pedido por {SITE.transfer.holdHours} horas. Cuando veamos la transferencia en el banco te confirmamos por
          correo y lo preparamos para el envío. También te mandamos estos datos a tu correo.
        </p>
        <div className="mt-6">
          {order ? (
            <TransferDetails number={number} total={order.total} />
          ) : (
            <p className="text-sm text-muted">No encontramos el pedido. Escríbenos por WhatsApp y te ayudamos.</p>
          )}
        </div>
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
          <Link href="/" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-pine-700 ring-1 ring-pine-700/30 hover:bg-mint-50">
            Seguir mirando <StoreIcon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
