"use client";

import ButtonAddTransaction from '@/components/buttons/ButtonAddTransaction';
import TransactionList from '@/components/TransactionList';
import TransactionsFinancialSummary from '@/components/TransactionsFinancialSummary';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {

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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600 h-4 w-4" />
            <input
              placeholder="search transactions..."
              // value={searchTerm}
              // onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-1 rounded-md border outline-none focus:ring-neutral-800 ring-2 ring-transparent transition-all bg-black border-neutral-800 text-white font-mono placeholder:text-neutral-600"
            />
          </div>
        </div>
        {/* filters here */}
        <ButtonAddTransaction text='Add Transaction' />

      </motion.div>

      <TransactionList />

    </motion.div>
  );
}
