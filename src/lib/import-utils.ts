import type { ImportKind } from "../types/generated/ImportKind";

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
export const IMPORT_PAGE_SIZE = 20;
export const importLabels: Record<ImportKind, string> = {
  accounts: "Cuentas", categories: "Categorías", items: "Artículos", movements: "Movimientos", purchases: "Líneas de compra",
};

export async function readImportFile(file: File): Promise<string> {
  if (file.size > MAX_IMPORT_BYTES) throw new Error("El CSV supera el límite de 5 MiB. Dividilo en archivos más pequeños.");
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer());
  } catch {
    throw new Error("No se pudo leer el CSV como UTF-8. Volvé a guardarlo con codificación UTF-8 e intentá otra vez.");
  }
}

export function downloadImportTemplate(kind: ImportKind, csv: string) {
  const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `orbit-${kind}-ejemplo.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
