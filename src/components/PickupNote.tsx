import { SITE } from "@/lib/site";

// Retiro (Raúl 24-11-2026): solo una posibilidad, en letra chica y sin promoverlo. Es su casa, así que
// no lleva dirección exacta, ícono ni botón: se coordina por WhatsApp caso a caso.
export function PickupNote({ className = "" }: { className?: string }) {
  if (!SITE.pickup) return null;
  return (
    <p className={`text-[11px] text-muted/80 ${className}`}>
      Si lo necesitas, también se puede retirar en {SITE.pickup}, coordinando antes por WhatsApp.
    </p>
  );
}
