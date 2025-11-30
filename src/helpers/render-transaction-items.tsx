import { ShoppingTransaction } from "@/models/transaction";

export const renderTransactionItems = (tx: ShoppingTransaction) => {
  return (
    <div>
      {/* Headers */}
      <div className="grid grid-cols-5 gap-2 font-mono border-b border-neutral-800 py-2 text-sm font-bold text-neutral-400">
        <span className="col-span-3 text-left">Item</span>
        <span className="text-center">Quantity</span>
        <span className="text-right">Price</span>
      </div>

      {/* Rows */}
      {tx.items.map((item, index) => (
        <div
          key={index}
          className="grid grid-cols-5 gap-2 last:border-transparent border-b border-neutral-800 py-2"
        >
          {/* ITEM (3 columns) */}
          <span className="col-span-3 truncate text-left">
            {item.name || (
              <span className="text-neutral-500" title="not specified">
                n/s
              </span>
            )}
          </span>

          {/* QUANTITY */}
          <span className="text-center">
            {item.quantity ? (
              item.quantity
            ) : (
              <span className="text-neutral-500" title="not specified">
                n/s
              </span>
            )}
          </span>

          {/* PRICE (right aligned) */}
          <span className="text-right">
            {item.price ? (
              <>
                $
                {item.price.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </>
            ) : (
              <span className="text-neutral-500" title="not specified">
                n/s
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
};
