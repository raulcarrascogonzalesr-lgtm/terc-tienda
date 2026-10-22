"use client";

import { useEffect } from "react";

const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";

// Hace que los bloques marcados con data-reveal aparezcan subiendo suave al bajar por la página,
// y que los sellos de descuento (.stamp) "salten" al aparecer.
// Anima con element.animate() en vez de cambiar clases: así no choca con React al hidratar.
// Lo que ya está en pantalla al cargar se muestra al tiro (sin parpadeo), y si la persona pidió
// "reducir movimiento" en su teléfono o computador, todo queda quieto.
export function ScrollReveal() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    const seen = new WeakSet<Element>();
    const show = (el: Element, animate: boolean) => {
      seen.add(el);
      if (!animate) {
        el.animate([{ opacity: 1 }], { duration: 0, fill: "forwards" });
        return;
      }
      const delay = parseFloat(getComputedStyle(el).getPropertyValue("--d")) || 0;
      el.animate(
        [
          { opacity: 0, transform: "translateY(24px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 700, delay, easing: EASE, fill: "both" },
      );
      el.querySelectorAll(".stamp").forEach((stamp) =>
        stamp.animate(
          [
            { opacity: 0, transform: "scale(0.4) rotate(-30deg)" },
            { opacity: 1, transform: "scale(1.12) rotate(-6deg)", offset: 0.7 },
            { opacity: 1, transform: "none" },
          ],
          { duration: 550, delay: delay + 250, easing: "cubic-bezier(0.3, 1.4, 0.5, 1)", fill: "backwards" },
        ),
      );
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.unobserve(entry.target);
          show(entry.target, true);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.1 },
    );
    let started = false;
    const watch = (root: ParentNode) => {
      root.querySelectorAll("[data-reveal]").forEach((el) => {
        if (seen.has(el)) return;
        // Al cargar, lo que ya se ve no se esconde para animarlo: evita el parpadeo.
        if (!started && el.getBoundingClientRect().top < innerHeight) show(el, false);
        else io.observe(el);
      });
    };
    watch(document);
    started = true;
    document.documentElement.classList.add("reveal-on");

    // Al navegar dentro de la tienda llegan bloques nuevos: también se animan.
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations)
        m.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches("[data-reveal]") && !seen.has(node)) io.observe(node);
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
