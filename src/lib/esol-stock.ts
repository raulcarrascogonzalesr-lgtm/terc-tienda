import { getAdminClient } from "./supabase";
import { C, emailEnabled, escapeHtml, sendMail, siteUrl } from "./email";
import { SITE } from "./site";

// Revisión diaria del stock de Esol (esol.cl) para los productos de Energía.
//
// En esol.cl cada producto tiene su página (detalle_productos.php?id=N) con dos datos:
//   Codigo: <span id="cod">V.VMIII.5K-48</span>   → el mismo código que guardamos en supplier_sku
//   Stock: Disponible - ...   o   Stock: Agotado - ...
// Solo se mira si está disponible. Los precios de esol.cl NO son el costo de TERC.
//
// Reglas (decididas por Raúl el 27-11-2026):
// - Si Esol lo marca "Agotado" (o la página ya no existe), se oculta de la tienda (active = false).
//   Nunca se borra.
// - Si vuelve a "Disponible", se muestra otra vez, pero solo si lo ocultó esta revisión
//   (stock_hidden_at). Lo que Raúl ocultó a mano no se toca.
// - Frenos: si esol.cl no responde bien o cambió su página, o si de una vez se agotan demasiados,
//   no se cambia nada y se avisa por correo.

const ESOL = "https://www.esol.cl";
const DETAIL = (id: number) => `${ESOL}/detalle_productos.php?id=${id}`;
const PARALLEL = 4;
const TIMEOUT_MS = 20000;
// Si más de este porcentaje de páginas no se pudo leer, la revisión no toca nada.
const MAX_UNREADABLE = 0.2;
// Si de una vez se agotarían más que esto, puede ser un error de Esol: no se toca nada y se avisa.
const MAX_HIDE_AT_ONCE = (total: number) => Math.max(10, Math.ceil(total * 0.15));
// Tiempo máximo buscando en esol.cl la página de productos nuevos (sin esol_page_id).
const DISCOVERY_BUDGET_MS = 60000;

export type EsolPage =
  | { kind: "ok"; code: string; available: boolean }
  | { kind: "missing" } // la página existe pero viene vacía: Esol sacó el producto
  | { kind: "error"; reason: string };

export function parseEsolPage(html: string): EsolPage {
  const code = html.match(/id="cod">\s*([^<]*?)\s*</);
  if (!code) return { kind: "error", reason: "la página no tiene el código (¿cambió esol.cl?)" };
  if (!code[1]) return { kind: "missing" };
  const stock = html.match(/Stock:\s*(Disponible|Agotado)/i);
  if (!stock) return { kind: "error", reason: "la página no dice Disponible ni Agotado (¿cambió esol.cl?)" };
  return { kind: "ok", code: code[1], available: stock[1].toLowerCase() === "disponible" };
}

async function get(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; TERC-stock/1.0)" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`esol.cl respondió ${res.status}`);
  return res.text();
}

async function readPage(id: number): Promise<EsolPage> {
  try {
    return parseEsolPage(await get(DETAIL(id)));
  } catch (err) {
    return { kind: "error", reason: err instanceof Error ? err.message : String(err) };
  }
}

async function inParallel<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(PARALLEL, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

const norm = (code: string) => code.trim().toUpperCase();

// Busca en esol.cl la página de los productos que todavía no la tienen anotada.
// Recorre las categorías de esol.cl y abre las páginas que no conocemos, hasta encontrarlos todos
// o hasta que se acabe el tiempo (sigue al día siguiente).
async function discoverPages(wanted: Set<string>, known: Set<number>): Promise<Map<string, number>> {
  const found = new Map<string, number>();
  if (wanted.size === 0) return found;
  const deadline = Date.now() + DISCOVERY_BUDGET_MS;
  const home = await get(`${ESOL}/`);
  const subcats = [...new Set([...home.matchAll(/subcat=(\d+)/g)].map((m) => Number(m[1])))];
  const ids = new Set<number>();
  for (const sub of subcats) {
    if (Date.now() > deadline) break;
    try {
      const list = await get(`${ESOL}/productos.php?subcat=${sub}`);
      for (const m of list.matchAll(/detalle_productos\.php\?id=(\d+)/g)) ids.add(Number(m[1]));
    } catch {
      // una categoría que no carga no detiene la búsqueda
    }
  }
  const pending = [...ids].filter((id) => !known.has(id)).sort((a, b) => b - a); // los más nuevos primero
  for (let i = 0; i < pending.length && found.size < wanted.size && Date.now() < deadline; i += PARALLEL) {
    const chunk = pending.slice(i, i + PARALLEL);
    const pages = await Promise.all(chunk.map(readPage));
    pages.forEach((page, j) => {
      if (page.kind === "ok" && wanted.has(norm(page.code))) found.set(norm(page.code), chunk[j]);
    });
  }
  return found;
}

type Row = {
  id: string;
  name: string;
  slug: string;
  supplier_sku: string | null;
  active: boolean;
  esol_page_id: number | null;
  stock_hidden_at: string | null;
};

export type EsolStockReport = {
  checked: number;
  available: number;
  soldOut: number;
  hidden: { name: string; slug: string; reason: string }[];
  shown: { name: string; slug: string }[];
  unreadable: { name: string; reason: string }[];
  notFound: string[]; // productos que no encontramos en esol.cl (sin página anotada)
  stopped?: string; // por qué la revisión no cambió nada
  emailed: boolean;
};

export async function runEsolStockCheck(): Promise<EsolStockReport | { error: string }> {
  const supabase = getAdminClient();
  if (!supabase) return { error: "Falta SUPABASE_SERVICE_ROLE_KEY" };

  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, supplier_sku, active, esol_page_id, stock_hidden_at")
    .eq("supplier", "Esol");
  if (error) return { error: `No se pudieron leer los productos (¿falta ejecutar supabase/stock-esol.sql?): ${error.message}` };

  // Solo importan los que están a la venta o los que ocultó esta revisión (para volver a mostrarlos).
  const rows = ((data ?? []) as Row[]).filter((r) => r.supplier_sku && (r.active || r.stock_hidden_at));
  const report: EsolStockReport = {
    checked: 0, available: 0, soldOut: 0, hidden: [], shown: [], unreadable: [], notFound: [], emailed: false,
  };

  // 1. Anotar la página de esol.cl de los productos nuevos.
  const withoutPage = rows.filter((r) => !r.esol_page_id);
  if (withoutPage.length) {
    const known = new Set(rows.map((r) => r.esol_page_id).filter((id): id is number => Boolean(id)));
    let found = new Map<string, number>();
    try {
      found = await discoverPages(new Set(withoutPage.map((r) => norm(r.supplier_sku!))), known);
    } catch {
      // si esol.cl no carga, se intenta de nuevo mañana
    }
    for (const r of withoutPage) {
      const pageId = found.get(norm(r.supplier_sku!));
      if (!pageId) {
        report.notFound.push(r.name);
        continue;
      }
      r.esol_page_id = pageId;
      await supabase.from("products").update({ esol_page_id: pageId }).eq("id", r.id);
    }
  }

  // 2. Leer la página de cada producto.
  const targets = rows.filter((r) => r.esol_page_id);
  const pages = await inParallel(targets, (r) => readPage(r.esol_page_id!));
  const toHide: { row: Row; reason: string }[] = [];
  const toShow: Row[] = [];
  // Ojo: las consultas de Supabase solo se ejecutan al esperarlas (await / Promise.all).
  const cleanups: PromiseLike<unknown>[] = [];
  targets.forEach((row, i) => {
    const page = pages[i];
    report.checked++;
    if (page.kind === "error") {
      report.unreadable.push({ name: row.name, reason: page.reason });
      return;
    }
    if (page.kind === "ok" && norm(page.code) !== norm(row.supplier_sku!)) {
      // Esol usó esa página para otro producto: se vuelve a buscar mañana.
      report.unreadable.push({ name: row.name, reason: `la página de Esol ahora es de otro código (${page.code})` });
      cleanups.push(supabase.from("products").update({ esol_page_id: null }).eq("id", row.id));
      return;
    }
    // Si Raúl lo volvió a activar a mano, ya no cuenta como "ocultado por la revisión":
    // así, si después lo oculta él, la revisión no lo vuelve a mostrar.
    if (row.active && row.stock_hidden_at) {
      row.stock_hidden_at = null;
      cleanups.push(supabase.from("products").update({ stock_hidden_at: null }).eq("id", row.id));
    }
    const available = page.kind === "ok" && page.available;
    if (available) {
      report.available++;
      if (!row.active && row.stock_hidden_at) toShow.push(row);
    } else {
      report.soldOut++;
      if (row.active) toHide.push({ row, reason: page.kind === "missing" ? "Esol sacó el producto de su página" : "Agotado en Esol" });
    }
  });

  await Promise.all(cleanups);

  // 3. Frenos de seguridad.
  if (report.checked > 0 && report.unreadable.length / report.checked > MAX_UNREADABLE) {
    report.stopped = `No se pudieron leer ${report.unreadable.length} de ${report.checked} páginas de esol.cl. Puede que la página esté caída o haya cambiado, así que no se ocultó ni mostró nada.`;
  } else if (toHide.length > MAX_HIDE_AT_ONCE(report.checked)) {
    report.stopped = `Esol marcaría ${toHide.length} productos como agotados de una vez. Es raro, puede ser un error de su página, así que no se ocultó nada. Revísalo y, si es verdad, ocúltalos en el panel.`;
  }

  // 4. Ocultar y volver a mostrar.
  const now = new Date().toISOString();
  if (!report.stopped) {
    for (const { row, reason } of toHide) {
      const { error: e } = await supabase.from("products").update({ active: false, stock_hidden_at: now }).eq("id", row.id);
      if (!e) report.hidden.push({ name: row.name, slug: row.slug, reason });
    }
    for (const row of toShow) {
      const { error: e } = await supabase.from("products").update({ active: true, stock_hidden_at: null }).eq("id", row.id);
      if (!e) report.shown.push({ name: row.name, slug: row.slug });
    }
  } else {
    // En el correo igual se muestra qué se habría ocultado.
    report.hidden = toHide.map(({ row, reason }) => ({ name: row.name, slug: row.slug, reason: `NO ocultado: ${reason}` }));
  }

  // 5. Correo a TERC solo si algo cambió o hay que revisar algo.
  const worthEmail = report.hidden.length || report.shown.length || report.stopped || report.notFound.length || report.unreadable.length;
  if (worthEmail && emailEnabled()) report.emailed = await sendMail({ to: SITE.email, ...summaryEmail(report) });

  return report;
}

function summaryEmail(r: EsolStockReport) {
  const link = (slug: string) => `${siteUrl()}/producto/${slug}`;
  const admin = `${siteUrl()}/admin/productos`;
  const subject = r.stopped
    ? "Stock Esol: revisar a mano, no se cambió nada"
    : `Stock Esol: ${r.hidden.length} ocultos, ${r.shown.length} de vuelta`;

  const lines: string[] = [];
  const html: string[] = [];
  const section = (title: string, color: string, items: string[], itemsHtml: string[]) => {
    if (!items.length) return;
    lines.push("", title, ...items.map((i) => `- ${i}`));
    html.push(
      `<h3 style="margin:18px 0 6px;color:${color};font-size:16px">${escapeHtml(title)}</h3>`,
      `<ul style="margin:0;padding-left:18px">${itemsHtml.map((i) => `<li style="margin:3px 0">${i}</li>`).join("")}</ul>`,
    );
  };

  const intro = `Revisé ${r.checked} productos de Esol: ${r.available} disponibles y ${r.soldOut} agotados.`;
  lines.push(intro);
  html.push(`<p style="margin:0 0 8px">${escapeHtml(intro)}</p>`);
  if (r.stopped) {
    lines.push("", `OJO: ${r.stopped}`);
    html.push(`<p style="margin:12px 0;padding:10px 12px;background:#fff4e5;border-radius:8px;color:#8a4b00"><b>Ojo:</b> ${escapeHtml(r.stopped)}</p>`);
  }
  section(
    r.stopped ? "Se habrían ocultado" : "Ocultos de la tienda (sin borrar)",
    "#b42318",
    r.hidden.map((p) => `${p.name} (${p.reason})`),
    r.hidden.map((p) => `<a href="${link(p.slug)}" style="color:${C.pine}">${escapeHtml(p.name)}</a> · ${escapeHtml(p.reason)}`),
  );
  section(
    "De vuelta en la tienda (Esol los tiene otra vez)",
    "#067647",
    r.shown.map((p) => p.name),
    r.shown.map((p) => `<a href="${link(p.slug)}" style="color:${C.pine}">${escapeHtml(p.name)}</a>`),
  );
  section(
    "No los encontré en esol.cl (no se tocaron)",
    "#475467",
    r.notFound,
    r.notFound.map(escapeHtml),
  );
  section(
    "No se pudo leer su página hoy (no se tocaron)",
    "#475467",
    r.unreadable.map((p) => `${p.name}: ${p.reason}`),
    r.unreadable.map((p) => `${escapeHtml(p.name)}: ${escapeHtml(p.reason)}`),
  );
  lines.push("", `Para volver a mostrar uno a mano: ${admin}`);
  html.push(`<p style="margin:18px 0 0;font-size:13px;color:#475467">Para volver a mostrar uno a mano: <a href="${admin}">panel de productos</a>. Esol dice que su stock no está al día al segundo, así que igual confirma con ellos antes de cobrar.</p>`);

  return {
    subject,
    text: lines.join("\n"),
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#101828;line-height:1.5">${html.join("")}</div>`,
  };
}
