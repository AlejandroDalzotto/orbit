import type { Account } from "@/models/wallet";
import { motion } from "motion/react";
import DropdownMenu from "./DropdownMenu";
import DropdownMenuButton from "./buttons/DropdownMenuButton";
import { Edit, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ModalAllTransantionsByAccount from "./modals/ModalAllTransactionsByAccount";
import ModalEditWallet from "./modals/ModalEditWallet";
import { useModal } from "@/context/modal-provider";
import { useWalletStore } from "@/stores/walletStore";
import { useConfirmModal } from "@/hooks/useConfirmationModal";

export default function AccountCard({
  account,
  animationDelay,
}: {
  account: Account;
  animationDelay: number;
}) {
  const { open } = useModal();
  const { confirm } = useConfirmModal();
  const removeAccount = useWalletStore((state) => state.removeAccount);

  return (
    <motion.div
      key={account.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animationDelay }}
      className="flex items-center justify-between px-0 py-6 transition-colors border-b group border-neutral-900 hover:border-neutral-800"
    >
      <div className="flex-1">
        <div className="flex items-center space-x-4">
          <div className="w-2 h-2 rounded-full bg-neutral-600" />
          <div>
            <h3 className="font-light tracking-wide text-white">
              {account.name}
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              {account.type} • {account.currency} • {account.transactionsCount}{" "}
              transactions
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="text-right">
          <p className="font-light text-white">
            $
            {account.balance.toLocaleString(
              account.currency === "USD" ? "en-US" : "es-AR",
              { minimumFractionDigits: 2 },
            )}
          </p>
        </div>

        {/* Dropdown menu */}
        <DropdownMenu>
          {({ close }) => (
            <>
              <DropdownMenuButton
                text="Transactions"
                color="neutral"
                icon={<Eye className="w-3 h-3" />}
                onClick={async () => {
                  close();
                  open(<ModalAllTransantionsByAccount account={account} />);
                }}
              />
              <DropdownMenuButton
                text="Edit"
                color="neutral"
                icon={<Edit className="w-3 h-3" />}
                onClick={() => {
                  close();
                  open(<ModalEditWallet account={account} />);
                }}
              />
              <DropdownMenuButton
                text="Delete"
                color="red"
                icon={<Trash2 className="w-3 h-3" />}
                onClick={async () => {
                  const isConfirmed = await confirm({
                    variant: "danger",
                    message:
                      "Are you sure you want to delete this account? All associated records will be marked as belonging to an “unknown” account.",
                    title: "Delete Account Permanently",
                    confirmText: "Confirm",
                    cancelText: "Cancel",
                  });

                  if (isConfirmed) {
                    // close the menu immediately so UI feels responsive
                    close();

                    const [error, response] = await removeAccount(account.id);

                    if (error) {
                      toast.error(`Error deleting account: ${error.message}`);

                      return;
                    }

                    toast.success(response);
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
