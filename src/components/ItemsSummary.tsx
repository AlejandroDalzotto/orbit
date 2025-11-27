"use client";

import { motion } from "motion/react";
import { List, BarChart, AlertTriangle } from "lucide-react";
import { useItemStore } from "@/stores/itemStore";

export default function ItemsSummary() {
  const items = useItemStore((s) => s.items ?? []);
  const totalItems = items.length;
  const itemsWithHistory = items.filter(
    (it) => (it.purchaseHistory ?? []).length > 0,
  ).length;
  const spendingLeaks = items.filter((it) => Boolean(it.isSpendingLeak)).length;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="grid gap-6 md:grid-cols-3 mb-6"
    >
      <div className="border-neutral-800 flex flex-col gap-6 rounded-xl border py-6 shadow-sm bg-black">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-neutral-400 font-mono text-sm">items</span>
            <List className="h-4 w-4 text-neutral-50" />
          </div>
          <div className="text-2xl font-light text-white font-mono">
            {totalItems}
          </div>
          <p className="text-neutral-500 text-xs font-mono mt-2">
            total stored items
          </p>
        </div>
      </div>

      <div className="border-neutral-800 flex flex-col gap-6 rounded-xl border py-6 shadow-sm bg-black">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-neutral-400 font-mono text-sm">
              purchase history
            </span>
            <BarChart className="h-4 w-4 text-neutral-50" />
          </div>
          <div className="text-2xl font-light text-white font-mono">
            {itemsWithHistory}
          </div>
          <p className="text-neutral-500 text-xs font-mono mt-2">
            items with purchase history
          </p>
        </div>
      </div>

      <div className="border-neutral-800 flex flex-col gap-6 rounded-xl border py-6 shadow-sm bg-black">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-neutral-400 font-mono text-sm">
              spending leaks
            </span>
            <AlertTriangle className="h-4 w-4 text-neutral-50" />
          </div>
          <div
            className={`text-2xl font-light font-mono ${spendingLeaks > 0 ? "text-red-400" : "text-white"}`}
          >
            {spendingLeaks}
          </div>
          <p className="text-neutral-500 text-xs font-mono mt-2">
            items flagged as potential leaks
          </p>
        </div>
      </div>
    </motion.div>
  );
}
