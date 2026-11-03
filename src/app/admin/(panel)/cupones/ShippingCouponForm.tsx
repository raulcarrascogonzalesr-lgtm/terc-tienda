"use client";

import { useActionState, useState } from "react";
import { createShippingCoupon } from "../actions";

// Un clic = un cupón de envío gratis nuevo (24 horas, un solo uso), con el mensaje listo para mandar por DM.
export function ShippingCouponForm() {
  const [state, action, pending] = useActionState(createShippingCoupon, null);
  const [copied, setCopied] = useState(false);
  const message = state?.code
    ? `¡Lo armaste! 🎉 Gracias por seguirnos. Tu cupón de envío gratis es ${state.code}. Vale por 24 horas y es de un solo uso en terc.cl`
    : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-3">
      <form action={action} className="flex flex-wrap gap-3 items-end">
        <label className="space-y-1 flex-1 min-w-[200px]">
          <span className="text-sm font-medium">Para quién es (opcional)</span>
          <input name="note" placeholder="@usuario de Instagram" className="input" autoComplete="off" />
        </label>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Creando…" : "Crear cupón de envío gratis (24 h)"}
        </button>
      </form>
      {state?.error && <p className="text-sm text-[#b3362a]">{state.error}</p>}
      {state?.code && (
        <div className="rounded-lg border border-[#cfe3d8] bg-[#f1f8f4] p-4 space-y-2">
          <p className="text-sm">
            Cupón creado:{" "}
            <code className="bg-white rounded px-2 py-1 font-bold text-lg select-all">{state.code}</code>
          </p>
          <p className="text-sm text-[#6b716f]">Mensaje para mandar por DM:</p>
          <p className="text-sm bg-white rounded p-3 select-all">{message}</p>
          <button type="button" onClick={copy} className="text-sm underline">
            {copied ? "¡Copiado!" : "Copiar mensaje"}
          </button>
        </div>
      )}
    </div>
  );
}
