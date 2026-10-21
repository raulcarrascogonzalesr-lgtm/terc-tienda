"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { ORDER_STATUS_LABELS } from "@/lib/format";
import { getAdminClient } from "@/lib/supabase";
import type { OrderStatus } from "@/lib/types";
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

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/", "layout");
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
    cost: intOrNull(form.get("cost")),
    stock,
    battery_health: battery,
    warranty_months: intOrNull(form.get("warranty_months")) ?? 6,
    description: String(form.get("description") ?? "").trim(),
    active: form.get("active") === "on",
  };
  if (!values.brand || !values.category) return { error: "Faltan la marca o la categoría" };

  try {
    const photo = form.get("photo");
    if (photo instanceof File && photo.size > 0) values.image_url = await uploadImage(photo);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo subir la foto" };
  }

  const supabase = db();
  const { error } = id
    ? await supabase.from("products").update(values).eq("id", id)
    : await supabase.from("products").insert(values);
  if (error) {
    if (error.code === "23505") return { error: "Ya existe un producto con esa dirección (slug)" };
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/admin/productos");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const { data, error } = await db()
    .from("products")
    .delete()
    .eq("id", id)
    .select("image_url")
    .maybeSingle();
  if (error) throw error;
  // La foto se borra del almacenamiento; los pedidos y movimientos guardan su propio detalle.
  const photo = data?.image_url?.split("/productos/").pop();
  if (photo) await db().storage.from("productos").remove([photo]);
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
