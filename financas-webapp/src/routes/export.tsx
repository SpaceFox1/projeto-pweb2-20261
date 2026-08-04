import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTransactions } from '../store/slices/transactionsSlice';
import { fetchGoals } from '../store/slices/goalsSlice';
import { fetchSpendingLimits, selectSpendingStatus } from '../store/slices/spendingLimitsSlice';
import styles from './export.module.css';

// URL do microfrontend — em dev, roda na porta 5174
const MFE_SCRIPT_URL = 'http://localhost:5174/src/main.ts';

// O Web Component é registrado pelo microfrontend como <export-widget>
// Precisamos declarar o elemento para o TypeScript aceitar no JSX
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'export-widget': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { transactions?: string; goals?: string; limits?: string },
        HTMLElement
      >;
    }
  }
}

export function ExportPage(): React.ReactElement {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.transactions);
  const { items: goals } = useAppSelector((state) => state.goals);
  const spendingStatus = useAppSelector(selectSpendingStatus);

  const [mfeStatus, setMfeStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Fetch transactions if not already loaded
  useEffect(() => {
    if (items.length === 0) {
      void dispatch(fetchTransactions());
    }
    void dispatch(fetchGoals());
    void dispatch(fetchSpendingLimits());
  }, [dispatch, items.length]);

  // Dynamically load the microfrontend script
  useEffect(() => {
    if (scriptRef.current) return; // already mounted

    const script = document.createElement('script');
    script.type = 'module';
    script.src = MFE_SCRIPT_URL;
    script.onload = () => setMfeStatus('ready');
    script.onerror = () => setMfeStatus('error');

    document.head.appendChild(script);
    scriptRef.current = script;

    return () => {
      // We intentionally keep the script loaded (Web Component stays registered)
      // but clean up the ref so StrictMode double-invocation is safe
      scriptRef.current = null;
    };
  }, []);

  const transactionsJSON = JSON.stringify(items);
  const goalsJSON = JSON.stringify(goals);
  const limitsJSON = JSON.stringify(spendingStatus);

  return (
    <section className={styles.exportPage} aria-labelledby="export-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>Ferramentas de dados</p>
        <h1 id="export-title">Exportar transações</h1>
        <p>
          Baixe seus dados financeiros em PDF ou CSV, ou compartilhe um resumo em texto em aplicativos mensageiros.
        </p>
      </header>

      {loading && (
        <p className={styles.status} role="status">
          Carregando transações...
        </p>
      )}

      {!loading && mfeStatus === 'loading' && (
        <div className={styles.mfeLoader} role="status" aria-live="polite">
          <span className={styles.spinner} aria-hidden="true" />
          <p>Carregando módulo de exportação...</p>
        </div>
      )}

      {!loading && mfeStatus === 'error' && (
        <div className={styles.mfeError} role="alert">
          <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.errorIcon}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <div>
            <strong>Módulo de exportação indisponível</strong>
            <p>
              Não foi possivel carregar o modulo <code>financas-exportador</code>, ele possivelmente está indisponivel no momento.
            </p>
          </div>
        </div>
      )}

      {mfeStatus === 'ready' && (
        /* @ts-expect-error microfrontend */
        <export-widget transactions={transactionsJSON} goals={goalsJSON} limits={limitsJSON} />
      )}
    </section>
  );
}
