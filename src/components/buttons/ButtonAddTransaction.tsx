"use client";

import { useModal } from '@/context/modal-provider';
import { Plus } from 'lucide-react'
import ModalAddTransaction from '../modals/ModalAddTransaction';
import { useWalletAccounts } from '@/hooks/useWalletAccounts';

interface Props {
  text: string,
  onMutate: () => void,
}

export default function ButtonAddTransaction({ text, onMutate }: Props) {
  const { open } = useModal()
  const { isLoading, accounts } = useWalletAccounts()

  if (isLoading) return null

  // If there are no accounts registered in the system the user
  // shouldn't be able to register transactions sice you need
  // to specify an account when you create a transaction.
  const disabled = accounts.length === 0;

  return (
    <button
      disabled={disabled}
      onClick={() => {
        open(
          <ModalAddTransaction onMutateTransactions={onMutate} />
        )
      }}
      className="flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs h-9 px-4 py-2 has-[>svg]:px-3 bg-white text-black hover:bg-neutral-200 font-mono">
      <Plus className="w-4 h-4" />
      {text}
    </button>
  )
}
