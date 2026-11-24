"use client";

import { useActionState } from "react";
import { importExternalDocuments } from "../actions";

// Aparece cuando hay productos con la ficha técnica o el manual enlazados desde otra página.
// La tienda solo muestra los PDF guardados en ella.
export function ImportDocsButton({ pending: count }: { pending: number }) {
  const [result, action, pending] = useActionState(importExternalDocuments, null);
  if (count === 0 && !result) return null;
  return (
    <form action={action} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e4e2dc] bg-[#fbf8ef] p-4 text-sm">
      <span className="flex-1">
        {count > 0
          ? `${count} ${count === 1 ? "producto tiene" : "productos tienen"} fichas técnicas o manuales (PDF) enlazados desde otra página. Guárdalos en la tienda para que se vean en la ficha del producto (5 productos por clic).`
          : "Todos los documentos están guardados en la tienda."}
        {result && (
          <span className="block mt-1 text-[#6b716f]">
            Se guardaron {result.saved}.
            {result.failed.length > 0 && ` No se pudo con: ${result.failed.join(", ")}.`}
          </span>
        )}
      </span>
      {count > 0 && (
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Guardando documentos…" : "Guardar documentos en la tienda"}
        </button>
      )}
    </form>
  );
}
