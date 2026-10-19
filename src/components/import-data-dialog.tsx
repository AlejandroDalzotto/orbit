import { useRef, useState, type ChangeEvent } from "react";
import { Download, FileUp } from "lucide-react";
import { useCommitImport, useImportTemplates, usePreviewImport } from "../hooks/use-imports";
import { downloadImportTemplate, IMPORT_PAGE_SIZE, importLabels, readImportFile } from "../lib/import-utils";
import type { ImportKind } from "../types/generated/ImportKind";
import type { ImportRequest } from "../types/generated/ImportRequest";
import { LedgerDialog, LedgerError, ledgerField, ledgerLabel, ledgerPrimary, ledgerSecondary } from "./ledger-ui";
import { ImportReferenceGuide } from "./import-reference-guide";
import { ImportDataTypeBadge } from "./import-data-type-badge";

type Draft = { name: string; request: ImportRequest };

export function ImportDataDialog({ initialKind = "movements", onClose }: { initialKind?: ImportKind; onClose: () => void }) {
  const templates = useImportTemplates();
  const preview = usePreviewImport();
  const commit = useCommitImport();
  const [kind, setKind] = useState<ImportKind>(initialKind);
  const commitStarted = useRef(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [reading, setReading] = useState(false);
  const [fileError, setFileError] = useState<unknown>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [offset, setOffset] = useState(0);
  const template = templates.data?.find((entry) => entry.kind === kind);
  const mapped = preview.data;
  const busy = reading || preview.isPending || commit.isPending;
  const done = commit.data;

  function reset() {
    commitStarted.current = false;
    setDraft(null); setFileError(null); setConfirmed(false); setOffset(0);
    preview.reset(); commit.reset();
  }

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file || busy) return;
    reset();
    setReading(true);
    try {
      const request: ImportRequest = { kind, csv: await readImportFile(file) };
      setDraft({ name: file.name, request });
      await preview.mutateAsync(request);
    } catch (error) {
      setFileError(error);
    } finally { setReading(false); }
  }

  async function revalidate() {
    if (!draft || busy) return;
    commit.reset(); setFileError(null); setConfirmed(false);
    try {
      await preview.mutateAsync(draft.request);
      commitStarted.current = false;
    }
    catch { /* The mutation exposes the normalized IPC error below. */ }
  }

  function confirmImport() {
    // Native double-click events can arrive before React renders the disabled button.
    if (commitStarted.current || busy || done || commit.isError || !draft || !confirmed || !mapped?.canCommit) return;
    commitStarted.current = true;
    commit.mutate(draft.request);
  }

  return <LedgerDialog title="Importar datos CSV" busy={busy} onClose={onClose} wide>
    <div className="relative min-w-0 space-y-6">
      <p className="text-xs leading-6 text-muted">Todo se procesa en este equipo. Seleccioná un tipo y un archivo: Orbit mapea por nombre de columna y valida cada registro. No se guarda nada hasta que confirmes la vista previa.</p>
      <label><span className={ledgerLabel}>Tipo de registros</span><select className={ledgerField} value={kind} disabled={busy || !!done} onChange={(event) => { reset(); setKind(event.target.value as ImportKind); }}>
        {(Object.entries(importLabels) as [ImportKind, string][]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
      {templates.isPending && <p role="status" className="text-xs text-muted">Cargando formatos CSV…</p>}
      {templates.error != null && <LedgerError error={templates.error} retry={() => void templates.refetch()} />}
      {template && !done && <>
        <details className="group space-y-4 rounded-xs border border-hairline p-4" open={!draft}>
          <summary className="cursor-pointer text-xs">Columnas para {importLabels[kind].toLocaleLowerCase("es")} · formato y ejemplo</summary>
          <p className="text-xs leading-6 text-muted">Encabezados exactos, en cualquier orden; omití las columnas opcionales o dejalas vacías. UTF-8, separador coma o punto y coma. Máximo 2.000 registros y 5 MiB. Los campos con comas, saltos de línea o comillas deben ir entre comillas dobles; duplicá las comillas interiores.</p>
          <p className="text-xs leading-6 text-muted">Los importes son unidades de la moneda, no centavos: <code>12.50</code> significa 12,50. También se acepta coma decimal en un campo correctamente entrecomillado o con separador punto y coma. Sin separadores de miles, símbolos, signos ni exponentes.</p>
          <div className="max-h-64 overflow-auto"><table className="w-full text-left text-xs"><caption className="sr-only">Especificación de columnas CSV de {importLabels[kind]}</caption><thead className="text-muted"><tr><th scope="col" className="pb-3 pr-3">Columna</th><th scope="col" className="whitespace-nowrap pb-3 pr-4">Tipo de dato</th><th scope="col" className="pb-3">Mapeo en Orbit</th></tr></thead><tbody className="divide-y divide-hairline">{template.columns.map((column) => <tr key={column.name}><th scope="row" className="py-3 pr-3 align-top font-normal"><code>{column.name}</code><span className="mt-1 block text-[10px] text-muted">{column.required ? "Obligatoria" : "Opcional"}</span></th><td className="py-3 pr-4 align-top"><ImportDataTypeBadge type={column.dataType} /></td><td className="py-3 text-muted">{column.description}<code className="mt-2 block text-primary">Ej.: {column.example}</code></td></tr>)}</tbody></table></div>
          <button type="button" className={ledgerSecondary} onClick={() => downloadImportTemplate(kind, template.exampleCsv)}><Download size={14} />Descargar ejemplo CSV</button>
          <p className="text-[10px] leading-5 text-muted">Los IDs del ejemplo son ilustrativos: reemplazalos con IDs existentes válidos. No se buscan referencias por nombre ni se crean automáticamente.</p>
          <ImportReferenceGuide key={kind} kind={kind} />
        </details>
        <label className="block space-y-3 border border-dashed border-hairline p-4"><span className="flex items-center gap-2 text-xs"><FileUp size={16} />Seleccionar archivo CSV</span>
          <input aria-label="Archivo CSV" type="file" accept=".csv,text/csv" disabled={busy} onChange={(event) => void selectFile(event)} className="block w-full min-w-0 text-xs text-muted file:mr-3 file:cursor-pointer file:rounded-xs file:border file:border-hairline file:bg-transparent file:px-3 file:py-2 file:text-primary" />
        </label>
      </>}
      {busy && <p role="status" className="text-xs text-muted">{commit.isPending ? "Revalidando y guardando todas las filas en SQLite…" : reading && !preview.isPending ? "Leyendo CSV local…" : "Mapeando y validando filas. Todavía no se guardó ningún registro…"}</p>}
      {(fileError ?? preview.error) != null && <LedgerError error={fileError ?? preview.error} />}
      {mapped && draft && !done && <section aria-label="Vista previa CSV" className="min-w-0 space-y-4 border-t border-hairline pt-5">
        <div><p className={ledgerLabel}>Vista previa · {draft.name}</p><h3 className="font-display text-2xl">{mapped.validRows} de {mapped.totalRows} registros válidos</h3><p className="mt-2 text-xs leading-6 text-muted">Columnas del archivo → campos homónimos de Orbit. Importes en unidades de su moneda. Los valores vacíos opcionales se interpretan como no asignados. Fila 1 = encabezado; los saltos de línea dentro de un campo no suman registros.</p></div>
        {mapped.errors.length > 0 && <div role="alert" className="max-h-44 space-y-2 overflow-y-auto border border-error/35 p-3 text-xs text-error"><p>No se puede confirmar este archivo. Corregí los errores y seleccioná el CSV otra vez.</p><ul className="list-inside list-disc space-y-2">{mapped.errors.map((issue, index) => <li key={index}>Fila {issue.rowNumber}: {issue.message}</li>)}</ul></div>}
        <div className="relative max-h-80 max-w-full overflow-auto border-y border-hairline"><table className="w-full text-left text-xs"><caption className="sr-only">Registros CSV mapeados para confirmar</caption><thead className="sticky top-0 bg-surface text-muted"><tr><th scope="col" className="p-3">Fila</th>{mapped.columns.map((column, index) => <th key={`${column}-${index}`} scope="col" className="whitespace-nowrap p-3 font-normal">{column || "(sin encabezado)"}</th>)}<th scope="col" className="p-3">Validación</th></tr></thead><tbody className="divide-y divide-hairline">{mapped.rows.slice(offset, offset + IMPORT_PAGE_SIZE).map((row) => <tr key={row.rowNumber}><th scope="row" className="p-3 align-top font-normal">{row.rowNumber}</th>{mapped.columns.map((_, index) => <td key={index} className="max-w-60 min-w-24 whitespace-pre-wrap break-words p-3 align-top">{row.values[index] || <span className="text-muted">—</span>}</td>)}<td className={`min-w-32 p-3 align-top ${row.errors.length ? "text-error" : "text-muted"}`}>{row.errors.length ? row.errors.join(" ") : mapped.errors.some((issue) => issue.rowNumber === 1) ? "Encabezado inválido" : "Válida"}</td></tr>)}</tbody></table></div>
        {mapped.rows.length > IMPORT_PAGE_SIZE && <nav aria-label="Páginas de vista previa" className="flex flex-wrap items-center justify-between gap-3 text-xs"><button type="button" className={ledgerSecondary} disabled={offset === 0 || busy} onClick={() => setOffset((value) => Math.max(0, value - IMPORT_PAGE_SIZE))}>Anterior</button><span className="text-muted">{offset + 1}–{Math.min(offset + IMPORT_PAGE_SIZE, mapped.rows.length)} de {mapped.rows.length}</span><button type="button" className={ledgerSecondary} disabled={offset + IMPORT_PAGE_SIZE >= mapped.rows.length || busy} onClick={() => setOffset((value) => value + IMPORT_PAGE_SIZE)}>Siguiente</button></nav>}
        <p className="text-xs leading-6 text-muted">Se crearán registros nuevos; no se reemplazan datos existentes ni se detectan duplicados automáticamente. Reimportar el mismo archivo duplica sus registros. Un error impide guardar el archivo completo.</p>
        {kind === "movements" && <p className="text-xs leading-6 text-muted">Una fila <code>transfer</code> crea las dos partes vinculadas. Las monedas distintas requieren <code>to_amount</code>; no se calcula ningún cambio.</p>}
        {kind === "purchases" && <p className="text-xs leading-6 text-muted">Las compras heredan fecha, moneda y comercio del gasto. Vincularlas no modifica el importe del movimiento.</p>}
        <label className="flex items-start gap-3 text-xs leading-6"><input type="checkbox" className="mt-1 accent-primary" checked={confirmed} disabled={!mapped.canCommit || busy || commit.isError} onChange={(event) => setConfirmed(event.target.checked)} /><span>Revisé la vista previa y quiero crear estos {mapped.totalRows} registros.</span></label>
      </section>}
      {commit.error != null && <div className="space-y-3"><LedgerError error={commit.error} /><button type="button" className={ledgerSecondary} disabled={busy} onClick={() => void revalidate()}>Volver a validar</button><p className="text-xs text-muted">No se reintenta la importación automáticamente. Si se perdió la respuesta, verificá los registros antes de volver a importar.</p></div>}
      {done && <section role="status" className="space-y-3 border border-hairline p-5"><h3 className="font-display text-3xl">Importación completada</h3><p className="text-xs leading-6">Se crearon {done.importedRows} registros de {importLabels[done.kind].toLocaleLowerCase("es")}. Movimientos de dinero creados: {done.createdMovements}. Líneas de compra creadas: {done.createdPurchases}.</p><p className="text-xs text-muted">Los saldos, historiales y reportes se recalculan desde SQLite.</p><button type="button" className={ledgerSecondary} onClick={reset}>Importar otro archivo</button></section>}
      <footer className="flex flex-wrap justify-end gap-3 border-t border-hairline pt-5"><button type="button" className={ledgerSecondary} disabled={busy} onClick={onClose}>{done ? "Cerrar" : "Descartar y cerrar"}</button>
        {!done && <button type="button" className={ledgerPrimary} disabled={busy || !mapped?.canCommit || !confirmed || !draft || commit.isError} onClick={confirmImport}>{commit.isPending ? "Importando…" : "Confirmar importación"}</button>}
      </footer>
    </div>
  </LedgerDialog>;
}
