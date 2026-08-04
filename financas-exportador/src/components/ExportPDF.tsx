import { useState, useRef } from 'react';
import type { Transaction } from '../utils/types';
import { exportToPDF } from '../utils/pdfExporter';
import { calcTotals, currencyFormatter } from '../utils/types';
import { PDFCharts, type PDFChartsHandle } from './PDFCharts';

interface Props {
  transactions: Transaction[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  goals?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  limits?: any[];
}

export function ExportPDF({ transactions, goals = [], limits = [] }: Props): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [exported, setExported] = useState(false);
  const chartsRef = useRef<PDFChartsHandle>(null);

  const { totalIncome, totalExpense, balance } = calcTotals(transactions);

  const handleExport = async () => {
    setLoading(true);
    try {
      let chartImages: string[] = [];
      if (chartsRef.current) {
        chartImages = await chartsRef.current.captureCharts();
      }
      await exportToPDF(transactions, goals, limits, chartImages);
      setExported(true);
      setTimeout(() => setExported(false), 2000);
    } catch (err) {
      console.error('Failed to export PDF', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="export-card">
      <div className="export-card__icon export-card__icon--pdf">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z" />
        </svg>
      </div>

      <h2 className="export-card__title">Relatório PDF</h2>
      <p className="export-card__desc">
        Gere um relatório profissional em PDF com resumo financeiro, totais e
        listagem completa de transações.
      </p>

      <div className="export-card__summary">
        <div className="summary-item summary-item--income">
          <span className="summary-item__label">Receitas</span>
          <span className="summary-item__value">{currencyFormatter.format(totalIncome)}</span>
        </div>
        <div className="summary-item summary-item--expense">
          <span className="summary-item__label">Despesas</span>
          <span className="summary-item__value">{currencyFormatter.format(totalExpense)}</span>
        </div>
        <div className={`summary-item ${balance >= 0 ? 'summary-item--income' : 'summary-item--expense'}`}>
          <span className="summary-item__label">Saldo</span>
          <span className="summary-item__value">{currencyFormatter.format(balance)}</span>
        </div>
      </div>

      <p className="export-card__count">{transactions.length} {`${transactions.length === 1 ? 'transação será incluída' : 'transações serão incluídas'}`} no relatório.</p>

      <button
        type="button"
        className={`export-btn export-btn--pdf ${exported ? 'export-btn--success' : ''}`}
        onClick={() => void handleExport()}
        disabled={loading || (transactions.length === 0 && goals.length === 0 && limits.length === 0) || exported}
      >
        {loading ? (
          <>
            <span className="export-btn__spinner" aria-hidden="true" />
            Gerando PDF...
          </>
        ) : exported ? (
          <>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
            PDF gerado!
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>
            Baixar PDF
          </>
        )}
      </button>
      
      <PDFCharts
        ref={chartsRef}
        transactions={transactions}
        goals={goals}
        limits={limits}
      />
    </div>
  );
}
