import { useEffect, useMemo, useState } from 'react';
import { SpendingLimitsOverview } from '../components/SpendingLimitsOverview';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCategories } from '../store/slices/categoriesSlice';
import { fetchTransactions } from '../store/slices/transactionsSlice';
import {
  createSpendingLimit,
  deleteSpendingLimit,
  fetchSpendingLimits,
  selectSpendingStatus,
  type SpendingStatusItem,
} from '../store/slices/spendingLimitsSlice';
import styles from './spendingLimits.module.css';

export function SpendingLimitsPage(): React.ReactElement {
  const dispatch = useAppDispatch();
  const { items: categories } = useAppSelector((state) => state.categories);
  const { items: spendingLimits, loading, error } = useAppSelector((state) => state.spendingLimits);
  const transactions = useAppSelector((state) => state.transactions.items);

  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [limitAmount, setLimitAmount] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void dispatch(fetchCategories());
    void dispatch(fetchTransactions());
    void dispatch(fetchSpendingLimits());
  }, [dispatch]);

  const status = useMemo(() => selectSpendingStatus({
    spendingLimits: { items: spendingLimits, loading, error },
    transactions: { items: transactions },
  }), [spendingLimits, transactions, loading, error]);

  const limitIdByCategory = useMemo(
    () => new Map(spendingLimits.map((limit) => [limit.categoryId, limit.id])),
    [spendingLimits],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!categoryId || !limitAmount) {
      setMessage('Preencha categoria e limite mensal.');
      return;
    }

    const result = await dispatch(createSpendingLimit({
      categoryId: Number(categoryId),
      limitAmount: Number(limitAmount),
    }));

    if (createSpendingLimit.fulfilled.match(result)) {
      setMessage('Limite cadastrado com sucesso.');
      setCategoryId('');
      setLimitAmount('');
      void dispatch(fetchSpendingLimits());
    } else {
      setMessage(typeof result.payload === 'string' ? result.payload : 'Não foi possível cadastrar o limite.');
    }
  };

  const handleDelete = async (item: SpendingStatusItem) => {
    const limitId = limitIdByCategory.get(item.categoryId);
    if (!limitId) {
      return;
    }

    await dispatch(deleteSpendingLimit(limitId));
  };

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <h1>Limites de gastos</h1>
        <p>Defina limites mensais por categoria e acompanhe o uso mensal.</p>
      </header>

      {message && <p className={styles.message}>{message}</p>}
      {error && <p role="alert" className={styles.error}>{error}</p>}

      <div className={styles.content}>
        <section className={styles.panel}>
          <h2>Novo limite</h2>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="limit-category">
                Categoria
              </label>
              <select
                id="limit-category"
                className={styles.select}
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value ? Number(event.target.value) : '')}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="limit-amount">
                Valor limite (R$)
              </label>
              <input
                id="limit-amount"
                className={styles.input}
                type="number"
                min="0"
                step="0.01"
                value={limitAmount}
                onChange={(event) => setLimitAmount(event.target.value)}
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              Salvar limite
            </button>
          </form>
        </section>

        <section className={styles.panel}>
          <h2>Limites cadastrados</h2>
          {loading ? <p className={styles.loading}>Carregando limites...</p> : null}

          {!loading && status.length === 0 ? (
            <div className={styles.emptyState}>Nenhum limite cadastrado ainda.</div>
          ) : (
            <SpendingLimitsOverview
              items={status}
              onDelete={handleDelete}
            />
          )}
        </section>
      </div>
    </section>
  );
}
