"use client";

import { useTransition } from "react";
import { setStoreOpen } from "./actions";

// Interruptor del inicio del panel para abrir o cerrar las compras.
export function StoreSwitch({ open }: { open: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <div
      className={`flex flex-wrap items-center gap-4 rounded-xl border p-4 ${open ? "border-[#cfe5dc] bg-[#eef7f3]" : "border-[#ead9a8] bg-[#fbf6e6]"}`}
    >
      <div className="flex-1 min-w-56">
        <p className="font-semibold">{open ? "La tienda está abierta" : "Compras cerradas: \"Estamos preparando la tienda\""}</p>
        <p className="text-sm text-[#6b716f]">
          {open
            ? "Cualquier persona puede comprar en terc.cl."
            : "Los visitantes ven los equipos y precios, pero no pueden pagar. Tú, desde este navegador, sí puedes probar la compra."}
        </p>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => setStoreOpen(!open))}
        className={open ? "btn-secondary" : "btn-primary"}
      >
        {pending ? "Guardando…" : open ? "Cerrar compras" : "Abrir la tienda"}
      </button>
    </div>
  );
}
