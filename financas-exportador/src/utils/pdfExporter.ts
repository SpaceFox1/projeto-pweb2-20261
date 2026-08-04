import type { Transaction } from './types';
import { currencyFormatter, calcTotals, formatDate } from './types';

let globalPageYPos = 0;
const elemPadding = 8;

function drawHeader(doc: any) {
  const now = new Date();
  const reportDate = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // ── Header strip
  doc.setFillColor(16, 185, 129); // --accent-color #10B981
  doc.rect(0, 0, 297, 22, 'F');

  // ── Logo (Manual SVG Path conversion)
  doc.setDrawColor(243, 243, 243);
  doc.setLineWidth(1);
  doc.setLineCap('round');
  doc.setLineJoin('round');
  // Trend line
  doc.line(23.3, 8.2, 18.8, 12.8);
  doc.line(18.8, 12.8, 16.4, 10.4);
  doc.line(16.4, 10.4, 12.8, 13.9);
  // Arrow head
  doc.line(23.3, 11.1, 23.3, 8.2);
  doc.line(23.3, 8.2, 20.5, 8.2);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('FinanceFlow', 28, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  // centered text
  doc.text('Relatório de Transações', 297 / 2, 14, { align: 'center' });

  doc.setTextColor(200, 255, 230);
  doc.setFontSize(8);
  doc.text(`Gerado em ${reportDate}`, 297 - 14, 14, { align: 'right' });

  globalPageYPos = 25 + elemPadding; // header height + margin
}

interface TableData {
  columns: string[];
  rows: (string | number)[][];
  textAlign: ('left' | 'center' | 'right')[];
  customFormatting?: (((data?: any) => void) | undefined)[];
}

async function drawTable(doc: any, tableData: TableData) {
  const { default: autoTable } = await import('jspdf-autotable');
  const columnWidths: number[] = [];

  const maxColumnDataWidth: number[] = tableData.columns.map((col, index) => {
    const colData = tableData.rows.map((row) => row[index]);
    const maxDataWidth = Math.max(
      doc.getTextWidth(col.toString()),
      ...colData.map((data) => doc.getTextWidth(data.toString())),
    );
    return maxDataWidth;
  });

  // use maxWidth data to set column width proportionally to the page width
  const totalMaxWidth = maxColumnDataWidth.reduce((sum, width) => sum + width, 0);
  const pageWidth = doc.internal.pageSize.getWidth() - 28; // 14mm margin on each side

  maxColumnDataWidth.forEach((width) => {
    const proportionalWidth = (width / totalMaxWidth) * pageWidth;
    columnWidths.push(proportionalWidth);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (autoTable as any)(doc, {
    head: [tableData.columns],
    body: tableData.rows,
    startY: globalPageYPos,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
      textColor: [15, 23, 42],
    },
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 252, 250],
    },
    columnStyles: columnWidths.map((width, index) => ({ cellWidth: width, halign: tableData.textAlign[index] || 'left' })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell: (data: any) => {
      if (tableData.customFormatting && tableData.customFormatting[data.column.index]) {
        const formatter = tableData.customFormatting[data.column.index];
        if (!formatter) return;
        formatter(data);
      }
    },
  });
}

function addPage(doc: any) {
  globalPageYPos = 0; // reset Y position for new page
  doc.addPage();
  drawHeader(doc);
}

interface Limit {
  categoryName: string;
  limitAmount: number;
  spent: number;
  percentUsed: number;
}

function drawLimits(doc: any, pageHeight: number, pageWidth: number, limits: Limit[]) {
  // ── Limits Chart & Table
  if (limits.length > 0) {
    addPage(doc);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Limites de Gastos (Progresso)', 14, globalPageYPos);

    globalPageYPos += 15;

    limits.forEach((l) => {
      if (globalPageYPos + 15 > pageHeight - 20) {
        addPage(doc);
      }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(l.categoryName, 14, globalPageYPos);

      doc.setFont('helvetica', 'normal');
      doc.text(`${l.percentUsed}% - ${currencyFormatter.format(l.spent)} de ${currencyFormatter.format(l.limitAmount)}`, pageWidth - 14, globalPageYPos, { align: 'right' });
      globalPageYPos += 4;
      // Draw progress bar
      const barWidth = pageWidth - 28; // 14mm margin on each side
      doc.setFillColor(226, 232, 240); // empty bg
      doc.rect(14, globalPageYPos, barWidth, 6, 'F');

      const fillWidth = Math.min((l.spent / l.limitAmount) * barWidth, barWidth);
      const color = l.percentUsed >= 100 ? [239, 68, 68] : (l.percentUsed >= 80 ? [245, 158, 11] : [22, 163, 74]);
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(14, globalPageYPos, fillWidth, 6, 'F');

      globalPageYPos += 15;
    });
  }
}

function drawGoals(doc: any, pageHeight: number, pageWidth: number, goals: any[]) {
  // ── Goals Table
  if (goals.length > 0) {
    addPage(doc);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Metas', 14, globalPageYPos);

    globalPageYPos += 15;

    goals.forEach((g) => {
      if (globalPageYPos + 15 > pageHeight - 20) {
        doc.addPage();
        globalPageYPos = 20;
      }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(g.name, 14, globalPageYPos);

      doc.setFont('helvetica', 'normal');
      // For goals, percentUsed and savedAmount are passed in
      const percentUsed = g.percentUsed || 0;
      const savedAmount = g.savedAmount || 0;
      doc.text(
        `Prazo: ${formatDate(g.deadline)} | ${percentUsed}% - ${currencyFormatter.format(savedAmount)} de ${currencyFormatter.format(g.targetAmount)}`,
        pageWidth - 14, globalPageYPos, { align: 'right' }
      );

      globalPageYPos += 4;
      // Draw progress bar
      const barWidth = pageWidth - 28; // 14mm margin on each side
      doc.setFillColor(226, 232, 240); // empty bg
      doc.rect(14, globalPageYPos, barWidth, 6, 'F');

      const fillWidth = Math.min((savedAmount / g.targetAmount) * barWidth, barWidth);
      const color = percentUsed >= 100 ? [34, 197, 94] : [139, 92, 246]; // Purple for goals
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(14, globalPageYPos, fillWidth, 6, 'F');

      globalPageYPos += 15;
    });
  }
}

async function drawSummaryCards(doc: any, transactions: Transaction[]) {
  const { totalIncome, totalExpense, balance } = calcTotals(transactions);

  drawHeader(doc);

  // ── Summary cards
  const cards = [
    { label: 'Total de Receitas', value: currencyFormatter.format(totalIncome), color: [16, 185, 129] as [number, number, number] },
    { label: 'Total de Despesas', value: currencyFormatter.format(totalExpense), color: [239, 68, 68] as [number, number, number] },
    { label: 'Saldo', value: currencyFormatter.format(balance), color: balance >= 0 ? [16, 185, 129] as [number, number, number] : [239, 68, 68] as [number, number, number] },
  ];

  cards.forEach((card, i) => {
    const x = 14 + i * 92;
    doc.setFillColor(248, 252, 250);
    doc.roundedRect(x, globalPageYPos, 86, 20, 3, 3, 'F');
    doc.setFillColor(...card.color);
    doc.roundedRect(x, globalPageYPos, 4, 20, 2, 2, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(card.label, x + 8, globalPageYPos + 7);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(card.value, x + 8, globalPageYPos + 15);
  });

  globalPageYPos += 20 + elemPadding; // cards height + margin

  // ── Transactions table
  const tableBody = transactions.map((t) => [
    t.type === 'INCOME' ? 'Receita' : 'Despesa',
    currencyFormatter.format(t.amount),
    t.categoryName,
    formatDate(t.date),
    t.description ?? '—',
  ]);

  await drawTable(doc, {
    columns: ['Tipo', 'Valor', 'Categoria', 'Data', 'Descrição'],
    rows: tableBody,
    textAlign: ['center', 'right', 'left', 'center', 'left'],
    customFormatting: [
      (data: any) => {
        if (data.section === 'body') {
          const row = transactions[data.row.index];
          if (row) {
            data.cell.styles.textColor = row.type === 'INCOME' ? [16, 185, 129] : [239, 68, 68];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      (data: any) => {
        if (data.section === 'body') {
          const row = transactions[data.row.index];
          if (row) {
            data.cell.styles.textColor = row.type === 'INCOME' ? [16, 185, 129] : [239, 68, 68];
          }
        }
      },
      undefined, // No custom formatting for category
      undefined, // No custom formatting for date
      undefined, // No custom formatting for description
    ],
  });
}

function drawFooter(doc: any) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${pageCount} — FinanceFlow`,
      297 / 2,
      210 - 5,
      { align: 'center' },
    );
  }
}

async function drawGraphs(doc: any, chartImages: string[]) {
  if (!chartImages || chartImages.length === 0) return;

  const titles = [
    'Receitas vs Despesas',
    'Despesas por Categoria',
    'Evolução do Saldo (12 Meses)',
    'Despesas ao Longo do Tempo',
    'Progresso das Metas (%)',
    'Consumo de Limites Mensais (%)'
  ];

  for (let i = 0; i < chartImages.length; i++) {
    const isLeft = i % 2 === 0;
    
    if (isLeft) {
      addPage(doc);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Análise Financeira (Gráficos Profissionais)', 14, globalPageYPos);
      globalPageYPos += 15;
    }

    const xPos = isLeft ? 14 : 154; // Left column at 14mm, Right column at 154mm (Page is 297mm wide)
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(titles[i] || `Gráfico ${i + 1}`, xPos, globalPageYPos);
    
    const imgData = chartImages[i];
    
    // Index 0 and 1 are 400x400 (square), others are 600x400 (3:2)
    const imgWidth = (i < 2) ? 80 : 120;
    const imgHeight = 80;
    
    // Center the square images within their column (column width ~120mm)
    const offsetX = (i < 2) ? (120 - 80) / 2 : 0;

    doc.addImage(imgData, 'PNG', xPos + offsetX, globalPageYPos + 5, imgWidth, imgHeight);
  }
}

export async function exportToPDF(transactions: Transaction[], goals: any[] = [], limits: any[] = [], chartImages: string[] = []): Promise<void> {
  // Dynamic import — loads jsPDF and autotable only when user requests PDF
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  await drawSummaryCards(doc, transactions);
  drawLimits(doc, pageHeight, pageWidth, limits);
  drawGoals(doc, pageHeight, pageWidth, goals);
  await drawGraphs(doc, chartImages);

  drawFooter(doc);

  doc.save(`relatorio_financas_${new Date().toISOString().slice(0, 10)}.pdf`);
}
