import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { after, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { normalizePhone, normalizeRut } from "@/lib/address";
import { energyCardAllowed, isEnergy, REQUEST_COURIER, REQUEST_ZONE } from "@/lib/energy";
import { cardPrice, formatCLP } from "@/lib/format";
import { orderNumber, sendRequestEmails } from "@/lib/order-emails";
import { getProductsByIds } from "@/lib/products";
import { storeIsOpen } from "@/lib/store-status";
import { getAdminClient } from "@/lib/supabase";
import { SITE } from "@/lib/site";
import { sanitizeUtm } from "@/lib/utm";
import { warrantyLabel } from "@/lib/warranty";
import { createWebpayTransaction, getWebpayConfig } from "@/lib/webpay";

// Solicitud de compra (TERC 2.1). Los productos de Energía no se pagan en la página: el cliente
// envía su carrito con sus datos, ve la cuenta y transfiere al tiro (Raúl, 26-11-2026); TERC
// confirma stock y, si no hay, le devuelve el 100%. Si el carrito trae además equipos, todo va en la misma
// solicitud y en una sola transferencia.
//
// Se guarda como un pedido "Pendiente" (customer.payment = "transferencia"). En el panel, al
// marcarlo "Pagado" se descuenta el stock y sale el correo de pago recibido, como cualquier venta.
//
// Con tarjeta (Raúl 27-11-2026): el cliente puede elegir Webpay si el total con el precio de tarjeta
// no pasa de SITE.energyCardMax. El pedido queda "Pendiente" (customer.payment = "webpay") hasta que
// Webpay confirma; ahí /api/webpay/retorno lo marca pagado y manda el correo, como con los equipos.
// Si después no hay stock, Raúl anula el cargo desde el portal de Transbank (devolución del 100%).

type Body = {
  items?: { productId?: unknown; quantity?: unknown; extendWarranty?: unknown }[];
  customer?: Record<string, unknown>;
  utm?: unknown;
  acceptPolicy?: unknown;
  method?: unknown; // "webpay" o "transferencia" (por defecto)
  website?: unknown; // campo trampa invisible: si viene lleno, es un robot
};

function text(value: unknown, max = 200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;
  if (!(await storeIsOpen()) && !(await getAdminUser())) {
    return NextResponse.json({ error: "Estamos preparando la tienda: muy pronto podrás comprar." }, { status: 503 });
  }
  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }
  // Robot: se responde como si todo hubiera salido bien, sin guardar nada.
  if (text(body.website)) return NextResponse.json({ number: orderNumber(randomUUID()) });
  if (body.acceptPolicy !== true) {
    return NextResponse.json({ error: "Debes aceptar la política de garantía y devoluciones" }, { status: 400 });
  }

  // Webpay solo si está configurado (en modo prueba, solo para el administrador, igual que en el carrito).
  const method = body.method === "webpay" ? "webpay" : "transferencia";
  const webpay = method === "webpay" ? getWebpayConfig() : null;
  if (method === "webpay" && (!webpay || (webpay.adminOnly && !(await getAdminUser())))) {
    return NextResponse.json({ error: "El pago con tarjeta no está disponible. Elige transferencia." }, { status: 503 });
  }
  // Con tarjeta cada unidad cuesta el precio de "otros medios de pago" (la comisión de Transbank).
  const unit = (price: number) => (method === "webpay" ? cardPrice(price) : price);

  const c = body.customer ?? {};
  const name = text(c.name, 120);
  const email = text(c.email, 160).toLowerCase();
  const comuna = text(c.comuna, 80);
  const phone = normalizePhone(text(c.phone, 40));
  if (name.length < 2) return NextResponse.json({ error: "Escribe tu nombre" }, { status: 400 });
  if (!phone) return NextResponse.json({ error: "El WhatsApp debe tener 9 dígitos (9 1234 5678)" }, { status: 400 });
  if (!EMAIL.test(email)) return NextResponse.json({ error: "Revisa tu correo" }, { status: 400 });
  if (comuna.length < 2) return NextResponse.json({ error: "Escribe tu comuna" }, { status: 400 });

  const customer: Record<string, string> = {
    name,
    email,
    phone,
    comuna,
    payment: method,
    courier: REQUEST_COURIER,
    document: c.document === "factura" ? "Factura" : "Boleta",
  };
  if (customer.document === "Factura") {
    const rut = normalizeRut(text(c.rut, 20));
    const business = text(c.business, 120);
    if (!rut) return NextResponse.json({ error: "El RUT de la empresa no es válido" }, { status: 400 });
    if (business.length < 2) return NextResponse.json({ error: "Escribe la razón social" }, { status: 400 });
    customer.rut = rut;
    customer.business = business;
  }
  const note = text(c.note, 600);
  if (note) customer.note = note;

  const requested = body.items.map((i) => ({
    productId: String(i.productId),
    quantity: Math.floor(Number(i.quantity)),
    extendWarranty: i.extendWarranty === true,
  }));
  if (requested.some((i) => !Number.isFinite(i.quantity) || i.quantity < 1)) {
    return NextResponse.json({ error: "Cantidad no válida" }, { status: 400 });
  }

  // Los precios siempre se leen del catálogo, nunca del navegador.
  const products = await getProductsByIds(requested.map((i) => i.productId));
  const lines = [];
  for (const item of requested) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return NextResponse.json({ error: "Un producto ya no está disponible" }, { status: 409 });
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `Sin stock suficiente de ${product.name}` }, { status: 409 });
    }
    const upgrade = item.extendWarranty ? (product.warranty_upgrade ?? null) : null;
    lines.push({
      product,
      quantity: item.quantity,
      energy: isEnergy(product),
      warrantyMonths: upgrade?.months ?? product.warranty_months,
      warrantyExtra: upgrade?.price ?? 0,
    });
  }
  // Solo los carritos con Energía van por solicitud; los de equipos se pagan en la página.
  if (!lines.some((l) => l.energy)) {
    return NextResponse.json({ error: "Este carrito se paga en la página. Vuelve al carrito para pagar." }, { status: 400 });
  }

  const subtotal = lines.reduce((sum, l) => sum + unit(l.product.price + l.warrantyExtra) * l.quantity, 0);
  if (method === "webpay" && !energyCardAllowed(subtotal)) {
    return NextResponse.json(
      { error: `Con tarjeta se puede pagar hasta ${formatCLP(SITE.energyCardMax)}. Para este pedido elige transferencia.` },
      { status: 400 },
    );
  }

  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "No pudimos enviar tu solicitud. Escríbenos por WhatsApp." }, { status: 503 });
  }
  // Freno contra abuso: cada solicitud le manda un correo al cliente, así que nadie puede usar el
  // formulario para llenar de correos a otra persona ni de solicitudes falsas al panel.
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recent = (column: string, value: string) =>
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("shipping_zone", REQUEST_ZONE)
      .eq(column, value)
      .gte("created_at", hourAgo);
  const [byEmail, byPhone, all] = await Promise.all([
    recent("customer->>email", email),
    recent("customer->>phone", phone),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("shipping_zone", REQUEST_ZONE).gte("created_at", hourAgo),
  ]);
  if ((byEmail.count ?? 0) >= 3 || (byPhone.count ?? 0) >= 3 || (all.count ?? 0) >= 30) {
    return NextResponse.json(
      { error: "Ya recibimos tus solicitudes. Te escribimos pronto; si es urgente, háblanos por WhatsApp." },
      { status: 429 },
    );
  }
  const { data: costs } = await supabase
    .from("products")
    .select("id, cost")
    .in("id", lines.map((l) => l.product.id));
  const costById = new Map((costs ?? []).map((row) => [row.id, row.cost as number | null]));

  const id = randomUUID();
  const { error } = await supabase.from("orders").insert({
    id,
    status: "pending",
    customer,
    shipping_zone: REQUEST_ZONE,
    shipping_cost: 0,
    subtotal,
    discount: 0,
    coupon_code: null,
    total: subtotal,
    items: lines.map((l) => ({
      product_id: l.product.id,
      name: l.warrantyExtra ? `${l.product.name} + garantía extendida a ${warrantyLabel(l.warrantyMonths)}` : l.product.name,
      unit_price: unit(l.product.price + l.warrantyExtra),
      unit_cost: costById.get(l.product.id) ?? null,
      quantity: l.quantity,
      warranty_months: l.warrantyMonths,
      ...(l.warrantyExtra ? { warranty_extra: l.warrantyExtra } : {}),
      ...(l.energy ? { energy: true } : {}),
    })),
    utm: sanitizeUtm(body.utm),
  });
  if (error) {
    console.error("No se pudo guardar la solicitud", error);
    return NextResponse.json({ error: "No pudimos enviar tu solicitud. Escríbenos por WhatsApp." }, { status: 500 });
  }
  revalidatePath("/admin", "layout");

  if (webpay) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    try {
      const tx = await createWebpayTransaction(webpay, { orderId: id, amount: subtotal, returnUrl: `${siteUrl}/api/webpay/retorno` });
      // El token queda en el pedido (se ve en el panel): Transbank lo pide para validar la integración.
      await supabase.from("orders").update({ payment_id: `webpay${webpay.isTest ? "-prueba" : ""}:token:${tx.token}` }).eq("id", id);
      // Sin correo todavía: el de "recibimos tu pago" sale cuando Webpay confirma.
      return NextResponse.json({ number: orderNumber(id), id, checkoutUrl: tx.url, token: tx.token });
    } catch (err) {
      console.error("No se pudo crear la transacción Webpay (Energía)", err);
      await supabase.from("orders").update({ status: "failed" }).eq("id", id);
      return NextResponse.json({ error: "No pudimos conectar con Webpay. Intenta de nuevo o elige transferencia." }, { status: 502 });
    }
  }

  after(() => sendRequestEmails(id));
  return NextResponse.json({ number: orderNumber(id), id });
}
