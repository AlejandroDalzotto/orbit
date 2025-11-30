import ItemsForm from "@/components/form/ItemsForm";
import {
  type ItemRef,
  type Transaction,
  TransactionCategory,
} from "@/models/transaction";

export const renderSpecificFields = (
  category: TransactionCategory,
  fieldPrefix?: string,
  transaction?: Transaction,
) => {
  switch (category) {
    case TransactionCategory.Salary: {
      let extraDetails: string | undefined;
      let employer: string | undefined;
      let job: string | undefined;

      if (transaction && transaction.category === TransactionCategory.Salary) {
        extraDetails = transaction.extraDetails || undefined;
        employer = transaction.employer || undefined;
        job = transaction.job || undefined;
      }

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
              defaultValue={job}
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
              defaultValue={employer}
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
              defaultValue={extraDetails}
              placeholder="Optional commentaries..."
              className="w-full min-h-[4ch] resize-none bg-black border border-neutral-800 text-white font-mono px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
              name="extraDetails"
              id={`${fieldPrefix}extraDetails`}
            />
          </div>
        </>
      );
    }
    case TransactionCategory.Freelance: {
      let project: string | undefined;
      let client: string | undefined;

      if (
        transaction &&
        transaction.category === TransactionCategory.Freelance
      ) {
        project = transaction.project || undefined;
        client = transaction.client || undefined;
      }

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
              defaultValue={client}
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
              defaultValue={project}
              placeholder="e.g. Website Redesign"
              className="w-full bg-black border border-neutral-800 text-white font-mono px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
              type="text"
              name="project"
              id={`${fieldPrefix}project`}
            />
          </div>
        </>
      );
    }
    case TransactionCategory.Shopping: {
      let items: ItemRef[] | undefined;
      let storeName: string | undefined;

      if (
        transaction &&
        transaction.category === TransactionCategory.Shopping
      ) {
        items = transaction.items || undefined;
        storeName = transaction.storeName || undefined;
      }

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
              defaultValue={storeName}
              placeholder="e.g. Website Redesign"
              className="w-full bg-black border border-neutral-800 text-white font-mono px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700"
              type="text"
              name="storeName"
              id={`${fieldPrefix}store`}
            />
          </div>
          <ItemsForm initialValues={items} />
        </>
      );
    }
    default:
      return null;
  }
};
