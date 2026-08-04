import { useState } from 'react';
import type { Transaction } from '../utils/types';
import { buildWhatsAppText, openWhatsApp } from '../utils/textExporter';

interface Props {
  transactions: Transaction[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  goals?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  limits?: any[];
}

export function ExportShare({ transactions, goals = [], limits = [] }: Props): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const preview = buildWhatsAppText(transactions, goals, limits);

  const handleShare = () => {
    openWhatsApp(transactions, goals, limits);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Resumo Financeiro',
          text: preview,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className="export-card">
      <div className="export-card__icon export-card__icon--whatsapp">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" />
        </svg>
      </div>

      <h2 className="export-card__title">Compartilhar Resumo</h2>
      <p className="export-card__desc">
        Compartilhe um resumo financeiro formatado diretamente pelo WhatsApp,
        Telegram ou qualquer outro aplicativo.
      </p>

      <div className="export-card__preview export-card__preview--message">
        <div className="whatsapp-bubble">
          {preview.split('\n').map((line, index) => {
            // Split the line by *bold* or _italic_ tokens while keeping the delimiters
            // Using a regex to capture bold (*...*) and italics (_..._)
            const parts = line.split(/(\*\*?[^*]+\*\*?|_[^_]+_)/g);

            return (
              <span key={index}>
                {parts.map((part, i) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i}>{part.slice(2, -2)}</strong>;
                  }
                  if (part.startsWith('*') && part.endsWith('*')) {
                    return <strong key={i}>{part.slice(1, -1)}</strong>;
                  }
                  if (part.startsWith('_') && part.endsWith('_')) {
                    return <em key={i}>{part.slice(1, -1)}</em>;
                  }
                  return part;
                })}
                <br />
              </span>
            );
          })}
          <span className="whatsapp-bubble__time">
            {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            <svg viewBox="0 0 18 18" aria-hidden="true" className="whatsapp-bubble__check">
              <path d="M17.394 5.035l-.57-.444a.434.434 0 0 0-.609.076L7.897 15.025l-4.097-3.393a.436.436 0 0 0-.612.063l-.432.544a.434.434 0 0 0 .063.609l4.937 4.091a.434.434 0 0 0 .609-.076L17.47 5.644a.434.434 0 0 0-.076-.609z" />
              <path d="M13.381 5.035l-.57-.444a.434.434 0 0 0-.609.076l-5.01 6.412-1.012-.838a.436.436 0 0 0-.612.063l-.432.544a.434.434 0 0 0 .063.609l1.851 1.533.532.44a.434.434 0 0 0 .609-.076l5.267-6.728a.434.434 0 0 0-.077-.611z" />
            </svg>
          </span>
        </div>
      </div>

      <div className="export-card__actions">
        <button
          type="button"
          className="export-btn export-btn--whatsapp"
          onClick={handleShare}
          disabled={transactions.length === 0}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
          </svg>
          Abrir no WhatsApp
        </button>

        <button
          type="button"
          className={`export-btn export-btn--copy ${copied ? 'export-btn--success' : ''}`}
          onClick={() => void handleCopy()}
          disabled={transactions.length === 0}
        >
          {copied ? (
            <>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
              Copiado!
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" /></svg>
              Copiar
            </>
          )}
        </button>
        
        {!!navigator.share && (
          <button
            type="button"
            className={`export-btn export-btn--csv ${shared ? 'export-btn--success' : ''}`}
            style={{ background: '#64748b' }}
            onClick={() => void handleNativeShare()}
            disabled={transactions.length === 0}
          >
            {shared ? (
              <>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                Compartilhado!
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" /></svg>
                Mais Opções
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
