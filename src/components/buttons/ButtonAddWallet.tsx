"use client";

import { useModal } from "@/context/modal-provider";
import ModalAddWallet from "@/components/modals/ModalAddWallet";
import { Plus } from "lucide-react";

export default function ButtonAddWallet({
  text = 'Add account'
}: {
  text: string
}) {

  const { open } = useModal()

  return (
    <button
      onClick={() => open(
        <ModalAddWallet />
      )}
      className="flex items-center px-3 py-1 transition-colors border rounded-md gap-x-2 border-neutral-600 text-neutral-600 hover:text-neutral-50 hover:bg-white/20"
    >
      <Plus className="w-4 h-4" />
      {text}
    </button>
  )
}
