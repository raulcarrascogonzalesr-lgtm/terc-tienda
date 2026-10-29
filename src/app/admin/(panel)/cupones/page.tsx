import { couponUnitPrice, describeCoupon, usesByCode } from "@/lib/coupons";
import { formatCLP, shortDate, todayInChile } from "@/lib/format";
import { ConfirmButton } from "../ConfirmButton";
import { deleteCoupon, toggleCoupon } from "../actions";
import { listAllProducts, listCoupons, listOrders } from "../data";
import { Badge, Card, PageHeader, Tip } from "../ui";
import { CouponForm } from "./CouponForm";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const [coupons, products, orders] = await Promise.all([listCoupons(), listAllProducts(), listOrders(1000)]);
  const uses = usesByCode(orders);
  const today = todayInChile();
  const byId = new Map(products.map((p) => [p.id, p]));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tienda"
        title="Cupones"
        subtitle="Códigos de descuento para un equipo. El cliente lo escribe en el carrito y el descuento se aplica a una unidad de ese equipo."
      />

      <Tip title="¿Cómo funcionan?">
        Cada cupón sirve solo para el equipo que elijas y, si no cambias el número, se puede usar
        una sola vez: cuando alguien paga con él, queda gastado. Si el equipo está en oferta, el
        cupón no se suma: el cliente paga el precio más bajo de los dos. Deja el código vacío y se
        crea uno al azar, difícil de adivinar.
      </Tip>

      <Card title="Nuevo cupón">
        <CouponForm
          products={products
            .filter((p) => p.active)
            .map((p) => ({ id: p.id, name: p.name, price: formatCLP(p.price) }))}
        />
      </Card>

      <Card title="Cupones creados">
        {coupons.length === 0 ? (
          <p className="text-sm text-[#6b716f]">Todavía no hay cupones.</p>
        ) : (
          <div className="overflow-x-auto -mx-5 sm:-mx-6">
            <table className="w-full text-sm">
              <thead className="text-left text-[#6b716f] border-b border-[#e4e2dc]">
                <tr>
                  <th className="px-5 sm:px-6 py-2">Código</th>
                  <th className="p-2">Equipo</th>
                  <th className="p-2 text-right">Descuento</th>
                  <th className="p-2 text-right">Paga hoy</th>
                  <th className="p-2 text-center">Usos</th>
                  <th className="p-2">Estado</th>
                  <th className="px-5 sm:px-6 py-2">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const product = c.product_id ? byId.get(c.product_id) : undefined;
                  const used = uses.get(c.code) ?? 0;
                  const expired = !!c.expires_on && c.expires_on < today;
                  const status =
                    used >= c.max_uses
                      ? { tone: "muted" as const, label: "Usado" }
                      : expired
                        ? { tone: "muted" as const, label: "Vencido" }
                        : !c.active
                          ? { tone: "warn" as const, label: "Pausado" }
                          : { tone: "good" as const, label: "Disponible" };
                  return (
                    <tr key={c.code} className="border-b border-[#efede8] last:border-0 align-top">
                      <td className="px-5 sm:px-6 py-2">
                        <code className="bg-[#efede8] rounded px-1.5 py-0.5 font-semibold select-all">{c.code}</code>
                        {c.note && <p className="text-xs text-[#6b716f] mt-1">{c.note}</p>}
                      </td>
                      <td className="p-2">{c.product_id ? (product?.name ?? "—") : "Cualquier equipo"}</td>
                      <td className="p-2 text-right whitespace-nowrap">{describeCoupon(c, formatCLP)}</td>
                      <td className="p-2 text-right whitespace-nowrap">
                        {product ? formatCLP(couponUnitPrice(c, product)) : "—"}
                        {product && <p className="text-xs text-[#6b716f]">antes {formatCLP(product.price)}</p>}
                      </td>
                      <td className="p-2 text-center whitespace-nowrap">
                        {used} de {c.max_uses}
                      </td>
                      <td className="p-2">
                        <Badge tone={status.tone}>{status.label}</Badge>
                        {c.expires_on && (
                          <p className="text-xs text-[#6b716f] mt-1">Vence {shortDate(c.expires_on)}</p>
                        )}
                      </td>
                      <td className="px-5 sm:px-6 py-2">
                        <div className="flex justify-end gap-3 text-xs">
                          <form action={toggleCoupon.bind(null, c.code, !c.active)}>
                            <button type="submit" className="text-[#6b716f] hover:text-black underline">
                              {c.active ? "Pausar" : "Reactivar"}
                            </button>
                          </form>
                          {used === 0 && (
                            <form action={deleteCoupon.bind(null, c.code)}>
                              <ConfirmButton
                                message={`¿Borrar el cupón ${c.code}?`}
                                className="text-[#b3362a] hover:underline"
                              >
                                Borrar
                              </ConfirmButton>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-[#6b716f] mt-3">
          Si le vendes a alguien con su cupón por WhatsApp (fuera de la página), pausa el cupón
          para que no se pueda usar de nuevo.
        </p>
      </Card>
    </div>
  );
}
