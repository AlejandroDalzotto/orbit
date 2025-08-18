"use client";

import ButtonAddTransaction from '@/components/buttons/ButtonAddTransaction';
import { FinancialSummany, Transaction } from '@/models/transaction';
import { TransactionService } from '@/services/transaction';
import { ArrowUpRight, Search, TrendingDown, TrendingUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

export default function Home() {

  const [financialSummany, setFinancialSummany] = useState<FinancialSummany | null>(null);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);

  useEffect(() => {

    const fetchData = async () => {
      const service = new TransactionService();

      try {
        const [resultFinancialSummary, resultTransactions] = await Promise.all([
          service.getFinancialSummary(),
          service.getTransactions(),
        ]);

        if (resultFinancialSummary[0]) {
          console.error('Error fetching financial summary:', resultFinancialSummary[0]);
          return;
        }

        if (resultTransactions[0]) {
          console.error('Error fetching transactions:', resultTransactions[0]);
          return;
        }

        setFinancialSummany(resultFinancialSummary[1])
        setTransactions(resultTransactions[1])


      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    }
    fetchData();


  }, []);

  if (!financialSummany || !transactions) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-neutral-400 font-mono">Loading...</p>
      </div>
    );
  }

  const { netBalance, totalExpenses, totalIncome } = financialSummany;

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

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid gap-6 md:grid-cols-3 mb-12"
      >
        <div className="border-neutral-800 flex flex-col gap-6 rounded-xl border py-6 shadow-sm bg-black">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-neutral-400 font-mono text-sm">income</span>
              <TrendingUp className="h-4 w-4 text-neutral-600" />
            </div>
            <div className="text-2xl font-light text-white font-mono">
              +${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="border-neutral-800 flex flex-col gap-6 rounded-xl border py-6 shadow-sm bg-black">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-neutral-400 font-mono text-sm">expenses</span>
              <TrendingDown className="h-4 w-4 text-neutral-600" />
            </div>
            <div className="text-2xl font-light text-white font-mono">
              -${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="border-neutral-800 flex flex-col gap-6 rounded-xl border py-6 shadow-sm bg-black">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-neutral-400 font-mono text-sm">balance</span>
              <ArrowUpRight className={`h-4 w-4 ${netBalance >= 0 ? "text-neutral-600" : "text-neutral-600"}`} />
            </div>
            <div className={`text-2xl font-light font-mono ${netBalance >= 0 ? "text-white" : "text-white"}`}>
              {netBalance >= 0 ? "+" : ""}${netBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </motion.div>

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

      {transactions !== null && transactions.length > 0 ? (
        <AnimatePresence>
          <div className="space-y-2">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >

              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      ) : null}

      {transactions === null || transactions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-16 text-center"
        >
          <div className="w-1 h-16 mb-8 bg-neutral-800" />
          <p className="mb-8 font-light text-neutral-500">No transactions registered yet</p>
          <ButtonAddTransaction text='Add your first transaction' />
        </motion.div>
      ) : null}
    </motion.div>
  );
}
