import Link from "next/link";
import { notFound } from "next/navigation";
import { formatCLP, formatDateTime, ORDER_STATUS_LABELS } from "@/lib/format";
import { SHIPPING_ZONES, isShippingZone } from "@/lib/shipping";
import { updateOrder } from "../../actions";
import { getOrder } from "../../data";
import { PageHeader } from "../../ui";

export const dynamic = "force-dynamic";

const CUSTOMER_LABELS: Record<string, string> = {
  name: "Nombre",
  email: "Correo",
  phone: "Teléfono",
  region: "Región",
  comuna: "Comuna",
  address: "Dirección",
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const zone = isShippingZone(order.shipping_zone)
    ? SHIPPING_ZONES[order.shipping_zone].label
    : order.shipping_zone;

  return (
    <section className="space-y-6">
      <Link href="/admin/pedidos" className="text-sm text-[#0f5f59] underline">
        ← Volver a pedidos
      </Link>
      <PageHeader eyebrow="Pedido" title={`Pedido del ${formatDateTime(order.created_at)}`} />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#e4e2dc] p-4 space-y-2 text-sm">
          <h2 className="font-semibold">Cliente</h2>
          {Object.entries(CUSTOMER_LABELS).map(([key, label]) => (
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
        <h2 className="font-semibold">Productos</h2>
        {order.items.map((item) => (
          <div key={item.product_id} className="flex justify-between gap-4">
            <span>
              {item.quantity} × {item.name}
            </span>
            <span>{formatCLP(item.unit_price * item.quantity)}</span>
          </div>
        ))}
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
