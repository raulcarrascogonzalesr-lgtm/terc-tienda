import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { runEsolStockCheck } from "@/lib/esol-stock";

// La llama una vez al día la alarma (Cron Job) de cPanel:
//   curl -s -m 300 -H "Authorization: Bearer <CRON_SECRET>" https://terc.cl/api/stock-esol
// Revisa en esol.cl si los productos de Energía siguen disponibles, oculta los agotados,
// vuelve a mostrar los que reaparecen y manda un resumen a contacto@terc.cl si algo cambió.
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

async function handle(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Falta la variable CRON_SECRET en la app de cPanel" }, { status: 503 });
  }
  if (!authorized(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const report = await runEsolStockCheck();
  if ("error" in report) return NextResponse.json(report, { status: 503 });
  if (report.hidden.length || report.shown.length) revalidatePath("/", "layout");
  return NextResponse.json(report);
}

export const GET = handle;
export const POST = handle;
