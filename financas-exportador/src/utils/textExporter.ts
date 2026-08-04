import type { Transaction } from './types';
import { currencyFormatter, calcTotals } from './types';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildWhatsAppText(transactions: Transaction[], goals: any[] = [], limits: any[] = []): string {
  const { totalIncome, totalExpense, balance } = calcTotals(transactions);

  const now = new Date();
  const period = now.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  const balanceEmoji = balance >= 0 ? '💰' : '⚠️';

  // Top 3 expense categories
  const expenseByCategory = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.categoryName] = (acc[t.categoryName] ?? 0) + t.amount;
      return acc;
    }, {});

  const topCategories = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat, amt]) => `  • ${cat}: ${currencyFormatter.format(amt)}`)
    .join('\n');

  const categoriesSection =
    topCategories.length > 0
      ? `\n\n📂 *Maiores gastos por categoria:*\n${topCategories}`
      : '';

  const goalsSection = goals.length > 0
    ? `\n\n🎯 *Metas:*\n` + goals.map((g) => `  • ${g.name}: ${currencyFormatter.format(g.targetAmount)} | ${Math.round(balance / g.targetAmount * 100)}%`).join('\n')
    : '';

  const limitsSection = limits.length > 0
    ? `\n\n🚧 *Limites Mensais:*\n` + limits.map((l) => `  • ${l.categoryName}: ${currencyFormatter.format(l.spent)} / ${currencyFormatter.format(l.limitAmount)} (${l.percentUsed}%)`).join('\n')
    : '';

  return (
    `📊 *Resumo Financeiro — ${period}*\n` +
    `_Exportado via FinanceFlow_\n` +
    `\n` +
    `✅ Receitas: *${currencyFormatter.format(totalIncome)}*\n` +
    `❌ Despesas: *${currencyFormatter.format(totalExpense)}*\n` +
    `${balanceEmoji} Saldo: *${currencyFormatter.format(balance)}*` +
    goalsSection +
    limitsSection +
    categoriesSection +
    `\n\n_Total: ${transactions.length} ${transactions.length === 1 ? 'transação registrada' : 'transações registradas'}._`
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function openWhatsApp(transactions: Transaction[], goals: any[] = [], limits: any[] = []): void {
  const text = buildWhatsAppText(transactions, goals, limits);
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
}
