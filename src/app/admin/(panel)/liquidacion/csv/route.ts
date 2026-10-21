import { requireAdmin } from "@/lib/admin";
import { loadBusiness } from "../../data";
import { CATEGORY_LABELS, lastMonths } from "../../finance";
import { monthReport } from "../report";

export const dynamic = "force-dynamic";

function cell(value: string | number): string {
  const text = String(value);
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// Planilla del mes separada por punto y coma, como la abre Excel en español.
export async function GET(request: Request) {
  await requireAdmin();
  const mes = new URL(request.url).searchParams.get("mes");
  const month = mes && /^\d{4}-\d{2}$/.test(mes) ? mes : lastMonths(1)[0];
  const { orders, products, movements } = await loadBusiness();
  const r = monthReport(month, orders, movements, products);

  const rows: (string | number)[][] = [
    ["Fecha", "Tipo", "Categoría", "Detalle", "Entrada", "Salida"],
    ...r.sales.map((o) => [
      (o.paid_at ?? o.created_at).slice(0, 10),
      "Venta web",
      "Venta",
      `${o.customer.name}: ${o.items.map((i) => `${i.quantity} x ${i.name}`).join(", ")}`,
      o.total,
      "",
    ]),
    ...r.moves.map((m) => [
      m.date,
      m.kind === "ingreso" ? "Ingreso" : "Egreso",
      CATEGORY_LABELS[m.category] ?? m.category,
      m.description,
      m.kind === "ingreso" ? m.amount : "",
      m.kind === "egreso" ? m.amount : "",
    ]),
    [],
    ["Saldo inicial", "", "", "", r.opening, ""],
    ["Saldo final", "", "", "", r.closing, ""],
    ["Resultado del mes", "", "", "", r.result.result, ""],
  ];

  const csv = "﻿" + rows.map((row) => row.map(cell).join(";")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="liquidacion-terc-${month}.csv"`,
    },
  });
}
