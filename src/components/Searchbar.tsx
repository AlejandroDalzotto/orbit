"use client";

import { useTransactionStore } from "@/stores/transactionStore";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface SearchbarProps {
  placeholder?: string;
  className?: string;
}

export default function Searchbar({
  placeholder = "search transactions...",
  className = "",
}: SearchbarProps) {
  // context search value and setter
  const searchQuery = useTransactionStore((state) => state.searchQuery);
  const setSearchQuery = useTransactionStore((state) => state.setSearchQuery);

  // local input state (controlled input)
  const [input, setInput] = useState<string>(searchQuery);

  // remember the last value we explicitly sent to context to avoid treating
  // our own update as an external change
  const lastSentRef = useRef<string | null>(null);

  // debounced value of the local input
  const debouncedInput = useDebounce(input, 300);

  // When the debounced input changes, push it to the context only if it
  // differs from the current context value. Record what we sent so the
  // following sync effect can ignore that change.
  useEffect(() => {
    if (debouncedInput !== searchQuery) {
      setSearchQuery(debouncedInput);
      lastSentRef.current = debouncedInput;
    }
    // only depend on debouncedInput and context setter/value
  }, [debouncedInput, searchQuery, setSearchQuery]);

  const clearSearch = () => {
    setInput("");
    setSearchQuery("");
    lastSentRef.current = "";
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-neutral-600" />
      <input
        type="text"
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full py-1 pl-10 pr-10 font-mono text-white transition-all bg-black border rounded-md outline-none focus:ring-neutral-800 ring-2 ring-transparent border-neutral-800 placeholder:text-neutral-600"
      />

      {input && (
        <button
          onClick={clearSearch}
          aria-label="Clear search"
          className="absolute transition-colors transform -translate-y-1/2 right-3 top-1/2 text-neutral-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
