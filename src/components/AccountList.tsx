import AccountCard from "@/components/AccountCard";
import ButtonAddWallet from "@/components/buttons/ButtonAddWallet";
import { useWallet } from "@/context/wallet-provider";
import { motion } from "motion/react";

export default function AccountList() {

  const { accounts } = useWallet();

  return (
    <>
      <div className="space-y-4">
        <h2 className="mb-2 font-light tracking-wider text-neutral-200">Accounts</h2>
        {accounts !== null ? accounts.map((account, index) => {

          return (
            <AccountCard key={account.id} account={account} animationDelay={index * 0.1} />
          )
        }) : null}
      </div>

      {accounts !== null && accounts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-16 text-center">
          <div className="w-1 h-16 mb-8 bg-neutral-800" />
          <p className="mb-8 font-light text-neutral-500">No accounts registered yet</p>
          <ButtonAddWallet text="Add your first account" />
        </motion.div>
      ) : null}
    </>
  )
}
