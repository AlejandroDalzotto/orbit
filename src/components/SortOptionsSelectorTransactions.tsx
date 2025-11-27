import {
  TransactionSortOption,
  useTransactionStore,
} from "@/stores/transactionStore";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface Props {
  shouldRender: boolean;
}

export default function SortOptionsSelectorTransactions({
  shouldRender,
}: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const sortBy = useTransactionStore((state) => state.sortBy);
  const changeSorting = useTransactionStore((state) => state.setSortBy);

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const sortOptions: { value: TransactionSortOption; label: string }[] = [
    { value: "mostExpensive" as const, label: "Highest Balance" },
    { value: "cheapest" as const, label: "Lowest Balance" },
    { value: "oldest" as const, label: "Oldest" },
    { value: "latest" as const, label: "Most Recent" },
    { value: "income" as const, label: "Income only" },
    { value: "expenses" as const, label: "Expenses only" },
  ];

  return (
    <>
      {shouldRender && (
        <AnimatePresence>
          <div className="flex items-center space-x-2">
            <p className="text-xs text-neutral-500">sort by</p>
            <div className="relative w-3xs" ref={menuRef}>
              <button
                ref={buttonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-full px-3 py-2 pr-8 font-mono text-sm font-light text-left transition-colors bg-black border rounded-md appearance-none cursor-pointer border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white focus:outline-none focus:ring-1 focus:ring-neutral-700"
              >
                {sortOptions.find((option) => option.value === sortBy)?.label}
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <motion.div
                    animate={{ rotate: isMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-3 h-3 text-neutral-400" />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 z-50 mt-1 bg-black border rounded-md shadow-lg top-full border-neutral-800"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          // update route path
                          changeSorting(option.value);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm font-mono font-light transition-colors first:rounded-t-md last:rounded-b-md ${
                          sortBy === option.value
                            ? "bg-neutral-900 text-white"
                            : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </AnimatePresence>
      )}
    </>
  );
}
