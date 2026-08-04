import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { currencies, CurrencyCode, fetchExchangeRates, selectQuote, type AppDispatch, type RootState } from './store';
import './widget.css';

const moneyFormatter = (value: number, currency: CurrencyCode) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);

export function ExchangeWidget(): React.ReactElement {
  const dispatch = useDispatch<AppDispatch>();
  const [amount, setAmount] = useState('');
  const [from, setFrom] = useState<CurrencyCode>('BRL');
  const [to, setTo] = useState<CurrencyCode>('USD');
  const [submitted, setSubmitted] = useState(false);
  const quote = useSelector((state: RootState) => selectQuote(state, from, to));
  const { loading, error } = useSelector((state: RootState) => state.exchange);

  const numericAmount = Number(amount.replace(',', '.'));
  const hasValidAmount = Number.isFinite(numericAmount) && numericAmount > 0;
  const convertedValue = useMemo(() => (quote && hasValidAmount ? numericAmount * quote.rate : null), [quote, hasValidAmount, numericAmount]);

  useEffect(() => {
    setSubmitted(false);
  }, [from, to]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    // The microfrontend store survives route changes while its script remains loaded.
    // Reuse an already obtained quote for the same currency pair.
    if (hasValidAmount && !quote) void dispatch(fetchExchangeRates({ from, to }));
  };

  const swapCurrencies = () => {
    setFrom(to);
    setTo(from);
  };

  const formatUpdate = (value: string) =>
    new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

  return (
    <div className="xw-root">
      <form className="xw-card" onSubmit={handleSubmit} noValidate>
        <label className="xw-field" htmlFor="xw-amount">
          Valor a converter
          <input
            id="xw-amount"
            inputMode="decimal"
            placeholder="Ex.: 100,00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-invalid={submitted && !hasValidAmount}
            aria-describedby={submitted && !hasValidAmount ? 'xw-amount-error' : undefined}
          />
        </label>
        {submitted && !hasValidAmount && <p id="xw-amount-error" className="xw-validation" role="alert">Informe um valor maior que zero.</p>}

        <div className="xw-currencies">
          <label className="xw-field" htmlFor="xw-from">
            Moeda de origem
            <select id="xw-from" value={from} onChange={(event) => setFrom(event.target.value as CurrencyCode)}>
              {currencies.map((currency) => <option value={currency.code} key={currency.code}>{currency.code} — {currency.name}</option>)}
            </select>
          </label>
          <button className="xw-swap" type="button" onClick={swapCurrencies} aria-label="Inverter moedas de origem e destino" title="Inverter moedas">⇄</button>
          <label className="xw-field" htmlFor="xw-to">
            Moeda de destino
            <select id="xw-to" value={to} onChange={(event) => setTo(event.target.value as CurrencyCode)}>
              {currencies.map((currency) => <option value={currency.code} key={currency.code}>{currency.code} — {currency.name}</option>)}
            </select>
          </label>
        </div>

        <button className="xw-submit" type="submit" disabled={loading}>{loading ? 'Consultando cotação...' : 'Converter'}</button>
        {error && <p className="xw-error" role="alert">{error}</p>}

        {convertedValue !== null && quote && (
          <section className="xw-result" aria-live="polite">
            <p>Você receberá aproximadamente</p>
            <strong>{moneyFormatter(convertedValue, to)}</strong>
            <span>1 {from} = {moneyFormatter(quote.rate, to)}</span>
            <small>Cotação de {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(`${quote.quotedAt}T12:00:00`))} · consultada em {formatUpdate(quote.fetchedAt)}</small>
          </section>
        )}
      </form>
    </div>
  );
}
