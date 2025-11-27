import { Modal } from "@/components/Modal";
import { useModal } from "@/context/modal-provider";
import { AlertTriangle } from "lucide-react";

interface ConfirmOptions {
  title?: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export const useConfirmModal = () => {
  const { open, close } = useModal();

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      const {
        title = "Confirmar acción",
        message,
        confirmText = "Confirmar",
        cancelText = "Cancelar",
        variant = "warning",
      } = options;

      const variantStyles = {
        danger: "bg-red-600 hover:bg-red-700",
        warning: "bg-yellow-600 hover:bg-yellow-700",
        info: "bg-blue-600 hover:bg-blue-700",
      };

      const handleConfirm = () => {
        resolve(true);
        close();
      };

      const handleCancel = () => {
        resolve(false);
        close();
      };

      open(
        <Modal
          title={title}
          showCloseButton={false}
          footer={
            <>
              <button
                onClick={handleCancel}
                className="rounded-md hover:scale-110 active:scale-90 text-sm font-medium transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive shadow-xs h-9 px-4 py-2 font-mono text-neutral-300 border-neutral-300 bg-neutral-800"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`rounded-md hover:scale-110 active:scale-90 text-sm font-medium transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive shadow-xs h-9 px-4 py-2 font-mono ${variantStyles[variant]}`}
              >
                {confirmText}
              </button>
            </>
          }
        >
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle
                className={`
                  ${variant === "danger" ? "text-red-600" : ""}
                  ${variant === "warning" ? "text-yellow-600" : ""}
                  ${variant === "info" ? "text-blue-600" : ""}
                `}
                size={24}
              />
            </div>
            <div className="text-gray-700 dark:text-gray-300">
              {typeof message === "string" ? <p>{message}</p> : message}
            </div>
          </div>
        </Modal>,
      );
    });
  };

  return { confirm };
};
