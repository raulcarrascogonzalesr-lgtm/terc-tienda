"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteProduct } from "../actions";
import { ICONS } from "../icons";
import { Icon } from "../ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-lg bg-[#b3362a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#962c22] disabled:opacity-50"
    >
      {pending ? "Eliminando…" : "Sí, eliminar"}
    </button>
  );
}

// Basurero de la lista de productos: abre un cuadro que pide confirmar antes de borrar.
export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Eliminar producto"
        aria-label={`Eliminar ${name}`}
        className="rounded-lg p-1.5 text-[#a3a8a5] transition hover:bg-[#fbeceb] hover:text-[#b3362a]"
      >
        <Icon path={ICONS.basurero} className="w-[18px] h-[18px]" />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`borrar-${id}`}
            className="w-full max-w-sm rounded-xl bg-white p-6 text-left shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={`borrar-${id}`} className="text-lg font-semibold text-[#0a2a2a]">
              ¿Estás seguro que quieres eliminar este producto?
            </h2>
            <p className="mt-2 text-sm text-[#0a2a2a]">
              <strong>{name}</strong> se borrará de la tienda y del panel. Esto no se puede deshacer.
            </p>
            <p className="mt-2 text-sm text-[#6b716f]">
              Si solo quieres que no aparezca en la tienda, mejor edítalo y desmarca “Visible”.
            </p>
            <form
              action={deleteProduct.bind(null, id)}
              className="mt-5 flex justify-end gap-2"
            >
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                Cancelar
              </button>
              <SubmitButton />
            </form>
          </div>
        </div>
      )}
    </>
  );
}
