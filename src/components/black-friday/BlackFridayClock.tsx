"use client";

import { useEffect, useState } from "react";
import { endOfDayInChile } from "@/components/OfferCountdown";
import { shortDate } from "@/lib/format";

const pad = (n: number) => String(n).padStart(2, "0");

// Cuenta regresiva grande en cuadritos (días, horas, minutos, segundos) hasta el fin del Black Friday.
// "compact" es la versión de una línea para la franja de arriba.
export function BlackFridayClock({ endsOn, compact = false }: { endsOn: string; compact?: boolean }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return <span className="tabular-nums">Hasta el {shortDate(endsOn)}</span>;
  const left = Math.max(0, Math.floor((endOfDayInChile(endsOn) - now) / 1000));
  const parts = [
    { n: Math.floor(left / 86400), label: "días" },
    { n: Math.floor((left % 86400) / 3600), label: "horas" },
    { n: Math.floor((left % 3600) / 60), label: "min" },
    { n: left % 60, label: "seg" },
  ];

  if (compact)
    return (
      <span className="tabular-nums">
        Termina en {parts[0].n > 0 && `${parts[0].n}d `}
        {pad(parts[1].n)}:{pad(parts[2].n)}:{pad(parts[3].n)}
      </span>
    );

  return (
    <div className="flex gap-2 sm:gap-3" role="timer" aria-label="Tiempo que queda de Black Friday">
      {parts.map((p) => (
        <div key={p.label} className="bf-tick flex w-14 flex-col items-center rounded-xl bg-white/[0.06] py-2 ring-1 ring-gold/30 sm:w-[4.5rem] sm:py-2.5">
          <span className="font-[family-name:var(--font-display)] text-2xl font-extrabold leading-none tabular-nums text-white sm:text-3xl">
            {pad(p.n)}
          </span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gold">{p.label}</span>
        </div>
      ))}
    </div>
  );
}
