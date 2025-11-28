import { Maximize, Minimize, X } from "lucide-react";
import Image from "next/image";

export default function Titlebar() {
  return (
    <div className="h-8 bg-transparent px-2 select-none flex items-center fixed left-0 right-0 top-0 z-30">
      <div className="w-fit flex items-center gap-x-2">
        <Image
          className="invert"
          src="/orbit-logo.png"
          alt="Logo"
          width={32}
          height={32}
        />
        <p className="text-white">Orbit</p>
      </div>
      <div className="grow h-full" data-tauri-drag-region></div>
      <div className="flex gap-x-4">
        <button
          id="titlebar-minimize"
          className="appearance-none inline-flex justify-center items-center w-6 h-6 bg-transparent hover:bg-white/10 rounded transition-all hover:text-neutral-50 text-neutral-300 active:scale-90 hover:scale-110"
          title="minimize"
        >
          <Minimize className="w-4 h-4" />
        </button>
        <button
          id="titlebar-maximize"
          title="maximize"
          className="appearance-none inline-flex justify-center items-center w-6 h-6 bg-transparent hover:bg-white/10 rounded transition-all hover:text-neutral-50 text-neutral-300 active:scale-90 hover:scale-110"
        >
          <Maximize className="w-4 h-4" />
        </button>
        <button
          id="titlebar-close"
          title="close"
          className="appearance-none inline-flex justify-center items-center w-6 h-6 bg-transparent hover:bg-red-500/10 rounded transition-all hover:text-red-500 text-neutral-300 active:scale-90 hover:scale-110"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
