import Link from "next/link";
import { formatCLP } from "@/lib/format";
import { isEnergy } from "@/lib/energy";
import { photoProps } from "@/lib/photo";
import type { AdminProduct, ExtraCost } from "@/lib/types";
import { updatePrice } from "../actions";
import { listAllProducts, listExtraCosts } from "../data";
import { extraCostFor } from "../extra-costs";
import { netOf } from "../finance";
import { PageHeader } from "../ui";
import { CHECKED_ON, REFERENCES, type Reference } from "./referencias";

export const dynamic = "force-dynamic";

// Para buscar sin importar mayúsculas, tildes ni guiones.
const simple = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

// Ganancia por equipo: precio sin IVA, menos el costo y los costos por venta.
function profitOf(price: number, p: AdminProduct, extraCosts: ExtraCost[]): number | null {
  if (p.cost === null) return null;
  return netOf(price) - p.cost - extraCostFor(price, p.category, extraCosts);
}

// Precio terminado en ...9.990 (o ...990 bajo $100.000) justo bajo la tienda más barata.
function justBelow(price: number): number {
  return price >= 100_000
    ? Math.floor((price - 9_991) / 10_000) * 10_000 + 9_990
    : Math.floor((price - 991) / 1_000) * 1_000 + 990;
}

type Row = {
  p: AdminProduct;
  ref: Reference | null;
  cheapest: [number, string] | null;
  place: number; // 1 = el más barato
  total: number; // tiendas comparadas + TERC
  profit: number | null;
};

function buildRow(p: AdminProduct, extraCosts: ExtraCost[]): Row {
  const ref = (p.supplier_sku && REFERENCES[p.supplier_sku]) || null;
  const stores = ref?.tiendas ?? [];
  const cheapest = stores.length ? stores.reduce((a, b) => (b[0] < a[0] ? b : a)) : null;
  return {
    p,
    ref,
    cheapest,
    place: 1 + stores.filter(([price]) => price < p.price).length,
    total: stores.length + 1,
    profit: profitOf(p.price, p, extraCosts),
  };
}

function Place({ row }: { row: Row }) {
  if (!row.cheapest) return <span className="text-xs text-[#6b716f]">Sin tiendas para comparar</span>;
  if (row.place === 1)
    return (
      <span className="inline-block rounded-full bg-[#e3f4ec] px-2.5 py-1 text-xs font-semibold text-[#1d6b50]">
        El más barato
      </span>
    );
  const close = row.p.price <= row.cheapest[0] * 1.03;
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
        close ? "bg-[#fbf1dc] text-[#8a5a00]" : "bg-[#fbe4e1] text-[#a1302a]"
      }`}
    >
      Puesto {row.place} de {row.total}
    </span>
  );
}

export default async function PricesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sku?: string; ok?: string }>;
}) {
  const [{ q = "", sku = "", ok }, all, extraCosts] = await Promise.all([
    searchParams,
    listAllProducts(),
    listExtraCosts(),
  ]);
  const query = simple(q);
  const rows = all
    .filter((p) => p.active && isEnergy(p))
    .filter((p) => !query || simple(`${p.sku} ${p.name} ${p.brand} ${p.supplier_sku ?? ""}`).includes(query))
    .sort((a, b) => b.price - a.price)
    .map((p) => buildRow(p, extraCosts));
  const compared = rows.filter((r) => r.cheapest);
  const cheapestCount = compared.filter((r) => r.place === 1).length;
  const profits = rows.map((r) => r.profit).filter((n): n is number => n !== null);
  const saved = ok && rows.find((r) => r.p.sku === sku);

  return (
    <section className="space-y-4">
      <PageHeader
        eyebrow="Tienda"
        title="Tabla de precios"
        subtitle={`Los productos de Energía con su precio de la tienda, el de Esol y el de otras tiendas. El precio y la ganancia se leen directo de la tienda; las otras tiendas se revisaron el ${CHECKED_ON}.`}
      >
        <Link href="/admin/productos" className="text-sm text-[#288868] underline">
          Ir a Productos
        </Link>
      </PageHeader>

      {saved && (
        <p className="rounded-lg border border-[#bfe3d2] bg-[#eef8f3] px-4 py-3 text-sm text-[#1d6b50]">
          Listo: {saved.p.name} quedó en {formatCLP(saved.p.price)} y ya se ve así en la tienda.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#e4e2dc] bg-white p-4">
          <p className="text-xs text-[#6b716f]">Productos en la tabla</p>
          <p className="mt-1 text-2xl font-semibold text-[#0a2a2a]">{rows.length}</p>
        </div>
        <div className="rounded-xl border border-[#e4e2dc] bg-white p-4">
          <p className="text-xs text-[#6b716f]">Somos los más baratos</p>
          <p className="mt-1 text-2xl font-semibold text-[#1d6b50]">
            {cheapestCount} de {compared.length}
          </p>
          <p className="text-xs text-[#6b716f]">contando solo los que tienen otras tiendas</p>
        </div>
        <div className="rounded-xl border border-[#e4e2dc] bg-white p-4">
          <p className="text-xs text-[#6b716f]">Ganancia promedio por equipo</p>
          <p className="mt-1 text-2xl font-semibold text-[#0a2a2a]">
            {profits.length ? formatCLP(Math.round(profits.reduce((a, b) => a + b, 0) / profits.length)) : "—"}
          </p>
        </div>
      </div>

      <form className="flex flex-wrap items-center gap-2" role="search">
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Buscar por SKU (10044), nombre o marca"
          aria-label="Buscar en la tabla de precios"
          className="input max-w-md flex-1"
        />
        <button className="btn-primary">Buscar</button>
        {q && (
          <Link href="/admin/precios" className="text-sm text-[#288868] underline">
            Ver todos
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-xl border border-[#e4e2dc] bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-[#e4e2dc] text-left text-[#6b716f]">
            <tr>
              <th className="p-3">Producto</th>
              <th className="p-3">Precio TERC con IVA</th>
              <th className="p-3 text-right">Esol al público</th>
              <th className="p-3">Tienda más barata</th>
              <th className="p-3">¿Cómo vamos?</th>
              <th className="p-3 text-right">Ganancia por equipo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const { p, ref, cheapest } = row;
              const target = cheapest && row.place > 1 ? justBelow(cheapest[0]) : null;
              const targetProfit = target ? profitOf(target, p, extraCosts) : null;
              const picked = p.sku === sku;
              const photo = p.image_url ?? p.images[0] ?? null;
              return (
                <tr
                  key={p.id}
                  id={`sku-${p.sku}`}
                  className={`scroll-mt-24 border-b border-[#f0eee8] align-top last:border-0 target:bg-[#fff6d6] ${
                    picked ? "bg-[#fff6d6]" : ""
                  }`}
                >
                  <td className="p-3">
                    <div className="flex min-w-[240px] gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#e4e2dc] bg-[#f6f5f1]">
                        {photo && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            {...photoProps(photo, "48px", 256)}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-contain p-0.5 mix-blend-multiply"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[#0a2a2a]">{p.name}</p>
                        <p className="text-xs text-[#6b716f]">
                          SKU {p.sku} ·{" "}
                          <Link href={`/admin/productos/${p.id}`} className="text-[#288868] underline">
                            Editar
                          </Link>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <form key={`${p.id}-${p.price}`} action={updatePrice} className="flex items-center gap-1.5">
                      <input type="hidden" name="id" value={p.id} />
                      <input
                        name="price"
                        inputMode="numeric"
                        defaultValue={p.price.toLocaleString("es-CL")}
                        aria-label={`Precio de ${p.name}`}
                        className="input w-32 text-right"
                      />
                      <button className="rounded-md border border-[#cfd8d3] px-2.5 py-1.5 text-xs font-semibold text-[#0a2a2a] hover:bg-[#f1efe8]">
                        Guardar
                      </button>
                    </form>
                    {ref && (
                      <p className={`mt-1 text-xs ${p.price < ref.esol ? "text-[#8a5a00]" : "text-[#6b716f]"}`}>
                        {p.price < ref.esol
                          ? `${formatCLP(ref.esol - p.price)} bajo Esol`
                          : `${formatCLP(p.price - ref.esol)} sobre Esol`}
                      </p>
                    )}
                  </td>
                  <td className="p-3 text-right tabular-nums">{ref ? formatCLP(ref.esol) : "—"}</td>
                  <td className="p-3">
                    {cheapest ? (
                      <>
                        <p className="tabular-nums text-[#0a2a2a]">{formatCLP(cheapest[0])}</p>
                        <p className="text-xs text-[#6b716f]">{cheapest[1]}</p>
                      </>
                    ) : (
                      <span className="text-[#6b716f]">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    <Place row={row} />
                    {target !== null && targetProfit !== null && (
                      <p className="mt-1 max-w-[220px] text-xs text-[#6b716f]">
                        Para ser el más barato: {formatCLP(target)}
                        {targetProfit > 0 ? ` (ganarías ${formatCLP(targetProfit)})` : " (perderías plata)"}
                      </p>
                    )}
                  </td>
                  <td
                    className={`p-3 text-right font-semibold tabular-nums ${
                      row.profit !== null && row.profit < 0 ? "text-[#a1302a]" : "text-[#0a2a2a]"
                    }`}
                  >
                    {row.profit === null ? "—" : formatCLP(row.profit)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[#6b716f]">
        Escribe el precio nuevo y aprieta Guardar: se cambia al tiro en la tienda. Las demás cosas del producto se
        cambian con Editar.
      </p>
    </section>
  );
}
