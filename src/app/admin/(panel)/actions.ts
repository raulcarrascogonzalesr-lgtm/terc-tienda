"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { ORDER_STATUS_LABELS } from "@/lib/format";
import { getAdminClient } from "@/lib/supabase";
import type { OrderStatus } from "@/lib/types";

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
