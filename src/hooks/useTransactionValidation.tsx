// hooks/useTransactionValidation.ts
import { invoke } from "@tauri-apps/api/core";
import { useConfirmModal } from "@/hooks/useConfirmationModal";
import { ItemRef } from "@/models/transaction";

interface ItemLimitWarning {
  itemId: string;
  itemName: string;
  limitType: "money" | "quantity";
  limit: number;
  current: number;
  exceeded: number;
}

export const useTransactionValidation = () => {
  const { confirm } = useConfirmModal();

  const checkLimits = async (items: ItemRef[]) => {
    return await invoke<ItemLimitWarning[]>("check_items_limits", { items });
  };

  const confirmOverride = async (warnings: ItemLimitWarning[]) => {
    return await confirm({
      title: "⚠️ The limit has been exceeded",
      variant: "warning",
      confirmText: "Continue anyway",
      cancelText: "Cancel",
      message: (
        <div className="space-y-3">
          <p>The following items exceed their configured limit:</p>
          <ul className="space-y-2 mt-3">
            {warnings.map((w) => (
              <li
                key={w.itemId}
                className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
              >
                <div className="font-semibold text-gray-900 dark:text-white">
                  {w.itemName}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {w.limitType === "money" ? (
                    <>
                      Limit: ${w.limit.toFixed(2)} | Current: $
                      {w.current.toFixed(2)} | Exceeded: $
                      {w.exceeded.toFixed(2)}
                    </>
                  ) : (
                    <>
                      Limit: {w.limit} units | Current: {w.current} units |
                      Exceeded: {w.exceeded} units
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Do you want to continue with the transaction anyway?
          </p>
        </div>
      ),
    });
  };

  return { checkLimits, confirmOverride };
};
