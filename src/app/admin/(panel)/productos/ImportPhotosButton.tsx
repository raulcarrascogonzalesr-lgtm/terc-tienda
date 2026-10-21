"use client";

import { useActionState } from "react";
import { importExternalPhotos } from "../actions";

// Aparece cuando hay productos con la foto enlazada desde otra página.
export function ImportPhotosButton({ pending: count }: { pending: number }) {
  const [result, action, pending] = useActionState(importExternalPhotos, null);
  if (count === 0 && !result) return null;
  return (
    <form action={action} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e4e2dc] bg-[#fbf8ef] p-4 text-sm">
      <span className="flex-1">
        {count > 0
          ? `${count} ${count === 1 ? "producto tiene" : "productos tienen"} la foto enlazada desde otra página. Guárdalas en la tienda para que no se pierdan.`
          : "Todas las fotos están guardadas en la tienda."}
        {result && (
          <span className="block mt-1 text-[#6b716f]">
            Se guardaron {result.saved}.
            {result.failed.length > 0 && ` No se pudo con: ${result.failed.join(", ")}.`}
          </span>
        )}
      </span>
      {count > 0 && (
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Guardando fotos…" : "Guardar fotos en la tienda"}
        </button>
      )}
    </form>
  );
}
