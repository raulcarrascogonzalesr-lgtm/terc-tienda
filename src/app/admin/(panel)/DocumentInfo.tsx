import type { Movement } from "@/lib/types";
import { ICONS } from "./icons";
import { Icon } from "./ui";

const DOC_LABELS = { factura: "Factura", boleta: "Boleta", otro: "Comprobante" } as const;

export function DocumentInfo({ movement: m }: { movement: Movement }) {
  if (!m.doc_type) return <span className="text-[#a3a8a5]">—</span>;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2">
      <span>
        {DOC_LABELS[m.doc_type]}
        {m.doc_number && ` Nº ${m.doc_number}`}
      </span>
      {m.attachment && (
        <a
          href={`/admin/documento/${m.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#0f5f59] hover:underline print:hidden"
        >
          <Icon path={ICONS.archivo} className="w-3.5 h-3.5" />
          Ver
        </a>
      )}
    </span>
  );
}
