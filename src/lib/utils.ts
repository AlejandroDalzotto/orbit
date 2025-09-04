// import type { Series, Transaction } from '@/lib/definitions';

export function dateStringToTimestamp(str: string) {
  const date = new Date(str)
  const timestamp = date.getTime() + (date.getTimezoneOffset() * 60000)

  return timestamp
}

// function getDateRange(start: Date, end: Date): string[] {
//   const dates: string[] = [];
//   const current = new Date(start);

//   while (current <= end) {
//     dates.push(formatDate(current));
//     current.setDate(current.getDate() + 1); // avanzar un día
//   }

//   return dates;
// }

// export function transactionsToSeries(transactions: Transaction[]): Series[] {
//   const grouped = new Map<string, number>();

//   if (transactions.length === 0) return [];

//   // Guardar montos por fecha
//   for (const tx of transactions) {
//     const date = tx.date.split('T')[0];
//     const current = grouped.get(date) ?? 0;
//     grouped.set(date, current + tx.amount);
//   }

//   // Obtener fecha mínima y máxima
//   const dates = transactions.map(tx => new Date(tx.date.split('T')[0]));
//   const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
//   const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

//   // Rellenar días faltantes con valor 0
//   const fullRange = getDateRange(minDate, maxDate);
//   for (const date of fullRange) {
//     if (!grouped.has(date)) {
//       grouped.set(date, 0);
//     }
//   }

//   // Convertir a array y ordenar
//   const result: Series[] = Array.from(grouped.entries())
//     .map(([time, value]) => ({ time, value }))
//     .sort((a, b) => a.time.localeCompare(b.time));

//   return result;
// }