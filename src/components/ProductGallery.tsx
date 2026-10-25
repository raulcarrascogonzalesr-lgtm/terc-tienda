"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { StoreIcon, type IconName } from "./icons";
import { Mark } from "./Mark";
import { PHOTO_BACKDROP, ProductImage } from "./ProductImage";

// Última "foto" de cada producto: la garantía y respaldo de TERC.
function TrustSlide({ product }: { product: Product }) {
  const points: { icon: IconName; text: string }[] = [
    { icon: "checklist", text: product.on_demand ? "Revisado antes de enviártelo" : "Revisado uno por uno" },
    { icon: "truck", text: "Envío a todo Chile" },
    { icon: "card", text: "Pago seguro, también en cuotas" },
  ];
  return (
    <div className="relative flex aspect-square w-full flex-col justify-between overflow-hidden bg-pine px-14 py-6 text-white sm:px-16 sm:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(61,181,133,0.25),transparent_60%)]" />
      <Mark className="absolute -bottom-10 -right-10 w-64 opacity-[0.08]" ink="#ffffff" />
      <div className="relative flex items-center gap-3">
        <Mark className="w-9 sm:w-12" ink="#ffffff" technical />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold sm:text-xs">
          Compra con respaldo
        </span>
      </div>
      <div className="relative">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mint">Garantía TERC</p>
        <p className="mt-1 text-5xl font-bold tracking-tight sm:text-7xl">
          {product.warranty_months} <span className="text-2xl sm:text-4xl">meses</span>
        </p>
        <p className="mt-2 max-w-xs text-xs text-white/75 sm:text-sm">
          Si algo falla, te respondemos nosotros. Sin letra chica.
        </p>
      </div>
      <ul className="relative space-y-1.5 sm:space-y-2.5">
        {points.map((p) => (
          <li key={p.text} className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 sm:h-8 sm:w-8">
              <StoreIcon name={p.icon} className="w-4 h-4 text-gold" />
            </span>
            {p.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Fotos del producto con miniaturas; siempre termina con la tarjeta de garantía TERC.
export function ProductGallery({ product, badges }: { product: Product; badges?: React.ReactNode }) {
  const photos = [product.image_url, ...product.images].filter((url): url is string => !!url);
  // Sin fotos, la primera vista es el fondo de la marca.
  const views: (string | null)[] = [...(photos.length ? photos : [null]), "terc"];
  const [index, setIndex] = useState(0);
  const go = (i: number) => setIndex((i + views.length) % views.length);
  const current = views[index];

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-3xl border border-line/[0.06] bg-surface">
        {current === "terc" ? (
          <TrustSlide product={product} />
        ) : current ? (
          <div className={`aspect-square w-full ${PHOTO_BACKDROP}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current} alt={product.name} className="h-full w-full object-contain p-[1%] mix-blend-multiply" />
          </div>
        ) : (
          <ProductImage product={{ ...product, image_url: null }} />
        )}
        {current !== "terc" && badges}
        {product.on_demand && current && current !== "terc" && (
          <span className="absolute bottom-3 right-3 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] text-muted">
            Imagen referencial
          </span>
        )}
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Foto anterior"
          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/85 text-lg text-ink shadow-sm transition hover:bg-surface"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Foto siguiente"
          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/85 text-lg text-ink shadow-sm transition hover:bg-surface"
        >
          ›
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {views.map((view, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={view === "terc" ? "Ver garantía TERC" : `Ver foto ${i + 1}`}
            className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${i === index ? "border-pine" : "border-transparent opacity-70 hover:opacity-100"}`}
          >
            {view === "terc" ? (
              <span className="flex h-full w-full flex-col items-center justify-center bg-pine text-white">
                <StoreIcon name="shield" className="w-5 h-5 text-gold" />
                <span className="text-[10px] font-semibold">{product.warranty_months} meses</span>
              </span>
            ) : view ? (
              <span className={`block h-full w-full ${PHOTO_BACKDROP}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={view} alt="" className="h-full w-full object-contain p-1 mix-blend-multiply" />
              </span>
            ) : (
              <span className="relative flex h-full w-full items-center justify-center photo-stage">
                <Mark className="w-8 opacity-60" ink="#0a2a2a" technical />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
