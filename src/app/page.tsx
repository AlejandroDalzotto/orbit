"use client";

import { FinancialSummany, Transaction } from '@/models/transaction';
import { TransactionService } from '@/services/transaction';
import { ArrowUpRight, Plus, Search, TrendingDown, TrendingUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

export default function Home() {

  const [financialSummany, setFinancialSummany] = useState<FinancialSummany | null>(null);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);

  // const categories = {
  //   income: ["Salary", "Freelance", "Investment", "Business", "Gift", "Other"],
  //   expense: [
  //     "Food",
  //     "Housing",
  //     "Transportation",
  //     "Entertainment",
  //     "Healthcare",
  //     "Shopping",
  //     "Utilities",
  //     "Education",
  //     "Other",
  //   ],
  // }

  // const renderSpecificFields = (transaction: any, isEdit = false) => {
  //   const category = transaction.category
  //   const prefix = isEdit ? "edit-" : ""

  //   switch (category) {
  //     case "Salary":
  //       return (
  //         <>
  //           <div className="grid gap-2">
  //             <label htmlFor={`${prefix}job`} className="text-neutral-300 font-mono text-sm">
  //               Job Title
  //             </label>
  //             <input
  //               id={`${prefix}job`}
  //               value={transaction.job}
  //               onChange={(e) =>
  //                 isEdit
  //                   ? setEditTransaction({ ...editTransaction, job: e.target.value })
  //                   : setNewTransaction({ ...newTransaction, job: e.target.value })
  //               }
  //               placeholder="e.g., Senior Software Engineer"
  //               className="bg-black border-neutral-800 text-white font-mono"
  //             />
  //           </div>
  //           <div className="grid gap-2">
  //             <Label htmlFor={`${prefix}employer`} className="text-neutral-300 font-mono text-sm">
  //               Employer
  //             </Label>
  //             <Input
  //               id={`${prefix}employer`}
  //               value={transaction.employer}
  //               onChange={(e) =>
  //                 isEdit
  //                   ? setEditTransaction({ ...editTransaction, employer: e.target.value })
  //                   : setNewTransaction({ ...newTransaction, employer: e.target.value })
  //               }
  //               placeholder="e.g., TechCorp Inc."
  //               className="bg-black border-neutral-800 text-white font-mono"
  //             />
  //           </div>
  //         </>
  //       )
  //     case "Freelance":
  //       return (
  //         <>
  //           <div className="grid gap-2">
  //             <Label htmlFor={`${prefix}client`} className="text-neutral-300 font-mono text-sm">
  //               Client
  //             </Label>
  //             <Input
  //               id={`${prefix}client`}
  //               value={transaction.client}
  //               onChange={(e) =>
  //                 isEdit
  //                   ? setEditTransaction({ ...editTransaction, client: e.target.value })
  //                   : setNewTransaction({ ...newTransaction, client: e.target.value })
  //               }
  //               placeholder="e.g., Local Restaurant"
  //               className="bg-black border-neutral-800 text-white font-mono"
  //             />
  //           </div>
  //           <div className="grid gap-2">
  //             <Label htmlFor={`${prefix}project`} className="text-neutral-300 font-mono text-sm">
  //               Project
  //             </Label>
  //             <Input
  //               id={`${prefix}project`}
  //               value={transaction.project}
  //               onChange={(e) =>
  //                 isEdit
  //                   ? setEditTransaction({ ...editTransaction, project: e.target.value })
  //                   : setNewTransaction({ ...newTransaction, project: e.target.value })
  //               }
  //               placeholder="e.g., Website Redesign"
  //               className="bg-black border-neutral-800 text-white font-mono"
  //             />
  //           </div>
  //         </>
  //       )
  //     case "Food":
  //       return (
  //         <>
  //           <div className="grid gap-2">
  //             <Label htmlFor={`${prefix}store`} className="text-neutral-300 font-mono text-sm">
  //               Store
  //             </Label>
  //             <Input
  //               id={`${prefix}store`}
  //               value={transaction.store}
  //               onChange={(e) =>
  //                 isEdit
  //                   ? setEditTransaction({ ...editTransaction, store: e.target.value })
  //                   : setNewTransaction({ ...newTransaction, store: e.target.value })
  //               }
  //               placeholder="e.g., Whole Foods Market"
  //               className="bg-black border-neutral-800 text-white font-mono"
  //             />
  //           </div>
  //           <div className="grid gap-2">
  //             <Label htmlFor={`${prefix}items`} className="text-neutral-300 font-mono text-sm">
  //               Items Purchased
  //             </Label>
  //             <Textarea
  //               id={`${prefix}items`}
  //               value={transaction.items}
  //               onChange={(e) =>
  //                 isEdit
  //                   ? setEditTransaction({ ...editTransaction, items: e.target.value })
  //                   : setNewTransaction({ ...newTransaction, items: e.target.value })
  //               }
  //               placeholder="e.g., Milk, Bread, Eggs, Chicken"
  //               className="bg-black border-neutral-800 text-white font-mono"
  //             />
  //           </div>
  //         </>
  //       )
  //     case "Housing":
  //       return (
  //         <>
  //           <div className="grid gap-2">
  //             <Label htmlFor={`${prefix}property`} className="text-neutral-300 font-mono text-sm">
  //               Property
  //             </Label>
  //             <Input
  //               id={`${prefix}property`}
  //               value={transaction.property}
  //               onChange={(e) =>
  //                 isEdit
  //                   ? setEditTransaction({ ...editTransaction, property: e.target.value })
  //                   : setNewTransaction({ ...newTransaction, property: e.target.value })
  //               }
  //               placeholder="e.g., Downtown Apartment 2B"
  //               className="bg-black border-neutral-800 text-white font-mono"
  //             />
  //           </div>
  //           <div className="grid gap-2">
  //             <Label htmlFor={`${prefix}landlord`} className="text-neutral-300 font-mono text-sm">
  //               Landlord (Optional)
  //             </Label>
  //             <Input
  //               id={`${prefix}landlord`}
  //               value={transaction.landlord}
  //               onChange={(e) =>
  //                 isEdit
  //                   ? setEditTransaction({ ...editTransaction, landlord: e.target.value })
  //                   : setNewTransaction({ ...newTransaction, landlord: e.target.value })
  //               }
  //               placeholder="e.g., City Properties LLC"
  //               className="bg-black border-neutral-800 text-white font-mono"
  //             />
  //           </div>
  //         </>
  //       )
  //     case "Transportation":
  //       return (
  //         <>
  //           <div className="grid gap-2">
  //             <Label htmlFor={`${prefix}vehicle`} className="text-neutral-300 font-mono text-sm">
  //               Vehicle (Optional)
  //             </Label>
  //             <Input
  //               id={`${prefix}vehicle`}
  //               value={transaction.vehicle}
  //               onChange={(e) =>
  //                 isEdit
  //                   ? setEditTransaction({ ...editTransaction, vehicle: e.target.value })
  //                   : setNewTransaction({ ...newTransaction, vehicle: e.target.value })
  //               }
  //               placeholder="e.g., Honda Civic 2020"
  //               className="bg-black border-neutral-800 text-white font-mono"
  //             />
  //           </div>
  //           <div className="grid gap-2">
  //             <Label htmlFor={`${prefix}location`} className="text-neutral-300 font-mono text-sm">
  //               Location (Optional)
  //             </Label>
  //             <Input
  //               id={`${prefix}location`}
  //               value={transaction.location}
  //               onChange={(e) =>
  //                 isEdit
  //                   ? setEditTransaction({ ...editTransaction, location: e.target.value })
  //                   : setNewTransaction({ ...newTransaction, location: e.target.value })
  //               }
  //               placeholder="e.g., Shell Station on Main St"
  //               className="bg-black border-neutral-800 text-white font-mono"
  //             />
  //           </div>
  //           <div className="grid gap-2">
  //             <Label htmlFor={`${prefix}mileage`} className="text-neutral-300 font-mono text-sm">
  //               Mileage (Optional)
  //             </Label>
  //             <Input
  //               id={`${prefix}mileage`}
  //               type="number"
  //               value={transaction.mileage}
  //               onChange={(e) =>
  //                 isEdit
  //                   ? setEditTransaction({ ...editTransaction, mileage: e.target.value })
  //                   : setNewTransaction({ ...newTransaction, mileage: e.target.value })
  //               }
  //               placeholder="e.g., 320"
  //               className="bg-black border-neutral-800 text-white font-mono"
  //             />
  //           </div>
  //         </>
  //       )
  //     case "Healthcare":
  //       return (
  //         <>
  //           <div className="grid gap-2">
  //             <Label htmlFor={`${prefix}provider`} className="text-neutral-300 font-mono text-sm">
  //               Healthcare Provider
  //             </Label>
  //             <Input
  //               id={`${prefix}provider`}
  //               value={transaction.provider}
  //               onChange={(e) =>
  //                 isEdit
  //                   ? setEditTransaction({ ...editTransaction, provider: e.target.value })
  //                   : setNewTransaction({ ...newTransaction, provider: e.target.value })
  //               }
  //               placeholder="e.g., Dr. Smith Family Medicine"
  //               className="bg-black border-neutral-800 text-white font-mono"
  //             />
  //           </div>
  //           <div className="grid gap-2">
  //             <Label htmlFor={`${prefix}treatment`} className="text-neutral-300 font-mono text-sm">
  //               Treatment (Optional)
  //             </Label>
  //             <Input
  //               id={`${prefix}treatment`}
  //               value={transaction.treatment}
  //               onChange={(e) =>
  //                 isEdit
  //                   ? setEditTransaction({ ...editTransaction, treatment: e.target.value })
  //                   : setNewTransaction({ ...newTransaction, treatment: e.target.value })
  //               }
  //               placeholder="e.g., Annual Physical Examination"
  //               className="bg-black border-neutral-800 text-white font-mono"
  //             />
  //           </div>
  //         </>
  //       )
  //     case "Investment":
  //       return (
  //         <>
  //           <div className="grid gap-2">
  //             <Label htmlFor={`${prefix}asset`} className="text-neutral-300 font-mono text-sm">
  //               Asset
  //             </Label>
  //             <Input
  //               id={`${prefix}asset`}
  //               value={transaction.asset}
  //               onChange={(e) =>
  //                 isEdit
  //                   ? setEditTransaction({ ...editTransaction, asset: e.target.value })
  //                   : setNewTransaction({ ...newTransaction, asset: e.target.value })
  //               }
  //               placeholder="e.g., AAPL Stock"
  //               className="bg-black border-neutral-800 text-white font-mono"
  //             />
  //           </div>
  //           <div className="grid gap-2">
  //             <Label htmlFor={`${prefix}shares`} className="text-neutral-300 font-mono text-sm">
  //               Shares/Units (Optional)
  //             </Label>
  //             <Input
  //               id={`${prefix}shares`}
  //               type="number"
  //               step="0.01"
  //               value={transaction.shares}
  //               onChange={(e) =>
  //                 isEdit
  //                   ? setEditTransaction({ ...editTransaction, shares: e.target.value })
  //                   : setNewTransaction({ ...newTransaction, shares: e.target.value })
  //               }
  //               placeholder="e.g., 10"
  //               className="bg-black border-neutral-800 text-white font-mono"
  //             />
  //           </div>
  //           <div className="grid gap-2">
  //             <Label htmlFor={`${prefix}price`} className="text-neutral-300 font-mono text-sm">
  //               Price per Share (Optional)
  //             </Label>
  //             <Input
  //               id={`${prefix}price`}
  //               type="number"
  //               step="0.01"
  //               value={transaction.price}
  //               onChange={(e) =>
  //                 isEdit
  //                   ? setEditTransaction({ ...editTransaction, price: e.target.value })
  //                   : setNewTransaction({ ...newTransaction, price: e.target.value })
  //               }
  //               placeholder="e.g., 50.00"
  //               className="bg-black border-neutral-800 text-white font-mono"
  //             />
  //           </div>
  //         </>
  //       )
  //     case "Shopping":
  //       return (
  //         <>
  //           <div className="grid gap-2">
  //             <Label htmlFor={`${prefix}store`} className="text-neutral-300 font-mono text-sm">
  //               Store
  //             </Label>
  //             <Input
  //               id={`${prefix}store`}
  //               value={transaction.store}
  //               onChange={(e) =>
  //                 isEdit
  //                   ? setEditTransaction({ ...editTransaction, store: e.target.value })
  //                   : setNewTransaction({ ...newTransaction, store: e.target.value })
  //               }
  //               placeholder="e.g., Target"
  //               className="bg-black border-neutral-800 text-white font-mono"
  //             />
  //           </div>
  //           <div className="grid gap-2">
  //             <Label htmlFor={`${prefix}items`} className="text-neutral-300 font-mono text-sm">
  //               Items (Optional)
  //             </Label>
  //             <Textarea
  //               id={`${prefix}items`}
  //               value={transaction.items}
  //               onChange={(e) =>
  //                 isEdit
  //                   ? setEditTransaction({ ...editTransaction, items: e.target.value })
  //                   : setNewTransaction({ ...newTransaction, items: e.target.value })
  //               }
  //               placeholder="e.g., Shirt, Jeans, Shoes"
  //               className="bg-black border-neutral-800 text-white font-mono"
  //             />
  //           </div>
  //         </>
  //       )
  //     case "Utilities":
  //       return (
  //         <>
  //           <div className="grid gap-2">
  //             <Label htmlFor={`${prefix}provider`} className="text-neutral-300 font-mono text-sm">
  //               Provider
  //             </Label>
  //             <Input
  //               id={`${prefix}provider`}
  //               value={transaction.provider}
  //               onChange={(e) =>
  //                 isEdit
  //                   ? setEditTransaction({ ...editTransaction, provider: e.target.value })
  //                   : setNewTransaction({ ...newTransaction, provider: e.target.value })
  //               }
  //               placeholder="e.g., Pacific Gas & Electric"
  //               className="bg-black border-neutral-800 text-white font-mono"
  //             />
  //           </div>
  //           <div className="grid gap-2">
  //             <Label htmlFor={`${prefix}service`} className="text-neutral-300 font-mono text-sm">
  //               Service
  //             </Label>
  //             <Input
  //               id={`${prefix}service`}
  //               value={transaction.service}
  //               onChange={(e) =>
  //                 isEdit
  //                   ? setEditTransaction({ ...editTransaction, service: e.target.value })
  //                   : setNewTransaction({ ...newTransaction, service: e.target.value })
  //               }
  //               placeholder="e.g., Electricity"
  //               className="bg-black border-neutral-800 text-white font-mono"
  //             />
  //           </div>
  //           <div className="grid gap-2">
  //             <Label htmlFor={`${prefix}period`} className="text-neutral-300 font-mono text-sm">
  //               Billing Period (Optional)
  //             </Label>
  //             <Input
  //               id={`${prefix}period`}
  //               value={transaction.period}
  //               onChange={(e) =>
  //                 isEdit
  //                   ? setEditTransaction({ ...editTransaction, period: e.target.value })
  //                   : setNewTransaction({ ...newTransaction, period: e.target.value })
  //               }
  //               placeholder="e.g., January 2024"
  //               className="bg-black border-neutral-800 text-white font-mono"
  //             />
  //           </div>
  //         </>
  //       )
  //     default:
  //       return null
  //   }
  // }

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
        <button className='flex items-center px-3 py-1 bg-white transition-colors border rounded-md gap-x-2 border-white text-black hover:bg-transparent hover:text-white'>
          <Plus className="w-4 h-4" />
          Add transaction
        </button>

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
          <button className='flex items-center px-3 py-1 transition-colors border rounded-md gap-x-2 border-neutral-600 text-neutral-600 hover:text-neutral-50 hover:bg-white/20'>
            <Plus className="w-4 h-4" />
            Add your first transaction
          </button>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
