import Link from "next/link";
import { Terqui, type TerquiPose } from "@/components/Terqui";
import { getAdminClient } from "@/lib/supabase";
import type { Order } from "@/lib/types";
import { ClearCartOnSuccess } from "./ClearCartOnSuccess";
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

// Mercado Pago vuelve con el ID del pedido (external_reference) y el estado del pago.
// La compra se cuenta para la publicidad solo si el pago quedó aprobado.
async function approvedOrder(query: Record<string, string | string[] | undefined>) {
  const orderId = String(query.external_reference ?? "");
  if (!/^[0-9a-f-]{36}$/.test(orderId)) return null;
  const supabase = getAdminClient();
  if (!supabase) return null;
  const { data } = await supabase.from("orders").select("id, status, total, items").eq("id", orderId).maybeSingle();
  const order = data as Pick<Order, "id" | "status" | "total" | "items"> | null;
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
  const order = estado === "exito" ? await approvedOrder(await searchParams) : null;

  return (
    <div className="max-w-lg mx-auto px-4 py-12 flex flex-col items-center text-center">
      {estado === "exito" && <ClearCartOnSuccess />}
      {order && (
        <TrackPurchase
          orderId={order.id}
          value={order.total}
          items={order.items.map((i) => ({ id: i.product_id, name: i.name, price: i.unit_price, quantity: i.quantity }))}
        />
      )}
      <Terqui pose={message.pose} className="w-40 h-40" />
      <h1 className="mt-2 text-2xl font-bold text-ink">{message.title}</h1>
      <p className="mt-2 text-muted">{message.text}</p>
      <Link
        href={estado === "error" ? "/carrito" : "/"}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-pine px-6 py-3 text-sm font-semibold text-white transition hover:bg-pine-700"
      >
        {estado === "error" ? "Volver al carrito" : "Seguir comprando"}
      </Link>
    </div>
  );
}
