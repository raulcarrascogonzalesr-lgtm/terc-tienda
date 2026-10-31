"use client";

import { useEffect, useRef, useState } from "react";
import { photoProps } from "@/lib/photo";
import type { Product } from "@/lib/types";
import { CARD_SIZES, PHOTO_BACKDROP, ProductImage } from "./ProductImage";

const INTERVAL_MS = 3200; // tiempo que se queda cada foto
const FADE_MS = 1600; // duración del fundido entre fotos

// Foto de la tarjeta. Al pasar el mouse, muestra las otras vistas del equipo una tras otra
// con un fundido suave; al salir, vuelve a la primera. Las otras fotos se descargan
// recién la primera vez que alguien pasa el mouse.
export function HoverPhotos({ product }: { product: Product }) {
  const photos = [product.image_url, ...product.images].filter((url): url is string => !!url);
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!hovering || photos.length < 2) return;
    // La primera vista nueva aparece al rato; las siguientes, cada INTERVAL_MS.
    const first = setTimeout(() => setIndex(1), 900);
    timer.current = setInterval(() => setIndex((i) => (i + 1) % photos.length), INTERVAL_MS);
    return () => {
      clearTimeout(first);
      if (timer.current) clearInterval(timer.current);
    };
  }, [hovering, photos.length]);

  if (photos.length < 2) return <ProductImage product={product} />;

  return (
    <div
      className={`aspect-square w-full ${PHOTO_BACKDROP}`}
      onMouseEnter={() => {
        setLoaded(true);
        setHovering(true);
      }}
      onMouseLeave={() => {
        setHovering(false);
        setIndex(0);
      }}
    >
      {photos.map((src, i) =>
        i === 0 || loaded ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            {...photoProps(src, CARD_SIZES, 828)}
            alt={i === 0 ? product.name : ""}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-contain p-[1.5%] mix-blend-multiply transition-[opacity,transform] ease-in-out ${
              i === index ? "opacity-100 scale-100" : "opacity-0 scale-[0.985]"
            }`}
            style={{ transitionDuration: `${FADE_MS}ms` }}
          />
        ) : null,
      )}
      {/* Puntos que indican qué vista se está mostrando. */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center gap-1.5 transition-opacity duration-300 ${
          hovering ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      >
        {photos.map((src, i) => (
          <span
            key={src}
            className={`h-1.5 rounded-full transition-all duration-1000 ease-in-out ${i === index ? "w-4 bg-pine" : "w-1.5 bg-pine/25"}`}
          />
        ))}
      </div>
    </div>
  );
}
