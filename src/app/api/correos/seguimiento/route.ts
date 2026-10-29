import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { runFollowUps } from "@/lib/follow-up-emails";

// La llama una vez al día la alarma (Cron Job) de cPanel:
//   curl -s -H "Authorization: Bearer <CRON_SECRET>" https://terc.cl/api/correos/seguimiento
// Revisa qué correos de seguimiento tocan ese día y los envía.
export const dynamic = "force-dynamic";

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
  const report = await runFollowUps();
  return NextResponse.json(report, { status: "error" in report ? 503 : 200 });
}

export const GET = handle;
export const POST = handle;
