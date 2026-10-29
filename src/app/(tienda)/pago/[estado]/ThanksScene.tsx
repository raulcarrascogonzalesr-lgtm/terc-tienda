"use client";

import { useEffect, useRef } from "react";

// Terqui celebra la compra, se sube al camión de TERC y lleva la caja hasta la casa.
// La animación está en lib/terqui-anim/thanks.js y se carga aparte.
export function ThanksScene({ firstLine }: { firstLine: string }) {
  const root = useRef<HTMLDivElement>(null);
  const scene = useRef<{ replay(): void; stop(): void } | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("@/lib/terqui-anim/thanks").then(({ startThanksScene }) => {
      if (!cancelled && root.current) scene.current = startThanksScene(root.current, { firstLine });
    });
    return () => {
      cancelled = true;
      scene.current?.stop();
    };
  }, [firstLine]);

  return (
    <div
      ref={root}
      className="relative h-[300px] overflow-hidden rounded-3xl bg-gradient-to-b from-[#0a2a2a] to-[#12493f] sm:h-[330px]"
    >
      <canvas aria-hidden data-s="confetti" className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-x-0 bottom-0 h-[52px] bg-[#0d3a33]" />
      <div className="absolute inset-x-0 bottom-[46px] h-1.5 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,.35)_0_34px,transparent_34px_60px)]" />
      <svg aria-hidden data-s="home" className="absolute bottom-[52px] w-[120px]" viewBox="0 0 120 110">
        <path d="M8 52 L60 8 L112 52" fill="none" stroke="#b3a26a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="20" y="48" width="80" height="62" rx="6" fill="#f4faf6" />
        <rect x="50" y="72" width="22" height="38" rx="3" fill="#288868" />
        <rect x="28" y="60" width="16" height="16" rx="3" fill="#cfe6d9" />
        <rect x="78" y="60" width="16" height="16" rx="3" fill="#cfe6d9" />
      </svg>
      <svg aria-hidden data-s="truck" className="absolute bottom-10 left-0 w-[170px]" viewBox="0 0 170 90">
        <rect x="4" y="10" width="104" height="58" rx="8" fill="#f4faf6" />
        <text x="56" y="47" textAnchor="middle" fontFamily="var(--font-montserrat), sans-serif" fontWeight="800" fontSize="22" fill="#0a2a2a">
          TERC
        </text>
        <path d="M108 28 H138 L160 50 V68 H108 Z" fill="#288868" />
        <path d="M114 34 H134 L148 50 H114 Z" fill="#cfe6d9" />
        <circle cx="34" cy="72" r="13" fill="#0a2a2a" />
        <circle cx="34" cy="72" r="5" fill="#b3a26a" />
        <circle cx="134" cy="72" r="13" fill="#0a2a2a" />
        <circle cx="134" cy="72" r="5" fill="#b3a26a" />
      </svg>
      <div aria-hidden data-s="tq" className="absolute left-0 top-0" />
      <div
        aria-hidden
        data-s="bubble"
        className="absolute left-0 top-0 whitespace-nowrap rounded-[18px] rounded-bl-[4px] bg-white px-3.5 py-2.5 font-[family-name:var(--font-display)] text-base font-extrabold text-[#0a2a2a] opacity-0 shadow-lg"
      />
      <button
        type="button"
        onClick={() => scene.current?.replay()}
        className="absolute right-3 top-3 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white"
      >
        Ver de nuevo
      </button>
    </div>
  );
}
