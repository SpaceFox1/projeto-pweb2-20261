import { useState, useRef } from 'react';
import type { Transaction } from '../utils/types';
import { calcTotals, currencyFormatter } from '../utils/types';
import { exportToPPTX } from '../utils/pptxExporter';
import { PDFCharts, type PDFChartsHandle } from './PDFCharts';

interface Props {
  transactions: Transaction[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  goals?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  limits?: any[];
}

export function ExportPPTX({ transactions, goals = [], limits = [] }: Props): React.ReactElement {
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
      await exportToPPTX(transactions, goals, limits, chartImages);
      setExported(true);
      setTimeout(() => setExported(false), 2500);
    } catch (err) {
      console.error('Failed to export PPTX', err);
    } finally {
      setLoading(false);
    }
  };

  const slideCount = 2 + (limits.length > 0 ? 1 : 0) + (goals.length > 0 ? 1 : 0) + Math.ceil(6 / 4) + 1;

  return (
    <div className="export-card">
      <div className="export-card__icon export-card__icon--pptx">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13H9.5v2H8V6h4zm0 5.5c.83 0 1.5-.67 1.5-1.5S12.83 8 12 8H9.5v3.5H12z" />
        </svg>
      </div>

      <h2 className="export-card__title">Apresentação PowerPoint</h2>
      <p className="export-card__desc">
        Gere uma apresentação de slides profissional (PPTX) com análise financeira completa,
        incluindo resumo, gráficos, metas e limites organizados em slides visuais e prontos para reuniões.
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

      <p className="export-card__count">
        A apresentação terá aprox. <strong>{slideCount} slides</strong>: capa, resumo financeiro,
        {limits.length > 0 ? ' limites de gastos,' : ''}
        {goals.length > 0 ? ' metas financeiras,' : ''}
        {' '}gráficos interativos e encerramento.
      </p>

      <button
        type="button"
        className={`export-btn export-btn--pptx ${exported ? 'export-btn--success' : ''}`}
        onClick={() => void handleExport()}
        disabled={loading || (transactions.length === 0 && goals.length === 0 && limits.length === 0) || exported}
      >
        {loading ? (
          <>
            <span className="export-btn__spinner" aria-hidden="true" />
            Gerando PPTX...
          </>
        ) : exported ? (
          <>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
            Apresentação gerada!
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>
            Baixar .pptx
          </>
        )}
      </button>

      <PDFCharts ref={chartsRef} transactions={transactions} goals={goals} limits={limits} />
    </div>
  );
}
