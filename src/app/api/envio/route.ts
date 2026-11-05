import { NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/products";
import { getCommunes, quoteWithFund } from "@/lib/shipit";
import { getShippingFund } from "@/lib/shipping-fund";

export const dynamic = "force-dynamic";

// Comunas a las que se puede enviar. communes es null cuando Shipit no está disponible:
// el carrito usa entonces las tarifas fijas. fund es lo que trae cada equipo para el envío.
export async function GET() {
  const [communes, fund] = await Promise.all([getCommunes(), getShippingFund()]);
  return NextResponse.json({ communes, fund });
}

// Cotiza el envío del carrito a una comuna.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    communeId?: unknown;
    items?: { productId?: unknown; quantity?: unknown }[];
  } | null;
  const communeId = Number(body?.communeId);
  if (!Number.isInteger(communeId) || !Array.isArray(body?.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Faltan datos para cotizar" }, { status: 400 });
  }
  const products = await getProductsByIds(body.items.map((i) => String(i.productId)));
  const lines = body.items.flatMap((i) => {
    const product = products.find((p) => p.id === String(i.productId));
    const quantity = Math.max(1, Math.floor(Number(i.quantity)) || 1);
    return product ? [{ product, quantity }] : [];
  });
  const { options } = await quoteWithFund(communeId, lines);
  return NextResponse.json({ options });
}
