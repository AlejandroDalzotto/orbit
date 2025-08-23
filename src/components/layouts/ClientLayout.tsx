"use client"

import { AutoHideSidebar } from "@/components/AutoHideSidebar"
import { motion } from "motion/react"
import type React from "react"
import { useEffect, useState } from "react"
import { Toaster } from "sonner"

export function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showIndicator, setShowIndicator] = useState(true)
  const [mouseX, setMouseX] = useState(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX)
      // Hide indicator when sidebar is likely to be shown (cursor near left edge)
      if (e.clientX < 50) {
        setShowIndicator(false)
      } else if (e.clientX > 200) {
        setShowIndicator(true)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <>
      <AutoHideSidebar />

      {/* Elegant sidebar indicator */}
      <motion.div
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{
          opacity: showIndicator ? 0.4 : 0,
          x: showIndicator ? 0 : -20,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex items-center">
          {/* Subtle line indicator */}
          <motion.div
            className="w-0.5 h-12 bg-neutral-600"
            animate={{
              height: mouseX < 100 ? 16 : 12,
              backgroundColor: mouseX < 100 ? "#a3a3a3" : "#525252",
            }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            className="ml-2 flex flex-col items-center"
            animate={{
              opacity: mouseX < 100 ? 0.8 : 0.3,
              x: mouseX < 100 ? 4 : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            {/* Vertical "sidebar" text */}
            <div
              className="text-neutral-500 text-xs font-mono tracking-wider"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              sidebar
            </div>

            {/* Small arrow hint */}
            <div className="mt-2 text-neutral-500 text-xs font-mono">→</div>
          </motion.div>
        </div>
      </motion.div>

      <div className="min-h-screen relative">
        <main className="p-8 pt-12">{children}</main>
      </div>

      <Toaster />
    </>
  )
}
