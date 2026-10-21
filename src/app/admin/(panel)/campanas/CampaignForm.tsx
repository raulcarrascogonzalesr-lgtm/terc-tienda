"use client";

import { useActionState, useEffect, useRef } from "react";
import { saveCampaign } from "../actions";
import { CHANNEL_LABELS } from "../finance";

export function CampaignForm() {
  const [state, action, pending] = useActionState(saveCampaign, null);
  const form = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current && !pending && !state) form.current?.reset();
    if (pending) submitted.current = true;
  }, [pending, state]);

  return (
    <form ref={form} action={action} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
      <label className="space-y-1">
        <span className="text-sm font-medium">Nombre</span>
        <input name="name" required placeholder="Notebooks Instagram octubre" className="input" />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">Dónde</span>
        <select name="channel" className="input" defaultValue="meta">
          {Object.entries(CHANNEL_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">Presupuesto al mes (CLP)</span>
        <input name="monthly_budget" inputMode="numeric" placeholder="100000" className="input" />
      </label>
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Creando…" : "Crear campaña"}
      </button>
      {state?.error && (
        <p className="text-sm text-red-700 sm:col-span-2 lg:col-span-4">{state.error}</p>
      )}
    </form>
  );
}
