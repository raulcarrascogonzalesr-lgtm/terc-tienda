import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { Preference } from "mercadopago";
import { getAdminUser } from "@/lib/admin";
import { addressLine, DWELLINGS, isDwelling, isFixedCourier, normalizePhone, normalizeRut } from "@/lib/address";
import { checkCoupon, countCouponUses } from "@/lib/coupons";
import { getMercadoPagoClient } from "@/lib/mercadopago";
import { createWebpayTransaction, getWebpayConfig } from "@/lib/webpay";
import { getProductsByIds } from "@/lib/products";
import { findCommune, quoteWithFund } from "@/lib/shipit";
import { getShippingFund } from "@/lib/shipping-fund";
import { courierLabel, isShippingZone, SHIPPING_ZONES } from "@/lib/shipping";
import { storeIsOpen } from "@/lib/store-status";
import { getAdminClient } from "@/lib/supabase";
import { sanitizeUtm } from "@/lib/utm";

type CheckoutBody = {
  items?: { productId?: unknown; quantity?: unknown }[];
  shippingZone?: unknown; // tarifas fijas, cuando Shipit no está disponible
  shipping?: { communeId?: unknown; courier?: unknown }; // envío cotizado con Shipit
  preferredCourier?: unknown; // courier que eligió el cliente cuando el envío va con tarifa fija
  customer?: Record<string, unknown>;
  utm?: unknown;
  method?: unknown; // "webpay" o "mercadopago" (por defecto)
  coupon?: unknown; // código de cupón de descuento, si el cliente escribió uno
  acceptPolicy?: unknown; // casilla "acepto la política de garantía y devoluciones"
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

// Datos del cliente: los obligatorios y los que puede dejar en blanco.
const REQUIRED_FIELDS = ["name", "email", "phone", "region", "comuna", "street", "number"] as const;
const OPTIONAL_FIELDS = ["rut", "unit", "villa", "references"] as const;

function text(value: unknown, max = 200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

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
  if (body.acceptPolicy !== true) {
    return NextResponse.json(
      { error: "Debes aceptar la política de garantía y devoluciones para comprar" },
      { status: 400 },
    );
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
  for (const field of REQUIRED_FIELDS) {
    if (customer[field]) continue;
    const value = text(body.customer?.[field]);
    if (!value) return NextResponse.json({ error: "Faltan datos de envío" }, { status: 400 });
    customer[field] = value;
  }
  for (const field of OPTIONAL_FIELDS) {
    const value = text(body.customer?.[field]);
    if (value) customer[field] = value;
  }
  const phone = normalizePhone(customer.phone);
  if (!phone) return NextResponse.json({ error: "El celular debe tener 9 dígitos" }, { status: 400 });
  customer.phone = phone;
  if (customer.rut) {
    const rut = normalizeRut(customer.rut);
    if (!rut) return NextResponse.json({ error: "El RUT no es válido" }, { status: 400 });
    customer.rut = rut;
  }
  const dwelling = isDwelling(body.customer?.dwelling) ? body.customer.dwelling : "casa";
  if (dwelling !== "casa" && !customer.unit) {
    return NextResponse.json({ error: "Falta el número del depto u oficina" }, { status: 400 });
  }
  customer.dwelling = DWELLINGS[dwelling];
  // La dirección en una línea, como la leen los correos, el panel y el courier.
  customer.address = addressLine({
    street: customer.street,
    number: customer.number,
    dwelling,
    unit: customer.unit,
    villa: customer.villa,
  });

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

  // quote: lo que cobra el courier; fund: lo que trajeron los equipos para el envío (envío gratis en la RM).
  let shipping: { zone: string; label: string; price: number; quote: number; fund: number };
  if (commune) {
    // El precio del envío también se vuelve a cotizar aquí, nunca se toma del navegador.
    const { options, fundTotal } = await quoteWithFund(commune.id, lines);
    const option = options.find((o) => o.courier === body.shipping?.courier);
    if (!option) {
      return NextResponse.json(
        { error: "El precio del envío cambió. Vuelve a elegir cómo quieres recibirlo." },
        { status: 409 },
      );
    }
    customer.commune_id = String(commune.id);
    // Si Shipit no pudo cotizar (tarifa fija), el courier es el que eligió el cliente.
    if (isShippingZone(option.courier)) {
      if (!isFixedCourier(body.preferredCourier)) {
        return NextResponse.json({ error: "Elige con qué courier quieres recibirlo" }, { status: 400 });
      }
      customer.courier = courierLabel(body.preferredCourier);
    } else {
      customer.courier = option.label;
    }
    shipping = {
      zone: isShippingZone(option.courier) ? option.courier : `shipit:${option.courier}`,
      label: `${customer.courier} a ${commune.name}`,
      price: option.price,
      quote: option.cost ?? option.price,
      fund: fundTotal,
    };
  } else {
    const zone = body.shippingZone as keyof typeof SHIPPING_ZONES;
    if (!isFixedCourier(body.preferredCourier)) {
      return NextResponse.json({ error: "Elige con qué courier quieres recibirlo" }, { status: 400 });
    }
    customer.courier = courierLabel(body.preferredCourier);
    const fund = (await getShippingFund()) * lines.reduce((n, l) => n + l.quantity, 0);
    const { label, price } = SHIPPING_ZONES[zone];
    shipping = {
      zone,
      label: `${customer.courier} (${label})`,
      price: fund > 0 ? (zone === "rm" ? 0 : Math.max(0, price - fund)) : price,
      quote: price,
      fund,
    };
  }
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  const orderId = randomUUID();

  const supabase = getAdminClient();

  // Cupón: descuenta en una sola unidad del equipo para el que se creó.
  let coupon: { code: string; productId: string; unitPrice: number; discount: number } | null = null;
  if (typeof body.coupon === "string" && body.coupon.trim()) {
    if (!supabase) return NextResponse.json({ error: "Los cupones no están disponibles" }, { status: 503 });
    const check = await checkCoupon(supabase, body.coupon, lines.map((l) => l.product), undefined, customer.email);
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: 409 });
    coupon = { code: check.coupon.code, productId: check.product.id, unitPrice: check.unitPrice, discount: check.discount };
  }
  const discount = coupon?.discount ?? 0;
  const total = subtotal - discount + shipping.price;

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
      // Solo con el envío gratis activo (antes de correr envio-gratis.sql estas columnas no existen).
      ...(shipping.fund > 0 ? { shipping_fund: shipping.fund, shipping_quote: shipping.quote } : {}),
      subtotal,
      discount,
      coupon_code: coupon?.code ?? null,
      total,
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
    // Segunda revisión ya con el pedido guardado: si otra persona usó el mismo cupón al mismo
    // tiempo, ninguna de las dos compras pasa con él (nunca se usa más veces de lo permitido).
    if (coupon) {
      const { data: limit } = await supabase.from("coupons").select("max_uses").eq("code", coupon.code).maybeSingle();
      const others = await countCouponUses(supabase, coupon.code, orderId, customer.email).catch(() => Infinity);
      if (!limit || others >= limit.max_uses) {
        await supabase.from("orders").update({ status: "failed" }).eq("id", orderId);
        return NextResponse.json({ error: "Ese cupón ya fue usado o hay otra compra en curso con él" }, { status: 409 });
      }
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  const webpay = getWebpayConfig();
  if (method === "webpay" && webpay) {
    try {
      const tx = await createWebpayTransaction(webpay, {
        orderId,
        amount: total,
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
        // Con cupón, la unidad con descuento va en su propia línea, para que la suma sea el total.
        ...lines.flatMap((l) => {
          const discounted = coupon?.productId === l.product.id;
          const full = { id: l.product.id, title: l.product.name, unit_price: l.product.price, currency_id: "CLP" };
          return [
            ...(discounted
              ? [{ ...full, title: `${l.product.name} (cupón ${coupon!.code})`, quantity: 1, unit_price: coupon!.unitPrice }]
              : []),
            ...(l.quantity - (discounted ? 1 : 0) > 0 ? [{ ...full, quantity: l.quantity - (discounted ? 1 : 0) }] : []),
          ];
        }),
        // Mercado Pago no acepta líneas de $0: con envío gratis, el envío no va como línea.
        ...(shipping.price > 0
          ? [
              {
                id: `envio-${shipping.zone}`,
                title: `Envío ${shipping.label}`,
                quantity: 1,
                unit_price: shipping.price,
                currency_id: "CLP",
              },
            ]
          : []),
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
