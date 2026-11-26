import Link from "next/link";
import { notFound } from "next/navigation";
import { getPreference } from "@/lib/email-preferences";
import { isRequestOrder, REQUEST_ZONE } from "@/lib/energy";
import { SITE } from "@/lib/site";
import { transferRows, transferSubject } from "@/lib/transfer";
import { orderNumber } from "@/lib/order-emails";
import { formatCLP, formatDateTime, ORDER_STATUS_LABELS } from "@/lib/format";
import { shippingLabel } from "@/lib/shipping";
import { updateOrder } from "../../actions";
import { getOrder } from "../../data";
import { PageHeader } from "../../ui";
import type { Order } from "@/lib/types";
import { ResendEmail } from "./ResendEmail";

export const dynamic = "force-dynamic";

const CUSTOMER_LABELS: Record<string, string> = {
  name: "Nombre",
  document: "Documento",
  business: "Razón social",
  rut: "RUT",
  email: "Correo",
  phone: "Teléfono",
  courier: "Courier que eligió",
  region: "Región",
  comuna: "Comuna",
  address: "Dirección",
  dwelling: "Tipo de lugar",
  references: "Indicaciones",
  note: "Nota del cliente",
};

// Pedido por transferencia (Energía o computadores): recordatorio por WhatsApp con la cuenta y el monto.
// El cliente ya los vio al enviar el pedido y le llegaron por correo (Raúl, 26-11-2026).
function approvalMessage(order: Order) {
  const first = (order.customer.name ?? "").trim().split(/\s+/)[0];
  const number = orderNumber(order.id);
  const lines = order.items.map((i) => `• ${i.quantity} × ${i.name}: ${formatCLP(i.unit_price * i.quantity)}`);
  return [
    `Hola${first ? ` ${first}` : ""}, te escribimos de TERC por tu pedido ${number}.`,
    "",
    ...lines,
    `Total a transferir: ${formatCLP(order.total)} (IVA incluido)`,
    "",
    "Datos para la transferencia:",
    ...transferRows().map(([k, v]) => `${k}: ${v}`),
    `Asunto: ${transferSubject(number)}`,
    "",
    "Cuando transfieras, mándanos el comprobante por aquí. ¡Gracias!",
  ].join("\n");
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const zone = shippingLabel(order.shipping_zone);
  const paid = ["paid", "shipped", "delivered"].includes(order.status);
  const sentAt = (value?: string | null) => (value ? `enviado el ${formatDateTime(value)}` : null);
  const pref = order.customer.email ? await getPreference(order.customer.email) : null;
  const followUps: [string, string | null | undefined][] = [
    ["Día 10 · cuidar el equipo", order.care_email_at],
    ["Día 30 · código de amigo (solo con permiso)", order.referral_email_at],
  ];

  const request = isRequestOrder(order);
  const customerWa = (order.customer.phone ?? "").replace(/\D/g, "");
  const approveUrl = request && customerWa ? `https://wa.me/${customerWa}?text=${encodeURIComponent(approvalMessage(order))}` : null;

  return (
    <section className="space-y-6">
      <Link href="/admin/pedidos" className="text-sm text-[#288868] underline">
        ← Volver a pedidos
      </Link>
      <PageHeader
        eyebrow={request ? "Pago por transferencia" : "Pedido"}
        title={`${request ? "Solicitud" : "Pedido"} ${orderNumber(order.id)} del ${formatDateTime(order.created_at)}`}
      />

      {request && (
        <div className={`rounded-xl border p-4 text-sm space-y-3 ${order.status === "pending" ? "border-[#b3a26a] bg-[#fbf8ee]" : "border-[#e4e2dc] bg-white"}`}>
          <h2 className="font-semibold">
            {order.status === "pending" ? "Esperando la transferencia del cliente" : "Pedido por transferencia"}
          </h2>
          <ol className="list-decimal space-y-1 pl-5 text-[#3d4543]">
            <li>El cliente ya vio la cuenta y el monto (y le llegaron por correo). Asunto: {transferSubject(orderNumber(order.id))}.</li>
            <li>
              Cuando veas la plata en el banco (no solo la foto del comprobante), confirma stock con el proveedor. Si hay, cambia el
              estado a <strong>Pagado</strong> y guarda: se descuenta el stock y al cliente le llega el correo de pago recibido.
            </li>
            {order.shipping_zone === REQUEST_ZONE ? (
              <li>
                Si no hay stock: devuélvele el 100% en máximo {SITE.transfer.refundDays} días hábiles y cámbialo a{" "}
                <strong>Cancelado</strong>.
              </li>
            ) : (
              <li>
                Si no transfiere en {SITE.transfer.holdHours} horas, cámbialo a <strong>Cancelado</strong>. Si ya pagó y no hay
                stock, devuélvele el 100%.
              </li>
            )}
          </ol>
          {approveUrl && order.status === "pending" && (
            <a href={approveUrl} target="_blank" rel="noopener" className="btn-primary inline-block">
              Recordarle la cuenta y el monto por WhatsApp
            </a>
          )}

        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#e4e2dc] p-4 space-y-2 text-sm">
          <h2 className="font-semibold">Cliente</h2>
          {/* Los pedidos antiguos no tienen todos los datos: se muestran solo los que hay. */}
          {Object.entries(CUSTOMER_LABELS).filter(([key]) => order.customer[key]).map(([key, label]) => (
            <p key={key}>
              <span className="text-[#6b716f]">{label}:</span> {order.customer[key]}
            </p>
          ))}
        </div>

        <form
          action={updateOrder.bind(null, order.id)}
          className="bg-white rounded-xl border border-[#e4e2dc] p-4 space-y-4 text-sm"
        >
          <h2 className="font-semibold">Estado</h2>
          <select name="status" defaultValue={order.status} className="input">
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <label className="block space-y-1">
            <span>Código de seguimiento del envío</span>
            <input
              name="tracking_code"
              defaultValue={order.tracking_code ?? ""}
              className="input"
            />
          </label>
          <p className="text-[#6b716f]">
            {order.paid_at ? `Pagado el ${formatDateTime(order.paid_at)}` : "Sin pago registrado"}
            {order.payment_id && ` · Pago ${order.payment_id}`}
          </p>
          <button type="submit" className="btn-primary">
            Guardar
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-[#e4e2dc] p-4 text-sm space-y-2">
        <h2 className="font-semibold">Correos al cliente</h2>
        <p className="text-[#6b716f]">
          Salen solos: el de pago al confirmarse el pago, el de envío al guardar el pedido como
          &quot;Enviado&quot; con su código de seguimiento, y el de &quot;¿cómo te fue?&quot; al marcarlo
          &quot;Entregado&quot;.
        </p>
        <ResendEmail
          orderId={order.id}
          kind="paid"
          label="Pago recibido"
          sentAt={sentAt(order.paid_email_at)}
          disabled={!paid}
        />
        <ResendEmail
          orderId={order.id}
          kind="shipped"
          label="Pedido en camino"
          sentAt={sentAt(order.shipped_email_at)}
          disabled={!order.tracking_code}
        />
        <ResendEmail
          orderId={order.id}
          kind="delivered"
          label="Pedido entregado"
          sentAt={sentAt(order.delivered_email_at)}
          disabled={order.status !== "delivered"}
        />
        <h3 className="font-semibold pt-3">Seguimiento después de la entrega</h3>
        <p className="text-[#6b716f]">
          {order.delivered_at ? `Entregado el ${formatDateTime(order.delivered_at)}. ` : ""}
          Novedades:{" "}
          {pref?.unsubscribed_at
            ? `se dio de baja el ${formatDateTime(pref.unsubscribed_at)} (no recibe correos de seguimiento)`
            : pref?.marketing_consent_at
              ? `aceptó el ${formatDateTime(pref.marketing_consent_at)}`
              : "no marcó la casilla"}
          .
        </p>
        <ul className="text-[#6b716f]">
          {followUps.map(([label, at]) => (
            <li key={label}>
              {label}: {at ? `revisado el ${formatDateTime(at)}` : "pendiente"}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-xl border border-[#e4e2dc] p-4 text-sm space-y-2">
        <h2 className="font-semibold">Productos</h2>
        {order.items.map((item) => (
          <div key={item.product_id} className="flex justify-between gap-4">
            <span>
              {item.quantity} × {item.name}
            </span>
            <span>{formatCLP(item.unit_price * item.quantity)}</span>
          </div>
        ))}
        {order.discount ? (
          <div className="flex justify-between gap-4 text-[#6b716f]">
            <span>Cupón {order.coupon_code}</span>
            <span>−{formatCLP(order.discount)}</span>
          </div>
        ) : null}
        <div className="flex justify-between gap-4 text-[#6b716f]">
          <span>Envío {zone}</span>
          <span>{formatCLP(order.shipping_cost)}</span>
        </div>
        <div className="flex justify-between gap-4 font-semibold border-t border-[#e4e2dc] pt-2">
          <span>Total</span>
          <span>{formatCLP(order.total)}</span>
        </div>
      </div>
    </section>
  );
}
