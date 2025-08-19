import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Item } from '@/models/transaction'

interface ItemsFormProps {
  className?: string
}

const ItemsForm = ({ className = '' }: ItemsFormProps) => {
  const [items, setItems] = useState<Item[]>([{ name: '', quantity: null, price: null }])

  const addItem = () => {
    setItems([...items, { name: '', quantity: null, price: null }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof Item, value: string) => {
    const updatedItems = items.map((item, i) => {
      if (i === index) {
        if (field === 'quantity' || field === 'price') {
          return { ...item, [field]: value ? Number(value) : null }
        }
        return { ...item, [field]: value }
      }
      return item
    })
    setItems(updatedItems)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-neutral-300 font-mono text-sm">Items</label>
        <button
          type="button"
          onClick={addItem}
          className="flex items-center space-x-1 px-2 py-1 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded-sm font-mono text-xs transition-colors"
        >
          <Plus className="h-3 w-3" />
          <span>Add</span>
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 p-3 border border-neutral-800 rounded-md">
            {/* Name - Required field */}
            <input
              type="text"
              name={`items[${index}].name`}
              placeholder="Item name"
              value={item.name}
              onChange={(e) => updateItem(index, 'name', e.target.value)}
              className="flex-1 bg-black border border-neutral-800 text-white font-mono text-sm px-2 py-1 rounded focus:outline-none focus:border-neutral-700 transition-colors"
              required={index === 0} // Al menos el primer item debe tener nombre
            />
            
            {/* Quantity - Optional */}
            <input
              type="number"
              name={`items[${index}].quantity`}
              placeholder="Qty"
              min="0"
              step="1"
              value={item.quantity || ''}
              onChange={(e) => updateItem(index, 'quantity', e.target.value)}
              className="w-16 bg-black border border-neutral-800 text-white font-mono text-sm px-2 py-1 rounded focus:outline-none focus:border-neutral-700 transition-colors"
            />
            
            {/* Price - Optional */}
            <input
              type="number"
              name={`items[${index}].price`}
              placeholder="Price"
              min="0"
              step="0.01"
              value={item.price || ''}
              onChange={(e) => updateItem(index, 'price', e.target.value)}
              className="w-20 bg-black border border-neutral-800 text-white font-mono text-sm px-2 py-1 rounded focus:outline-none focus:border-neutral-700 transition-colors"
            />
            
            {/* Remove button - Only show if more than 1 item */}
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-neutral-400 hover:text-red-400 p-1 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Helper text */}
      <p className="text-neutral-500 font-mono text-xs">
        Add items purchased in this transaction. Quantity and price are optional.
      </p>
    </div>
  )
}

export default ItemsForm