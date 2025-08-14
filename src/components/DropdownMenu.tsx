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
  const [renderAbove, setRenderAbove] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    function checkPosition() {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setRenderAbove(spaceBelow < 220); // 220px is estimated menu height
      }
    }

    checkPosition();
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", checkPosition);
    window.addEventListener("scroll", checkPosition, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", checkPosition);
      window.removeEventListener("scroll", checkPosition, true);
    };
  }, [isMenuOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="px-3 py-2 transition-opacity rounded-md opacity-0 hover:bg-white/10 group-hover:opacity-100 text-neutral-400 hover:text-white"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            transition={{ duration: 0.1 }}
            initial={{ opacity: 0, y: renderAbove ? -20 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: renderAbove ? -20 : 20 }}
            className={`absolute min-w-48 bg-black *:py-1 *:px-4 *:rounded p-1 border rounded-md border-neutral-800
              ${renderAbove ? "bottom-full mb-2" : "top-full mt-2"} -right-1/2`}
          >
            <button className="flex items-center w-full text-neutral-300 gap-x-2 hover:bg-neutral-900 hover:text-white">
              <Plus className="w-3 h-3" />
              Add amount
            </button>
            <button className="flex items-center w-full text-neutral-300 gap-x-2 hover:bg-neutral-900 hover:text-white">
              <Minus className="w-3 h-3" />
              Subtract amount
            </button>
            <button className="flex items-center w-full text-neutral-300 gap-x-2 hover:bg-neutral-900 hover:text-white">
              <Eye className="w-3 h-3" />
              History
            </button>
            <button className="flex items-center w-full text-neutral-300 gap-x-2 hover:bg-neutral-900 hover:text-white">
              <Edit className="w-3 h-3" />
              Edit
            </button>
            <button className="flex items-center w-full text-red-400 gap-x-2 hover:bg-neutral-900 hover:text-red-300">
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}