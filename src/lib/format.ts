const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function formatCLP(value: number): string {
  return clp.format(value);
}

export const GRADE_LABELS = {
  A: "Grado A · como nuevo",
  B: "Grado B · detalles leves",
  C: "Grado C · marcas visibles",
} as const;
