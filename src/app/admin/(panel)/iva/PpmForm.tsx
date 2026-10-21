"use client";

import { useActionState } from "react";
import { savePpmRate } from "../actions";

export function PpmForm({ rate }: { rate: string }) {
  const [state, action, pending] = useActionState(savePpmRate, null);
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <label className="space-y-1.5">
        <span className="block text-sm font-medium">Tasa de PPM de Wiremax (%)</span>
        <input
          name="ppm_rate"
          defaultValue={rate.replace(".", ",")}
          inputMode="decimal"
          placeholder="Ej: 0,25"
          className="input w-40"
        />
      </label>
      <button type="submit" disabled={pending} className="btn-secondary">
        {pending ? "Guardando…" : "Guardar tasa"}
      </button>
      {state?.error && <p className="w-full text-sm text-[#b3362a]">{state.error}</p>}
    </form>
  );
}
