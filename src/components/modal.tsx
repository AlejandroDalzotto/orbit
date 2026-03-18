import { X } from "lucide-react";
import styles from "./modal.module.css";
import { useEffect } from "react";

export default function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  // listen to Esc key to close modal.
  useEffect(() => {
    const handleKeyEvent = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyEvent);
    return () => {
      document.removeEventListener("keydown", handleKeyEvent);
    };
  }, [onClose]);

  return (
    <div className={styles.modal_overlay + " inset-0 overflow-hidden z-30 fixed bg-neutral-950/20 backdrop-blur-xs grid place-content-center"}>
      <div className={styles.modal_content + " relative p-6 min-w-xs w-md bg-white h-auto rounded-lg border border-neutral-200 shadow-lg"}>
        <div className="absolute top-4 right-4 aspect-square w-6">
          <button onClick={onClose} className="cursor-pointer hover:text-red-500">
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
