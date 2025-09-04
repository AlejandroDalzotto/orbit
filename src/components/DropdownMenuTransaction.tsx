"use client";

import DropdownMenuButton from "@/components/buttons/DropdownMenuButton";
import ModalEditTransaction from "@/components/modals/ModalEditTransaction";
import { useModal } from "@/context/modal-provider";
import { useTransactions } from "@/hooks/useTransactions";
import { useTransactionsFinancialSummary } from "@/hooks/useTransactionsFinancialSummary";
import { Transaction } from "@/models/transaction";
import { TransactionService } from "@/services/transaction";
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ModalTransactionInformation from "./modals/ModalTransactionInformation";

export default function DropdownMenuTransaction({
  transaction
}: {
  transaction: Transaction
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [renderAbove, setRenderAbove] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const service = new TransactionService();
  const { mutate: mutateTransactions } = useTransactions({ limit: 50, offset: 0 });
  const { mutate: mutateFinancialSummary } = useTransactionsFinancialSummary();
  const { open } = useModal();

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
            className={`absolute z-20 min-w-48 bg-black *:py-1 *:px-4 *:rounded p-1 border rounded-md border-neutral-800
              ${renderAbove ? "bottom-full mb-2" : "top-full mt-2"} -right-1/2`}
          >
            <DropdownMenuButton
              text="View information"
              color="neutral"
              icon={<Eye className="w-3 h-3" />}
              onClick={() => {
                setIsMenuOpen(false);
                open(
                  <ModalTransactionInformation transaction={transaction} />
                )
              }}
            />
            <DropdownMenuButton
              text="Edit"
              color="neutral"
              icon={<Edit className="w-3 h-3" />}
              onClick={() => {
                setIsMenuOpen(false);
                open(<ModalEditTransaction transaction={transaction} />)
              }}
            />
            <DropdownMenuButton
              text="Delete"
              color="red"
              icon={<Trash2 className="w-3 h-3" />}
              onClick={() => {
                if (confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
                  service.deleteTransaction(transaction.id).then(([error,]) => {
                    if (error) {
                      toast.error(`Error deleting account: ${error.msg}`);
                    } else {
                      mutateTransactions();
                      mutateFinancialSummary();
                      toast.success(`Transaction deleted successfully.`);
                    }
                  });
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

