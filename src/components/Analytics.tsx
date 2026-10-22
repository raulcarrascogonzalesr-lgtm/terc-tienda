"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CONSENT_KEY, readConsent, trackWhatsApp } from "@/lib/analytics";
import { SITE } from "@/lib/site";

// Carga el píxel de Meta y Google Analytics solo si el visitante acepta las cookies,
// y muestra el aviso mientras no haya elegido.
export function Analytics() {
  const [consent, setConsent] = useState<"si" | "no" | null | undefined>(undefined);
  const pathname = usePathname();

  useEffect(() => setConsent(readConsent()), []);

  // Meta cuenta cada página vista, también al navegar dentro de la tienda.
  // La primera la envía el propio código del píxel al cargarse.
  const lastPath = useRef<string | null>(null);
  useEffect(() => {
    if (consent !== "si") return;
    if (lastPath.current !== null && lastPath.current !== pathname) window.fbq?.("track", "PageView");
    lastPath.current = pathname;
  }, [consent, pathname]);

  // Clics a WhatsApp, estén donde estén.
  useEffect(() => {
    if (consent !== "si") return;
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.('a[href*="wa.me"]')) trackWhatsApp();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [consent]);

  function choose(value: "si" | "no") {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // Sin almacenamiento: vale solo para esta visita.
    }
    setConsent(value);
  }

  return (
    <>
      {consent === "si" && SITE.metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${SITE.metaPixelId}');fbq('track','PageView');`}
        </Script>
      )}
      {consent === "si" && SITE.ga4Id && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${SITE.ga4Id}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${SITE.ga4Id}');`}
          </Script>
        </>
      )}
      {consent === null && (
        <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-black/10 bg-white p-4 text-sm text-ink shadow-xl sm:inset-x-auto sm:left-5">
          <p>
            Usamos cookies para medir las visitas y mejorar nuestros anuncios.{" "}
            <Link href="/privacidad" className="underline">
              Más información
            </Link>
          </p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => choose("si")} className="rounded-full bg-pine px-4 py-2 font-semibold text-white hover:bg-pine-700">
              Aceptar
            </button>
            <button type="button" onClick={() => choose("no")} className="rounded-full border border-black/15 px-4 py-2 font-semibold hover:bg-black/[0.04]">
              Solo las necesarias
            </button>
          </div>
        </div>
      )}
    </>
  );
}
