import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { Preference } from "mercadopago";
import { getAdminUser } from "@/lib/admin";
import { maxUnits } from "@/lib/format";
import { getMercadoPagoClient } from "@/lib/mercadopago";
import { getProductsByIds } from "@/lib/products";
import { isShippingZone, SHIPPING_ZONES } from "@/lib/shipping";
import { storeIsOpen } from "@/lib/store-status";
import { getAdminClient } from "@/lib/supabase";
import { sanitizeUtm } from "@/lib/utm";

type CheckoutBody = {
  items?: { productId?: unknown; quantity?: unknown }[];
  shippingZone?: unknown;
  customer?: Record<string, unknown>;
  utm?: unknown;
};

const CUSTOMER_FIELDS = ["name", "email", "phone", "region", "comuna", "address"] as const;

export async function POST(request: Request) {
  // Con las compras cerradas desde el panel, solo el administrador puede pagar (para probar).
  if (!(await storeIsOpen()) && !(await getAdminUser())) {
    return NextResponse.json(
      { error: "Estamos preparando la tienda: muy pronto podrás comprar." },
      { status: 503 },
    );
  }
  const body = (await request.json().catch(() => null)) as CheckoutBody | null;
  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }
  if (!isShippingZone(body.shippingZone)) {
    return NextResponse.json({ error: "Zona de envío no válida" }, { status: 400 });
  }

  const customer: Record<string, string> = {};
  for (const field of CUSTOMER_FIELDS) {
    const value = body.customer?.[field];
    if (typeof value !== "string" || value.trim() === "") {
      return NextResponse.json({ error: "Faltan datos de envío" }, { status: 400 });
    }
    customer[field] = value.trim().slice(0, 200);
  }

  const requested = body.items.map((i) => ({
    productId: String(i.productId),
    quantity: Math.floor(Number(i.quantity)),
  }));
  if (requested.some((i) => !Number.isFinite(i.quantity) || i.quantity < 1)) {
    return NextResponse.json({ error: "Cantidad no válida" }, { status: 400 });
  }

  // Los precios siempre se leen del catálogo, nunca del navegador.
  const products = await getProductsByIds(requested.map((i) => i.productId));
  const lines = [];
  for (const item of requested) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json({ error: "Un producto ya no está disponible" }, { status: 409 });
    }
    if (maxUnits(product) < item.quantity) {
      return NextResponse.json({ error: `Sin stock suficiente de ${product.name}` }, { status: 409 });
    }
    lines.push({ product, quantity: item.quantity });
  }

  const shipping = SHIPPING_ZONES[body.shippingZone];
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  const orderId = randomUUID();

  const supabase = getAdminClient();
  if (supabase) {
    // Costo de cada equipo al momento de la venta, para calcular la ganancia real.
    const { data: costs } = await supabase
      .from("products")
      .select("id, cost")
      .in("id", lines.map((l) => l.product.id));
    const costById = new Map((costs ?? []).map((c) => [c.id, c.cost as number | null]));

    const { error } = await supabase.from("orders").insert({
      id: orderId,
      status: "pending",
      customer,
      shipping_zone: body.shippingZone,
      shipping_cost: shipping.price,
      subtotal,
      total: subtotal + shipping.price,
      items: lines.map((l) => ({
        product_id: l.product.id,
        name: l.product.name,
        unit_price: l.product.price,
        unit_cost: costById.get(l.product.id) ?? null,
        quantity: l.quantity,
      })),
      utm: sanitizeUtm(body.utm),
    });
    if (error) {
      console.error("No se pudo guardar el pedido", error);
      return NextResponse.json({ error: "No se pudo crear el pedido" }, { status: 500 });
    }
  }

  const mp = getMercadoPagoClient();
  if (!mp) {
    return NextResponse.json(
      { error: "Los pagos aún no están configurados (falta MERCADOPAGO_ACCESS_TOKEN)" },
      { status: 503 },
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const preference = await new Preference(mp).create({
    body: {
      external_reference: orderId,
      items: [
        ...lines.map((l) => ({
          id: l.product.id,
          title: l.product.name,
          quantity: l.quantity,
          unit_price: l.product.price,
          currency_id: "CLP",
        })),
        {
          id: `envio-${body.shippingZone}`,
          title: `Envío ${shipping.label}`,
          quantity: 1,
          unit_price: shipping.price,
          currency_id: "CLP",
        },
      ],
      payer: { name: customer.name, email: customer.email },
      back_urls: {
        success: `${siteUrl}/pago/exito`,
        pending: `${siteUrl}/pago/pendiente`,
        failure: `${siteUrl}/pago/error`,
      },
      auto_return: "approved",
      notification_url: `${siteUrl}/api/webhooks/mercadopago`,
    },
  });

  const checkoutUrl = preference.init_point;
  if (!checkoutUrl) {
    return NextResponse.json(
      { error: "Mercado Pago no devolvió un enlace de pago" },
      { status: 502 },
    );
  }
  return NextResponse.json({ checkoutUrl, orderId });
}
