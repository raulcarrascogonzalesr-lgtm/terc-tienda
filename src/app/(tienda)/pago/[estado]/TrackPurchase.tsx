"use client";

import { useEffect } from "react";
import { trackPurchase, type TrackItem } from "@/lib/analytics";

// Cuenta la compra una sola vez por pedido, aunque el cliente recargue la página.
export function TrackPurchase({ orderId, value, items }: { orderId: string; value: number; items: TrackItem[] }) {
  useEffect(() => {
    const key = `terc-compra-${orderId}`;
    try {
      if (localStorage.getItem(key)) return;
    } catch {
      // Sin almacenamiento: se envía igual; Meta descarta duplicados por el ID del pedido.
    }
    const t = setTimeout(() => {
      trackPurchase(orderId, value, items);
      try {
        localStorage.setItem(key, "1");
      } catch {}
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);
  return null;
}
