"use client";

import { useActionState } from "react";
import type { EmailKind } from "@/lib/order-emails";
import { resendEmail, type ResendResult } from "../../actions";

// Muestra si el correo ya salió y permite reenviarlo al cliente.
export function ResendEmail({
  orderId,
  kind,
  label,
  sentAt,
  disabled,
}: {
  orderId: string;
  kind: EmailKind;
  label: string;
  sentAt: string | null;
  disabled?: boolean;
}) {
  const [result, action, pending] = useActionState<ResendResult>(() => resendEmail(orderId, kind), null);
  return (
    <form action={action} className="flex flex-wrap items-center justify-between gap-2">
      <span>
        <span className="text-[#6b716f]">{label}:</span> {sentAt ?? "no enviado"}
        {result?.ok && <span className="text-[#288868]"> · enviado recién</span>}
        {result?.error && <span className="text-red-700"> · {result.error}</span>}
      </span>
      <button type="submit" disabled={pending || disabled} className="text-[#288868] underline disabled:opacity-40 disabled:no-underline">
        {pending ? "Enviando…" : sentAt ? "Reenviar" : "Enviar"}
      </button>
    </form>
  );
}
