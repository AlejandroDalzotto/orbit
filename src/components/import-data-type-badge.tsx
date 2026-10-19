import type { ImportDataType } from "../types/generated/ImportDataType";

const dataTypes: Record<ImportDataType, { label: string; description: string; classes: string }> = {
  text: { label: "Texto", description: "Cadena de texto; se conservan los saltos de línea dentro de campos entrecomillados.", classes: "border-type-text/25 bg-type-text/10 text-type-text" },
  integer: { label: "Entero · ID", description: "Número entero positivo que referencia un registro existente, sin decimales.", classes: "border-type-integer/25 bg-type-integer/10 text-type-integer" },
  decimal: { label: "Decimal", description: "Número con punto o coma decimal, sin separadores de miles. Los importes usan la precisión de su moneda.", classes: "border-type-decimal/25 bg-type-decimal/10 text-type-decimal" },
  date: { label: "Fecha", description: "Fecha válida con formato YYYY-MM-DD.", classes: "border-type-date/25 bg-type-date/10 text-type-date" },
  enum: { label: "Enum", description: "Uno de los valores exactos permitidos que se enumeran en la descripción.", classes: "border-type-enum/25 bg-type-enum/10 text-type-enum" },
};

export function ImportDataTypeBadge({ type }: { type: ImportDataType }) {
  const { label, description, classes } = dataTypes[type];
  return <span title={description} className={`inline-flex whitespace-nowrap rounded-xs border px-2 py-1 font-mono text-[10px] font-normal ${classes}`}>{label}</span>;
}
