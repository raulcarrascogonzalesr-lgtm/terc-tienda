"use client";

import { useEffect, useState } from "react";
import { StoreIcon } from "./icons";

type Theme = "claro" | "oscuro";
const KEY = "terc-tema";
const EVENT = "terc-tema";

// El tema elegido se guarda en el navegador del visitante (por defecto, claro).
// El script de src/app/layout.tsx lo aplica al cargar, antes de pintar.
function apply(theme: Theme) {
  if (theme === "oscuro") document.documentElement.dataset.theme = "dark";
  else delete document.documentElement.dataset.theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

function useTheme() {
  const [theme, setTheme] = useState<Theme>("claro");
  useEffect(() => {
    const read = () => setTheme(document.documentElement.dataset.theme === "dark" ? "oscuro" : "claro");
    read();
    window.addEventListener(EVENT, read);
    return () => window.removeEventListener(EVENT, read);
  }, []);
  return theme;
}

// Botón de sol/luna del encabezado.
export function ThemeToggle() {
  const theme = useTheme();
  const dark = theme === "oscuro";
  return (
    <button
      type="button"
      onClick={() => apply(dark ? "claro" : "oscuro")}
      aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={dark ? "Modo claro" : "Modo oscuro"}
      className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink hover:bg-mint-50"
    >
      <StoreIcon name={dark ? "sun" : "moon"} className="w-5 h-5" />
      <span className="hidden lg:inline">{dark ? "Modo claro" : "Modo oscuro"}</span>
    </button>
  );
}

// Selector "Apariencia" del pie de página, sobre fondo verde oscuro.
export function ThemeSwitch() {
  const theme = useTheme();
  const options: { value: Theme; label: string; icon: "sun" | "moon" }[] = [
    { value: "claro", label: "Claro", icon: "sun" },
    { value: "oscuro", label: "Oscuro", icon: "moon" },
  ];
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Apariencia</span>
      <div role="radiogroup" aria-label="Apariencia de la página" className="inline-flex rounded-full bg-white/10 p-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={theme === o.value}
            onClick={() => apply(o.value)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              theme === o.value ? "bg-gold text-[#0a2a2a]" : "text-white/75 hover:text-white"
            }`}
          >
            <StoreIcon name={o.icon} className="w-4 h-4" />
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
