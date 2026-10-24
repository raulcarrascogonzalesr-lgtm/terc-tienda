import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { Preference } from "mercadopago";
import { getAdminUser } from "@/lib/admin";
import { getMercadoPagoClient } from "@/lib/mercadopago";
import { createWebpayTransaction, getWebpayConfig } from "@/lib/webpay";
import { getProductsByIds } from "@/lib/products";
import { findCommune, quoteShipping } from "@/lib/shipit";
import { isShippingZone, SHIPPING_ZONES } from "@/lib/shipping";
import { storeIsOpen } from "@/lib/store-status";
import { getAdminClient } from "@/lib/supabase";
import { sanitizeUtm } from "@/lib/utm";

type CheckoutBody = {
  items?: { productId?: unknown; quantity?: unknown }[];
  shippingZone?: unknown; // tarifas fijas, cuando Shipit no está disponible
  shipping?: { communeId?: unknown; courier?: unknown }; // envío cotizado con Shipit
  customer?: Record<string, unknown>;
  utm?: unknown;
  method?: unknown; // "webpay" o "mercadopago" (por defecto)
};

type PaymentMethod = "mercadopago" | "webpay";

// Medios de pago que el carrito puede ofrecer. Webpay en modo prueba (o con WEBPAY_SOLO_ADMIN) solo lo ve el administrador.
async function availableMethods(): Promise<PaymentMethod[]> {
  const methods: PaymentMethod[] = [];
  const webpay = getWebpayConfig();
  if (webpay && (!webpay.adminOnly || (await getAdminUser()))) methods.push("webpay");
  if (getMercadoPagoClient()) methods.push("mercadopago");
  return methods;
}

export async function GET() {
  return NextResponse.json({ methods: await availableMethods() });
}

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
  const method: PaymentMethod = body.method === "webpay" ? "webpay" : "mercadopago";
  if (!(await availableMethods()).includes(method)) {
    return NextResponse.json({ error: "Ese medio de pago no está disponible" }, { status: 503 });
  }
  // Con Shipit, la región y la comuna salen de la comuna elegida en la lista.
  const commune = body.shipping ? await findCommune(Number(body.shipping.communeId)) : null;
  if (body.shipping ? !commune : !isShippingZone(body.shippingZone)) {
    return NextResponse.json({ error: "Elige la comuna de envío" }, { status: 400 });
  }

  const customer: Record<string, string> = {};
  if (commune) {
    customer.region = commune.region;
    customer.comuna = commune.name;
  }
  for (const field of CUSTOMER_FIELDS) {
    if (customer[field]) continue;
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
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `Sin stock suficiente de ${product.name}` }, { status: 409 });
    }
    lines.push({ product, quantity: item.quantity });
  }

  let shipping: { zone: string; label: string; price: number };
  if (commune) {
    // El precio del envío también se vuelve a cotizar aquí, nunca se toma del navegador.
    const options = await quoteShipping(commune.id, lines);
    const option = options.find((o) => o.courier === body.shipping?.courier);
    if (!option) {
      return NextResponse.json(
        { error: "El precio del envío cambió. Vuelve a elegir cómo quieres recibirlo." },
        { status: 409 },
      );
    }
    customer.commune_id = String(commune.id);
    shipping = {
      zone: isShippingZone(option.courier) ? option.courier : `shipit:${option.courier}`,
      label: `${option.label} a ${commune.name}`,
      price: option.price,
    };
  } else {
    const zone = body.shippingZone as keyof typeof SHIPPING_ZONES;
    shipping = { zone, ...SHIPPING_ZONES[zone] };
  }
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
      shipping_zone: shipping.zone,
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  const webpay = getWebpayConfig();
  if (method === "webpay" && webpay) {
    try {
      const tx = await createWebpayTransaction(webpay, {
        orderId,
        amount: subtotal + shipping.price,
        returnUrl: `${siteUrl}/api/webpay/retorno`,
      });
      // Webpay pide enviar al cliente con un formulario (POST) que lleva el token.
      return NextResponse.json({ checkoutUrl: tx.url, token: tx.token, orderId });
    } catch (err) {
      console.error("No se pudo crear la transacción Webpay", err);
      return NextResponse.json({ error: "No se pudo conectar con Webpay" }, { status: 502 });
    }
  }

  const mp = getMercadoPagoClient();
  if (!mp) {
    return NextResponse.json(
      { error: "Los pagos aún no están configurados (falta MERCADOPAGO_ACCESS_TOKEN)" },
      { status: 503 },
    );
  }

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
          id: `envio-${shipping.zone}`,
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
