"use client";

export default function HowToUsePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-light mb-4">Welcome to Orbit</h1>

      <section className="mb-6">
        <p className="text-neutral-400">
          Orbit makes it easy to keep track of your money and shopping. This
          short guide shows the most common tasks so you can get started
          quickly.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Quick start: 3 easy steps
        </h2>
        <ol className="list-decimal pl-6 text-neutral-400 space-y-2">
          <li>
            <strong>Create an account</strong>: Add a place where you keep money
            (for example, &quot;Cash&quot; or &quot;Bank&quot;). This helps
            Orbit show balances.
          </li>
          <li>
            <strong>Record transactions</strong>: Tap &quot;Add
            transaction&quot; to log money in or out. Enter the amount, date and
            a short note (like &quot;groceries&quot; or &quot;salary&quot;).
          </li>
          <li>
            <strong>Save items when you shop</strong>: For grocery or shopping
            receipts, list the items and their prices, Orbit will remember those
            prices so you can compare them later.
          </li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Daily use</h2>
        <p className="text-neutral-400 mb-2">
          Use Orbit every time you spend or receive money. A few quick habits:
        </p>
        <ul className="list-disc pl-6 text-neutral-400 space-y-2">
          <li>
            Write a short note for each transaction so you remember it later.
          </li>
          <li>
            When shopping, add the items and prices, it helps track trends.
          </li>
          <li>
            Check the summaries to see how much you spent or earned recently.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Items and price history</h2>
        <p className="text-neutral-400 mb-2">
          Items let you track products you buy often. Each time you record a
          shopping transaction with an item and a price, Orbit saves that price.
        </p>
        <p className="text-neutral-400">
          Open an item to see a small chart of past prices and a short list of
          recent entries. This is handy to see if a product is getting more
          expensive or on sale.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Editing and deleting</h2>
        <p className="text-neutral-400 mb-2">
          You can edit or delete transactions and items at any time:
        </p>
        <ul className="list-disc pl-6 text-neutral-400 space-y-2">
          <li>Edit a transaction if you typed the wrong amount or date.</li>
          <li>
            Delete a transaction to remove it from your history, items stay
            unless you delete them too.
          </li>
          <li>
            Edit item names to keep things consistent (for example, use the same
            name for the same product).
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Helpful tips</h2>
        <ul className="list-disc pl-6 text-neutral-400 space-y-2">
          <li>
            Use consistent item names like &quot;Olive Oil 1L&quot; to avoid
            duplicates.
          </li>
          <li>Add a short note to transactions so you can find them later.</li>
          <li>
            Check the items page occasionally to tidy up names or remove old
            entries.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">FAQ</h2>
        <div className="text-neutral-400 space-y-2">
          <div>
            <strong>Q:</strong> If I delete a transaction, will it remove the
            item?
            <br />
            <strong>A:</strong> No, deleting a transaction only removes that
            record. Items and their price history stay unless you delete the
            item itself.
          </div>

          <div>
            <strong>Q:</strong> Can I change a saved transaction?
            <br />
            <strong>A:</strong> Yes, open it from the list and choose Edit.
            Totals update automatically.
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Want more features?</h2>
        <p className="text-neutral-400">
          If you&apos;d like extra functionality (for example, export, reports
          or scheduled transactions), describe what you need and it can be
          added.
        </p>
      </section>

      <footer className="text-neutral-500 text-sm mt-8">
        <p>
          Thanks for using Orbit, simple tools to help you manage everyday
          spending.
        </p>
      </footer>
    </div>
  );
}
