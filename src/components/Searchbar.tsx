"use client"

import { Search, X } from "lucide-react"
import { useState, useEffect } from "react"

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface SearchbarProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export default function Searchbar({
  onSearch,
  placeholder = "search transactions...",
  className = "",
}: SearchbarProps) {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    onSearch(debouncedSearch)
  }, [debouncedSearch, onSearch])

  const clearSearch = () => {
    setSearch("")
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600 h-4 w-4" />
      <input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-10 pr-10 py-1 rounded-md border outline-none focus:ring-neutral-800 ring-2 ring-transparent transition-all bg-black border-neutral-800 text-white font-mono placeholder:text-neutral-600 w-full"
      />

      {search && (
        <button
          onClick={clearSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}