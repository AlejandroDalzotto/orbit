import type { Account } from '@/lib/definitions'

const TYPE_COLORS = {
  'cash': 'text-green-500',
  'online wallet': 'text-blue-500',
  'bank account': 'text-indigo-500',
  'credit card': 'text-red-500'
}

export default function AccountCard({ account }: { account: Account }) {
  return (
    <div className="p-5 bg-white/5 rounded flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <h2>{account.name}</h2>
        <p className={`${TYPE_COLORS[account.type]} text-sm`}>{account.type}</p>
      </div>
      <p className="text-2xl font-bold">${account.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
      <p className="text-sm text-blue-500">{account.currency}</p>
    </div>
  )
}
