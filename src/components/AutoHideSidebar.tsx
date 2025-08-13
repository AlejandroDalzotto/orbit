"use client"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CreditCard, TrendingUp, BarChart3 } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

// Navigation items
const navigationItems = [
  {
    title: "Transactions",
    url: "/",
    icon: TrendingUp,
  },
  {
    title: "Wallets",
    url: "/wallet",
    icon: CreditCard,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
]

export function AutoHideSidebar() {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const pathname = usePathname()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Show sidebar when cursor is within 50px of left edge
      if (e.clientX <= 50) {
        setIsVisible(true)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      } else if (e.clientX > 280 && !isHovered) {
        // Hide sidebar when cursor moves away and not hovering over sidebar
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false)
        }, 300)
      }
    }

    const handleMouseLeave = () => {
      if (!isHovered) {
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false)
        }, 300)
      }
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isHovered])

  const handleSidebarMouseEnter = () => {
    setIsHovered(true)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleSidebarMouseLeave = () => {
    setIsHovered(false)
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false)
    }, 300)
  }

  return (
    <>
      {/* Invisible trigger zone */}
      <div
        className="fixed left-0 top-0 w-12 h-full z-40 pointer-events-auto"
        style={{ pointerEvents: isVisible ? "none" : "auto" }}
      />

      <AnimatePresence>
        {isVisible && (
          <>
            {/* Sidebar */}
            <motion.div
              ref={sidebarRef}
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed left-0 top-0 h-full w-64 bg-black border-r border-neutral-900 z-50"
              onMouseEnter={handleSidebarMouseEnter}
              onMouseLeave={handleSidebarMouseLeave}
            >
              <div className="px-6 py-8 border-b border-neutral-900">
                <h1 className="text-sm font-light tracking-[0.2em] text-white uppercase">MoneyTracker</h1>
              </div>

              <div className="p-6">
                <nav className="space-y-2">
                  {navigationItems.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.url}
                        className={`flex items-center gap-4 px-0 py-3 text-sm font-light transition-colors border-b border-transparent hover:border-neutral-800 ${pathname === item.url ? "text-white border-neutral-700" : "text-neutral-400 hover:text-white"
                          }`}
                      >
                        <div className="w-1 h-1 bg-current rounded-full" />
                        <span className="tracking-wide">{item.title}</span>
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/10 z-40"
              onClick={() => setIsVisible(false)}
            />
          </>
        )}
      </AnimatePresence>
    </>
  )
}
