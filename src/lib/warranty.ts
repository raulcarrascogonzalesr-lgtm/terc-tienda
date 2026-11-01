// La garantía en palabras: 12 meses → "1 año", 24 → "2 años", 6 → "6 meses".
export function warrantyLabel(months: number) {
  if (months > 0 && months % 12 === 0) return months === 12 ? "1 año" : `${months / 12} años`;
  return `${months} meses`;
}
