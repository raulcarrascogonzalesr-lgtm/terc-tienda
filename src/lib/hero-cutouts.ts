// Fotos ya recortadas a mano (fondo transparente, en public/recortes/) para el banner de la
// portada. El recorte automático deja bordes blancos en equipos plateados sobre fondo blanco;
// estos equipos usan su recorte limpio. Para agregar uno: subir <slug>.webp y sumarlo aquí.
const CUT = new Set([
  "pc-hp-prodesk-600-g4-sff-i5-8500-8-gb-1-tb",
  "pc-hp-elitedesk-800-g4-sff-i7-8700-16-gb-1-tb",
  "notebook-hp-elitebook-830-g7-i7-10510u-8-gb-ssd-256-gb",
  "mini-pc-dell-optiplex-3000-micro-i5-12a-gen-8-gb-ssd-256-gb",
]);

export const CUTOUT_DIR = "/recortes/";

export function heroPhoto(slug: string, fallback: string) {
  return CUT.has(slug) ? `${CUTOUT_DIR}${slug}.webp` : fallback;
}
