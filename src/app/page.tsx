const records = [
  {
    date: "2023-10-01",
    type: "expense",
    amount: 50,
    description: "Groceries and snacks for the week: milk, bread, eggs, cheese, apples, chips, soda."
  },
  {
    date: "2023-10-01",
    type: "income",
    amount: 2000,
    description: "Salary for September: deposited directly into checking account."
  },
  {
    date: "2023-10-02",
    type: "expense",
    amount: 30,
    description: "Transport costs for the week (weekly pass): bus pass purchased at metro station."
  },
  {
    date: "2023-10-03",
    type: "expense",
    amount: 15.75,
    description: "Lunch at cafe: chicken salad sandwich, coffee, and a cookie."
  },
  {
    date: "2023-10-04",
    type: "expense",
    amount: 75,
    description: "Dinner with friends: shared appetizers, two main courses (pasta and steak), and a bottle of wine."
  },
  {
    date: "2023-10-05",
    type: "income",
    amount: 150,
    description: "Freelance work payment: completed web development project for 'InnovateTech Solutions'."
  },
  {
    date: "2023-10-06",
    type: "expense",
    amount: 45.99,
    description: "Online subscription renewal: annual subscription for 'FitnessPlus' workout app."
  },
  {
    date: "2023-10-07",
    type: "expense",
    amount: 25,
    description: "Movie tickets and popcorn: two tickets for 'The Galactic Odyssey' and a large popcorn combo."
  },
  {
    date: "2023-10-08",
    type: "expense",
    amount: 120,
    description: "Utility bill: electricity bill for September, paid online via bank transfer."
  },
  {
    date: "2023-10-09",
    type: "income",
    amount: 50,
    description: "Gift from family: birthday money received from aunt and uncle."
  },
  {
    date: "2023-10-10",
    type: "expense",
    amount: 8.50,
    description: "Coffee and pastry: purchased from local bakery, a latte and a croissant."
  },
  {
    date: "2023-10-11",
    type: "expense",
    amount: 60,
    description: "Haircut: men's haircut and beard trim at 'The Modern Barber' salon."
  },
  {
    date: "2023-10-12",
    type: "expense",
    amount: 250,
    description: "Car maintenance: oil change, tire rotation, and fluid check at 'AutoCare Pro'."
  },
  {
    date: "2023-10-13",
    type: "income",
    amount: 75,
    description: "Reimbursement: expense reimbursement for business travel mileage."
  },
  {
    date: "2023-10-14",
    type: "expense",
    amount: 35.20,
    description: "Books from bookstore: 'The Silent Patient' by Alex Michaelides and 'Project Hail Mary' by Andy Weir."
  },
  {
    date: "2023-10-15",
    type: "expense",
    amount: 18,
    description: "Lunch with colleagues: shared pizza and drinks at 'Pizza Palace'."
  },
  {
    date: "2023-10-16",
    type: "expense",
    amount: 22.50,
    description: "Online course purchase: 'Advanced JavaScript Techniques' on 'LearnCode Academy'."
  },
  {
    date: "2023-10-17",
    type: "income",
    amount: 500,
    description: "Bonus from work: performance bonus for exceeding quarterly targets."
  },
  {
    date: "2023-10-18",
    type: "expense",
    amount: 40,
    description: "Dinner delivery from 'Spicy Thai': pad thai, green curry, and spring rolls."
  },
  {
    date: "2023-10-19",
    type: "expense",
    amount: 12.99,
    description: "Streaming service subscription renewal for 'MovieFlix'."
  },
  {
    date: "2023-10-20",
    type: "expense",
    amount: 55,
    description: "Clothing purchase at local store for new fall wardrobe."
  }
];

export default function Home() {
  return (
    <div className="flex flex-col w-full h-full p-4 overflow-y-auto">
      <table className="max-h-full mx-auto table-fixed h-fit record-list">
        <thead>
          <tr>
            <th className="text-sm text-start">description</th>
            <th className="text-sm text-center">amount</th>
            <th className="text-sm text-center max-w-40">type</th>
          </tr>
        </thead>
        <tbody>
          {
            records.map(record => (
              <tr key={record.description} className="transition-all record-item">
                <td className="truncate">{record.description}</td>
                <td className="w-40 text-center">{record.amount}</td>
                <td className="text-center">{record.type}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}
