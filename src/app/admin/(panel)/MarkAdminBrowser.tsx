"use client";

import { useEffect } from "react";
import { ADMIN_BROWSER_KEY } from "@/lib/admin-browser";

// Recuerda en este navegador que es del administrador (ver admin-browser.ts).
export function MarkAdminBrowser() {
  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_BROWSER_KEY, "1");
    } catch {}
  }, []);
  return null;
}
