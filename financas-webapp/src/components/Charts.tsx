import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Transaction {
  id: number;
  description: string | null;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  categoryName: string;
  date: string;
}

interface BalanceChartData {
  date: string;
  balance: number;
}

interface CategoryChartData {
  name: string;
  value: number;
}

interface IncomeExpenseData {
  name: string;
  value: number;
}

const COLORS = {
  income: '#10b981',
  expense: '#ef4444',
  balance: '#3b82f6',
};

export function BalanceOverTimeChart({
  transactions,
}: {
  transactions: Transaction[];
}): React.ReactElement {
  const getBalanceOverTime = (transactions: Transaction[]): BalanceChartData[] => {
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const chartData: BalanceChartData[] = [];
    let runningBalance = 0;

    sortedTransactions.forEach((transaction) => {
      if (transaction.type === 'INCOME') {
        runningBalance += transaction.amount;
      } else {
        runningBalance -= transaction.amount;
      }

      const date = new Date(transaction.date);
      const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;

      const existingEntry = chartData.find((entry) => entry.date === dateStr);
      if (existingEntry) {
        existingEntry.balance = runningBalance;
      } else {
        chartData.push({ date: dateStr, balance: runningBalance });
      }
    });

    return chartData.slice(-12); // Last 12 entries
  };

  const data = getBalanceOverTime(transactions);

  return (
    <ResponsiveContainer width="99%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#666" />
        <YAxis stroke="#666" />
        <Tooltip
          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
          formatter={(value: number) =>
            `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          }
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="balance"
          stroke={COLORS.balance}
          dot={{ fill: COLORS.balance }}
          isAnimationActive={true}
          name="Saldo"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ExpensesOverTimeChart({
  transactions,
}: {
  transactions: Transaction[];
}): React.ReactElement {
  const getExpensesByMonth = (transactions: Transaction[]): BalanceChartData[] => {
    // 1. Filter out only the juicy expense meat from the pack
    const expenseTransactions = transactions.filter(
      (transaction) => transaction.type === 'EXPENSE',
    );

    // 2. Map to group total amounts by "MM/YYYY" key
    const monthlyMap = new Map<string, number>();

    expenseTransactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      // Using Month/Year so data across different years doesn't get tangled up!
      const monthYearStr = `${date.getMonth() + 1}/${date.getFullYear()}`;

      const currentTotal = monthlyMap.get(monthYearStr) || 0;
      monthlyMap.set(monthYearStr, currentTotal + transaction.amount);
    });

    // 3. Convert our territory map back into an array sorted by real chronological time
    const chartData = Array.from(monthlyMap.entries()).map(([dateStr, totalAmount]) => {
      return {
        date: dateStr,
        balance: totalAmount, // Keeping 'balance' property to match your BalanceChartData type!
      };
    });

    return chartData
      .sort((a, b) => {
        const [monthA, yearA] = a.date.split('/').map(Number);
        const [monthB, yearB] = b.date.split('/').map(Number);
        return new Date(yearA, monthA - 1).getTime() - new Date(yearB, monthB - 1).getTime();
      })
      .slice(-12); // Keep the last 12 months of hunting data
  };

  const data = getExpensesByMonth(transactions);

  return (
    <ResponsiveContainer width="99%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#666" />
        <YAxis stroke="#666" />
        <Tooltip
          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
          formatter={(value: number) =>
            `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          }
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="balance"
          stroke={COLORS.expense} // Swapped to expense red so the pack doesn't get confused!
          dot={{ fill: COLORS.expense }}
          isAnimationActive={true}
          name="Despesas por Mês"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ExpensesByCategoryChart({
  transactions,
}: {
  transactions: Transaction[];
}): React.ReactElement {
  const getExpensesByCategory = (transactions: Transaction[]): CategoryChartData[] => {
    const expensesMap = new Map<string, number>();

    transactions.forEach((transaction) => {
      if (transaction.type === 'EXPENSE') {
        const current = expensesMap.get(transaction.categoryName) || 0;
        expensesMap.set(transaction.categoryName, current + transaction.amount);
      }
    });

    return Array.from(expensesMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 categories
  };

  const data = getExpensesByCategory(transactions);

  return (
    <ResponsiveContainer width="99%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={80} />
        <YAxis stroke="#666" />
        <Tooltip
          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
          formatter={(value: number) =>
            `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          }
        />
        <Bar dataKey="value" fill={COLORS.expense} name="Despesa" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function IncomeExpenseRatioChart({
  transactions,
}: {
  transactions: Transaction[];
}): React.ReactElement {
  const getIncomeExpenseRatio = (transactions: Transaction[]): IncomeExpenseData[] => {
    const income = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    return [
      { name: 'Receitas', value: income },
      { name: 'Despesas', value: expense },
    ];
  };

  const data = getIncomeExpenseRatio(transactions);

  return (
    <ResponsiveContainer width="99%" height={300}>
      <PieChart margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value, percent }) =>
            `${name}: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} (${(percent * 100).toFixed(0)}%)`
          }
          outerRadius={60}
          fill="#8884d8"
          dataKey="value"
        >
          <Cell fill={COLORS.income} />
          <Cell fill={COLORS.expense} />
        </Pie>
        <Tooltip
          formatter={(value: number) =>
            `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          }
          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
