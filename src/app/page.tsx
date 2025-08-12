import Chart from '@/components/Chart';
import { IconAdd, IconDelete } from '@/components/Icons';
import { transactionsToSeries } from '@/lib/utils';
import { Transaction } from '@/models/transaction';
import clsx from 'clsx';

const records: Transaction[] = [
  {
    date: '2025-06-27',
    id: '1',
    createdAt: '2025-06-30',
    updatedAt: '2025-06-30',
    currency: 'ARS',
    category: 'salary',
    type: 'income',
    amount: 150000,
    details: 'Pago de trabajo de colocación de cielo raso y pintura en living y cocina'
  },
  {
    date: '2025-06-27',
    id: '2',
    createdAt: '2025-06-30',
    updatedAt: '2025-06-30',
    currency: 'ARS',
    category: 'online shopping',
    type: 'expense',
    amount: 51797.14,
    details: 'Compra de disco SSD M2 de 480 GB'
  },
  {
    date: '2025-06-27',
    id: '3',
    createdAt: '2025-06-30',
    updatedAt: '2025-06-30',
    currency: 'ARS',
    category: 'supermarket',
    type: 'expense',
    amount: 15200,
    details: 'Compras varias en los chinos'
  },
  {
    date: '2025-06-28',
    id: '4',
    createdAt: '2025-06-30',
    updatedAt: '2025-06-30',
    currency: 'ARS',
    category: 'supermarket',
    type: 'expense',
    amount: 19642.50,
    details: 'Compras varias en el kiosko de la esquina'
  },
  {
    date: '2025-07-01',
    id: '5',
    createdAt: '2025-07-28',
    updatedAt: '2025-07-28',
    currency: 'ARS',
    category: 'supermarket',
    type: 'expense',
    amount: 5300,
    details: 'Compras en los chinos'
  },
  {
    date: '2025-07-01',
    id: '6',
    createdAt: '2025-07-28',
    updatedAt: '2025-07-28',
    currency: 'ARS',
    category: 'supermarket',
    type: 'expense',
    amount: 5100,
    details: 'Compras en el super de la esquina'
  },
  {
    date: '2025-07-03',
    id: '7',
    createdAt: '2025-07-28',
    updatedAt: '2025-07-28',
    currency: 'ARS',
    category: 'salary',
    type: 'income',
    amount: 100000,
    details: '1er pago del trabajo de pisos'
  },
  {
    date: '2025-07-03',
    id: '8',
    createdAt: '2025-07-28',
    updatedAt: '2025-07-28',
    currency: 'ARS',
    category: 'supermarket',
    type: 'expense',
    amount: 21190,
    details: 'Compras en los chinos'
  },
  {
    date: '2025-07-04',
    id: '9',
    createdAt: '2025-07-28',
    updatedAt: '2025-07-28',
    currency: 'ARS',
    category: 'salary',
    type: 'income',
    amount: 300000,
    details: '2do pago del trabajo de pisos y pintura.'
  },
  {
    date: '2025-07-06',
    id: '10',
    createdAt: '2025-07-28',
    updatedAt: '2025-07-28',
    currency: 'ARS',
    category: 'supermarket',
    type: 'expense',
    amount: 5200,
    details: 'Pago por comida con los pibes'
  },
  {
    date: '2025-07-07',
    id: '11',
    createdAt: '2025-07-28',
    updatedAt: '2025-07-28',
    currency: 'ARS',
    category: 'supermarket',
    type: 'expense',
    amount: 25400,
    details: 'Compras varias en los chinos'
  },
  {
    date: '2025-07-08',
    id: '12',
    createdAt: '2025-07-28',
    updatedAt: '2025-07-28',
    currency: 'ARS',
    category: 'supermarket',
    type: 'expense',
    amount: 14300,
    details: 'Compras varias en el super de la plaza'
  },
  {
    date: '2025-07-09',
    id: '13',
    createdAt: '2025-07-28',
    updatedAt: '2025-07-28',
    currency: 'ARS',
    category: 'online shopping',
    type: 'expense',
    amount: 258608,
    details: 'Compra de teclado mecanico mchose Gx87'
  },
  {
    date: '2025-07-10',
    id: '14',
    createdAt: '2025-07-28',
    updatedAt: '2025-07-28',
    currency: 'ARS',
    category: 'cash transfer',
    type: 'income',
    amount: 10000,
    details: 'Transferencia para comprar la fuente de 700w'
  },
  {
    date: '2025-07-10',
    id: '15',
    createdAt: '2025-07-28',
    updatedAt: '2025-07-28',
    currency: 'ARS',
    category: 'shopping',
    type: 'expense',
    amount: 135000,
    details: 'Pago del mantenimiento del pc + fuente de 700w'
  },
  {
    date: '2025-07-11',
    id: '16',
    createdAt: '2025-07-28',
    updatedAt: '2025-07-28',
    currency: 'ARS',
    category: 'cash transfer',
    type: 'income',
    amount: 30000,
    details: 'Transferencia de anda a saber qué'
  },
  {
    date: '2025-07-14',
    id: '17',
    createdAt: '2025-07-28',
    updatedAt: '2025-07-28',
    currency: 'ARS',
    category: 'supermarket',
    type: 'expense',
    amount: 11500,
    details: 'Compras varias en los chinos'
  },
  {
    date: '2025-07-16',
    id: '18',
    createdAt: '2025-07-28',
    updatedAt: '2025-07-28',
    currency: 'ARS',
    category: 'supermarket',
    type: 'expense',
    amount: 11135,
    details: 'Compras en el kiosko de la esquina'
  },
  {
    date: '2025-07-20',
    id: '19',
    createdAt: '2025-07-28',
    updatedAt: '2025-07-28',
    currency: 'ARS',
    category: 'supermarket',
    type: 'expense',
    amount: 6300,
    details: 'Compras en los chinos'
  },
  {
    date: '2025-07-24',
    id: '20',
    createdAt: '2025-07-28',
    updatedAt: '2025-07-28',
    currency: 'ARS',
    category: 'salary',
    type: 'income',
    amount: 30000,
    details: 'Pago por el arreglo de un caño de agua'
  },
  {
    date: '2025-07-28',
    id: '21',
    createdAt: '2025-07-28',
    updatedAt: '2025-07-28',
    currency: 'ARS',
    category: 'supermarket',
    type: 'expense',
    amount: 22200,
    details: 'Compras varias en los chinos'
  },
  {
    date: '2025-08-05',
    id: '22',
    createdAt: '2025-08-06',
    updatedAt: '2025-08-06',
    currency: 'ARS',
    category: 'supermarket',
    type: 'expense',
    amount: 2800,
    details: 'Compras varias en los chinos'
  }
];

export default function Home() {

  const expenses = records.filter(tx => tx.type === 'expense');
  const incomes = records.filter(tx => tx.type === 'income');

  const expensesSeries = transactionsToSeries(expenses);
  const incomesSeries = transactionsToSeries(incomes);
  return (
    <div className='flex flex-col items-end w-full h-full p-4 overflow-y-auto'>
      <div className='flex items-center gap-x-2'>
        <button className='border border-transparent rounded-lg transition-all hover:scale-105 hover:*:fill-green-500 hover:border-green-400 hover:bg-green-500/10'>
          <IconAdd className='transition-colors' size={32} />
        </button>
        <button className='border border-transparent rounded-lg transition-all hover:scale-105 hover:*:fill-red-500 hover:border-red-400 hover:bg-red-500/10'>
          <IconDelete className='transition-colors' size={32} />
        </button>
      </div>
      <div className='container flex flex-col w-full max-h-full mx-auto h-fit record-list'>
        <div className='grid items-center py-2 transition-opacity grid-cols-[repeat(14,_minmax(0,_1fr))]'>
          <p className='col-span-2'>date</p>
          <p className='col-span-4 truncate'>description</p>
          <p className='col-span-2 text-center'>amount</p>
          <p className='col-span-2 text-center'>currency</p>
          <p className='col-span-1 text-center'>type</p>
          <span className='col-span-3 truncate place-self-end'>category</span>
        </div>
        {
          records.map(r => {

            return (
              <div className={clsx(
                'text-sm hover:cursor-pointer grid items-center transition-all grid-cols-[repeat(14,_minmax(0,_1fr))] record-item',
                { 'hover:text-green-400': r.type === 'income' },
                { 'hover:text-red-400': r.type === 'expense' },
              )} key={r.id}>
                <p className='col-span-2'>{r.date}</p>
                <p className='col-span-4 truncate' title={r.details}>{r.details}</p>
                <p className='col-span-2 text-center'>${r.amount}</p>
                <p className='col-span-2 text-center'>{r.currency}</p>
                <p className={clsx('col-span-1 font-black text-xl text-center',
                  { 'text-green-400': r.type === 'income' },
                  { 'text-red-400': r.type === 'expense' }
                )}>{r.type === 'income' ? <>&#x2191;</> : <>&#x2193;</>}</p>
                <span className='col-span-3 px-2 py-1 truncate place-self-end'>{r.category}</span>
              </div>
            )

          })
        }
      </div>

      <div className='container flex flex-col w-full max-h-full mx-auto mb-20 h-fit'>
        <h1 className='my-10'>Expenses</h1>
        <Chart data={expensesSeries} />

        <h1 className='my-10'>Incomes</h1>
        <Chart data={incomesSeries} />
      </div>
    </div>
  );
}
