import type { Transaction } from "@/lib/definitions";
import clsx from "clsx";

const records: Transaction[] = [
  {
    date: "2025-06-27",
    id: "1",
    createdAt: "2025-06-30",
    updatedAt: "2025-06-30",
    currency: "ARS",
    category: "Salary",
    type: "income",
    amount: 150000,
    description: "Pago de trabajo de colocación de cielo raso y pintura en living y cocina"
  },
  {
    date: "2025-06-27",
    id: "2",
    createdAt: "2025-06-30",
    updatedAt: "2025-06-30",
    currency: "ARS",
    category: "Online shopping",
    type: "expense",
    amount: 51797.14,
    description: "Compra de disco SSD M2 de 480 GB"
  },
  {
    date: "2025-06-27",
    id: "3",
    createdAt: "2025-06-30",
    updatedAt: "2025-06-30",
    currency: "ARS",
    category: "Supermarket",
    type: "expense",
    amount: 15200,
    description: "Compras varias en los chinos"
  },
  {
    date: "2025-06-28",
    id: "4",
    createdAt: "2025-06-30",
    updatedAt: "2025-06-30",
    currency: "ARS",
    category: "Supermarket",
    type: "expense",
    amount: 19642.50,
    description: "Compras varias en el kiosko de la esquina"
  }
];

export default function Home() {
  return (
    <div className="flex flex-col w-full h-full p-4 overflow-y-auto">
      <button className="p-2 w-fit">new record</button>
      <div className="container flex flex-col w-full max-h-full mx-auto h-fit record-list">
        <div className="grid items-center py-2 transition-opacity grid-cols-[repeat(14,_minmax(0,_1fr))]">
          <p className="col-span-2">date</p>
          <p className="col-span-5 truncate">description</p>
          <p className="col-span-2 text-center">amount</p>
          <p className="col-span-2 text-center">currency</p>
          <span className="col-span-3 px-3 py-1 truncate transition-colors rounded-full place-self-end hover:bg-white/5">category</span>
        </div>
        {
          records.map(r => {

            return (
              <div className={clsx(
                "text-sm grid items-center transition-all grid-cols-[repeat(14,_minmax(0,_1fr))] record-item",
                { "hover:text-green-400": r.type === "income" },
                { "hover:text-red-400": r.type === "expense" },
              )} key={r.id}>
                <p className="col-span-2">{r.date}</p>
                <p className="col-span-5 truncate">{r.description}</p>
                <p className="col-span-2 text-center">${r.amount}</p>
                <p className="col-span-2 text-center">{r.currency}</p>
                <span className="col-span-3 px-2 py-1 truncate place-self-end">{r.category}</span>
              </div>
            )

          })
        }
      </div>
    </div>
  );
}
