import type { AdminProduct, Movement, Order } from "@/lib/types";
import { cashBalance, isSold, loanStatus, monthOf, monthResult, saleMonth } from "../finance";

// Todo lo de un mes, para cuadrar con la contabilidad de Wiremax.
export function monthReport(
  month: string,
  orders: Order[],
  movements: Movement[],
  products: AdminProduct[],
) {
  const sales = orders
    .filter((o) => isSold(o) && saleMonth(o) === month)
    .sort((a, b) => (a.paid_at ?? a.created_at).localeCompare(b.paid_at ?? b.created_at));
  const moves = movements
    .filter((m) => monthOf(m.date) === month)
    .sort((a, b) => a.date.localeCompare(b.date));

  const opening = cashBalance(orders, movements, month);
  const salesIn = sales.reduce((s, o) => s + o.total, 0);
  const otherIn = moves.filter((m) => m.kind === "ingreso").reduce((s, m) => s + m.amount, 0);
  const out = moves.filter((m) => m.kind === "egreso").reduce((s, m) => s + m.amount, 0);
  // IVA incluido en las ventas (precios con IVA del 19%). Referencial.
  const vatInSales = Math.round((salesIn * 19) / 119);

  return {
    sales,
    moves,
    opening,
    salesIn,
    otherIn,
    out,
    closing: opening + salesIn + otherIn - out,
    vatInSales,
    result: monthResult(month, orders, movements, products),
    loan: loanStatus(movements.filter((m) => monthOf(m.date) <= month)),
  };
}
