import Link from "next/link";
import { StoreIcon, WhatsAppIcon } from "@/components/icons";
import { Mark } from "@/components/Mark";
import { Terqui, type TerquiPose } from "@/components/Terqui";
import { deliveryShort } from "@/lib/delivery";
import { formatCLP } from "@/lib/format";
import { photoProps } from "@/lib/photo";
import { orderNumber } from "@/lib/order-emails";
import { getProductsByIds } from "@/lib/products";
import { whatsappLink } from "@/lib/site";
import { getAdminClient } from "@/lib/supabase";
import type { Order } from "@/lib/types";
import { ClearCartOnSuccess } from "./ClearCartOnSuccess";
import { ThanksScene } from "./ThanksScene";
import { TrackPurchase } from "./TrackPurchase";

const MESSAGES: Record<string, { title: string; text: string; pose: TerquiPose }> = {
  exito: {
    pose: "celebra",
    title: "¡Gracias por tu compra!",
    text: "Recibimos tu pago. Te enviaremos un correo con el detalle y el seguimiento del envío.",
  },
  pendiente: {
    pose: "cargando",
    title: "Tu pago está en proceso",
    text: "Te avisaremos por correo apenas Mercado Pago lo confirme.",
  },
  error: {
    pose: "duda",
    title: "El pago no se completó",
    text: "No se hizo ningún cargo. Puedes volver al carrito e intentarlo de nuevo.",
  },
};

type PaidOrder = Pick<Order, "id" | "status" | "total" | "items" | "customer" | "shipping_cost">;

// Mercado Pago vuelve con el ID del pedido (external_reference) y el estado del pago.
// La compra se cuenta para la publicidad solo si el pago quedó aprobado.
async function approvedOrder(query: Record<string, string | string[] | undefined>) {
  const orderId = String(query.external_reference ?? "");
  if (!/^[0-9a-f-]{36}$/.test(orderId)) return null;
  const supabase = getAdminClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("orders")
    .select("id, status, total, items, customer, shipping_cost")
    .eq("id", orderId)
    .maybeSingle();
  const order = data as PaidOrder | null;
  if (!order) return null;
  const approved = order.status === "paid" || query.collection_status === "approved" || query.status === "approved";
  return approved ? order : null;
}

export default async function PaymentResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ estado: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { estado } = await params;
  const message = MESSAGES[estado] ?? MESSAGES.error;
  if (estado !== "exito") {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 flex flex-col items-center text-center">
        <Terqui pose={message.pose} className="w-40 h-40" />
        <h1 className="mt-2 text-2xl font-bold text-ink">{message.title}</h1>
        <p className="mt-2 text-muted">{message.text}</p>
        <Link
          href={estado === "error" ? "/carrito" : "/"}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-pine px-6 py-3 text-sm font-semibold text-white transition hover:bg-cta"
        >
          {estado === "error" ? "Volver al carrito" : "Seguir comprando"}
        </Link>
      </div>
    );
  }

  const order = await approvedOrder(await searchParams);
  // Los equipos del pedido, para mostrar su foto, su garantía y cuánto se ahorró frente a uno nuevo.
  const products = order ? await getProductsByIds(order.items.map((i) => i.product_id)).catch(() => []) : [];
  const byId = new Map(products.map((p) => [p.id, p]));
  const firstName = order?.customer?.name?.trim().split(/\s+/)[0] ?? "";
  const months = products.length ? Math.min(...products.map((p) => p.warranty_months)) : null;
  const saved = order
    ? order.items.reduce((sum, i) => {
        const list = byId.get(i.product_id)?.list_price;
        return sum + (list && list > i.unit_price ? (list - i.unit_price) * i.quantity : 0);
      }, 0)
    : 0;
  const onDemand = order ? order.items.some((i) => byId.get(i.product_id)?.on_demand !== false) : true;
  const whatsapp = whatsappLink(
    order ? `Hola TERC, tengo una consulta sobre mi pedido ${orderNumber(order.id)}` : "Hola TERC, tengo una consulta sobre mi compra",
  );
  const steps = [
    { title: "Pago recibido", text: "Hoy · te enviamos el comprobante a tu correo" },
    { title: "Revisión final y embalaje", text: "Lo probamos otra vez y lo embalamos con protección" },
    { title: "En camino", text: "Te llega un correo con el número de seguimiento" },
    { title: "Entregado", text: `Aprox. ${deliveryShort(onDemand)}` },
  ];

  return (
    <div className="shell max-w-5xl space-y-6 py-8">
      <ClearCartOnSuccess />
      {order && (
        <TrackPurchase
          orderId={order.id}
          value={order.total}
          items={order.items.map((i) => ({ id: i.product_id, name: i.name, price: i.unit_price, quantity: i.quantity }))}
        />
      )}
      <ThanksScene firstLine={firstName ? `¡Gracias, ${firstName}!` : "¡Gracias por tu compra!"} />

      {/* Después de pagar sí va "elegiste bien": confirmar la decisión evita el arrepentimiento. */}
      <div className="mx-auto grid max-w-2xl justify-items-center gap-2 text-center">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink text-balance sm:text-4xl">
          ¡Listo{firstName && `, ${firstName}`}! <span className="text-pine-700">Tu equipo ya es tuyo.</span>
        </h1>
        <p className="text-muted sm:text-lg">
          Recibimos tu pago. Elegiste bien: un equipo revisado
          {months ? `, con ${months} meses de garantía` : " y con garantía"}
          {saved > 0 ? `, y ahorraste ${formatCLP(saved)} frente a uno nuevo` : ""}. Te enviamos el detalle a tu correo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="rounded-3xl bg-surface p-5">
          <h2 className="mb-3 text-lg font-extrabold text-ink">Dónde va tu pedido</h2>
          <ol>
            {steps.map((step, i) => (
              <li key={step.title} className="relative grid grid-cols-[34px_minmax(0,1fr)] gap-3 pb-4 last:pb-0">
                {i < steps.length - 1 && <span className="absolute bottom-0 left-4 top-[34px] w-0.5 bg-line/10" aria-hidden />}
                <span
                  className={`flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 ${
                    i === 0
                      ? "border-pine-700 bg-pine-700 text-white"
                      : i === 1
                        ? "border-pine-700 shadow-[0_0_0_5px_rgba(40,136,104,0.15)]"
                        : "border-line/15"
                  }`}
                >
                  {i === 0 ? <StoreIcon name="check" className="h-4 w-4" /> : i === 1 && <span className="h-2.5 w-2.5 rounded-full bg-pine-700" />}
                </span>
                <div>
                  <b className="block text-[15px] text-ink">{step.title}</b>
                  <span className={`text-[13px] ${i === 3 ? "font-bold text-pine-700" : "text-muted"}`}>{step.text}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid content-start gap-3 rounded-3xl bg-surface p-5">
          <h2 className="text-lg font-extrabold text-ink">{order ? `Tu pedido ${orderNumber(order.id)}` : "Tu pedido"}</h2>
          {order?.items.map((item) => {
            const photo = byId.get(item.product_id)?.image_url;
            return (
              <div key={item.product_id} className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3">
                <span className="photo-stage relative block aspect-square overflow-hidden rounded-2xl">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img {...photoProps(photo, "64px", 256)} alt="" className="h-full w-full object-contain p-1.5 mix-blend-multiply" />
                  ) : (
                    <Mark className="absolute inset-[28%] opacity-50" ink="#0a2a2a" />
                  )}
                </span>
                <div>
                  <b className="block text-sm leading-snug text-ink">
                    {item.quantity > 1 && `${item.quantity} × `}
                    {item.name}
                  </b>
                  <span className="text-[13px] text-muted">{formatCLP(item.unit_price * item.quantity)}</span>
                </div>
              </div>
            );
          })}
          {order && (
            <p className="flex justify-between border-t border-line/10 pt-3 text-sm">
              <span className="text-muted">Total pagado{order.shipping_cost === 0 ? " · envío gratis" : ""}</span>
              <b className="text-ink">{formatCLP(order.total)}</b>
            </p>
          )}
          <div className="rounded-2xl bg-pine p-4 text-sm text-white">
            <b className="block font-[family-name:var(--font-display)] text-[15px] text-gold">Tu garantía TERC queda registrada</b>
            {months ? `Son ${months} meses` : "Corre"} desde el día en que lo recibes. Si algo falla, escríbenos y lo resolvemos
            nosotros.
          </div>
          <div className="flex flex-wrap gap-2.5">
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener"
                className="flex min-w-36 flex-1 items-center justify-center gap-2 rounded-full border-[1.5px] border-line/20 px-4 py-3 text-sm font-bold text-ink transition hover:border-pine-700/50"
              >
                <WhatsAppIcon className="h-5 w-5 text-[#25d366]" /> Escribir por WhatsApp
              </a>
            )}
            <Link
              href="/"
              className="flex min-w-36 flex-1 items-center justify-center rounded-full bg-pine px-4 py-3 text-sm font-bold text-white transition hover:bg-cta"
            >
              Seguir comprando
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
