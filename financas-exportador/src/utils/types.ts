export interface Transaction {
  id: number;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId: number;
  categoryName: string;
  date: string;
  description: string | null;
}

export const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC',
});

export function formatDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function calcTotals(transactions: Transaction[]) {
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}
