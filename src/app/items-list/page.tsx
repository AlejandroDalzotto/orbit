"use client";

import { useEffect } from "react";
import { useItemStore } from "@/stores/itemStore";
import { useModal } from "@/context/modal-provider";
import { Plus, Edit, Trash2, Eye, Droplet } from "lucide-react";
import ModalAddItem from "@/components/modals/ModalAddItem";
import ModalEditItem from "@/components/modals/ModalEditItem";
import ModalPriceHistory from "@/components/modals/ModalPriceHistory";
import ModalMarkLeak from "@/components/modals/ModalMarkLeak";
import DropdownMenu from "@/components/DropdownMenu";
import DropdownMenuButton from "@/components/buttons/DropdownMenuButton";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Item } from "@/models/item";
import ItemsSummary from "@/components/ItemsSummary";

export default function ItemsListPage() {
  const { open } = useModal();
  const loadItems = useItemStore((s) => s.loadItems);
  const items = useItemStore((s) => s.items);
  const deleteItem = useItemStore((s) => s.deleteItem);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleNew = () => open(<ModalAddItem />);
  const handleEdit = (item: Item) => open(<ModalEditItem item={item} />);
  const handleViewPriceHistory = (item: Item) =>
    open(<ModalPriceHistory item={item} />);

  const handleDelete = async (id: string) => {
    const [error] = await deleteItem(id);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Item deleted");
  };
  console.log(items[0]);
  return (
    <div className="flex flex-col max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light text-white">Items</h1>
          <p className="text-neutral-500 text-sm">Manage your items</p>
        </div>
        <div>
          <button
            onClick={handleNew}
            className="flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs h-9 px-4 py-2 has-[>svg]:px-3 bg-white text-black hover:bg-neutral-200 font-mono"
          >
            <Plus />
            <span>New item</span>
          </button>
        </div>
      </div>

      <ItemsSummary />

      <div className="grid grid-cols-1 gap-4">
        {items && items.length > 0 ? (
          items.map((it, idx) => (
            <motion.div
              key={it.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="flex items-center justify-between p-4 bg-black border border-neutral-800 rounded group"
            >
              <div>
                <div className="flex items-center gap-x-2">
                  {it.isSpendingLeak ? (
                    <span className="text-yellow-500 p-0.5 rounded border border-yellow-500">
                      <Droplet className="w-4 h-4 fill-yellow-500" />
                    </span>
                  ) : null}
                  <h3 className="text-white font-light">{it.name}</h3>
                  {it.hasExceededSpendMoneyLimit ? (
                    <span className="text-red-500 py-1 px-2 rounded border border-red-500">
                      Limit exceeded
                    </span>
                  ) : it.hasExceededSpendMoneyLimit === false ? (
                    <span className="text-green-500 py-1 px-2 rounded border border-green-500">
                      Within Limit
                    </span>
                  ) : null}
                </div>
                <p className="text-neutral-500 text-xs">{it.brand}</p>
              </div>

              <div className="flex items-center space-x-2">
                <DropdownMenu id={`item-${it.id}`}>
                  {({ close }) => (
                    <>
                      <DropdownMenuButton
                        color="neutral"
                        icon={<Edit className="w-3 h-3" />}
                        text="Edit"
                        onClick={() => {
                          close();
                          handleEdit(it);
                        }}
                      />

                      <DropdownMenuButton
                        color="neutral"
                        icon={<Eye className="w-3 h-3" />}
                        text="View price history"
                        onClick={() => {
                          close();
                          handleViewPriceHistory(it);
                        }}
                      />

                      <DropdownMenuButton
                        color="yellow"
                        icon={<Droplet className="w-3 h-3" />}
                        text="Mark as leak"
                        onClick={() => {
                          close();
                          open(<ModalMarkLeak item={it} />);
                        }}
                      />

                      <DropdownMenuButton
                        icon={<Trash2 className="w-3 h-3" />}
                        text="Delete"
                        color="red"
                        onClick={() => {
                          close();
                          handleDelete(it.id);
                        }}
                      />
                    </>
                  )}
                </DropdownMenu>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-neutral-500">No items registered</p>
        )}
      </div>
    </div>
  );
}
