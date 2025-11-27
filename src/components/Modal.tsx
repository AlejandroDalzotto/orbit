import { useModal } from "@/context/modal-provider";
import { X } from "lucide-react";

interface ModalProps {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export const Modal = ({
  title,
  children,
  footer,
  showCloseButton = true,
  maxWidth = "md",
}: ModalProps) => {
  const { close } = useModal();

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div
      className={`bg-black text-white rounded shadow-lg border border-neutral-700 w-full ${maxWidthClasses[maxWidth]} overflow-hidden`}
    >
      {/* Header */}
      {(title || showCloseButton) && (
        <div className="flex items-center justify-between p-4">
          {title ? <h2 className="text-xl font-semibold">{title}</h2> : null}
          {showCloseButton && (
            <button
              onClick={close}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6">{children}</div>

      {/* Footer */}
      {footer ? (
        <div className="flex items-center justify-end gap-3 p-4">{footer}</div>
      ) : null}
    </div>
  );
};
