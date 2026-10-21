"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Campaign } from "@/lib/types";
import { addMovement } from "../actions";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, OTHER_OUTFLOWS } from "../finance";

export function MovementForm({ campaigns, today }: { campaigns: Campaign[]; today: string }) {
  const [state, action, pending] = useActionState(addMovement, null);
  const form = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);

  // Limpia el formulario después de guardar bien.
  useEffect(() => {
    if (submitted.current && !pending && !state) form.current?.reset();
    if (pending) submitted.current = true;
  }, [pending, state]);

  return (
    <form ref={form} action={action} className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
      <label className="space-y-1 lg:col-span-2">
        <span className="text-sm font-medium">Tipo</span>
        <select name="category" required className="input" defaultValue="">
          <option value="" disabled>
            Elige…
          </option>
          <optgroup label="Entra plata">
            {Object.entries(INCOME_CATEGORIES).map(([k, v]) => (
              <option key={k} value={`ingreso:${k}`}>
                {v}
              </option>
            ))}
          </optgroup>
          <optgroup label="Sale plata (gasto)">
            {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => (
              <option key={k} value={`egreso:${k}`}>
                {v}
              </option>
            ))}
          </optgroup>
          <optgroup label="Sale plata (no es gasto)">
            {Object.entries(OTHER_OUTFLOWS).map(([k, v]) => (
              <option key={k} value={`egreso:${k}`}>
                {v}
              </option>
            ))}
          </optgroup>
        </select>
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">Monto (CLP)</span>
        <input name="amount" required inputMode="numeric" placeholder="150000" className="input" />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">Fecha</span>
        <input name="date" type="date" required defaultValue={today} className="input" />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">Campaña</span>
        <select name="campaign_id" className="input" defaultValue="">
          <option value="">Solo si es publicidad</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 sm:col-span-2 lg:col-span-4">
        <span className="text-sm font-medium">Detalle</span>
        <input
          name="description"
          placeholder="Ej: factura 1234 del proveedor, 2 notebooks"
          className="input"
        />
      </label>
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Guardando…" : "Agregar"}
      </button>
      {state?.error && (
        <p className="text-sm text-red-700 sm:col-span-2 lg:col-span-5">{state.error}</p>
      )}
    </form>
  );
}
