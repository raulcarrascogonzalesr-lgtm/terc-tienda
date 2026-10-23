"use client";

import { useActionState, useEffect, useRef } from "react";
import { saveExtraCost } from "../actions";

export function ExtraCostForm({ categories }: { categories: string[] }) {
  const [state, action, pending] = useActionState(saveExtraCost, null);
  const form = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current && !pending && !state) form.current?.reset();
    if (pending) submitted.current = true;
  }, [pending, state]);

  return (
    <form ref={form} action={action} className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
      <label className="space-y-1 lg:col-span-2">
        <span className="text-sm font-medium">Qué es</span>
        <input name="name" required placeholder="Caja con logo para notebook" className="input" />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">Para qué productos</span>
        <select name="category" className="input" defaultValue="">
          <option value="">Todos</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">Pesos por equipo, sin IVA</span>
        <input name="amount" inputMode="numeric" placeholder="1500" className="input" />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">O % del precio</span>
        <input name="percent" inputMode="decimal" placeholder="Ej: 3,19" className="input" />
      </label>
      <label className="space-y-1 sm:col-span-2 lg:col-span-4">
        <span className="text-sm font-medium">De dónde sale el número</span>
        <input
          name="note"
          placeholder="Cotización Fabribox 22-oct: 100 cajas a $150.000 + IVA"
          className="input"
        />
      </label>
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Guardando…" : "Agregar costo"}
      </button>
      {state?.error && (
        <p className="text-sm text-[#b3362a] sm:col-span-2 lg:col-span-5">{state.error}</p>
      )}
    </form>
  );
}
