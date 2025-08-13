"use client";

import { Account } from "@/lib/definitions";
import { Edit, MoreHorizontal, Trash2, Eye, Plus, Minus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, useRef, useEffect } from "react";

export default function DropdownMenu({
  account
}: {
  account: Account
}) {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="px-3 py-2 transition-opacity rounded-md opacity-0 hover:bg-white/10 group-hover:opacity-100 text-neutral-400 hover:text-white"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            transition={{ duration: 0.1 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bg-black *:py-1 *:px-4 *:rounded p-1 border rounded-md -right-1/2 top-full border-neutral-800"
          >
            <button
              // onClick={() => openEditDialog(account)}
              className="flex items-center w-full text-neutral-300 gap-x-2 hover:bg-neutral-900 hover:text-white"
            >
              <Plus className="w-3 h-3" />
              Add amount
            </button>
            <button
              // onClick={() => openEditDialog(account)}
              className="flex items-center w-full text-neutral-300 gap-x-2 hover:bg-neutral-900 hover:text-white"
            >
              <Minus className="w-3 h-3" />
              Subtract amount
            </button>
            <button
              // onClick={() => openEditDialog(account)}
              className="flex items-center w-full text-neutral-300 gap-x-2 hover:bg-neutral-900 hover:text-white"
            >
              <Eye className="w-3 h-3" />
              History
            </button>
            <button
              // onClick={() => openEditDialog(account)}
              className="flex items-center w-full text-neutral-300 gap-x-2 hover:bg-neutral-900 hover:text-white"
            >
              <Edit className="w-3 h-3" />
              Edit
            </button>
            <button
              // onClick={() => openDeleteDialog(account)}
              className="flex items-center w-full text-red-400 gap-x-2 hover:bg-neutral-900 hover:text-red-300"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}