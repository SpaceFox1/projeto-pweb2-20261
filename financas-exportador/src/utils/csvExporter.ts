import type { Transaction } from './types';
import { formatDate, currencyFormatter } from './types';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportToCSV(transactions: Transaction[], goals: any[] = [], limits: any[] = []): void {
  const headers = ['Tipo', 'Valor (R$)', 'Categoria', 'Data', 'Descrição'];

  const rows = transactions.map((t) => [
    t.type === 'INCOME' ? 'Receita' : 'Despesa',
    t.amount.toFixed(2).replace('.', ','),
    t.categoryName,
    formatDate(t.date),
    t.description ?? '',
  ]);

  let csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(';'),
    )
    .join('\n');

  if (goals.length > 0) {
    csvContent += '\n\n"METAS"\n';
    csvContent += '"Nome";"Alvo (R$)";"Prazo"\n';
    csvContent += goals
      .map((g) =>
        `"${g.name}";"${g.targetAmount.toFixed(2).replace('.', ',')}";"${formatDate(g.deadline)}"`
      )
      .join('\n');
  }

  if (limits.length > 0) {
    csvContent += '\n\n"LIMITES MENSAIS"\n';
    csvContent += '"Categoria";"Gasto (R$)";"Limite (R$)";"Uso (%)"\n';
    csvContent += limits
      .map((l) =>
        `"${l.categoryName}";"${l.spent.toFixed(2).replace('.', ',')}";"${l.limitAmount.toFixed(2).replace('.', ',')}";"${l.percentUsed}%"`
      )
      .join('\n');
  }

  // BOM for Excel to recognize UTF-8
  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `transacoes_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function previewCSV(transactions: Transaction[], goals: any[] = [], limits: any[] = []): string {
  const sample = transactions.slice(0, 5);
  let previewStr = sample
    .map((t) => {
      const tipo = t.type === 'INCOME' ? '✅ Receita' : '❌ Despesa';
      return `${tipo} | ${currencyFormatter.format(t.amount)} | ${t.categoryName} | ${formatDate(t.date)}`;
    })
    .join('\n');

  if (goals.length > 0) {
    previewStr += `\n... + ${goals.length} meta(s)`;
  }
  if (limits.length > 0) {
    previewStr += `\n... + ${limits.length} limite(s)`;
  }

  return previewStr;
}
