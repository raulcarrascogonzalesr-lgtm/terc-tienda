"use client";

import { useEffect } from "react";
import { WELCOME_KEY } from "./welcome-key";

const DURATION = 2000; // lo que dura la cortina (la animación está en globals.css)

// Cierra la cortina: al terminar, o antes si la persona toca la pantalla o aprieta una tecla.
export function CurtainCloser() {
  useEffect(() => {
    const html = document.documentElement;
    if (html.dataset.welcome !== "show") return;
    try {
      localStorage.setItem(WELCOME_KEY, "1");
    } catch {}
    let timer = window.setTimeout(() => (html.dataset.welcome = "done"), DURATION);
    const skip = () => {
      if (html.dataset.welcome !== "show") return;
      html.dataset.welcome = "skip";
      window.dispatchEvent(new Event("terc:welcome-skip"));
      window.clearTimeout(timer);
      timer = window.setTimeout(() => (html.dataset.welcome = "done"), 450);
    };
    const curtain = document.querySelector(".welcome");
    curtain?.addEventListener("click", skip);
    window.addEventListener("keydown", skip);
    return () => {
      window.clearTimeout(timer);
      curtain?.removeEventListener("click", skip);
      window.removeEventListener("keydown", skip);
      if (html.dataset.welcome === "show" || html.dataset.welcome === "skip") html.dataset.welcome = "done";
    };
  }, []);
  return null;
}
