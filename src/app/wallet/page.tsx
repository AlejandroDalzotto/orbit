export default function WalletPage() {

  const totalAccounts = 0;

  return (
    <section className="flex flex-col gap-y-5 p-4 container mx-auto">
      <h1 className="text-2xl font-bold">My Wallets</h1>
      <p>Track your money across all accounts.</p>
      <article className="p-5 flex flex-col bg-white/5 rounded gap-y-2">
        <p className="text-blue-500 font-bold">$ Total balance</p>
        <p className="text-4xl font-bold">$0</p>
        <p className="text-sm">Across {totalAccounts} accounts.</p>
      </article>

      <article className="flex items-center justify-between">
        <p className="text-xl font-bold">Your accounts</p>
        <button className="p-2 rounded bg-blue-500 flex gap-x-2 items-center"><span className="text-2xl">&#x2B;</span> Add wallet</button>
      </article>

      {totalAccounts === 0 ? (
        <article className="grid place-content-center bg-white/5 grow p-10 rounded text-balance text-center">
          <p className="text-neutral-500 text-xl">You don&apos;t have any wallets yet. Click &quot;Add wallet&quot; to create your first account and start tracking your balances.</p>
        </article>
      ) : (
        // Placeholder for accounts list
        /**
         * The objects should be like:
         * {
         *  id: 'unique-id',
         * name: 'Account Name',
         * type: 'cash' | 'online wallet' | 'back account' | 'credit card',
         * balance: 1000,
         * currency: 'USD' | 'ARS',
         * }
         */
        <div></div>
      )}
    </section>
  )
}
