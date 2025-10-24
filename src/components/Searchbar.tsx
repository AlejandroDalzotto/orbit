"use client"

import { Search, X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

interface SearchbarProps {
  placeholder?: string
  className?: string
}

export default function Searchbar({
  placeholder = "search transactions...",
  className = "",
}: SearchbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const initial = searchParams?.get("search") ?? ""
  const [search, setSearch] = useState(initial)
  const debouncedSearch = useDebounce(search, 300)

  // build a full url for navigation; if value is empty it removes the param
  const buildUrl = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(name, value)
      else params.delete(name)

      const qs = params.toString()
      return pathname + (qs ? `?${qs}` : "")
    },
    [pathname, searchParams]
  )

  // keep local input in sync when the URL changes externally
  useEffect(() => {
    const urlValue = searchParams?.get("search") ?? ""
    setSearch(urlValue)
  }, [searchParams])

  // push to router only when debounced value differs from current url param
  useEffect(() => {
    const currentParam = searchParams?.get("search") ?? ""
    if (debouncedSearch !== currentParam) {
      router.push(buildUrl("search", debouncedSearch))
    }
  }, [debouncedSearch, buildUrl, router, searchParams])

  const clearSearch = () => {
    setSearch("")
    // remove param immediately
    router.push(buildUrl("search", ""))
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-neutral-600" />
      <input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full py-1 pl-10 pr-10 font-mono text-white transition-all bg-black border rounded-md outline-none focus:ring-neutral-800 ring-2 ring-transparent border-neutral-800 placeholder:text-neutral-600"
      />

      {search && (
        <button
          onClick={clearSearch}
          className="absolute transition-colors transform -translate-y-1/2 right-3 top-1/2 text-neutral-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}