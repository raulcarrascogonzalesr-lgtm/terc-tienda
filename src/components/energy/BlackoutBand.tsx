"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { StoreIcon } from "@/components/icons";
import { Mark } from "@/components/Mark";
import { formatCLP } from "@/lib/format";
import { photoProps } from "@/lib/photo";
import type { Product } from "@/lib/types";

// Apartado de las UPS ("Que un corte de luz no te corte la pega"). Va en la portada (equipos) y en
// /energia, porque una UPS sirve para los dos mundos (pedido de Raúl, 26-11-2026).
// Se juega: el interruptor corta la luz de la oficina dibujada y se ve qué sigue prendido con UPS y
// qué se apaga sin ella. Al lado, "¿Qué vas a conectar?" marca la UPS que conviene.
// No prometer minutos exactos de respaldo: dependen de lo que se conecte.

type Ups = Pick<Product, "id" | "slug" | "name" | "price" | "image_url">;

const USES = [
  {
    key: "pc",
    label: "Computador y monitor",
    online: false,
    why: "Aguanta el corte y te da minutos para guardar tu trabajo y apagar tranquilo.",
  },
  {
    key: "red",
    label: "Router y cámaras",
    online: false,
    why: "El internet y las cámaras siguen andando un rato mientras vuelve la luz.",
  },
  {
    key: "server",
    label: "Servidor o equipo delicado",
    online: true,
    why: "Online de doble conversión: onda pura y cero corte al pasar a batería. Para servidores, NAS y equipos sensibles.",
  },
] as const;

const isOnline = (p: Ups) => /online/i.test(p.name);

export function BlackoutBand({ products, moreHref, className = "" }: { products: Ups[]; moreHref: string; className?: string }) {
  const [cut, setCut] = useState(false);
  const [withUps, setWithUps] = useState(true);
  const [use, setUse] = useState<(typeof USES)[number]["key"]>("pc");
  const [charge, setCharge] = useState(100);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Mientras la luz está cortada, la batería de la UPS baja de a poco (solo para que se vea; se
  // detiene en 64 %). Al volver la luz se recarga.
  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setCharge((c) => (cut && withUps ? Math.max(64, c - 1) : Math.min(100, c + 3)));
    }, cut ? 420 : 120);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [cut, withUps]);

  const chosen = USES.find((u) => u.key === use)!;
  const pick = products.find((p) => isOnline(p) === chosen.online) ?? products[0];
  // Dos tarjetas: la línea interactiva más barata y la online más barata (si no hay de las dos, las 2 primeras).
  const shown = [products.find((p) => !isOnline(p)), products.find(isOnline)].filter((p): p is Ups => Boolean(p));
  const cards = shown.length === 2 ? shown : products.slice(0, 2);
  const on = !cut || withUps; // ¿Siguen prendidos el computador y el router?
  const state = !cut ? "luz" : withUps ? "respaldo" : "apagon";

  return (
    <section
      aria-labelledby="ups-band"
      className={`relative overflow-hidden rounded-3xl bg-pine text-white ${className}`}
      data-state={state}
    >
      <StoreIcon name="bolt" className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 text-white/[0.04]" />
      <div className="relative grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-8">
        {/* Izquierda: título y la oficina con el interruptor. */}
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
            <StoreIcon name="shield" className="h-4 w-4" /> Respaldo UPS
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] tracking-[0.12em] text-white/85">Para tu computador y tu oficina</span>
          </p>
          <h2 id="ups-band" className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl">
            Que un corte de luz no te corte la pega
          </h2>
          <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-white/80">
            Toca el interruptor y mira qué pasa en la oficina. Con una UPS, el computador y el internet siguen andando cuando se
            corta la luz.
          </p>

          <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-white/10">
            <Office cut={cut} on={on} withUps={withUps} />
            {/* Estado, debajo del dibujo. */}
            <div
              className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm transition-colors duration-500 ${
                state === "apagon" ? "bg-sale/90" : state === "respaldo" ? "bg-[#3a3416]" : "bg-white/[0.06]"
              }`}
              aria-live="polite"
            >
              <span className="flex items-center gap-2 font-semibold">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    state === "luz" ? "bg-mint" : state === "respaldo" ? "ups-blink bg-gold" : "bg-white"
                  }`}
                />
                {state === "luz" && "Hay luz. La UPS está cargada y esperando."}
                {state === "respaldo" && "Se cortó la luz. Tu trabajo sigue."}
                {state === "apagon" && "Sin UPS se apagó todo. Lo que no guardaste, se perdió."}
              </span>
              {withUps && (
                <span className="ml-auto flex items-center gap-2 text-xs text-white/80">
                  Batería UPS
                  <span className="relative h-2.5 w-20 overflow-hidden rounded-full bg-white/15">
                    <span
                      className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-300 ${cut ? "bg-gold" : "bg-mint"}`}
                      style={{ width: `${charge}%` }}
                    />
                  </span>
                  <b className="w-9 tabular-nums text-white">{charge}%</b>
                </span>
              )}
            </div>
          </div>

          {/* Controles: el interruptor y "con / sin UPS". */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={cut}
              onClick={() => setCut((c) => !c)}
              className={`group relative inline-flex items-center gap-3 rounded-full py-2 pl-2 pr-5 text-sm font-bold transition ${
                cut ? "bg-white text-pine" : "bg-gold text-pine hover:brightness-105"
              }`}
            >
              {!cut && <span className="ups-ping pointer-events-none absolute inset-0 rounded-full ring-2 ring-gold" aria-hidden />}
              <span className={`relative h-7 w-12 rounded-full transition-colors ${cut ? "bg-pine" : "bg-pine/25"}`}>
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full shadow transition-all duration-300 ${cut ? "left-6 bg-gold" : "left-1 bg-white"}`}
                />
              </span>
              {cut ? "Volver la luz" : "Cortar la luz"}
            </button>
            <div className="inline-flex rounded-full bg-white/10 p-1 text-[13px] font-semibold" role="group" aria-label="Con o sin UPS">
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  aria-pressed={withUps === v}
                  onClick={() => setWithUps(v)}
                  className={`rounded-full px-3.5 py-1.5 transition ${withUps === v ? (v ? "bg-mint text-pine" : "bg-sale text-white") : "text-white/75 hover:text-white"}`}
                >
                  {v ? "Con UPS" : "Sin UPS"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Derecha: qué vas a conectar y la UPS que conviene. */}
        <div className="flex min-w-0 flex-col">
          <div className="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 sm:p-5">
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-mint">¿Qué vas a conectar?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {USES.map((u) => (
                <button
                  key={u.key}
                  type="button"
                  aria-pressed={use === u.key}
                  onClick={() => setUse(u.key)}
                  className={`rounded-full px-3.5 py-2 text-[13px] font-semibold transition ${
                    use === u.key ? "bg-gold text-pine" : "bg-white/10 text-white/85 hover:bg-white/15"
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/80">{chosen.why}</p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {cards.map((p) => (
              <UpsCard key={p.id} product={p} best={p.id === pick?.id} />
            ))}
          </div>

          <Link
            href={moreHref}
            className="group mt-3 flex items-center gap-3 rounded-2xl bg-white/[0.06] p-4 text-sm ring-1 ring-white/10 transition hover:bg-white/10"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint/20 text-mint">
              <StoreIcon name="battery" className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1 leading-snug text-white/80">
              <b className="block text-white">¿Necesitas horas, no minutos?</b>
              Inversor + batería de litio para respaldar la casa o la oficina completa.
            </span>
            <StoreIcon name="arrow" className="h-4 w-4 shrink-0 text-gold transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function UpsCard({ product, best }: { product: Ups; best: boolean }) {
  const online = isOnline(product);
  return (
    <Link
      href={`/producto/${product.slug}`}
      className={`group relative flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white/[0.06] transition hover:-translate-y-0.5 hover:bg-white/10 ${
        best ? "ring-2 ring-gold" : "ring-1 ring-white/10"
      }`}
    >
      {best && (
        <span className="absolute left-2 top-2 z-10 rounded-full bg-gold px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-pine">
          Te conviene
        </span>
      )}
      <div className="photo-stage relative aspect-[4/3] overflow-hidden">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            {...photoProps(product.image_url, "(min-width: 1024px) 220px, 45vw", 384)}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain p-[10%] mix-blend-multiply transition duration-500 group-hover:scale-105"
          />
        ) : (
          <Mark className="absolute inset-[30%] opacity-40" ink="#0a2a2a" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-3">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-mint">{online ? "Online · onda pura" : "Línea interactiva"}</span>
        <span className="line-clamp-2 text-[13px] font-semibold leading-snug text-white">{product.name}</span>
        <span className="mt-auto pt-1 font-[family-name:var(--font-display)] text-lg font-extrabold tabular-nums text-white">
          {formatCLP(product.price)}
        </span>
      </div>
    </Link>
  );
}

// La oficina dibujada. cut = se cortó la luz; on = el computador y el router siguen prendidos.
function Office({ cut, on, withUps }: { cut: boolean; on: boolean; withUps: boolean }) {
  const t = "transition-all duration-700";
  return (
    <svg viewBox="0 0 400 220" className="block h-auto w-full" role="img" aria-label={cut ? (on ? "Corte de luz: el computador sigue prendido gracias a la UPS" : "Corte de luz: todo apagado") : "Oficina con luz"}>
      {/* Pared y piso */}
      <rect width="400" height="220" className={t} fill={cut ? "#0c1d26" : "#f3ecd9"} />
      <rect y="178" width="400" height="42" className={t} fill={cut ? "#091419" : "#d9cdb0"} />
      {/* Ventana: de día / de noche con tormenta */}
      <rect x="22" y="24" width="86" height="70" rx="6" className={t} fill={cut ? "#14273a" : "#bfe3f2"} stroke={cut ? "#22384a" : "#fff"} strokeWidth="5" />
      <line x1="65" y1="24" x2="65" y2="94" stroke={cut ? "#22384a" : "#fff"} strokeWidth="4" className={t} />
      {cut ? (
        <path className="ups-flash" d="M80 32 L70 56 L78 56 L68 82 L90 50 L81 50 L88 32Z" fill="#ffe27a" />
      ) : (
        <circle cx="44" cy="48" r="10" fill="#ffd45c" />
      )}
      {/* Lámpara de techo y su luz */}
      <line x1="250" y1="0" x2="250" y2="26" stroke={cut ? "#3a4b55" : "#6b5d3e"} strokeWidth="2" className={t} />
      <path d="M232 40 Q250 18 268 40Z" className={t} fill={cut ? "#33424b" : "#2b2b2b"} />
      <polygon points="234,40 266,40 330,178 170,178" fill="#ffe9a3" className={t} opacity={cut ? 0 : 0.45} />
      <circle cx="250" cy="41" r="4" className={t} fill={cut ? "#3a4b55" : "#fff3c4"} />
      {/* Enchufe de la pared */}
      <rect x="352" y="140" width="22" height="28" rx="4" className={t} fill={cut ? "#1b2c36" : "#fffaf0"} stroke={cut ? "#2c3f4a" : "#c9bd9f"} />
      <circle cx="360" cy="152" r="1.8" fill="#776a4d" />
      <circle cx="366" cy="152" r="1.8" fill="#776a4d" />
      {/* Escritorio */}
      <rect x="120" y="128" width="210" height="8" rx="2" className={t} fill={cut ? "#3b3326" : "#8a6a44"} />
      <rect x="128" y="136" width="6" height="42" className={t} fill={cut ? "#2e281e" : "#735737"} />
      <rect x="316" y="136" width="6" height="42" className={t} fill={cut ? "#2e281e" : "#735737"} />
      {/* Monitor (con la luz cortada, su brillo alumbra un poco la pared) */}
      {cut && on && <ellipse cx="217" cy="98" rx="80" ry="52" fill="#bff5d8" opacity="0.16" />}
      <rect x="168" y="66" width="98" height="60" rx="5" fill="#1c1c1c" />
      <rect x="173" y="71" width="88" height="48" rx="2" className={t} fill={on ? "#eaf6ef" : "#0b0b0b"} />
      {on && (
        <g>
          <rect x="179" y="78" width="48" height="4" rx="2" fill="#288868" />
          <rect x="179" y="87" width="70" height="3" rx="1.5" fill="#9cc9b2" />
          <rect x="179" y="94" width="62" height="3" rx="1.5" fill="#9cc9b2" />
          <rect className="ups-typing" x="179" y="101" width="56" height="3" rx="1.5" fill="#9cc9b2" />
          <rect className="ups-caret" x="237" y="99" width="2" height="7" fill="#0a2a2a" />
        </g>
      )}
      <rect x="211" y="126" width="12" height="3" fill="#1c1c1c" />
      {/* Torre del computador */}
      <rect x="276" y="84" width="30" height="44" rx="3" fill="#1f2326" />
      <circle cx="291" cy="94" r="2.4" className={t} fill={on ? "#3db585" : "#333"} />
      <rect x="282" y="104" width="18" height="2" rx="1" fill="#33393d" />
      <rect x="282" y="109" width="18" height="2" rx="1" fill="#33393d" />
      {/* Router con antenas y luces */}
      <rect x="136" y="114" width="26" height="12" rx="3" fill="#2a2f33" />
      <line x1="141" y1="114" x2="138" y2="100" stroke="#2a2f33" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="157" y1="114" x2="160" y2="100" stroke="#2a2f33" strokeWidth="2.5" strokeLinecap="round" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={142 + i * 6} cy="120" r="1.6" className={on ? `ups-led ups-led-${i}` : ""} fill={on ? "#3db585" : "#444"} />
      ))}
      {/* Cables */}
      <path d="M291 128 C291 150 260 160 250 170" fill="none" stroke="#202426" strokeWidth="2" />
      <path d="M149 126 C150 150 200 162 222 170" fill="none" stroke="#202426" strokeWidth="2" />
      {withUps ? (
        <g>
          {/* UPS en el piso, enchufada a la pared */}
          <path d="M272 176 C300 176 330 170 352 158" fill="none" stroke="#202426" strokeWidth="2.5" />
          <rect x="212" y="148" width="62" height="32" rx="4" fill="#161a1c" />
          <rect x="220" y="156" width="20" height="11" rx="1.5" className={t} fill={cut ? "#3a3416" : "#1f3a44"} />
          <rect x="222" y="158" width={cut ? 10 : 16} height="7" rx="1" className={t} fill={cut ? "#ffc94a" : "#6fd3ff"} />
          <circle cx="258" cy="161" r="4.5" fill="#262b2e" stroke="#3c4246" />
          <circle cx="248" cy="172" r="2" className={cut ? "ups-blink" : ""} fill={cut ? "#ffc94a" : "#3db585"} />
          <text x="243" y="146" textAnchor="middle" fontSize="8" fontWeight="700" fill={cut ? "#ffc94a" : "#288868"} className={t}>
            UPS
          </text>
        </g>
      ) : (
        <path d="M250 170 C280 176 320 172 352 158 M222 170 C260 180 320 176 352 160" fill="none" stroke="#202426" strokeWidth="2" />
      )}
      {/* Rayitos en el enchufe cuando se corta */}
      {cut && <path className="ups-flash" d="M378 140 l8 -6 M380 152 l10 0 M378 164 l8 6" stroke="#ffe27a" strokeWidth="2" strokeLinecap="round" />}
      {/* Cartel cuando se apaga todo */}
      {cut && !on && (
        <g>
          <rect x="168" y="84" width="98" height="22" rx="11" fill="#c8442a" />
          <text x="217" y="99" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff">
            ¡Se apagó!
          </text>
        </g>
      )}
    </svg>
  );
}
