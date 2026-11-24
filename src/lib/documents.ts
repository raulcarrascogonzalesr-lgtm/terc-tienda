// Documentos para descargar de un producto (ficha técnica y manual de uso en PDF).
// En el panel se escriben uno por línea: "Ficha técnica | https://…pdf".
export type ProductDocument = { label: string; url: string };

export const DOCS_BUCKET = "fichas";

export function parseDocuments(text: string | null | undefined): ProductDocument[] {
  const docs: ProductDocument[] = [];
  for (const raw of (text ?? "").split(/\r?\n/)) {
    const i = raw.indexOf("|");
    if (i < 0) continue;
    const label = raw.slice(0, i).trim();
    const url = raw.slice(i + 1).trim();
    if (label && url.startsWith("https://")) docs.push({ label, url });
  }
  return docs;
}

export function formatDocuments(docs: ProductDocument[]): string {
  return docs.map((d) => `${d.label} | ${d.url}`).join("\n");
}

// La tienda solo enlaza archivos guardados en su propio almacenamiento (Supabase), nunca a otras páginas.
export function isStoredDocument(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname.endsWith(".supabase.co") && u.pathname.includes(`/storage/v1/object/public/${DOCS_BUCKET}/`);
  } catch {
    return false;
  }
}
