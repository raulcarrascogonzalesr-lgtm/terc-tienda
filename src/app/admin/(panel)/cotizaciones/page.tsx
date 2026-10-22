import { formatDateTime, QUOTE_KIND_LABELS, QUOTE_STATUS_LABELS } from "@/lib/format";
import type { Quote, QuoteStatus } from "@/lib/types";
import { updateQuoteStatus } from "../actions";
import { listQuotes } from "../data";
import { Badge, PageHeader, Tip } from "../ui";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<QuoteStatus, "warn" | "good" | "muted"> = {
  nueva: "warn",
  respondida: "good",
  cerrada: "muted",
};

// Deja el teléfono listo para wa.me: solo dígitos y con el 56 de Chile.
function whatsappNumber(phone: string | null): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length === 9 && digits.startsWith("9")) return `56${digits}`;
  if (digits.length === 11 && digits.startsWith("569")) return digits;
  return null;
}

function QuoteCard({ quote }: { quote: Quote }) {
  const wa = whatsappNumber(quote.phone);
  const greeting = `Hola ${quote.name.split(" ")[0]}, te escribimos de TERC por tu solicitud de cotización.`;
  return (
    <article className="rounded-xl border border-[#e4e2dc] bg-white p-5 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-[#0a2a2a]">
            {quote.name}
            {quote.company && <span className="font-normal text-[#6b716f]"> · {quote.company}</span>}
          </p>
          <p className="text-xs text-[#6b716f]">
            {formatDateTime(quote.created_at)} · {QUOTE_KIND_LABELS[quote.kind]}
            {quote.quantity && ` · ${quote.quantity} equipos`}
          </p>
        </div>
        <Badge tone={STATUS_TONE[quote.status]}>{QUOTE_STATUS_LABELS[quote.status]}</Badge>
      </div>
      <p className="whitespace-pre-line text-sm text-[#3b4442]">{quote.message}</p>
      <div className="flex flex-wrap items-center gap-2 border-t border-[#efede8] pt-3 text-sm">
        {wa && (
          <a
            href={`https://wa.me/${wa}?text=${encodeURIComponent(greeting)}`}
            target="_blank"
            rel="noopener"
            className="btn-secondary"
          >
            WhatsApp
          </a>
        )}
        <a
          href={`mailto:${quote.email}?subject=${encodeURIComponent("Tu cotización en TERC")}&body=${encodeURIComponent(greeting)}`}
          className="btn-secondary"
        >
          Correo
        </a>
        <span className="text-xs text-[#6b716f]">
          {quote.email}
          {quote.phone && ` · ${quote.phone}`}
        </span>
        <form action={updateQuoteStatus.bind(null, quote.id)} className="ml-auto flex items-center gap-2">
          <select name="status" defaultValue={quote.status} className="input py-1.5 text-sm">
            {Object.entries(QUOTE_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary py-1.5">
            Guardar
          </button>
        </form>
      </div>
    </article>
  );
}

export default async function QuotesPage() {
  const quotes = await listQuotes();
  const pending = quotes.filter((q) => q.status === "nueva");
  const rest = quotes.filter((q) => q.status !== "nueva");
  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Tienda"
        title="Cotizaciones"
        subtitle="Las solicitudes de la página Empresas y cotizaciones: compras por volumen, arriendos y pedidos especiales."
      />
      {quotes.length === 0 ? (
        <p className="text-[#6b716f]">Todavía no llegan solicitudes.</p>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-[#0a2a2a]">Por responder ({pending.length})</h2>
              {pending.map((q) => (
                <QuoteCard key={q.id} quote={q} />
              ))}
            </div>
          )}
          {rest.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-[#6b716f]">Anteriores</h2>
              {rest.map((q) => (
                <QuoteCard key={q.id} quote={q} />
              ))}
            </div>
          )}
        </>
      )}
      <Tip title="Antes de cotizar un arriendo">
        Conversa con tu papá las condiciones: contrato, garantía y seguro de los equipos van a nombre de
        Wiremax.
      </Tip>
    </section>
  );
}
