"use client";

import { useEffect } from "react";
import { trackViewItem, type TrackItem } from "@/lib/analytics";

// Avisa a Meta y Google que alguien vio la ficha de un producto.
export function TrackView({ item }: { item: TrackItem }) {
  useEffect(() => {
    // Espera un momento por si el píxel recién se está cargando.
    const t = setTimeout(() => trackViewItem(item), 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);
  return null;
}
