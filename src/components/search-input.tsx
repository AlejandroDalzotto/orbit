import { Search } from "lucide-react";
import { InputHTMLAttributes } from "react";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export function SearchInput({ containerClassName = "", className = "", ...props }: SearchInputProps) {
  return (
    <div className={`relative bg-neutral-100 group ${containerClassName}`}>
      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-neutral-400" />
      </span>

      <input className={`pl-10 pr-3 py-3 text-sm w-full bg-transparent focus:outline-none peer ${className}`} {...props} />

      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-neutral-500 transition-all duration-300 group-hover:w-full peer-focus:w-full peer-focus:h-1" />
    </div>
  );
}
