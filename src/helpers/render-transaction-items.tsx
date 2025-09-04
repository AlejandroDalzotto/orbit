import { SupermarketTransaction } from "@/models/transaction";

export const renderTransactionItems = (tx: SupermarketTransaction) => {


  return (
    <div>
      {tx.items.map((item, index) => (
        <div key={index} className="flex last:border-transparent justify-between border-b not-last:border-neutral-800 py-2">
          <span>{item.name}</span>
          {
            item.price ? (
              <span>${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            ) : (
              <span className="text-neutral-500">no price</span>
            )
          }
        </div>
      ))}
    </div>
  )

}