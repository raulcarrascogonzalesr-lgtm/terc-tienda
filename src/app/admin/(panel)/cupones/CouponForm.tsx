"use client";

import { useActionState, useEffect, useRef } from "react";
import { saveCoupon } from "../actions";

export function CouponForm({ products }: { products: { id: string; name: string; price: string }[] }) {
  const [state, action, pending] = useActionState(saveCoupon, null);
  const form = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current && !pending && !state) form.current?.reset();
    if (pending) submitted.current = true;
  }, [pending, state]);

  return (
    <form ref={form} action={action} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
      <label className="space-y-1 sm:col-span-2">
        <span className="text-sm font-medium">Para qué equipo</span>
        <select name="product_id" required className="input" defaultValue="">
          <option value="" disabled>
            Elige el equipo
          </option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.price}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">Descuento</span>
        <div className="flex gap-2">
          <input name="value" required inputMode="numeric" placeholder="7" className="input min-w-0" />
          <select name="kind" className="input w-auto" defaultValue="percent">
            <option value="percent">%</option>
            <option value="amount">pesos</option>
          </select>
        </div>
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">Código (opcional)</span>
        <input
          name="code"
          placeholder="Vacío = uno al azar"
          className="input uppercase"
          autoComplete="off"
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">Cuántas veces se puede usar</span>
        <input name="max_uses" inputMode="numeric" defaultValue="1" className="input" />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">Vence (opcional)</span>
        <input name="expires_on" type="date" className="input" />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">Para quién es</span>
        <input name="note" placeholder="Primer cliente WhatsApp, 24-oct" className="input" />
      </label>
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Creando…" : "Crear cupón"}
      </button>
      {state?.error && (
        <p className="text-sm text-[#b3362a] sm:col-span-2 lg:col-span-4">{state.error}</p>
      )}
    </form>
  );
}
