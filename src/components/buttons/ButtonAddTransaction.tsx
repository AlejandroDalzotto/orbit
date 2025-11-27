"use client";

import { useModal } from "@/context/modal-provider";
import { Plus } from "lucide-react";
import ModalAddTransaction from "../modals/ModalAddTransaction";
import { useWalletStore } from "@/stores/walletStore";

interface Props {
  text: string;
}

export default function ButtonAddTransaction({ text }: Props) {
  const { open } = useModal();
  const accountCount = useWalletStore((state) => state.accountCount);

  const isDisabled = accountCount === 0;

  return (
    <button
      disabled={isDisabled}
      onClick={() => {
        open(<ModalAddTransaction />);
      }}
      className="flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs h-9 px-4 py-2 has-[>svg]:px-3 bg-white text-black hover:bg-neutral-200 font-mono"
    >
      <Plus className="w-4 h-4" />
      {isDisabled ? "You need to create an account first" : text}
    </button>
  );
}
