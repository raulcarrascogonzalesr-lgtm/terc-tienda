"use client";

import { useEffect } from "react";
import { UTM_KEYS, UTM_STORAGE_KEY, type Utm } from "@/lib/utm";

// Recuerda la última campaña por la que llegó el visitante (30 días).
export function UtmCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utm: Utm = {};
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) utm[key] = value;
    }
    if (Object.keys(utm).length === 0) return;
    try {
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify({ ...utm, at: Date.now() }));
    } catch {
      // Sin almacenamiento (modo privado): el pedido queda sin campaña.
    }
  }, []);
  return null;
}
