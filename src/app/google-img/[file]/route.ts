// Foto de un equipo con fondo blanco, para Google Shopping y el catálogo de Instagram/Facebook.
// Algunas fotos se subieron como PNG con fondo transparente, y en esas vitrinas el
// transparente puede verse negro. Aquí se rellena con blanco y se entrega como JPG.
// Si el servidor no puede procesar la foto, manda a la original (nunca deja a Google sin foto).

const BUCKET_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/productos/`;
const FILE = /^[\w-]+\.(png|jpe?g|webp)$/i;

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!FILE.test(file) || !process.env.NEXT_PUBLIC_SUPABASE_URL) return new Response("No existe", { status: 404 });
  const original = BUCKET_URL + file;

  try {
    const res = await fetch(original);
    if (!res.ok) return new Response("No existe", { status: 404 });
    const input = Buffer.from(await res.arrayBuffer());
    // sharp viene con Next.js (lo usa para achicar las fotos de la tienda).
    const { default: sharp } = await import("sharp");
    const jpg = await sharp(input).flatten({ background: "#ffffff" }).jpeg({ quality: 90 }).toBuffer();
    return new Response(new Uint8Array(jpg), {
      headers: {
        "Content-Type": "image/jpeg",
        // Cada foto subida tiene un nombre único: la versión blanca no cambia nunca.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return Response.redirect(original, 302);
  }
}
