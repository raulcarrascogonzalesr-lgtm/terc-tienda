import { NextResponse } from "next/server";
import { readUnsubscribeLink, unsubscribe } from "@/lib/email-preferences";

// Baja con un clic: Gmail y Outlook llaman aquí con POST cuando el cliente presiona "Anular suscripción".
export async function POST(request: Request) {
  const url = new URL(request.url);
  const email = readUnsubscribeLink(url.searchParams.get("e"), url.searchParams.get("t"));
  if (!email) return NextResponse.json({ error: "Enlace no válido" }, { status: 400 });
  if (!(await unsubscribe(email))) return NextResponse.json({ error: "No se pudo registrar" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// Si alguien abre el enlace en el navegador, lo llevamos a la página donde confirma.
export function GET(request: Request) {
  const url = new URL(request.url);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? url.origin;
  return NextResponse.redirect(`${site}/correos/baja${url.search}`);
}
