import { NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/products";
import { getCommunes, quoteShipping } from "@/lib/shipit";

// Comunas a las que se puede enviar. communes es null cuando Shipit no está disponible:
// el carrito usa entonces las tarifas fijas.
export async function GET() {
  return NextResponse.json({ communes: await getCommunes() });
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
    return product ? [{ category: product.category, quantity }] : [];
  });
  try {
    const options = await quoteShipping(communeId, lines);
    return NextResponse.json({ options });
  } catch (error) {
    console.error("No se pudo cotizar con Shipit", error);
    return NextResponse.json({ error: "No pudimos cotizar el envío. Intenta de nuevo." }, { status: 502 });
  }
}
