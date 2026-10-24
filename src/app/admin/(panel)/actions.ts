"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { ORDER_STATUS_LABELS, QUOTE_STATUS_LABELS } from "@/lib/format";
import { emailEnabled } from "@/lib/email";
import { resendOrderEmail, sendOrderEmailOnce, type EmailKind } from "@/lib/order-emails";
import { getAdminClient } from "@/lib/supabase";
import type { OrderStatus, QuoteStatus } from "@/lib/types";
import { CHANNEL_LABELS, EXPENSE_CATEGORIES, INCOME_CATEGORIES, OTHER_OUTFLOWS } from "./finance";

function db() {
  const supabase = getAdminClient();
  if (!supabase) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY");
  return supabase;
}

export async function updateOrder(id: string, form: FormData) {
  await requireAdmin();
  const status = String(form.get("status")) as OrderStatus;
  if (!(status in ORDER_STATUS_LABELS)) throw new Error("Estado no válido");
  const tracking = String(form.get("tracking_code") ?? "").trim() || null;

  const supabase = db();
  const { data: current, error: readError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", id)
    .single();
  if (readError) throw readError;

  // Un pago recibido por fuera (por ejemplo, transferencia) también descuenta stock.
  if (status === "paid" && (current.status === "pending" || current.status === "failed")) {
    const { error } = await supabase.rpc("mark_order_paid", {
      p_order_id: id,
      p_payment_id: "manual",
    });
    if (error) throw error;
  }

  const { error } = await supabase
    .from("orders")
    .update({ status, tracking_code: tracking })
    .eq("id", id);
  if (error) throw error;

  // Correos al cliente: cada uno sale una sola vez por pedido.
  if (status === "paid") after(() => sendOrderEmailOnce(id, "paid"));
  if (status === "shipped" && tracking) after(() => sendOrderEmailOnce(id, "shipped"));
  if (status === "delivered") after(() => sendOrderEmailOnce(id, "delivered"));

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/", "layout");
}

export type ResendResult = { ok?: boolean; error?: string } | null;

// Vuelve a enviar al cliente un correo del pedido (por ejemplo, si no le llegó).
export async function resendEmail(id: string, kind: EmailKind): Promise<ResendResult> {
  await requireAdmin();
  if (!emailEnabled()) return { error: "Falta configurar SMTP_PASSWORD en cPanel" };
  if (!(await resendOrderEmail(id, kind))) return { error: "No se pudo enviar. Revisa el correo del cliente y el código de seguimiento." };
  revalidatePath(`/admin/pedidos/${id}`);
  return { ok: true };
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Kilos con decimales: acepta "2,5" o "2.5".
function kgOrNull(value: FormDataEntryValue | null): number | null {
  const n = Number(String(value ?? "").trim().replace(",", "."));
  return String(value ?? "").trim() !== "" && Number.isFinite(n) && n > 0 ? Math.round(n * 10) / 10 : null;
}

function intOrNull(value: FormDataEntryValue | null): number | null {
  const text = String(value ?? "").replace(/[.$\s]/g, "");
  if (text === "") return null;
  const n = Math.floor(Number(text));
  return Number.isFinite(n) ? n : null;
}

async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("La foto debe ser una imagen");
  const ext =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${randomUUID()}.${ext}`;
  const supabase = db();
  const { error } = await supabase.storage
    .from("productos")
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  return supabase.storage.from("productos").getPublicUrl(path).data.publicUrl;
}

export type SaveResult = { error: string } | null;

export async function saveProduct(_prev: SaveResult, form: FormData): Promise<SaveResult> {
  await requireAdmin();
  const id = String(form.get("id") ?? "") || null;
  const name = String(form.get("name") ?? "").trim();
  const price = intOrNull(form.get("price"));
  const stock = intOrNull(form.get("stock"));
  const grade = String(form.get("grade"));

  if (!name) return { error: "Falta el nombre" };
  if (price === null || price < 0) return { error: "El precio no es válido" };
  if (stock === null || stock < 0) return { error: "El stock no es válido" };
  if (!["A", "B", "C"].includes(grade)) return { error: "El grado no es válido" };

  const battery = intOrNull(form.get("battery_health"));
  if (battery !== null && (battery < 0 || battery > 100)) {
    return { error: "La batería debe estar entre 0 y 100" };
  }

  const values: Record<string, unknown> = {
    name,
    slug: slugify(String(form.get("slug") ?? "") || name),
    brand: String(form.get("brand") ?? "").trim(),
    category: String(form.get("category") ?? "").trim(),
    grade,
    price,
    list_price: intOrNull(form.get("list_price")),
    compare_price: intOrNull(form.get("compare_price")),
    offer_ends_at: String(form.get("offer_ends_at") ?? "").trim() || null,
    offer_name: String(form.get("offer_name") ?? "").trim().slice(0, 40) || null,
    cost: intOrNull(form.get("cost")),
    stock,
    battery_health: battery,
    warranty_months: intOrNull(form.get("warranty_months")) ?? 6,
    description: String(form.get("description") ?? "").trim(),
    active: form.get("active") === "on",
    on_demand: form.get("on_demand") === "on",
    supplier: String(form.get("supplier") ?? "").trim() || null,
    supplier_sku: String(form.get("supplier_sku") ?? "").trim() || null,
    ship_weight_kg: kgOrNull(form.get("ship_weight_kg")),
    ship_length_cm: intOrNull(form.get("ship_length_cm")),
    ship_width_cm: intOrNull(form.get("ship_width_cm")),
    ship_height_cm: intOrNull(form.get("ship_height_cm")),
  };
  if (!values.brand || !values.category) return { error: "Faltan la marca o la categoría" };
  const box = [values.ship_length_cm, values.ship_width_cm, values.ship_height_cm] as (number | null)[];
  if (box.some((n) => n !== null && n <= 0)) return { error: "Las medidas del paquete deben ser mayores que 0" };
  if (values.offer_ends_at && !((values.compare_price as number | null) && (values.compare_price as number) > price)) {
    return { error: "Para una oferta con fecha, pon el precio de antes (mayor que el precio actual)" };
  }

  // Fotos extra: enlaces (uno por línea) más los archivos que se suban.
  const links = String(form.get("images") ?? "")
    .split(/\s+/)
    .filter((url) => url.startsWith("https://"));
  try {
    const photo = form.get("photo");
    if (photo instanceof File && photo.size > 0) values.image_url = await uploadImage(photo);
    for (const file of form.getAll("extra_photos")) {
      if (file instanceof File && file.size > 0) links.push(await uploadImage(file));
    }
    values.images = links.slice(0, 8);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo subir la foto" };
  }

  const supabase = db();
  const { error } = id
    ? await supabase.from("products").update(values).eq("id", id)
    : await supabase.from("products").insert(values);
  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe un producto con esa dirección (slug) o con ese código del proveedor" };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/admin/productos");
}

const PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export type ImportResult = { saved: number; failed: string[] } | null;

// Dirección donde quedan las fotos guardadas en la tienda.
function storageUrl(): string {
  return db().storage.from("productos").getPublicUrl("").data.publicUrl;
}

// Descarga una foto de otra página y la guarda en la tienda; devuelve su nueva dirección.
async function copyPhoto(url: string): Promise<string> {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const type = res.headers.get("content-type")?.split(";")[0].trim() ?? "";
  if (!res.ok || !PHOTO_TYPES[type]) throw new Error("No es una foto");
  const body = await res.arrayBuffer();
  if (body.byteLength > 6 * 1024 * 1024) throw new Error("Foto muy pesada");
  const path = `${randomUUID()}.${PHOTO_TYPES[type]}`;
  const supabase = db();
  const upload = await supabase.storage.from("productos").upload(path, body, { contentType: type });
  if (upload.error) throw upload.error;
  return supabase.storage.from("productos").getPublicUrl(path).data.publicUrl;
}

// Copia a la tienda las fotos que se pusieron como enlace a otra página,
// para que no dependan de que esa página las siga teniendo.
export async function importExternalPhotos(): Promise<ImportResult> {
  await requireAdmin();
  const ours = storageUrl();
  const isExternal = (url: string | null): url is string =>
    !!url && url.startsWith("https://") && !url.startsWith(ours);
  const { data, error } = await db().from("products").select("id, name, image_url, images");
  if (error) throw error;

  let saved = 0;
  const failed: string[] = [];
  const pending = data.filter((p) => isExternal(p.image_url) || p.images.some(isExternal));
  for (const p of pending.slice(0, 15)) {
    let ok = true;
    const copy = async (url: string) => {
      if (!isExternal(url)) return url;
      try {
        const copied = await copyPhoto(url);
        saved++;
        return copied;
      } catch {
        ok = false;
        return url;
      }
    };
    const image_url = p.image_url ? await copy(p.image_url) : null;
    const images: string[] = [];
    for (const url of p.images as string[]) images.push(await copy(url));
    await db().from("products").update({ image_url, images }).eq("id", p.id);
    if (!ok) failed.push(p.name);
  }

  revalidatePath("/", "layout");
  return { saved, failed };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const { data, error } = await db()
    .from("products")
    .delete()
    .eq("id", id)
    .select("image_url, images")
    .maybeSingle();
  if (error) throw error;
  // Las fotos guardadas en la tienda se borran; los pedidos y movimientos guardan su propio detalle.
  const ours = storageUrl();
  const photos = [data?.image_url, ...(data?.images ?? [])]
    .filter((url): url is string => !!url && url.startsWith(ours))
    .map((url) => url.slice(ours.length));
  if (photos.length) await db().storage.from("productos").remove(photos);
  revalidatePath("/", "layout");
}

const MOVEMENT_CATEGORIES = {
  ingreso: Object.keys(INCOME_CATEGORIES),
  egreso: [...Object.keys(EXPENSE_CATEGORIES), ...Object.keys(OTHER_OUTFLOWS)],
};

export type MovementResult = { error: string } | { ok: true } | null;

const MAX_DOC_BYTES = 5 * 1024 * 1024;

function text(form: FormData, key: string, max = 120): string | null {
  return (
    String(form.get(key) ?? "")
      .trim()
      .slice(0, max) || null
  );
}

async function uploadDocument(file: File, date: string): Promise<string> {
  if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
    throw new Error("El documento debe ser una foto o un PDF");
  }
  if (file.size > MAX_DOC_BYTES) throw new Error("El archivo pesa más de 5 MB");
  const ext = file.type === "application/pdf" ? "pdf" : file.type.split("/")[1].replace(/\W/g, "");
  const path = `${date.slice(0, 7)}/${randomUUID()}.${ext || "jpg"}`;
  const { error } = await db()
    .storage.from("documentos")
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

// Qué documentos acepta cada tipo de movimiento.
function allowedDocs(category: string): string[] {
  if (category === "venta_directa") return ["boleta", "factura"];
  if (category === "devolucion_cliente") return ["nota_credito"];
  if (category in EXPENSE_CATEGORIES || category === "compra_equipos") {
    return ["factura", "boleta", "otro"];
  }
  return [];
}

export async function addMovement(_prev: MovementResult, form: FormData): Promise<MovementResult> {
  await requireAdmin();
  const [kind, category] = String(form.get("category") ?? "").split(":");
  if (kind !== "ingreso" && kind !== "egreso") return { error: "Elige un tipo" };
  if (!MOVEMENT_CATEGORIES[kind].includes(category)) return { error: "Elige un tipo" };

  const amount = intOrNull(form.get("amount"));
  if (amount === null || amount <= 0) return { error: "El monto no es válido" };
  const date = String(form.get("date") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "La fecha no es válida" };

  const isSale = category === "venta_directa" || category === "devolucion_cliente";
  const docs = allowedDocs(category);
  const docType = String(form.get("doc_type") ?? "");
  if (docType ? !docs.includes(docType) : isSale) return { error: "Elige el documento" };
  const docNumber = docType ? text(form, "doc_number", 40) : null;
  const supplier = text(form, "supplier");
  if ((docType === "factura" || docType === "nota_credito") && !docNumber) {
    return { error: "Anota el número del documento" };
  }
  if (docType === "factura" && !isSale && !supplier) {
    return { error: "Para una factura, anota el proveedor" };
  }

  // IVA tal como sale en el documento; si no viene, 19/119 del total.
  let vat: number | null = null;
  if (isSale || docType === "factura") {
    vat = intOrNull(form.get("vat")) ?? Math.round((amount * 19) / 119);
    if (vat < 0 || vat > amount) return { error: "El IVA no puede ser mayor que el total" };
  }

  // Venta fuera de la web de un equipo del catálogo: guarda su costo y baja el stock.
  let productId: string | null = null;
  let unitCost: number | null = null;
  if (category === "venta_directa") {
    productId = String(form.get("product_id") ?? "") || null;
    if (productId) {
      const { data: product } = await db()
        .from("products")
        .select("cost, stock")
        .eq("id", productId)
        .maybeSingle();
      if (!product) return { error: "El producto no existe" };
      if (product.stock < 1) return { error: "Ese producto no tiene stock" };
      unitCost = product.cost;
    } else {
      unitCost = intOrNull(form.get("unit_cost"));
    }
  }

  let attachment: string | null = null;
  const file = form.get("attachment");
  if (docType && file instanceof File && file.size > 0) {
    try {
      attachment = await uploadDocument(file, date);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "No se pudo subir el documento" };
    }
  }

  const campaignId = String(form.get("campaign_id") ?? "") || null;
  const { error } = await db()
    .from("movements")
    .insert({
      kind,
      category,
      amount,
      date,
      description: text(form, "description", 300) ?? "",
      campaign_id: category === "publicidad" ? campaignId : null,
      doc_type: docType || null,
      doc_number: docNumber,
      supplier,
      supplier_rut: docType ? text(form, "supplier_rut", 20) : null,
      vat,
      attachment,
      product_id: productId,
      unit_cost: unitCost,
    });
  if (error) {
    if (attachment) await db().storage.from("documentos").remove([attachment]);
    return { error: error.message };
  }
  if (productId) await changeStock(productId, -1);

  revalidatePath("/", "layout");
  return { ok: true };
}

async function changeStock(productId: string, delta: number) {
  const { data } = await db().from("products").select("stock").eq("id", productId).maybeSingle();
  if (!data) return;
  await db()
    .from("products")
    .update({ stock: Math.max(data.stock + delta, 0) })
    .eq("id", productId);
}

export async function deleteMovement(id: string) {
  await requireAdmin();
  const { data, error } = await db()
    .from("movements")
    .delete()
    .eq("id", id)
    .select("attachment, category, product_id")
    .maybeSingle();
  if (error) throw error;
  if (data?.attachment) await db().storage.from("documentos").remove([data.attachment]);
  // Si se borra una venta fuera de la web, el equipo vuelve al stock.
  if (data?.category === "venta_directa" && data.product_id) await changeStock(data.product_id, 1);
  revalidatePath("/", "layout");
}

export async function savePpmRate(_prev: SaveResult, form: FormData): Promise<SaveResult> {
  await requireAdmin();
  const raw = String(form.get("ppm_rate") ?? "")
    .trim()
    .replace(",", ".");
  const supabase = db();
  if (raw === "") {
    const { error } = await supabase.from("settings").delete().eq("key", "ppm_rate");
    if (error) return { error: error.message };
  } else {
    const rate = Number(raw);
    if (!Number.isFinite(rate) || rate < 0 || rate > 10) {
      return { error: "Escribe la tasa como porcentaje, por ejemplo 0,25" };
    }
    const { error } = await supabase
      .from("settings")
      .upsert({ key: "ppm_rate", value: String(rate), updated_at: new Date().toISOString() });
    if (error) return { error: error.message };
  }
  revalidatePath("/admin", "layout");
  return null;
}

export async function saveCampaign(_prev: SaveResult, form: FormData): Promise<SaveResult> {
  await requireAdmin();
  const name = String(form.get("name") ?? "").trim();
  if (!name) return { error: "Falta el nombre" };
  const channel = String(form.get("channel") ?? "otro");
  if (!(channel in CHANNEL_LABELS)) return { error: "Canal no válido" };

  const { error } = await db()
    .from("campaigns")
    .insert({
      name,
      channel,
      code: slugify(String(form.get("code") ?? "") || name),
      monthly_budget: intOrNull(form.get("monthly_budget")),
    });
  if (error) {
    if (error.code === "23505") return { error: "Ya existe una campaña con ese código" };
    return { error: error.message };
  }
  revalidatePath("/admin", "layout");
  return null;
}

export async function toggleCampaign(id: string, active: boolean) {
  await requireAdmin();
  const { error } = await db().from("campaigns").update({ active }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin", "layout");
}

// Abre o cierra las compras de la tienda (los visitantes siguen viendo equipos y precios).
export async function setStoreOpen(open: boolean) {
  await requireAdmin();
  const { error } = await db()
    .from("settings")
    .upsert({ key: "store_open", value: String(open), updated_at: new Date().toISOString() });
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function updateQuoteStatus(id: string, form: FormData) {
  await requireAdmin();
  const status = String(form.get("status")) as QuoteStatus;
  if (!(status in QUOTE_STATUS_LABELS)) throw new Error("Estado no válido");
  const { error } = await db().from("quotes").update({ status }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin", "layout");
}

export async function saveExtraCost(_prev: SaveResult, form: FormData): Promise<SaveResult> {
  await requireAdmin();
  const name = String(form.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Falta el nombre (por ejemplo, Caja con logo)" };
  const amount = intOrNull(form.get("amount")) ?? 0;
  const rawPercent = String(form.get("percent") ?? "")
    .trim()
    .replace("%", "")
    .replace(",", ".");
  const percent = rawPercent === "" ? 0 : Number(rawPercent);
  if (!Number.isFinite(percent) || percent < 0 || percent > 50) {
    return { error: "Escribe el porcentaje como número, por ejemplo 3,19" };
  }
  if (amount <= 0 && percent <= 0) return { error: "Escribe un monto o un porcentaje" };

  const { error } = await db()
    .from("extra_costs")
    .insert({
      name,
      category: String(form.get("category") ?? "") || null,
      amount,
      percent,
      note: String(form.get("note") ?? "").trim(),
    });
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return null;
}

export async function toggleExtraCost(id: string, active: boolean) {
  await requireAdmin();
  const { error } = await db().from("extra_costs").update({ active }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin", "layout");
}

export async function deleteExtraCost(id: string) {
  await requireAdmin();
  const { error } = await db().from("extra_costs").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin", "layout");
}
