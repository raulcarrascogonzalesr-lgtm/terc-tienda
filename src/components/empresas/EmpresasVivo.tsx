"use client";

import { useEffect, useRef } from "react";
import type { EmpresaEquipo } from "@/lib/terqui-anim/empresas";
import "./empresas.css";

// Envuelve la página de empresas: anima a Terqui (lib/terqui-anim/empresas.js) y muestra la ficha
// con la foto real cuando pasas el mouse (o tocas) un equipo dibujado.
export function EmpresasVivo({ equipos, children }: { equipos: Record<string, EmpresaEquipo>; children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let scene: { stop(): void } | null = null;
    let cancelled = false;
    import("@/lib/terqui-anim/empresas").then(({ startEmpresas }) => {
      if (!cancelled && root.current) scene = startEmpresas(root.current, { equipos });
    });
    return () => {
      cancelled = true;
      scene?.stop();
    };
  }, [equipos]);

  return (
    <div ref={root} className="emp">
      {children}
      <div
        data-emp-card
        role="dialog"
        aria-label="Ficha del equipo"
        className="emp-card grid gap-2.5 rounded-2xl bg-surface p-3 text-ink shadow-[0_18px_50px_rgba(10,42,42,0.22)] ring-1 ring-line/10"
      >
        <div className="emp-card-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-f="img" alt="" width={240} height={128} />
        </div>
        <div>
          <p data-f="name" className="font-display text-[15px] font-bold leading-snug" />
          <p data-f="line" className="text-xs text-muted" />
        </div>
        <p className="font-display text-xl font-extrabold tabular-nums">
          <span data-f="price" />
          <small className="block font-sans text-[11.5px] font-medium text-muted">
            IVA incluido · desde 3 equipos, precio por volumen
          </small>
        </p>
        <div className="grid grid-cols-2 gap-2">
          <a data-f="buy" href="#cotizar" className="flex items-center justify-center rounded-full bg-pine px-3 py-2.5 text-[13px] font-bold text-white transition hover:bg-cta">
            Ver equipo
          </a>
          <a href="#cotizar" className="flex items-center justify-center rounded-full bg-mint-50 px-3 py-2.5 text-[13px] font-bold text-pine-700">
            Cotizar
          </a>
        </div>
        <p data-f="tip" className="text-center text-[11.5px] text-muted" />
      </div>
    </div>
  );
}
