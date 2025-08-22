import ItemsForm from "@/components/form/ItemsForm";
import { TransactionCategory } from "@/models/transaction"

export const renderSpecificFields = (category: TransactionCategory, fieldPrefix?: string) => {

  switch (category) {
    case TransactionCategory.Salary:
      return (
        <>
          <div className="flex-1">
            <label
              className="block text-neutral-300 font-mono mb-2"
              htmlFor={`${fieldPrefix}job`}
            >
              job
            </label>
            <input
              required
              placeholder="e.g. Software Engineer"
              className="w-full bg-black border border-neutral-800 text-white font-mono px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
              type="text"
              name="job"
              id={`${fieldPrefix}job`}
            />
          </div>

          <div className="flex-1">
            <label
              className="block text-neutral-300 font-mono mb-2"
              htmlFor={`${fieldPrefix}employer`}
            >
              employer
            </label>
            <input
              placeholder="e.g. TechCorp Inc."
              className="w-full bg-black border border-neutral-800 text-white font-mono px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
              type="text"
              name="employer"
              id={`${fieldPrefix}employer`}
            />
          </div>

          <div className="flex-1">
            <label
              className="block text-neutral-300 font-mono mb-2"
              htmlFor={`${fieldPrefix}extraDetails`}
            >
              Extra commentaries
            </label>
            <textarea
              placeholder="Optional commentaries..."
              className="w-full min-h-[4ch] resize-none bg-black border border-neutral-800 text-white font-mono px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
              name="extraDetails"
              id={`${fieldPrefix}extraDetails`}
            />
          </div>
        </>
      );

    case TransactionCategory.Freelance:
      return (
        <>
          <div className="flex-1">
            <label
              className="block text-neutral-300 font-mono mb-2"
              htmlFor={`${fieldPrefix}client`}
            >
              client
            </label>
            <input
              placeholder="e.g. Local Restaurant"
              className="w-full bg-black border border-neutral-800 text-white font-mono px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
              type="text"
              name="client"
              id={`${fieldPrefix}client`}
            />
          </div>

          <div className="flex-1">
            <label
              className="block text-neutral-300 font-mono mb-2"
              htmlFor={`${fieldPrefix}project`}
            >
              project
            </label>
            <input
              placeholder="e.g. Website Redesign"
              className="w-full bg-black border border-neutral-800 text-white font-mono px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
              type="text"
              name="project"
              id={`${fieldPrefix}project`}
            />
          </div>
        </>
      );
    case TransactionCategory.Supermarket:
      return (
        <>
          <div className="flex-1">
            <label
              className="block text-neutral-300 font-mono mb-2"
              htmlFor={`${fieldPrefix}store`}
            >
              store
            </label>
            <input
              placeholder="e.g. Website Redesign"
              className="w-full bg-black border border-neutral-800 text-white font-mono px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
              type="text"
              name="storeName"
              id={`${fieldPrefix}store`}
            />
          </div>
          <ItemsForm />
        </>
      );
    default:
      return null;
  }
}