import { parseTechSheet } from "@/lib/tech-sheet";

// Apartado "Ficha técnica" de la ficha del producto. Se abre y se cierra en la misma página:
// no enlaza a ningún sitio externo (pedido de Raúl, 23-11). Los PDF van aparte, en ProductDocs.
export function TechSheet({ text }: { text: string | null | undefined }) {
  const groups = parseTechSheet(text);
  if (!groups.length) return null;
  return (
    <details className="group rounded-3xl bg-surface text-sm shadow-[0_10px_30px_-18px_rgba(10,42,42,0.4)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
        <span>Ficha técnica</span>
        <span aria-hidden className="text-lg leading-none text-pine-700 transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="space-y-4 px-5 pb-5">
        {groups.map((g, gi) => (
          <div key={gi} className="space-y-1">
            {g.title && <h3 className="pt-1 text-xs font-bold uppercase tracking-[0.14em] text-muted">{g.title}</h3>}
            {g.rows.length > 0 && (
              <dl className="divide-y divide-line/[0.06]">
                {g.rows.map((r, ri) => (
                  <div key={ri} className="grid gap-0.5 py-2 sm:grid-cols-[180px_1fr] sm:gap-3">
                    <dt className="text-muted">{r.label}</dt>
                    <dd className="text-ink">{r.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {g.notes.map((n, ni) => (
              <p key={ni} className="text-xs text-muted">
                {n}
              </p>
            ))}
          </div>
        ))}
      </div>
    </details>
  );
}
