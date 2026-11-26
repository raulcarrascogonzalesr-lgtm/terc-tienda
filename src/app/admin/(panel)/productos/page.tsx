import Link from "next/link";
import { formatCLP, shortDate, todayInChile } from "@/lib/format";
import { listAllProducts, listExtraCosts } from "../data";
import type { AdminProduct, ExtraCost, Product } from "@/lib/types";
import { NO_PHOTO_IMAGE, photoProps } from "@/lib/photo";
import { KIND_LABEL, productKind, type ProductKind } from "@/lib/specs";
import { ENERGY_CATEGORIES, energyCategory } from "@/lib/energy";
import { extraCostFor } from "../extra-costs";
import { netOf } from "../finance";
import { ICONS } from "../icons";
import { Icon, PageHeader } from "../ui";
import { DeleteProductButton } from "./DeleteProductButton";
import { ImportDocsButton } from "./ImportDocsButton";
import { ImportPhotosButton } from "./ImportPhotosButton";
import { isStoredDocument, parseDocuments } from "@/lib/documents";

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
  const src = own ?? (energyCategory(product.category) ? NO_PHOTO_IMAGE : REFERENCE_PHOTO[productKind(product)]);
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

// Raúl 26-11: con cientos de productos de Energía, la lista se separa en dos "mundos" con su color,
// y cada mundo en grupos (tipo de equipo o categoría de Energía), cada uno con su color.
type World = "computadores" | "energia";
type Group = { key: string; label: string; world: World; color: string; soft: string };

const WORLDS: Record<World, { label: string; hint: string; color: string; soft: string; border: string }> = {
  computadores: {
    label: "Computadores",
    hint: "Equipos reacondicionados",
    color: "#2563eb",
    soft: "#eaf1fe",
    border: "#bcd0fb",
  },
  energia: {
    label: "Energía",
    hint: "Baterías, inversores, UPS y más (Esol)",
    color: "#d97706",
    soft: "#fff4e0",
    border: "#f6d39a",
  },
};

const PC_GROUPS: Group[] = (
  [
    ["notebook", "#2563eb", "#eaf1fe"],
    ["aio", "#7c3aed", "#f1ebfe"],
    ["desktop", "#0891b2", "#e3f5f9"],
    ["mini", "#db2777", "#fdebf3"],
  ] as const
).map(([key, color, soft]) => ({ key, label: KIND_LABEL[key], world: "computadores", color, soft }));

const ENERGY_COLORS: Record<string, [string, string]> = {
  "Respaldo (UPS)": ["#7c3aed", "#f1ebfe"],
  "Baterías de litio": ["#16a34a", "#e6f6ec"],
  "Inversores y reguladores": ["#d97706", "#fff4e0"],
  "Paneles solares": ["#ca8a04", "#fdf6d8"],
  "Cables y conectores": ["#475569", "#eef1f5"],
  Iluminación: ["#db2777", "#fdebf3"],
};
const ENERGY_GROUPS: Group[] = ENERGY_CATEGORIES.map((c) => {
  const [color, soft] = ENERGY_COLORS[c.name] ?? ["#d97706", "#fff4e0"];
  return { key: c.short, label: c.name, world: "energia", color, soft };
});

function groupOf(p: AdminProduct): Group {
  const energy = energyCategory(p.category);
  if (energy) return ENERGY_GROUPS.find((g) => g.label === energy.name)!;
  const kind = productKind(p);
  return PC_GROUPS.find((g) => g.key === kind)!;
}

// Para los enlaces: guarda la búsqueda y cambia solo lo que se pide.
function hrefWith(params: { q?: string; mundo?: string; grupo?: string }) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const text = sp.toString();
  return `/admin/productos${text ? `?${text}` : ""}`;
}

function countLabel(n: number) {
  return n === 1 ? "1 producto" : `${n.toLocaleString("es-CL")} productos`;
}

// Una fila de la tabla: precio, costo, margen y stock de un producto.
function ProductRow({
  p,
  today,
  extraCosts,
  group,
}: {
  p: AdminProduct;
  today: string;
  extraCosts: ExtraCost[];
  group: Group;
}) {
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
      className="border-b border-[#efede8] last:border-0 hover:bg-[#fafaf8]"
      style={{ boxShadow: `inset 4px 0 0 ${group.color}` }}
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
      <td className="p-3 text-right whitespace-nowrap">{p.cost === null ? "—" : formatCLP(p.cost)}</td>
      <td className="p-3 text-right whitespace-nowrap text-[#6b716f]">{extra ? `−${formatCLP(extra)}` : "—"}</td>
      <td className={`p-3 text-right whitespace-nowrap ${margin !== null && margin.value < 0 ? "text-[#b3362a]" : ""}`}>
        {margin === null ? "—" : `${formatCLP(margin.value)} (${margin.percent}%)`}
        {marginBefore && (
          <span className="block text-xs text-[#6b716f]">
            antes {formatCLP(marginBefore.value)} ({marginBefore.percent}%)
          </span>
        )}
      </td>
      <td className={`p-3 text-right whitespace-nowrap ${p.stock === 0 ? "text-[#b3362a]" : ""}`}>
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
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; mundo?: string; grupo?: string }>;
}) {
  const [{ q = "", mundo, grupo }, all, extraCosts] = await Promise.all([
    searchParams,
    listAllProducts(),
    listExtraCosts(),
  ]);
  const world: World | null = mundo === "computadores" || mundo === "energia" ? mundo : null;
  // Busca por SKU, nombre, marca o código del proveedor. Un SKU exacto muestra solo ese producto.
  const query = simple(q);
  const exact = all.filter((p) => p.sku === query);
  const found = !query
    ? all
    : exact.length
      ? exact
      : all.filter((p) => simple(`${p.sku} ${p.name} ${p.brand} ${p.supplier_sku ?? ""}`).includes(query));
  const withGroup = found.map((p) => ({ p, group: groupOf(p) }));
  const inWorld = (w: World) => withGroup.filter((x) => x.group.world === w);
  const visibleRows = withGroup.filter(
    (x) => (!world || x.group.world === world) && (!grupo || !world || x.group.key === grupo),
  );
  const groups = (
    world === "energia" ? ENERGY_GROUPS : world === "computadores" ? PC_GROUPS : [...PC_GROUPS, ...ENERGY_GROUPS]
  )
    .map((g) => ({ g, rows: visibleRows.filter((x) => x.group === g) }))
    .filter((x) => x.rows.length > 0);
  const today = todayInChile();
  const ours = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos/`;
  // La imagen de Terqui "aún no tiene foto" es de la tienda (terc.cl), no de otra página.
  const isExternal = (url: string | null) =>
    !!url?.startsWith("https://") && !url.startsWith(ours) && !url.includes(NO_PHOTO_IMAGE);
  const externalPhotos = all.filter((p) => isExternal(p.image_url) || p.images.some(isExternal)).length;
  const externalDocs = all.filter((p) => parseDocuments(p.documents).some((d) => !isStoredDocument(d.url))).length;
  const chipsWorld = world ? (world === "energia" ? ENERGY_GROUPS : PC_GROUPS) : [];
  return (
    <section className="space-y-4">
      <PageHeader
        eyebrow="Tienda"
        title="Productos"
        subtitle="Precio, costo, margen y stock de cada producto, separados en Computadores y Energía."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/precios"
            className="inline-flex items-center gap-2 rounded-md border border-[#cfd8d3] bg-white px-4 py-2 text-sm font-semibold text-[#0a2a2a] hover:bg-[#f1efe8]"
          >
            <Icon path={ICONS.venta} className="w-4 h-4" />
            Tabla de precios
          </Link>
          <Link href="/admin/productos/nuevo" className="btn-primary">
            + Nuevo producto
          </Link>
        </div>
      </PageHeader>
      <ImportPhotosButton pending={externalPhotos} />
      <ImportDocsButton pending={externalDocs} />

      {/* Los dos mundos: una tarjeta grande de color para cada uno, y "Todos". */}
      <nav aria-label="Tipo de producto" className="grid gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))_auto]">
        {(Object.keys(WORLDS) as World[]).map((w) => {
          const info = WORLDS[w];
          const rows = inWorld(w);
          const active = world === w;
          const visible = rows.filter((x) => x.p.active).length;
          const noStock = rows.filter((x) => x.p.active && x.p.stock === 0).length;
          const onOffer = rows.filter((x) => x.p.compare_price && x.p.compare_price > x.p.price).length;
          return (
            <Link
              key={w}
              href={hrefWith({ q, mundo: active ? undefined : w })}
              aria-current={active ? "page" : undefined}
              className="group rounded-xl border-2 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              style={{
                borderColor: active ? info.color : info.border,
                background: active ? info.color : info.soft,
                color: active ? "#fff" : "#0a2a2a",
              }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-lg font-bold">{info.label}</span>
                <span className="text-2xl font-extrabold" style={{ color: active ? "#fff" : info.color }}>
                  {rows.length.toLocaleString("es-CL")}
                </span>
              </div>
              <span className={`block text-xs ${active ? "text-white/85" : "text-[#6b716f]"}`}>{info.hint}</span>
              <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-semibold">
                <span className={`rounded-full px-2 py-0.5 ${active ? "bg-white/20" : "bg-white"}`}>
                  {visible} visibles
                </span>
                {noStock > 0 && (
                  <span className={`rounded-full px-2 py-0.5 ${active ? "bg-white/20" : "bg-white text-[#b3362a]"}`}>
                    {noStock} sin stock
                  </span>
                )}
                {onOffer > 0 && (
                  <span className={`rounded-full px-2 py-0.5 ${active ? "bg-white/20" : "bg-white text-[#b3362a]"}`}>
                    {onOffer} en oferta
                  </span>
                )}
              </div>
            </Link>
          );
        })}
        <Link
          href={hrefWith({ q })}
          aria-current={!world ? "page" : undefined}
          className={`flex items-center justify-center rounded-xl border-2 px-5 py-3 text-sm font-bold transition hover:shadow-md ${
            !world ? "border-[#0a2a2a] bg-[#0a2a2a] text-white" : "border-[#e4e2dc] bg-white text-[#0a2a2a]"
          }`}
        >
          Ver todos
          <span className="ml-1.5 opacity-70">({found.length.toLocaleString("es-CL")})</span>
        </Link>
      </nav>

      {/* Dentro de un mundo: un botón de color por tipo o categoría. */}
      {world && (
        <div className="flex flex-wrap gap-2" aria-label="Categorías">
          <Link
            href={hrefWith({ q, mundo: world })}
            className="rounded-full border px-3 py-1 text-sm font-semibold"
            style={
              !grupo
                ? { background: WORLDS[world].color, borderColor: WORLDS[world].color, color: "#fff" }
                : { background: "#fff", borderColor: "#e4e2dc", color: "#0a2a2a" }
            }
          >
            Todas ({inWorld(world).length})
          </Link>
          {chipsWorld.map((g) => {
            const n = inWorld(world).filter((x) => x.group === g).length;
            if (!n) return null;
            const active = grupo === g.key;
            return (
              <Link
                key={g.key}
                href={hrefWith({ q, mundo: world, grupo: active ? undefined : g.key })}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold"
                style={
                  active
                    ? { background: g.color, borderColor: g.color, color: "#fff" }
                    : { background: g.soft, borderColor: g.soft, color: "#0a2a2a" }
                }
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: active ? "#fff" : g.color }}
                  aria-hidden
                />
                {g.label} ({n})
              </Link>
            );
          })}
        </div>
      )}

      <form className="flex flex-wrap items-center gap-2" role="search">
        {world && <input type="hidden" name="mundo" value={world} />}
        {world && grupo && <input type="hidden" name="grupo" value={grupo} />}
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder={
            world === "energia"
              ? "Buscar en Energía por SKU, nombre, marca o código Esol"
              : world === "computadores"
                ? "Buscar en Computadores por SKU (10012), nombre o marca"
                : "Buscar por SKU (10012), nombre o marca"
          }
          aria-label="Buscar productos"
          className="input max-w-md flex-1"
        />
        <button className="btn-primary">Buscar</button>
        {q && (
          <>
            <Link href={hrefWith({ mundo: world ?? undefined, grupo })} className="text-sm text-[#288868] underline">
              Borrar búsqueda
            </Link>
            <span className="text-sm text-[#6b716f]">{countLabel(visibleRows.length)}</span>
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
          {groups.map(({ g, rows }, i) => {
            // Al cambiar de mundo (en "Ver todos"), una franja grande con el nombre del mundo.
            const startsWorld = !world && (i === 0 || groups[i - 1].g.world !== g.world);
            const info = WORLDS[g.world];
            return (
              <tbody key={`${g.world}-${g.key}`}>
                {startsWorld && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-3 py-2.5 text-base font-extrabold text-white"
                      style={{ background: info.color }}
                    >
                      {info.label}
                      <span className="ml-2 text-sm font-semibold text-white/85">
                        {countLabel(inWorld(g.world).length)}
                      </span>
                    </td>
                  </tr>
                )}
                <tr>
                  <td
                    colSpan={9}
                    className="border-y px-3 py-1.5 text-sm font-bold"
                    style={{ background: g.soft, borderColor: g.soft, color: g.color }}
                  >
                    <span
                      className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
                      style={{ background: g.color }}
                      aria-hidden
                    />
                    {g.label}
                    <span className="ml-2 font-semibold text-[#6b716f]">{countLabel(rows.length)}</span>
                  </td>
                </tr>
                {rows.map(({ p }) => (
                  <ProductRow key={p.id} p={p} today={today} extraCosts={extraCosts} group={g} />
                ))}
              </tbody>
            );
          })}
          {groups.length === 0 && (
            <tbody>
              <tr>
                <td colSpan={9} className="p-6 text-center text-[#6b716f]">
                  {q ? `No hay productos que coincidan con "${q}".` : "Todavía no hay productos aquí."}
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
      <p className="text-sm text-[#6b716f]">
        En la tienda solo aparecen los productos visibles y con stock. Los del proveedor no cuentan como plata
        invertida. El costo nunca se muestra al cliente. El margen compara el precio sin IVA con el costo sin IVA, y le
        resta los{" "}
        <Link href="/admin/costos-extra" className="underline">
          costos por venta
        </Link>{" "}
        (caja, embalaje, comisión).
      </p>
    </section>
  );
}
