// Ficha técnica de un producto: texto del panel, una línea por dato ("Etiqueta: valor").
// Una línea que empieza con "## " abre un grupo. Las líneas sin ":" se muestran como nota del grupo.
export type TechSheetGroup = { title: string | null; rows: { label: string; value: string }[]; notes: string[] };

export function parseTechSheet(text: string | null | undefined): TechSheetGroup[] {
  const groups: TechSheetGroup[] = [];
  let current: TechSheetGroup | null = null;
  for (const raw of (text ?? "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("## ")) {
      current = { title: line.slice(3).trim(), rows: [], notes: [] };
      groups.push(current);
      continue;
    }
    if (!current) {
      current = { title: null, rows: [], notes: [] };
      groups.push(current);
    }
    const i = line.indexOf(":");
    if (i > 0 && i < line.length - 1) current.rows.push({ label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() });
    else current.notes.push(line);
  }
  return groups.filter((g) => g.rows.length || g.notes.length);
}
