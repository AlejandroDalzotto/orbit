import { renderSpecificInformation } from "@/helpers/render-specific-information";
import { Transaction, TransactionType } from "@/models/transaction";
import { Calendar, Edit, Eye, Trash2, Wallet2 } from "lucide-react";
import { motion } from "motion/react";
import DropdownMenu from "./DropdownMenu";
import DropdownMenuButton from "./buttons/DropdownMenuButton";
import ModalTransactionInformation from "./modals/ModalTransactionInformation";
import ModalEditTransaction from "./modals/ModalEditTransaction";
import { toast } from "sonner";
import { useModal } from "@/context/modal-provider";
import { useWalletStore } from "@/stores/walletStore";
import { useTransactionStore } from "@/stores/transactionStore";
import { useConfirmModal } from "@/hooks/useConfirmationModal";

interface CardProps {
  transaction: Transaction;
  animationDelay: number;
}

export default function TransactionCard({
  transaction,
  animationDelay,
}: CardProps) {
  // Dropdown menu is controlled per-instance via the DropdownMenu render prop.
  const { open } = useModal();
  const { confirm } = useConfirmModal();
  const deleteTransaction = useTransactionStore(
    (state) => state.deleteTransaction,
  );

  const searchQuery = useTransactionStore((state) => state.searchQuery);
  const accounts = useWalletStore((state) => state.accounts);

  const updateValuesOnTransactionRemoved = useWalletStore(
    (state) => state.updateValuesOnTransactionRemoved,
  );

  if (!accounts) return null;

  const accountName =
    accounts.find((acc) => acc.id === transaction.accountId)?.name ??
    "unknown account";

  return (
    <motion.div
      key={transaction.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animationDelay }}
      className="flex items-center justify-between px-5 py-6 transition-colors border-b border-neutral-900 group hover:border-neutral-800"
    >
      <div className="flex-1">
        <div className="flex items-center space-x-4">
          <div className="w-2 h-2 rounded-full bg-neutral-600" />
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <h3 className="font-light tracking-wide text-white">
                {transaction.details
                  .split(new RegExp(`(${searchQuery})`, "gi"))
                  .map((part, i) =>
                    part.toLowerCase() === searchQuery.toLowerCase() ? (
                      <span key={i} className="bg-white/10">
                        {part}
                      </span>
                    ) : (
                      part
                    ),
                  )}
              </h3>
              <span className="px-2 text-sm lowercase border rounded border-neutral-700 text-neutral-500">
                {transaction.category}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-6">
              <p className="flex items-center text-sm gap-x-2 text-neutral-500">
                <Calendar className="w-3 h-3" />
                {new Date(transaction.date).toLocaleDateString("es-AR")}
              </p>
              <p className="flex items-center text-sm gap-x-2 text-neutral-500">
                <Wallet2 className="w-3 h-3" />
                {accountName}
              </p>
              {renderSpecificInformation(transaction)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="text-right">
          <p className="text-lg font-light text-white">
            {" "}
            {transaction.type === "income" ? "+" : "-"}$
            {transaction.amount.toLocaleString("es-AR", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>

        <DropdownMenu id={`transaction-${transaction.id}`}>
          {({ close }) => (
            <>
              <DropdownMenuButton
                text="View information"
                color="neutral"
                icon={<Eye className="w-3 h-3" />}
                onClick={() => {
                  close();
                  open(
                    <ModalTransactionInformation transaction={transaction} />,
                  );
                }}
              />
              <DropdownMenuButton
                text="Edit"
                color="neutral"
                icon={<Edit className="w-3 h-3" />}
                onClick={() => {
                  close();
                  open(<ModalEditTransaction transaction={transaction} />);
                }}
              />
              <DropdownMenuButton
                text="Delete"
                color="red"
                icon={<Trash2 className="w-3 h-3" />}
                onClick={async () => {
                  const isConfirmed = await confirm({
                    message:
                      "Are you sure you want to delete this transaction? This action cannot be undone.",
                    title: "Delete Transaction Permanently",
                    confirmText: "Confirm",
                    cancelText: "Cancel",
                    variant: "danger",
                  });
                  if (isConfirmed) {
                    // close immediately for responsive UI
                    close();

                    const [error, message] = await deleteTransaction(
                      transaction.id,
                    );
                    if (error) {
                      toast.error(error.message);
                    } else {
                      toast.success(message);
                      if (transaction.affectsBalance) {
                        updateValuesOnTransactionRemoved(
                          transaction.accountId,
                          transaction.amount,
                          transaction.type === TransactionType.Income,
                        );
                      }
                    }
                  }
                }}
              />
            </>
          )}
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
