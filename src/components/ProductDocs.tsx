import { isStoredDocument, parseDocuments } from "@/lib/documents";

// Archivos para descargar (ficha técnica y manual de uso en PDF), debajo de la ficha técnica.
// Solo muestra los que están guardados en la tienda: nunca enlaza a otra página.
export function ProductDocs({ text }: { text: string | null | undefined }) {
  const docs = parseDocuments(text).filter((d) => isStoredDocument(d.url));
  if (!docs.length) return null;
  return (
    <section className="rounded-3xl bg-surface p-5 text-sm shadow-[0_10px_30px_-18px_rgba(10,42,42,0.4)]">
      <h2 className="font-semibold text-ink">Documentos para descargar</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {docs.map((d) => (
          <li key={d.url}>
            <a
              href={d.url}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-3 rounded-2xl border border-line/10 bg-paper px-4 py-3 transition hover:border-mint/60"
            >
              <span aria-hidden className="grid h-10 w-9 shrink-0 place-items-center rounded-md bg-[#c8372d] text-[10px] font-bold tracking-wide text-white">
                PDF
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-ink">{d.label}</span>
                <span className="block text-xs text-muted">Abrir o descargar</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
