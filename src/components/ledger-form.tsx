import { useId, useState, type FormEvent } from "react";
import { useSaveMovement } from "../hooks/use-movements";
import type { Account } from "../types/generated/Account";
import type { Category } from "../types/generated/Category";
import type { Currency } from "../types/generated/Currency";
import type { Movement } from "../types/generated/Movement";
import type { MovementEntry } from "../types/generated/MovementEntry";
import type { MovementType } from "../types/generated/MovementType";
import type { Shop } from "../types/generated/Shop";
import { LedgerDialog, LedgerError, ledgerField, ledgerLabel, ledgerPrimary, ledgerSecondary } from "./ledger-ui";
import { currencyDecimals, localDate, minorToInput, movementLabels, parseMinorAmount } from "./ledger-utils";

export function LedgerForm({ movement, accounts, categories, currencies, shops, onClose, onSaved }: {
  movement?: Movement; accounts: Account[]; categories: Category[]; currencies: Currency[]; shops: Shop[];
  onClose: () => void; onSaved: () => void;
}) {
  const id = useId();
  const save = useSaveMovement();
  const initialCurrency = currencies.find((currency) => currency.code === movement?.currencyCode);
  const initialDestinationCurrency = currencies.find((currency) => currency.code === movement?.toCurrencyCode);
  const [type, setType] = useState<MovementType>(movement?.type ?? "expense");
  const [accountId, setAccountId] = useState(String(movement?.accountId ?? accounts.find((account) => account.isActive)?.id ?? ""));
  const [destinationId, setDestinationId] = useState(String(movement?.toAccountId ?? ""));
  const [amount, setAmount] = useState(movement && initialCurrency ? minorToInput(movement.amount, initialCurrency) : "");
  const [destinationAmount, setDestinationAmount] = useState(movement?.toAmount != null && initialDestinationCurrency ? minorToInput(movement.toAmount, initialDestinationCurrency) : "");
  const [date, setDate] = useState(movement?.date ?? localDate());
  const [description, setDescription] = useState(movement?.description ?? "");
  const [notes, setNotes] = useState(movement?.notes ?? "");
  const [categoryId, setCategoryId] = useState(String(movement?.categoryId ?? ""));
  const [shopId, setShopId] = useState(String(movement?.shopId ?? ""));
  const [validationError, setValidationError] = useState<unknown>(null);
  const account = accounts.find((item) => String(item.id) === accountId);
  const destination = accounts.find((item) => String(item.id) === destinationId);
  const currency = currencies.find((item) => item.code === account?.currencyCode);
  const destinationCurrency = currencies.find((item) => item.code === destination?.currencyCode);
  const isTransfer = type === "transfer";
  const differentCurrency = isTransfer && destination && account && destination.currencyCode !== account.currencyCode;
  const hasCategories = type === "income" || type === "expense";
  const eligibleCategories = categories.filter((category) => category.isActive && (category.type === "both" || category.type === type));
  const unavailableCategory = categories.find((category) => String(category.id) === categoryId && !eligibleCategories.some((item) => item.id === category.id));
  const accountAvailable = !!account?.isActive && !!currency;
  const destinationAvailable = !isTransfer || (!!destination?.isActive && !!destinationCurrency && destination.id !== account?.id);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (save.isPending) return;
    setValidationError(null);
    save.reset();
    try {
      if (!accountAvailable || !account || !currency) throw new Error("Elegí una cuenta activa con moneda disponible.");
      if (!destinationAvailable) throw new Error("Elegí otra cuenta activa como destino.");
      if (hasCategories && categoryId && !eligibleCategories.some((category) => String(category.id) === categoryId)) throw new Error("Elegí una categoría activa compatible o quitá la categoría anterior.");
      const sourceAmount = parseMinorAmount(amount, currency);
      const toAmount = isTransfer
        ? differentCurrency && destinationCurrency ? parseMinorAmount(destinationAmount, destinationCurrency) : sourceAmount
        : null;
      const entry: MovementEntry = {
        accountId: account.id, type, amount: sourceAmount, currencyCode: currency.code, date,
        description: description.trim(), notes: notes.trim() || null,
        categoryId: hasCategories && categoryId ? Number(categoryId) : null,
        shopId: type === "expense" && shopId ? Number(shopId) : null,
        toAccountId: isTransfer && destination ? destination.id : null, toAmount,
      };
      await save.mutateAsync({ id: movement?.id, entry });
      onSaved();
    } catch (error) {
      setValidationError(error);
    }
  }

  return <LedgerDialog title={movement ? "Editar movimiento" : "Nuevo movimiento"} busy={save.isPending} onClose={onClose}>
    <form onSubmit={submit} className="space-y-5">
      <fieldset disabled={save.isPending} className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-type`} className={ledgerLabel}>Tipo de movimiento</label>
          <select id={`${id}-type`} className={ledgerField} value={type} onChange={(event) => {
            setType(event.target.value as MovementType); setCategoryId(""); setShopId(""); setDestinationAmount("");
          }}>
            {(Object.entries(movementLabels) as [MovementType, string][]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-account`} className={ledgerLabel}>{isTransfer ? "Cuenta de origen" : "Cuenta"}</label>
          <select required id={`${id}-account`} className={ledgerField} value={accountId} onChange={(event) => {
            const next = accounts.find((item) => String(item.id) === event.target.value);
            if (next?.currencyCode !== account?.currencyCode) setAmount("");
            setAccountId(event.target.value); setDestinationAmount("");
            if (event.target.value === destinationId) setDestinationId("");
          }}>
            <option value="">Seleccionar cuenta</option>
            {accounts.map((item) => <option key={item.id} value={item.id} disabled={!item.isActive}>{item.name} · {item.currencyCode}{!item.isActive ? " · inactiva" : ""}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-amount`} className={ledgerLabel}>Importe {currency ? `· ${currency.code}` : ""}</label>
          <input required id={`${id}-amount`} inputMode="decimal" autoComplete="off" className={ledgerField} value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={currency?.decimalPlaces === 0 ? "0" : "0,00"} aria-describedby={`${id}-precision`} />
          <p id={`${id}-precision`} className="mt-2 font-mono text-[10px] text-muted">{currency ? `${currencyDecimals(currency)} decimales. ` : ""}Sin separadores de miles.</p>
        </div>
        {isTransfer && <>
          <div>
            <label htmlFor={`${id}-destination`} className={ledgerLabel}>Cuenta de destino</label>
            <select required id={`${id}-destination`} className={ledgerField} value={destinationId} onChange={(event) => { setDestinationId(event.target.value); setDestinationAmount(""); }}>
              <option value="">Seleccionar destino</option>
              {accounts.filter((item) => item.id !== account?.id).map((item) => <option key={item.id} value={item.id} disabled={!item.isActive}>{item.name} · {item.currencyCode}{!item.isActive ? " · inactiva" : ""}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-destination-amount`} className={ledgerLabel}>Importe recibido {destinationCurrency ? `· ${destinationCurrency.code}` : ""}</label>
            <input id={`${id}-destination-amount`} required={!!differentCurrency} disabled={!differentCurrency} inputMode="decimal" autoComplete="off" className={ledgerField}
              value={differentCurrency ? destinationAmount : destination ? amount : ""} onChange={(event) => setDestinationAmount(event.target.value)} aria-describedby={`${id}-transfer-help`} />
          </div>
          <p id={`${id}-transfer-help`} className="font-mono text-[11px] leading-relaxed text-muted sm:col-span-2">
            {differentCurrency ? `Ingresá explícitamente lo recibido en ${destinationCurrency?.code ?? "destino"} (${destinationCurrency?.decimalPlaces ?? "—"} decimales). No se calcula ni aplica un tipo de cambio.` : "Entre cuentas de la misma moneda, el importe recibido es idéntico al enviado."} Una transferencia guarda ambos lados como un único movimiento lógico.
          </p>
        </>}
        <div>
          <label htmlFor={`${id}-date`} className={ledgerLabel}>Fecha</label>
          <input required type="date" id={`${id}-date`} className={ledgerField} value={date} onChange={(event) => setDate(event.target.value)} />
        </div>
        {hasCategories && <div>
          <label htmlFor={`${id}-category`} className={ledgerLabel}>Categoría</label>
          <select id={`${id}-category`} className={ledgerField} value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            <option value="">Sin categoría</option>
            {unavailableCategory && <option value={unavailableCategory.id} disabled>{unavailableCategory.name} · no disponible</option>}
            {categoryId && !categories.some((item) => String(item.id) === categoryId) && <option value={categoryId} disabled>Categoría #{categoryId} · no disponible</option>}
            {eligibleCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>}
        {type === "expense" && <div className="sm:col-span-2">
          <label htmlFor={`${id}-shop`} className={ledgerLabel}>Comercio</label>
          <select id={`${id}-shop`} className={ledgerField} value={shopId} onChange={(event) => setShopId(event.target.value)}>
            <option value="">Sin comercio</option>
            {shopId && !shops.some((item) => String(item.id) === shopId) && <option value={shopId} disabled>Comercio #{shopId} · no disponible</option>}
            {shops.map((item) => <option key={item.id} value={item.id}>{item.name}{item.address ? ` · ${item.address}` : ""}</option>)}
          </select>
        </div>}
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-description`} className={ledgerLabel}>Descripción</label>
          <input id={`${id}-description`} className={ledgerField} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="¿Qué registraste?" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-notes`} className={ledgerLabel}>Notas</label>
          <textarea id={`${id}-notes`} rows={3} className={`${ledgerField} resize-y`} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Referencia, contexto o detalles adicionales" />
        </div>
      </fieldset>
      {!accountAvailable && <p role="status" className="font-mono text-xs text-muted">Elegí una cuenta activa con moneda disponible. Si no tenés una, creala en Cuentas.</p>}
      {type === "initial_balance" && <p className="font-mono text-xs leading-relaxed text-muted">El saldo inicial aumenta el saldo de la cuenta, pero no se considera un ingreso en Analítica.</p>}
      {(validationError ?? save.error) != null && <LedgerError error={validationError ?? save.error} />}
      <footer className="flex flex-wrap justify-end gap-3 border-t border-primary/15 pt-5">
        <button type="button" className={ledgerSecondary} disabled={save.isPending} onClick={onClose}>Cancelar</button>
        <button type="submit" className={ledgerPrimary} disabled={save.isPending || !accountAvailable || !destinationAvailable}>{save.isPending ? "Guardando…" : movement ? "Guardar cambios" : "Crear movimiento"}</button>
      </footer>
    </form>
  </LedgerDialog>;
}
