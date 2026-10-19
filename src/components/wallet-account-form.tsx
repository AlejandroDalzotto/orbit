import { useId, useState, type FormEvent } from "react";
import { useCreateAccount, useUpdateAccount } from "../hooks/use-accounts";
import { useLedgerCurrencies } from "../hooks/use-movements";
import type { Account } from "../types/generated/Account";
import { LedgerDialog } from "./ledger-ui";
import { errorMessage, formatMinor, minorToInput } from "./ledger-utils";
import { accountTypeLabels, isAccountType, parseInitialBalance } from "./wallet-utils";
import { WalletError, WalletField, walletField, walletLabel, walletPrimary, walletSecondary } from "./wallet-ui";

export type WalletAccountFormProps = {
  account?: Account;
  onClose: () => void;
  onSaved?: (account: Account) => void;
};

export function WalletAccountForm({ account, onClose, onSaved }: WalletAccountFormProps) {
  const id = useId();
  const create = useCreateAccount();
  const update = useUpdateAccount();
  const currencyQuery = useLedgerCurrencies();
  const currencies = currencyQuery.data ?? [];
  const availableCurrencies = currencies.filter((item) => item.isActive);
  const [name, setName] = useState(account?.name ?? "");
  const [kind, setKind] = useState(account?.accountType ?? "checking");
  const [currencyCode, setCurrencyCode] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [description, setDescription] = useState(account?.description ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);
  const currency = account
      ? currencies.find((item) => item.code === account.currencyCode)
      : availableCurrencies.find((item) => item.code === (currencyCode || availableCurrencies[0]?.code));
  const mutation = account ? update : create;
  const busy = mutation.isPending;
  const canSubmit = !!account || (!currencyQuery.isPending && !currencyQuery.isError && !!currency);
  const error = validationError ?? mutation.error;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setValidationError(null);
    mutation.reset();
    try {
      if (!name.trim()) throw new Error("Ingresá un nombre para la cuenta.");
      if (!isAccountType(kind)) throw new Error("Elegí un tipo de cuenta compatible.");
      const entry = { name: name.trim(), accountType: kind, description: description.trim() || null };
      let saved: Account;
      if (account) {
        saved = await update.mutateAsync({ id: account.id, entry });
      } else {
        if (!currency || !canSubmit) throw new Error("Elegí una moneda del catálogo disponible.");
        saved = await create.mutateAsync({ ...entry, currencyCode: currency.code, initialBalance: parseInitialBalance(openingBalance, currency) });
      }
      if (onSaved) onSaved(saved);
      else onClose();
    } catch (cause) {
      setValidationError(errorMessage(cause));
    }
  }

  return <LedgerDialog title={account ? "Editar cuenta" : "Nueva cuenta"} onClose={onClose} busy={busy}>
    <form onSubmit={submit} className="space-y-6 text-primary" aria-busy={busy} aria-describedby={error ? `${id}-error` : undefined}>
      <p className="font-mono text-xs leading-relaxed text-muted">{account ? "Actualizá sus datos. El saldo se modifica desde el libro de movimientos, no desde esta ficha." : "Un lugar para tu dinero. Elegí su moneda y, si hace falta, registrá el saldo con el que empezás."}</p>
      {!account && currencyQuery.isError && <WalletError error={currencyQuery.error} retry={() => void currencyQuery.refetch()} />}
      {!account && currencyQuery.isPending && <p role="status" className="font-mono text-xs text-muted">Cargando monedas…</p>}
      {!account && currencyQuery.isSuccess && !availableCurrencies.length && <WalletError error="No hay monedas activas disponibles. Revisá el catálogo e intentá de nuevo." retry={() => void currencyQuery.refetch()} />}
      <fieldset disabled={busy} className="space-y-5">
        <WalletField label="Nombre de la cuenta">
          <input autoFocus required autoComplete="off" className={walletField} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Mi cuenta principal" />
        </WalletField>
        <div className="grid gap-5 sm:grid-cols-2">
          <WalletField label="Tipo de cuenta">
            <select className={walletField} value={kind} onChange={(event) => setKind(event.target.value)}>
              {!isAccountType(kind) && <option value={kind} disabled>{kind} · elegí un tipo compatible</option>}
              {Object.entries(accountTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </WalletField>
          <WalletField label={account ? "Moneda · no editable" : "Moneda"}>
            {account ? <input className={walletField} value={account.currencyCode} readOnly /> : <select required disabled={!availableCurrencies.length || currencyQuery.isError} className={walletField} value={currency?.code ?? ""} onChange={(event) => { setCurrencyCode(event.target.value); setOpeningBalance(""); }}>
              {!availableCurrencies.length && <option value="">Sin monedas activas</option>}
              {availableCurrencies.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.name}</option>)}
            </select>}
          </WalletField>
        </div>
        {!account && <div className="border-t border-primary/[0.14] pt-5">
          <label className="block"><span className={walletLabel}>Saldo inicial · opcional</span>
            <input type="text" inputMode="decimal" autoComplete="off" className={walletField} value={openingBalance} onChange={(event) => setOpeningBalance(event.target.value)} disabled={!currency || currencyQuery.isError} placeholder={currency ? minorToInput(0, currency) : "0"} aria-describedby={`${id}-balance-help`} />
          </label>
          <p id={`${id}-balance-help`} className="mt-2 font-mono text-[10px] leading-relaxed text-muted">{currency ? `${currency.code} · ${currency.decimalPlaces} decimales. ` : ""}Importe no negativo, sin separadores de miles. Vacío o cero no crea un movimiento. Un saldo positivo se registra hoy como saldo inicial, no como ingreso.</p>
        </div>}
        {account && <div className="border-y border-primary/[0.14] py-4"><span className={walletLabel}>Saldo actual · solo lectura</span><p className="break-words font-display text-3xl tabular-nums">{formatMinor(account.balance, account.currencyCode, currencies)}</p></div>}
        <WalletField label="Descripción · opcional">
          <textarea rows={3} className={`${walletField} resize-y`} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Lo que quieras recordar sobre esta cuenta…" />
        </WalletField>
      </fieldset>
      {error != null && <div id={`${id}-error`}><WalletError error={error} /></div>}
      <footer className="flex flex-wrap justify-end gap-3 border-t border-primary/[0.14] pt-5">
        <button type="button" className={walletSecondary} disabled={busy} onClick={onClose}>Cancelar</button>
        <button type="submit" className={walletPrimary} disabled={busy || !canSubmit}>{busy ? "Guardando…" : account ? "Guardar cambios" : "Crear cuenta"}</button>
      </footer>
    </form>
  </LedgerDialog>;
}
