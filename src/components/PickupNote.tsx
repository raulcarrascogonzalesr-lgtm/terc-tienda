import { SITE, whatsappLink } from "@/lib/site";
import { StoreIcon } from "./icons";

// Apartado chico de "Retiro en bodega" (Raúl 24-11-2026): el cliente, sobre todo de regiones, puede venir a
// buscar su producto. Siempre se coordina antes por WhatsApp (no hay horario de atención fijo).
export function PickupNote({ className = "" }: { className?: string }) {
  if (!SITE.pickup) return null;
  const wa = whatsappLink("Hola, quiero retirar mi compra en la bodega de TERC");
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <StoreIcon name="box" className="mt-0.5 h-6 w-6 shrink-0 text-pine-700" />
      <div>
        <p className="font-bold text-ink">Retiro en bodega</p>
        <p className="text-[13px] text-muted">
          ¿Vienes de regiones o prefieres buscarlo tú? Retíralo sin costo en la {SITE.pickup}, coordinando antes por{" "}
          {wa ? (
            <a href={wa} target="_blank" rel="noopener" className="font-semibold text-pine-700 hover:underline">
              WhatsApp
            </a>
          ) : (
            "WhatsApp"
          )}
          .
        </p>
      </div>
    </div>
  );
}
