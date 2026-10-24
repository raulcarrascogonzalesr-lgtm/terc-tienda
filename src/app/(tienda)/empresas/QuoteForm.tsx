"use client";

import { useActionState } from "react";
import { StoreIcon } from "@/components/icons";
import { Terqui } from "@/components/Terqui";
import { QUOTE_KIND_LABELS } from "@/lib/format";
import type { QuoteKind } from "@/lib/types";
import { submitQuote } from "./actions";

const field =
  "w-full rounded-xl border border-line/10 bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-muted/70 focus:border-pine-700 focus:outline-none focus:ring-4 focus:ring-pine-700/10";

export function QuoteForm({ kind }: { kind: QuoteKind }) {
  const [state, action, pending] = useActionState(submitQuote, null);

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-surface p-10 text-center ring-1 ring-line/[0.06]">
        <Terqui pose="corazon" className="w-36 h-36" />
        <h3 className="text-xl font-bold text-ink">¡Recibimos tu solicitud!</h3>
        <p className="max-w-sm text-sm text-muted">
          Te contactamos dentro de un día hábil para ver los detalles y enviarte una cotización.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-3xl bg-surface p-6 sm:p-8 ring-1 ring-line/[0.06]">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">¿Qué necesitas?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {Object.entries(QUOTE_KIND_LABELS).map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-line/10 px-3 py-2.5 text-sm text-ink has-[:checked]:border-pine-700 has-[:checked]:bg-mint-50 has-[:checked]:font-semibold"
            >
              <input type="radio" name="kind" value={value} defaultChecked={value === kind} className="accent-pine-700" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-ink">Nombre</span>
          <input name="name" required autoComplete="name" className={field} />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-ink">
            Empresa o institución <span className="font-normal text-muted">(opcional)</span>
          </span>
          <input name="company" autoComplete="organization" className={field} />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-ink">Correo</span>
          <input name="email" type="email" required autoComplete="email" className={field} />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-ink">
            Teléfono o WhatsApp <span className="font-normal text-muted">(opcional)</span>
          </span>
          <input name="phone" type="tel" autoComplete="tel" placeholder="+56 9 …" className={field} />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-ink">
          Cantidad aproximada de equipos <span className="font-normal text-muted">(opcional)</span>
        </span>
        <input name="quantity" inputMode="numeric" placeholder="Ej: 10" className={`${field} sm:max-w-[200px]`} />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-ink">Cuéntanos qué buscas</span>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="Ej: 10 notebooks con 16 GB para una oficina, idealmente iguales."
          className={field}
        />
      </label>

      {/* Campo trampa para robots: las personas no lo ven. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      {state?.error && (
        <p role="alert" className="rounded-xl bg-sale-50 px-4 py-3 text-sm font-medium text-sale">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">Usamos tus datos solo para responder esta solicitud.</p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-pine px-7 py-3.5 text-sm font-bold text-white transition hover:bg-cta disabled:opacity-60"
        >
          {pending ? "Enviando…" : "Quiero que me contacten"}
          {!pending && <StoreIcon name="arrow" className="w-4 h-4" />}
        </button>
      </div>
    </form>
  );
}
