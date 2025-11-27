"use client";

import { useDropdownMenu } from "@/context/dropdown-menu-provider";
import { MoreHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

interface DropdownMenuRenderProps {
  close: () => void;
}

interface DropdownMenuProps {
  /**
   * Children can be either:
   * - React nodes (JSX elements) — they'll be rendered as-is.
   * - A render function that receives an object with a `close` function:
   *     children = ({ close }) => <YourButtons onSomeAction={() => { close(); ... }} />
   *
   * The render function form is recommended when menu actions should close the menu
   * without reaching into the global dropdown context.
   */
  children:
    | React.ReactNode
    | ((props: DropdownMenuRenderProps) => React.ReactNode);
  /**
   * Optional id to identify this dropdown instance. If omitted, an internal unique id is generated.
   * Using a stable id allows external logic to control/open specific menus via the provider.
   */
  id?: string;
}

export default function DropdownMenu({ children, id }: DropdownMenuProps) {
  const { toggleMenu, closeMenu, isMenuOpen } = useDropdownMenu();
  const instanceIdRef = useRef<string>(
    id ?? `dropdown-${Math.random().toString(36).slice(2, 9)}`,
  );
  const instanceId = instanceIdRef.current;

  const [renderAbove, setRenderAbove] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const open = isMenuOpen(instanceId);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closeMenu(instanceId);
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
  }, [open, closeMenu, instanceId]);

  // Helper to render children. If a render function is provided, call it with the `close` API.
  // Otherwise, render children as-is. This avoids cloning elements or adding casts.
  const renderChildren = () => {
    const close = () => closeMenu(instanceId);

    if (typeof children === "function") {
      return (children as (props: DropdownMenuRenderProps) => React.ReactNode)({
        close,
      });
    }

    // Plain React nodes are returned as-is. Use the render-function form to receive `close`.
    return children as React.ReactNode;
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => toggleMenu(instanceId)}
        className="px-3 py-2 transition-opacity rounded-md opacity-0 hover:bg-white/10 group-hover:opacity-100 text-neutral-400 hover:text-white"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            transition={{ duration: 0.1 }}
            initial={{ opacity: 0, y: renderAbove ? -20 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: renderAbove ? -20 : 20 }}
            className={`absolute z-20 min-w-48 bg-black *:py-1 *:px-4 *:rounded p-1 border rounded-md border-neutral-800
              ${renderAbove ? "bottom-full mb-2" : "top-full mt-2"} -right-1/2`}
          >
            {renderChildren()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
