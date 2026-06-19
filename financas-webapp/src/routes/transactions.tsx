import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTransactions, type TransactionType } from '../store/slices/transactionsSlice';
import './transactions.css';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC',
});

function formatType(type: TransactionType): string {
  return type === 'INCOME' ? 'Receita' : 'Despesa';
}

function formatDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function TransactionsPage(): React.ReactElement {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.transactions);

  useEffect(() => {
    void dispatch(fetchTransactions());
  }, [dispatch]);

  return (
    <section className="transactions-page" aria-labelledby="transactions-title">
      <header className="transactions-page__header">
        <p className="transactions-page__eyebrow">Controle financeiro</p>
        <h1 id="transactions-title">Histórico de transações</h1>
        <p>Consulte as receitas e despesas já registradas.</p>
      </header>

      {loading && (
        <p className="transactions-page__status" role="status">
          Carregando transações...
        </p>
      )}

      {!loading && error && (
        <p className="transactions-page__status transactions-page__status--error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="transactions-page__status">
          Nenhuma transação registrada.
        </p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="transactions-page__table-wrapper">
          <table className="transactions-page__table">
            <thead>
              <tr>
                <th scope="col">Tipo</th>
                <th scope="col">Valor</th>
                <th scope="col">Categoria</th>
                <th scope="col">Data</th>
                <th scope="col">Descrição</th>
              </tr>
            </thead>
            <tbody>
              {items.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    <span
                      className={`transactions-page__type transactions-page__type--${transaction.type.toLowerCase()}`}
                    >
                      {formatType(transaction.type)}
                    </span>
                  </td>
                  <td
                    className={`transactions-page__amount transactions-page__amount--${transaction.type.toLowerCase()}`}
                  >
                    {currencyFormatter.format(transaction.amount)}
                  </td>
                  <td>{transaction.categoryName}</td>
                  <td>{formatDate(transaction.date)}</td>
                  <td className="transactions-page__description">
                    {transaction.description || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
