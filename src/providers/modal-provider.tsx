import { useEffect } from "react";
import { useModalStore } from "../stores/modal-store";
import { X } from "lucide-react";
import styles from "./modal.module.css";

export function ModalProvider() {
  const modal = useModalStore((state) => state.modal);
  const close = useModalStore((state) => state.close);
  const isOpen = Boolean(modal);

  // listen to Esc key to close modal.
  useEffect(() => {
    const handleKeyEvent = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", handleKeyEvent);
    return () => {
      document.removeEventListener("keydown", handleKeyEvent);
    };
  }, []);

  return (
    <>
      {isOpen ? (
        <div className={styles.modal_overlay + " inset-0 overflow-hidden z-30 fixed bg-neutral-950/20 backdrop-blur-xs grid place-content-center"}>
          <div className={styles.modal_content + " relative w-2xl p-6 min-w-xs bg-white h-auto rounded-lg border border-neutral-200 shadow-lg"}>
            <div className="absolute top-4 right-4 aspect-square w-6">
              <button onClick={close} className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            {modal}
          </div>
          <footer className={styles.modal_footer_text + " mt-4"}>
            <p className="text-sm select-none font-mono text-center">
              podes apretar <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd> para cerrar el modal
            </p>
          </footer>
        </div>
      ) : null}
    </>
  );
}
