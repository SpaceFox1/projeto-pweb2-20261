import { useState } from 'react';
import type { Transaction } from './utils/types';
import { ExportCSV } from './components/ExportCSV';
import { ExportPDF } from './components/ExportPDF';
import { ExportShare } from './components/ExportShare';
import { ExportPPTX } from './components/ExportPPTX';
import './widget.css';

type Tab = 'pdf' | 'csv' | 'share' | 'pptx';

interface Props {
  transactions: Transaction[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  goals?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  limits?: any[];
}

export function ExportWidget({ transactions, goals, limits }: Props): React.ReactElement {
  const [activeTab, setActiveTab] = useState<Tab>('pdf');

  return (
    <div className="ew-root">
      <nav className="ew-tabs" role="tablist" aria-label="Formatos de exportação">
        <button
          role="tab"
          type="button"
          className={`ew-tab ${activeTab === 'pdf' ? 'ew-tab--active' : ''}`}
          aria-selected={activeTab === 'pdf'}
          aria-controls="ew-panel-pdf"
          id="ew-tab-pdf"
          onClick={() => setActiveTab('pdf')}
        >
          <svg viewBox="0 0 24 24" className="ew-tab__icon" aria-hidden="true">
            <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z" />
          </svg>
          PDF
        </button>

        <button
          role="tab"
          type="button"
          className={`ew-tab ${activeTab === 'csv' ? 'ew-tab--active' : ''}`}
          aria-selected={activeTab === 'csv'}
          aria-controls="ew-panel-csv"
          id="ew-tab-csv"
          onClick={() => setActiveTab('csv')}
        >
          <svg viewBox="0 0 24 24" className="ew-tab__icon" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 13h8v1.5H8V13zm0 3h5v1.5H8V16zm0-6h8v1.5H8V10z" />
          </svg>
          CSV
        </button>

        <button
          role="tab"
          type="button"
          className={`ew-tab ${activeTab === 'share' ? 'ew-tab--active' : ''}`}
          aria-selected={activeTab === 'share'}
          aria-controls="ew-panel-share"
          id="ew-tab-share"
          onClick={() => setActiveTab('share')}
        >
          <svg viewBox="0 0 24 24" className="ew-tab__icon" aria-hidden="true">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" />
          </svg>
          Compartilhar
        </button>

        <button
          role="tab"
          type="button"
          className={`ew-tab ${activeTab === 'pptx' ? 'ew-tab--active' : ''}`}
          aria-selected={activeTab === 'pptx'}
          aria-controls="ew-panel-pptx"
          id="ew-tab-pptx"
          onClick={() => setActiveTab('pptx')}
        >
          <svg viewBox="0 0 24 24" className="ew-tab__icon" aria-hidden="true">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13H9.5v2H8V6h4zm0 5.5c.83 0 1.5-.67 1.5-1.5S12.83 8 12 8H9.5v3.5H12z" />
          </svg>
          Apresentação
        </button>
      </nav>

      <div
        role="tabpanel"
        id="ew-panel-pdf"
        aria-labelledby="ew-tab-pdf"
        hidden={activeTab !== 'pdf'}
      >
        <ExportPDF transactions={transactions} goals={goals} limits={limits} />
      </div>

      <div
        role="tabpanel"
        id="ew-panel-csv"
        aria-labelledby="ew-tab-csv"
        hidden={activeTab !== 'csv'}
      >
        <ExportCSV transactions={transactions} goals={goals} limits={limits} />
      </div>

      <div
        role="tabpanel"
        id="ew-panel-share"
        aria-labelledby="ew-tab-share"
        hidden={activeTab !== 'share'}
      >
        <ExportShare transactions={transactions} goals={goals} limits={limits} />
      </div>

      <div
        role="tabpanel"
        id="ew-panel-pptx"
        aria-labelledby="ew-tab-pptx"
        hidden={activeTab !== 'pptx'}
      >
        <ExportPPTX transactions={transactions} goals={goals} limits={limits} />
      </div>
    </div>
  );
}
