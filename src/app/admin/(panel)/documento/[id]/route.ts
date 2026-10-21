import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Abre la foto o PDF de una factura con un enlace que vence en 5 minutos.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = getAdminClient();
  if (!supabase || !UUID.test(id)) return new Response("No encontrado", { status: 404 });

  const { data } = await supabase.from("movements").select("attachment").eq("id", id).maybeSingle();
  if (!data?.attachment) return new Response("Este movimiento no tiene archivo", { status: 404 });

  const { data: signed, error } = await supabase.storage
    .from("documentos")
    .createSignedUrl(data.attachment, 300);
  if (error || !signed) return new Response("No se pudo abrir el archivo", { status: 500 });
  redirect(signed.signedUrl);
}
