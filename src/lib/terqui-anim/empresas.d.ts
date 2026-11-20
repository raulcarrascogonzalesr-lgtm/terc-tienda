// Tipos de la página de empresas (empresas.js).
export type EmpresaEquipo = {
  name: string;
  line: string; // texto chico bajo el nombre, por ejemplo la garantía
  price: string; // ya con formato, por ejemplo "$492.990"
  url: string;
  photo: { src: string; srcSet?: string; sizes?: string } | null;
};

export function startEmpresas(root: HTMLElement, opts: { equipos: Record<string, EmpresaEquipo> }): { stop(): void };
