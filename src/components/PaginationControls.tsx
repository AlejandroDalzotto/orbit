"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPageNumbers } from "@/lib/utils";
import { useTransactionStore } from "@/stores/transactionStore";

type Props = {
  className?: string;
  /**
   * Optional override to force showing/hiding the "go to" input.
   * If omitted, the component will use the value from the pagination context.
   */
  showGoTo: boolean;
};

export default function PaginationControls({
  className = "",
  showGoTo,
}: Props) {
  const [pageInput, setPageInput] = useState<string>("");

  const currentPage = useTransactionStore((state) => state.currentPage);
  const totalPages = useTransactionStore((state) => state.totalPages);
  const navigateTo = useTransactionStore((state) => state.navigateTo);
  const goPreviousPage = useTransactionStore((state) => state.previousPage);
  const goNextPage = useTransactionStore((state) => state.nextPage);
  const hasNext = useTransactionStore((state) => state.hasNext);
  const hasPrevious = useTransactionStore((state) => state.hasPrevious);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = Number.parseInt(pageInput);
    if (!isNaN(page) && page >= 1 && page <= Math.max(1, totalPages)) {
      navigateTo(page);
      setPageInput("");
    }
  };

  const changePage = (page: number) => {
    if (page < 1 || page > Math.max(1, totalPages)) return;
    navigateTo(page);
  };

  return (
    <div className={`flex items-center w-full justify-between ${className}`}>
      {showGoTo ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="font-mono text-xs text-neutral-500">go to</span>
          <input
            max={totalPages}
            min={1}
            type="number"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            placeholder="page..."
            className="w-24 px-2 py-1 font-mono text-sm bg-black border rounded border-neutral-800 text-neutral-400 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700"
          />
        </form>
      ) : null}

      <div className="flex items-center gap-2">
        <button
          onClick={() => void goPreviousPage()}
          disabled={!hasPrevious}
          className="p-2 transition-colors text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers(currentPage, totalPages).map((page, index) => (
            <div key={index}>
              {page === "..." ? (
                <span className="px-2 font-mono text-sm select-none text-neutral-600">
                  ...
                </span>
              ) : (
                <button
                  onClick={() => changePage(page as number)}
                  className={`px-3 select-none py-1 text-sm font-mono rounded transition-colors ${
                    currentPage === page
                      ? "bg-white text-black"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => goNextPage()}
          disabled={!hasNext}
          className="p-2 transition-colors text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
