"use client";

import { useActionState } from "react";
import { saveShippingFund } from "../actions";

export function FundForm({ amount }: { amount: number }) {
  const [state, action, pending] = useActionState(saveShippingFund, null);
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <label className="space-y-1.5">
        <span className="block text-sm font-medium">Monto por equipo (con IVA)</span>
        <input name="shipping_fund" defaultValue={amount} inputMode="numeric" placeholder="Ej: 7000" className="input w-40" />
      </label>
      <button type="submit" disabled={pending} className="btn-secondary">
        {pending ? "Guardando…" : "Guardar"}
      </button>
      {state?.error && <p className="w-full text-sm text-[#b3362a]">{state.error}</p>}
    </form>
  );
}
