"use client";

import { CONSENT_KEY } from "@/lib/analytics";

export function ResetCookies() {
  return (
    <button
      type="button"
      onClick={() => {
        try {
          localStorage.removeItem(CONSENT_KEY);
        } catch {}
        window.location.reload();
      }}
      className="rounded-full border border-black/15 px-4 py-2 text-sm font-semibold hover:bg-black/[0.04]"
    >
      Cambiar mi elección de cookies
    </button>
  );
}
