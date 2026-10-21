import type { AdminProduct, Order } from "@/lib/types";

// Pedidos que ya se pagaron (aunque después se hayan enviado o entregado).
const SOLD = new Set(["paid", "shipped", "delivered"]);

const monthKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Santiago",
  year: "numeric",
  month: "2-digit",
});

export function summarize(orders: Order[], products: AdminProduct[], now = new Date()) {
  const thisMonth = monthKey.format(now);
  const costById = new Map(products.map((p) => [p.id, p.cost]));

  const sold = orders.filter((o) => SOLD.has(o.status));
  const soldThisMonth = sold.filter(
    (o) => monthKey.format(new Date(o.paid_at ?? o.created_at)) === thisMonth,
  );

  // Ganancia estimada: precio de venta menos el costo actual del producto (sin envío).
  const profit = (list: Order[]) => {
    let total = 0;
    let missingCost = false;
    for (const o of list) {
      for (const item of o.items) {
        const cost = costById.get(item.product_id);
        if (cost == null) missingCost = true;
        else total += (item.unit_price - cost) * item.quantity;
      }
    }
    return { total, missingCost };
  };

  const active = products.filter((p) => p.active);
  const inStock = active.filter((p) => p.stock > 0);

  return {
    month: {
      sales: soldThisMonth.reduce((s, o) => s + o.subtotal, 0),
      orders: soldThisMonth.length,
      profit: profit(soldThisMonth),
    },
    allTime: {
      sales: sold.reduce((s, o) => s + o.subtotal, 0),
      orders: sold.length,
      profit: profit(sold),
    },
    stock: {
      units: inStock.reduce((s, p) => s + p.stock, 0),
      invested: inStock.reduce((s, p) => s + (p.cost ?? 0) * p.stock, 0),
      atPrice: inStock.reduce((s, p) => s + p.price * p.stock, 0),
      missingCost: inStock.filter((p) => p.cost == null).length,
    },
    toShip: orders.filter((o) => o.status === "paid").length,
    awaitingPayment: orders.filter((o) => o.status === "pending").length,
    lowStock: active.filter((p) => p.stock <= 1).sort((a, b) => a.stock - b.stock),
    recent: orders.slice(0, 5),
  };
}
