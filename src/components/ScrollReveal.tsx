"use client";

import { useEffect } from "react";

// Hace que los bloques marcados con data-reveal aparezcan subiendo suave al bajar por la página.
// Lo que ya está en pantalla al cargar se muestra al tiro (sin parpadeo), y si la persona pidió
// "reducir movimiento" en su teléfono o computador, todo queda quieto.
export function ScrollReveal() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.1 },
    );
    const watch = (root: ParentNode) => {
      root.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => {
        // Lo que ya se ve no se esconde para animarlo: evita el parpadeo al cargar.
        if (!document.documentElement.classList.contains("reveal-on") && el.getBoundingClientRect().top < innerHeight) {
          el.classList.add("is-in");
        } else {
          io.observe(el);
        }
      });
    };
    watch(document);
    document.documentElement.classList.add("reveal-on");

    // Al navegar dentro de la tienda llegan bloques nuevos: también se animan.
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations)
        m.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches("[data-reveal]:not(.is-in)")) io.observe(node);
          watch(node);
        });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
