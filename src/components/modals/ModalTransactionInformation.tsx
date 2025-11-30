"use client";

import { useModal } from "@/context/modal-provider";
import { renderTransactionItems } from "@/helpers/render-transaction-items";
import type { Transaction } from "@/models/transaction";
import { X } from "lucide-react";

type CardProps = {
  transaction: Transaction;
};

export default function ModalTransactionInformation({
  transaction,
}: CardProps) {
  const { close } = useModal();
  return (
    <div className="relative p-6 text-sm rounded shadow-lg bg-black border border-neutral-700 w-lg overflow-y-auto">
      <button
        className="absolute right-6 top-6 hover:scale-125 transition-transform hover:cursor-pointer"
        onClick={() => close()}
      >
        <X />
      </button>
      <div className="flex items-center space-x-2 mb-4">
        <h2 className="text-lg font-semibold truncate">
          {transaction.details}
        </h2>
        <span className="px-2 text-sm rounded border border-neutral-700 lowercase text-neutral-500">
          {transaction.category}
        </span>
      </div>
      <p className="mb-4 font-light text-white text-2xl">
        $
        {transaction.amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}
      </p>
      {transaction.category === "shopping" && (
        <p className="mb-4 text-neutral-500">{transaction.storeName}</p>
      )}
      {transaction.category === "shopping" && transaction.items && (
        <div className="w-full my-5">
          <h3 className="text-md font-semibold mb-2">Items:</h3>
          {renderTransactionItems(transaction)}
        </div>
      )}
      <div className="flex items-center justify-around border-t border-neutral-600 pt-4">
        <p className="mb-4 text-neutral-500">
          created at:{" "}
          {new Date(transaction.createdAt).toLocaleDateString("es-AR")}
        </p>
        <p className="mb-4 text-neutral-500">
          last time updated:{" "}
          {new Date(transaction.updatedAt).toLocaleDateString("es-AR")}
        </p>
      </div>
    </div>
  );
}
