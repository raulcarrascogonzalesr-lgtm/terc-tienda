"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { cutoutPhoto } from "@/components/CutoutImage";
import { WhatsAppIcon } from "@/components/icons";
import type { HeroItem } from "@/lib/terqui-anim/hero";
import "./terqui-hero.css";

// Banner de la portada con Terqui. El HTML está aquí y la animación en lib/terqui-anim/hero.js,
// que se carga aparte para no hacer más lenta la primera vista de la página.
// Los equipos salen del catálogo: si cambias un precio, una foto o una oferta en el panel, el banner lo muestra.

const OPEN_AT = 1.15; // segundo en que se abre la cortina de bienvenida (ver WelcomeCurtain)

const Icon = ({ d, fill = false }: { d: string; fill?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill={fill ? "currentColor" : "none"}
    stroke={fill ? undefined : "currentColor"}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d={d} />
  </svg>
);
const I = {
  shield: "M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3ZM8.8 12l2.2 2.2 4.4-4.4",
  doc: "M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5",
  card: "M3 5.5h18v13H3zM3 10h18M7 15h4",
  chat: "M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12Z",
  arrow: "M5 12h14M13 6l6 6-6 6",
  check: "M9 6h11M9 12h11M9 18h11M3.5 6l1.2 1.2L7 5M3.5 12l1.2 1.2L7 11M3.5 18l1.2 1.2L7 17",
  pause: "M6 5h4v14H6zM14 5h4v14h-4z",
  play: "M8 5.5v13l11-6.5z",
  mute: "M11 5 6 9H3v6h3l5 4zM16 9l5 6M21 9l-5 6",
  sound: "M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13",
};

declare global {
  interface Window {
    __tercWelcomeAt?: number;
  }
}

export function TerquiHero({
  items,
  warranty,
  freeShipping,
  whatsapp,
}: {
  items: HeroItem[];
  warranty: number;
  freeShipping: boolean;
  whatsapp: string | null;
}) {
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let hero: { start(): void; stop(): void } | null = null;
    let cancelled = false;
    // Si se está mostrando la cortina de bienvenida, Terqui entra justo cuando se abre.
    const welcomeAt = document.documentElement.dataset.welcome === "show" ? window.__tercWelcomeAt : undefined;
    const startDelay = welcomeAt === undefined ? 0 : Math.max(0, OPEN_AT - (performance.now() - welcomeAt) / 1000);
    const skip = () => hero?.start();
    window.addEventListener("terc:welcome-skip", skip);
    import("@/lib/terqui-anim/hero").then(({ startHero }) => {
      if (cancelled || !root.current) return;
      hero = startHero(root.current, {
        products: items,
        warranty,
        music: "/terqui/banner-musica.mp3",
        startDelay,
        cutout: (src) => cutoutPhoto(src),
      });
    });
    return () => {
      cancelled = true;
      window.removeEventListener("terc:welcome-skip", skip);
      hero?.stop();
    };
  }, [items, warranty]);

  return (
    <section className="hx-wrap" aria-roledescription="carrusel" aria-label="Equipos destacados y beneficios de TERC">
      <div ref={root} className="hx">
        <div className="hx-stage" data-h="stage">
          <div className="hx-glow" data-h="g1" />
          <div className="hx-glow" data-h="g2" />
          <div className="hx-glow" data-h="g3" />
          <div className="hx-floor" data-h="floor" />
          <div className="hx-spot" data-h="spot" />
          <div data-h="motes" />
          <div className="hx-podium" data-h="podium" />
          <div className="hx-podium-ring" data-h="pring" />
          <div className="hx-shadow" data-h="pshadow" />
          <div className="hx-prod" data-h="pA">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" />
            <div className="hx-sweep" />
          </div>
          <div className="hx-prod" data-h="pB">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" />
            <div className="hx-sweep" />
          </div>
          <div className="hx-stamp" data-h="stamp" aria-hidden>
            <span data-h="stampPct" />
            <small>
              Oferta
              <br />
              de Terqui
            </small>
          </div>

          {/* Garantía: anillo que se llena */}
          <svg className="hx-ring" data-h="ring" viewBox="0 0 400 400" aria-hidden>
            <circle cx="200" cy="200" r="170" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="10" />
            <circle
              data-h="ringArc"
              cx="200"
              cy="200"
              r="170"
              fill="none"
              stroke="#b3a26a"
              strokeWidth="10"
              strokeLinecap="round"
              transform="rotate(-90 200 200)"
              strokeDasharray="1068"
              strokeDashoffset="1068"
            />
            <circle data-h="ringDot" cx="200" cy="30" r="9" fill="#fff" />
          </svg>
          <div className="hx-ring-label" data-h="ringLabel" aria-hidden>
            <b data-h="ringNum">0</b>
            <span>
              meses de
              <br />
              garantía
            </span>
          </div>

          {/* Revisión: ficha con checks */}
          <div className="hx-check" data-h="checkCard" aria-hidden>
            <p className="hx-cc-head">
              <Icon d={I.check} /> Revisión TERC
            </p>
            {["Batería y pantalla", "Teclado, puertos y conexiones", "Disco y memoria", "Limpieza completa", "Windows Pro original"].map(
              (row) => (
                <div key={row} className="hx-cc-row">
                  <i />
                  {row}
                </div>
              ),
            )}
          </div>

          {/* Envío: ruta hasta la casa */}
          <svg className="hx-route" data-h="route" viewBox="0 0 600 300" aria-hidden>
            <path
              d="M40 250 C 160 250, 160 90, 300 110 S 470 210, 540 70"
              fill="none"
              stroke="rgba(255,255,255,.18)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="2 16"
            />
            <path
              data-h="routeDraw"
              d="M40 250 C 160 250, 160 90, 300 110 S 470 210, 540 70"
              fill="none"
              stroke="#b3a26a"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <g data-h="routeHome" transform="translate(540 70)">
              <circle r="44" fill="#3db585" opacity=".18" />
              <path d="M-22 6 L0 -16 L22 6 V26 H-22 Z" fill="#fff" />
              <rect x="-6" y="10" width="12" height="16" rx="2" fill="#0a2a2a" />
            </g>
            <g data-h="routeTruck">
              <rect x="-26" y="-16" width="34" height="26" rx="4" fill="#d8ad73" />
              <path d="M8 -8 H22 L30 2 V10 H8 Z" fill="#fff" />
              <circle cx="-14" cy="12" r="6" fill="#0a2a2a" />
              <circle cx="18" cy="12" r="6" fill="#0a2a2a" />
            </g>
          </svg>

          {/* Textos: cada escena tiene su bloque; los de los equipos se llenan con sus datos */}
          <div className="hx-txt" data-block="intro">
            <span className="hx-eyebrow" data-in="0.35">
              Tecnología reacondicionada · Chile
            </span>
            <h2 className="hx-title">
              <span data-in="0.5" data-fx="word">
                Rinde como nuevo.
              </span>{" "}
              <em data-in="0.95" data-fx="word">
                Cuesta bastante menos.
              </em>
            </h2>
            <p className="hx-sub" data-in="1.5">
              Notebooks y computadores de empresa, revisados uno a uno y con garantía TERC.
            </p>
          </div>
          {["prodA", "prodB"].map((block) => (
            <div key={block} className="hx-txt" data-block={block}>
              <span className="hx-eyebrow" data-in="0.45" data-k="eyebrow" />
              <h2 className="hx-title" data-in="0.6" data-fx="word" data-k="name" />
              <div className="hx-chips" data-k="chips" />
              <div className="hx-price" data-in="1.45" data-fx="pop" data-k="price" />
            </div>
          ))}
          <div className="hx-txt" data-block="garantia">
            <span className="hx-eyebrow" data-in="0.35">
              Garantía TERC
            </span>
            <h2 className="hx-title">
              <span data-in="0.5" data-fx="word">
                Si algo falla,
              </span>{" "}
              <em data-in="0.85" data-fx="word">
                te respondemos nosotros.
              </em>
            </h2>
            <div className="hx-chips">
              <span className="hx-chip" data-in="1.5">
                <Icon d={I.shield} />
                {warranty} meses de garantía
              </span>
              <span className="hx-chip" data-in="1.65">
                <Icon d={I.doc} />
                Boleta o factura
              </span>
              <span className="hx-chip" data-in="1.8">
                <Icon d={I.card} />
                Pago seguro, también en cuotas
              </span>
              <span className="hx-chip hx-hide-m" data-in="1.95">
                <Icon d={I.chat} />
                Te atiende una persona por WhatsApp
              </span>
            </div>
          </div>
          <div className="hx-txt" data-block="revisado">
            <span className="hx-eyebrow" data-in="0.35">
              Así lo preparamos
            </span>
            <h2 className="hx-title">
              <span data-in="0.5" data-fx="word">
                Revisado uno a uno
              </span>{" "}
              <em data-in="0.85" data-fx="word">
                antes de enviártelo.
              </em>
            </h2>
            <p className="hx-sub" data-in="1.4">
              No vendemos equipos &quot;como vienen&quot;. Cada uno pasa por nuestra revisión antes de salir.
            </p>
          </div>
          <div className="hx-txt" data-block="envio">
            <span className="hx-eyebrow" data-in="0.35">
              {freeShipping ? "Envío gratis en la Región Metropolitana" : "Envío a todo Chile"}
            </span>
            <h2 className="hx-title">
              <span data-in="0.5" data-fx="word">
                De nuestras manos
              </span>{" "}
              <em data-in="0.85" data-fx="word">
                a tu escritorio.
              </em>
            </h2>
            <p className="hx-sub" data-in="1.4">
              Bien embalado y con seguimiento por correo hasta que llega{freeShipping ? ". Y a regiones, más barato" : ""}.
            </p>
          </div>

          <div className="hx-ctas" data-h="ctas">
            <a
              className="hx-cta hx-gold"
              data-h="cta"
              href="#equipos"
              onClick={(e) => {
                // La animación cambia el enlace (a la ficha del equipo que se está mostrando).
                const href = e.currentTarget.getAttribute("href");
                if (!href?.startsWith("/") || e.metaKey || e.ctrlKey || e.shiftKey) return;
                e.preventDefault();
                router.push(href);
              }}
            >
              <span data-h="ctaLabel">Ver equipos</span> <Icon d={I.arrow} />
            </a>
            {whatsapp && (
              <a className="hx-cta hx-ghost" href={whatsapp} target="_blank" rel="noopener">
                <WhatsAppIcon className="h-[1.2em] w-[1.2em]" />
                Hablar por WhatsApp
              </a>
            )}
          </div>
          <div className="hx-nav">
            <button type="button" className="hx-navbtn" data-h="prev" aria-label="Anterior">
              ‹
            </button>
            <div className="hx-navinfo">
              <span data-h="navLabel">Hola</span>
              <span className="hx-bar">
                <i data-h="navBar" />
              </span>
            </div>
            <button type="button" className="hx-navbtn" data-h="next" aria-label="Siguiente">
              ›
            </button>
          </div>

          <div className="hx-terqui" data-h="tq" aria-hidden />
          <div className="hx-bubble" data-h="bubble" aria-hidden />
        </div>
        <div className="hx-ctrl">
          <button type="button" className="hx-hbtn hx-icon" data-h="pause" aria-label="Pausar el banner">
            <span className="hx-off">
              <Icon d={I.pause} fill />
            </span>
            <span className="hx-onl">
              <Icon d={I.play} fill />
            </span>
          </button>
          <button type="button" className="hx-hbtn" data-h="sound" aria-pressed="false">
            <span className="hx-off">
              <Icon d={I.mute} />
            </span>
            <span className="hx-onl">
              <Icon d={I.sound} />
            </span>
            <span className="hx-lbl hx-off">Activar sonido</span>
            <span className="hx-lbl hx-onl">Silenciar</span>
          </button>
        </div>
      </div>
    </section>
  );
}
