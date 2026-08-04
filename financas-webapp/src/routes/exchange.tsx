import { useEffect, useRef, useState } from 'react';
import styles from './exchange.module.css';

// Em desenvolvimento, o microfrontend é servido independentemente na porta 5175.
const MFE_SCRIPT_URL = 'http://localhost:5175/src/main.ts';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'exchange-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export function ExchangePage(): React.ReactElement {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (customElements.get('exchange-widget')) {
      setStatus('ready');
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = MFE_SCRIPT_URL;
    script.onload = () => setStatus('ready');
    script.onerror = () => setStatus('error');
    document.head.appendChild(script);
    scriptRef.current = script;

    return () => {
      scriptRef.current = null;
    };
  }, []);

  return (
    <section className={styles.exchangePage} aria-labelledby="exchange-page-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>Ferramentas internacionais</p>
        <h1 id="exchange-page-title">Câmbio de moedas</h1>
        <p>Converta valores para planejar compras, viagens e investimentos internacionais.</p>
      </header>

      {status === 'loading' && <div className={styles.loader} role="status">Carregando conversor de moedas...</div>}
      {status === 'error' && (
        <div className={styles.error} role="alert">
          Não foi possível carregar o módulo <code>financas-conversor</code>. Confirme se ele está em execução na porta 5175.
        </div>
      )}
      {status === 'ready' && (
        // @ts-expect-error O Web Component é registrado pelo microfrontend em tempo de execução.
        <exchange-widget />
      )}
    </section>
  );
}
