"use client";

import { Check } from 'lucide-react';
import { useState } from 'react'

export default function CheckBox() {

  const [checked, setChecked] = useState(true)

  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          name='affectsBalance'
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="sr-only"
        />
        <div className={`
          w-4 h-4 border rounded-sm transition-all duration-200 flex items-center justify-center
          ${checked
            ? 'bg-white border-white'
            : 'bg-black border-neutral-800 hover:border-neutral-700'
          }
        `}>
          {checked && (
            <Check className="h-3 w-3 text-black" strokeWidth={2} />
          )}
        </div>
      </div>
      <span className="ml-3 text-neutral-300 font-mono font-light text-sm select-none">
        affects balance
      </span>
    </label>
  )
}
