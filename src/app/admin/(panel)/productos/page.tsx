import Link from "next/link";
import { formatCLP, shortDate, todayInChile } from "@/lib/format";
import { listAllProducts, listExtraCosts } from "../data";
import type { ExtraCost, Product } from "@/lib/types";
import { photoProps } from "@/lib/photo";
import { productKind, type ProductKind } from "@/lib/specs";
import { extraCostFor } from "../extra-costs";
import { netOf } from "../finance";
import { ICONS } from "../icons";
import { Icon, PageHeader } from "../ui";
import { DeleteProductButton } from "./DeleteProductButton";
import { ImportPhotosButton } from "./ImportPhotosButton";

export const dynamic = "force-dynamic";

// Margen neto: precio sin IVA menos costo neto y menos los costos por venta.
function marginOf(price: number, cost: number | null, category: string, extraCosts: ExtraCost[]) {
  if (cost === null) return null;
  const net = netOf(price);
  const value = net - cost - extraCostFor(price, category, extraCosts);
  return { value, percent: net ? Math.round((value / net) * 100) : 0 };
}

// Foto de ejemplo para los productos que todavía no tienen foto propia, según el tipo de equipo.
const REFERENCE_PHOTO: Record<ProductKind, string> = {
  notebook: "/ejemplo/lat.webp",
  aio: "/ejemplo/aio.webp",
  desktop: "/ejemplo/ed800.webp",
  mini: "/ejemplo/opti.webp",
};

// Miniatura para reconocer cada producto en la lista: su foto de la tienda o, si no tiene, una de ejemplo.
function Thumbnail({ product }: { product: Product }) {
  const own = product.image_url ?? product.images[0] ?? null;
  const src = own ?? REFERENCE_PHOTO[productKind(product)];
  return (
    <Link
      href={`/admin/productos/${product.id}`}
      className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#e4e2dc] bg-[#f6f5f1]"
      title={own ? product.name : "Sin foto propia: imagen de ejemplo"}
      tabIndex={-1}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...photoProps(src, "56px", 256)}
        alt=""
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-contain p-0.5 mix-blend-multiply ${own ? "" : "opacity-50 grayscale"}`}
      />
      {!own && (
        <span className="absolute inset-x-0 bottom-0 bg-white/85 text-center text-[9px] leading-3 text-[#6b716f]">
          ejemplo
        </span>
      )}
    </Link>
  );
}

// Para buscar sin importar mayúsculas, tildes ni guiones.
const simple = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [{ q = "" }, all, extraCosts] = await Promise.all([searchParams, listAllProducts(), listExtraCosts()]);
  // Busca por SKU, nombre, marca o código del proveedor. Un SKU exacto muestra solo ese producto.
  const query = simple(q);
  const exact = all.filter((p) => p.sku === query);
  const products = !query
    ? all
    : exact.length
      ? exact
      : all.filter((p) => simple(`${p.sku} ${p.name} ${p.brand} ${p.supplier_sku ?? ""}`).includes(query));
  const today = todayInChile();
  const ours = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos/`;
  const isExternal = (url: string | null) => !!url?.startsWith("https://") && !url.startsWith(ours);
  const externalPhotos = all.filter(
    (p) => isExternal(p.image_url) || p.images.some(isExternal),
  ).length;
  return (
    <section className="space-y-4">
      <PageHeader
        eyebrow="Tienda"
        title="Productos"
        subtitle="Precio, costo, margen y stock de cada equipo."
      >
        <Link href="/admin/productos/nuevo" className="btn-primary">
          + Nuevo producto
        </Link>
      </PageHeader>
      <ImportPhotosButton pending={externalPhotos} />
      <form className="flex flex-wrap items-center gap-2" role="search">
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Buscar por SKU (10012), nombre o marca"
          aria-label="Buscar productos"
          className="input max-w-md flex-1"
        />
        <button className="btn-primary">Buscar</button>
        {q && (
          <>
            <Link href="/admin/productos" className="text-sm text-[#288868] underline">
              Ver todos
            </Link>
            <span className="text-sm text-[#6b716f]">
              {products.length === 1 ? "1 producto" : `${products.length} productos`}
            </span>
          </>
        )}
      </form>
      <div className="bg-white rounded-xl border border-[#e4e2dc] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[#6b716f] border-b border-[#e4e2dc]">
            <tr>
              <th className="p-3">Producto</th>
              <th className="p-3">Grado</th>
              <th className="p-3 text-right">Precio con IVA</th>
              <th className="p-3 text-right">Costo neto</th>
              <th className="p-3 text-right">Costos por venta</th>
              <th className="p-3 text-right">Margen neto</th>
              <th className="p-3 text-right">Stock</th>
              <th className="p-3">Visible</th>
              <th className="p-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              // En oferta: muestra también el precio y el margen de antes. Cuando pasa el último
              // día, la tienda cobra otra vez el precio de antes, así que el margen se calcula con ese.
              const before = p.compare_price && p.compare_price > p.price ? p.compare_price : null;
              const ended = before !== null && !!p.offer_ends_at && p.offer_ends_at < today;
              const price = ended ? before : p.price;
              const extra = extraCostFor(price, p.category, extraCosts);
              const margin = marginOf(price, p.cost, p.category, extraCosts);
              const marginBefore = before && !ended ? marginOf(before, p.cost, p.category, extraCosts) : null;
              return (
                <tr
                  key={p.id}
                  className="border-b border-[#efede8] last:border-0 hover:bg-[#fafaf8]"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3 min-w-[16rem]">
                      <Thumbnail product={p} />
                      <div>
                        <Link href={`/admin/productos/${p.id}`} className="text-[#288868] underline">
                          {p.name}
                        </Link>
                        <span className="block font-mono text-xs text-[#6b716f]">{p.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{p.grade}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {formatCLP(price)}
                    {before && !ended && (
                      <span className="block text-xs text-[#b3362a]">
                        {p.offer_name ?? "Oferta"}
                        {p.offer_ends_at && ` hasta el ${shortDate(p.offer_ends_at)}`} · antes{" "}
                        <span className="line-through">{formatCLP(before)}</span>
                      </span>
                    )}
                    {ended && <span className="block text-xs text-[#6b716f]">Oferta terminada</span>}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {p.cost === null ? "—" : formatCLP(p.cost)}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap text-[#6b716f]">
                    {extra ? `−${formatCLP(extra)}` : "—"}
                  </td>
                  <td
                    className={`p-3 text-right whitespace-nowrap ${margin !== null && margin.value < 0 ? "text-[#b3362a]" : ""}`}
                  >
                    {margin === null ? "—" : `${formatCLP(margin.value)} (${margin.percent}%)`}
                    {marginBefore && (
                      <span className="block text-xs text-[#6b716f]">
                        antes {formatCLP(marginBefore.value)} ({marginBefore.percent}%)
                      </span>
                    )}
                  </td>
                  <td
                    className={`p-3 text-right whitespace-nowrap ${p.stock === 0 ? "text-[#b3362a]" : ""}`}
                  >
                    {p.stock}
                    {p.on_demand && <span className="block text-xs text-[#6b716f]">del proveedor</span>}
                  </td>
                  <td className="p-3">{p.active ? "Sí" : "No"}</td>
                  <td className="px-3 py-1.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        title="Editar producto"
                        aria-label={`Editar ${p.name}`}
                        className="rounded-lg p-1.5 text-[#6b716f] transition hover:bg-[#eef5f3] hover:text-[#288868]"
                      >
                        <Icon path={ICONS.editar} className="w-[18px] h-[18px]" />
                      </Link>
                      <DeleteProductButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-[#6b716f]">
                  {q ? `No hay productos que coincidan con "${q}".` : "Todavía no hay productos."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-[#6b716f]">
        En la tienda solo aparecen los productos visibles y con stock. Los del proveedor no cuentan como plata invertida. El costo nunca se muestra al
        cliente. El margen compara el precio sin IVA con el costo sin IVA, y le resta los{" "}
        <Link href="/admin/costos-extra" className="underline">
          costos por venta
        </Link>{" "}
        (caja, embalaje, comisión).
      </p>
    </section>
  );
}
