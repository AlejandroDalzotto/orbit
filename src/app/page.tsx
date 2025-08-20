"use client";

import ButtonAddTransaction from '@/components/buttons/ButtonAddTransaction';
import Searchbar from '@/components/Searchbar';
import TransactionList from '@/components/TransactionList';
import TransactionsFinancialSummary from '@/components/TransactionsFinancialSummary';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-1 flex-col max-w-6xl mx-auto"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-light text-white mb-2 font-mono">transactions</h1>
        <div className="w-16 h-px bg-neutral-800 mb-4"></div>
        <p className="text-neutral-400 font-mono text-sm">track income and expenses</p>
      </motion.div>

      <TransactionsFinancialSummary />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 mb-8"
      >
        <div className="flex-1">
          <Searchbar onSearch={handleSearch} />
        </div>
        {/* filters here */}
        <ButtonAddTransaction text="Add Transaction" />
      </motion.div>

      <TransactionList searchQuery={searchQuery} />
    </motion.div>
  )
}