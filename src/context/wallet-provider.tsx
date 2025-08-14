"use client";
import { Account } from "@/lib/definitions";
import { WalletService } from "@/services/wallet";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

type WalletState = {
  accounts: Account[] | null;
  totalBalance: number | null;
  isLoading: boolean;
};

type AsyncVoidFunction = () => Promise<void>

type WalletActions = {
  loadWallet: AsyncVoidFunction;
  onAccountAdded: (newEntry: Account) => void;
}

type WalletContextState = WalletState & WalletActions

export const WalletContext = createContext<WalletContextState>({
  loadWallet: async () => { },
  onAccountAdded: () => { },
  accounts: null,
  totalBalance: null,
  isLoading: true,
});

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [totalBalance, setTotalBalance] = useState<number | null>(null);

  const loadWallet = async () => {
    setIsLoading(true);

    const service = new WalletService();

    const [resultGetTotalBalance, resultGetAccounts] = await Promise.all([
      service.getTotalBalance(),
      service.getAccounts()
    ]);

    if (resultGetTotalBalance[0] || resultGetAccounts[0]) {
      toast.error("Failed to fetch wallet data.");
      setIsLoading(false);
      return;
    }

    setTotalBalance(resultGetTotalBalance[1]);
    setAccounts(resultGetAccounts[1]);
    setIsLoading(false);
  }

  const onAccountAdded = (newEntry: Account) => {
  setAccounts(prev => prev ? [...prev, newEntry] : [newEntry]);
  setTotalBalance(prev => prev !== null ? prev + newEntry.balance : newEntry.balance);
};

  useEffect(() => {
    console.log("accounts updated:", accounts);
    console.log("total accounts:", accounts?.length);
  }, [accounts]);

  useEffect(() => {
    loadWallet();
  }, [])

  return (
    <WalletContext.Provider value={{
      accounts,
      isLoading,
      totalBalance,
      loadWallet,
      onAccountAdded,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = (): WalletContextState => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}