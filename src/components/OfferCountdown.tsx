"use client";

import { useEffect, useState } from "react";
import { shortDate } from "@/lib/format";

// Momento exacto en que termina el último día de la oferta: medianoche en Chile.
function endOfDayInChile(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d + 1, 3);
  const zone = new Intl.DateTimeFormat("en-US", { timeZone: "America/Santiago", timeZoneName: "shortOffset" })
    .formatToParts(guess)
    .find((part) => part.type === "timeZoneName")?.value;
  const offset = Number(zone?.replace("GMT", "")) || -3;
  return Date.UTC(y, m - 1, d + 1, -offset);
}

const pad = (n: number) => String(n).padStart(2, "0");

// Cuenta regresiva de una oferta real. Antes de cargar muestra la fecha, para que no parpadee.
export function OfferCountdown({ endsOn, className = "" }: { endsOn: string; className?: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return <span className={className}>Termina el {shortDate(endsOn)}</span>;

  const left = Math.max(0, Math.floor((endOfDayInChile(endsOn) - now) / 1000));
  const days = Math.floor(left / 86400);
  const clock = `${pad(Math.floor((left % 86400) / 3600))}:${pad(Math.floor((left % 3600) / 60))}:${pad(left % 60)}`;
  return (
    <span className={`tabular-nums ${className}`}>
      Termina en {days > 0 && `${days} ${days === 1 ? "día" : "días"} `}
      {clock}
    </span>
  );
}
