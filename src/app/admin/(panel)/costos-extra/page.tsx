import { formatCLP } from "@/lib/format";
import { ConfirmButton } from "../ConfirmButton";
import { deleteExtraCost, toggleExtraCost } from "../actions";
import { listAllProducts, listExtraCosts } from "../data";
import { extraCostFor } from "../extra-costs";
import { netOf } from "../finance";
import { Card, PageHeader, Tip } from "../ui";
import { ExtraCostForm } from "./ExtraCostForm";

export const dynamic = "force-dynamic";

function describe(amount: number, percent: number): string {
  const parts = [];
  if (amount > 0) parts.push(formatCLP(amount));
  if (percent > 0) parts.push(`${String(percent).replace(".", ",")}% del precio`);
  return parts.join(" + ");
}

export default async function ExtraCostsPage() {
  const [costs, products] = await Promise.all([listExtraCosts(), listAllProducts()]);
  const categories = [...new Set(products.map((p) => p.category))].sort();

  // Un ejemplo por categoría: el equipo más vendible (el más barato) con su margen antes y después.
  const examples = categories.map((category) => {
    const p = products
      .filter((x) => x.category === category && x.cost !== null)
      .sort((a, b) => a.price - b.price)[0];
    if (!p || p.cost === null) return { category, product: null };
    const priceNet = netOf(p.price);
    const extra = extraCostFor(p.price, p.category, costs);
    return {
      category,
      product: p,
      before: priceNet - p.cost,
      extra,
      after: priceNet - p.cost - extra,
      priceNet,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tienda"
        title="Costos por venta"
        subtitle="Lo que gastas cada vez que vendes un equipo, además de lo que te costó: caja con logo, relleno, cinta, sticker, comisión de pago. Se restan del margen de cada producto."
      />

      <Tip title="¿Cómo se calcula?">
        Si compras 100 cajas a $150.000 sin IVA, cada caja cuesta $1.500: ese es el número que va
        aquí. Los montos van sin IVA, igual que el costo de los equipos. La compra de las cajas la
        anotas aparte en Registrar movimiento → Pagué un gasto → Cajas y embalaje, con su factura.
      </Tip>

      <Card title="Agregar un costo">
        <ExtraCostForm categories={categories} />
      </Card>

      <Card title="Costos que se restan hoy">
        {costs.length === 0 ? (
          <p className="text-sm text-[#6b716f]">
            Todavía no hay costos extra. Cuando tengas la cotización de las cajas, agrégala arriba.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-5 sm:-mx-6">
            <table className="w-full text-sm">
              <thead className="text-left text-[#6b716f] border-b border-[#e4e2dc]">
                <tr>
                  <th className="px-5 sm:px-6 py-2">Qué es</th>
                  <th className="p-2">Para</th>
                  <th className="p-2 text-right">Por equipo</th>
                  <th className="p-2">De dónde sale</th>
                  <th className="px-5 sm:px-6 py-2">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {costs.map((c) => (
                  <tr
                    key={c.id}
                    className={`border-b border-[#efede8] last:border-0 ${c.active ? "" : "opacity-50"}`}
                  >
                    <td className="px-5 sm:px-6 py-2 font-medium">{c.name}</td>
                    <td className="p-2">{c.category ?? "Todos"}</td>
                    <td className="p-2 text-right whitespace-nowrap">{describe(c.amount, c.percent)}</td>
                    <td className="p-2 text-[#6b716f]">{c.note || "—"}</td>
                    <td className="px-5 sm:px-6 py-2">
                      <div className="flex justify-end gap-3 text-xs">
                        <form action={toggleExtraCost.bind(null, c.id, !c.active)}>
                          <button type="submit" className="text-[#6b716f] hover:text-black underline">
                            {c.active ? "Pausar" : "Reactivar"}
                          </button>
                        </form>
                        <form action={deleteExtraCost.bind(null, c.id)}>
                          <ConfirmButton
                            message={`¿Borrar "${c.name}"?`}
                            className="text-[#b3362a] hover:underline"
                          >
                            Borrar
                          </ConfirmButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Cómo queda el margen (un ejemplo por categoría)">
        <div className="overflow-x-auto -mx-5 sm:-mx-6">
          <table className="w-full text-sm">
            <thead className="text-left text-[#6b716f] border-b border-[#e4e2dc]">
              <tr>
                <th className="px-5 sm:px-6 py-2">Categoría</th>
                <th className="p-2">Equipo</th>
                <th className="p-2 text-right">Margen sin costos extra</th>
                <th className="p-2 text-right">Costos extra</th>
                <th className="px-5 sm:px-6 py-2 text-right">Margen final</th>
              </tr>
            </thead>
            <tbody>
              {examples.map((e) => (
                <tr key={e.category} className="border-b border-[#efede8] last:border-0">
                  <td className="px-5 sm:px-6 py-2 font-medium">{e.category}</td>
                  {e.product ? (
                    <>
                      <td className="p-2">{e.product.name}</td>
                      <td className="p-2 text-right whitespace-nowrap">{formatCLP(e.before)}</td>
                      <td className="p-2 text-right whitespace-nowrap">
                        {e.extra ? `−${formatCLP(e.extra)}` : "—"}
                      </td>
                      <td
                        className={`px-5 sm:px-6 py-2 text-right whitespace-nowrap font-semibold ${e.after < 0 ? "text-[#b3362a]" : ""}`}
                      >
                        {formatCLP(e.after)} ({e.priceNet ? Math.round((e.after / e.priceNet) * 100) : 0}%)
                      </td>
                    </>
                  ) : (
                    <td colSpan={4} className="p-2 text-[#6b716f]">
                      Sin productos con costo cargado.
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[#6b716f] mt-3">
          El margen de todos los productos, ya con estos costos restados, está en Productos.
        </p>
      </Card>
    </div>
  );
}
