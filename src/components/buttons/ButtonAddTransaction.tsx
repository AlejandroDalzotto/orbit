"use client";

import { useModal } from '@/context/modal-provider';
import { Plus } from 'lucide-react'
import ModalAddTransaction from '../modals/ModalAddTransaction';

export default function ButtonAddTransaction({ text }: { text: string }) {
  const { open } = useModal()

  return (
    <button
      onClick={() => {
        open(
          <ModalAddTransaction />
        )
      }}
      className='flex items-center px-3 py-1 bg-white transition-colors border rounded-md gap-x-2 border-white text-black hover:bg-transparent hover:text-white'>
      <Plus className="w-4 h-4" />
      {text}
    </button>
  )
}
