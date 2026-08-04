import { useState } from 'react';
import type { Transaction } from '../utils/types';
import { exportToCSV, previewCSV } from '../utils/csvExporter';

interface Props {
  transactions: Transaction[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  goals?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  limits?: any[];
}

export function ExportCSV({ transactions, goals = [], limits = [] }: Props): React.ReactElement {
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    exportToCSV(transactions, goals, limits);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const preview = previewCSV(transactions, goals, limits);

  return (
    <div className="export-card">
      <div className="export-card__icon export-card__icon--csv">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
          <path d="M8 12h8v2H8zm0 4h8v2H8z" />
        </svg>
      </div>

      <h2 className="export-card__title">Planilha CSV</h2>
      <p className="export-card__desc">
        Gera um arquivo compatível com Excel, Google Sheets ou Apple Numbers para
        análises avançadas de todos os seus registros financeiros.
      </p>

      <div className="export-card__preview">
        <p className="export-card__preview-label">
          Prévia dos dados:
        </p>
        <pre className="export-card__preview-content">{preview || 'Nenhum dado para exibir.'}</pre>
        {transactions.length > 5 && (
          <p className="export-card__preview-more">
            + {transactions.length - 5} linha(s) adicionais no arquivo
          </p>
        )}
      </div>

      <div className="export-card__actions">
        <button
          type="button"
          className={`export-btn export-btn--csv ${exported ? 'export-btn--success' : ''}`}
          onClick={handleExport}
          disabled={(transactions.length === 0 && goals.length === 0 && limits.length === 0) || exported}
        >
          {exported ? (
            <>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
              Concluído!
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>
              Baixar .csv
            </>
          )}
        </button>
      </div>
    </div>
  );
}
