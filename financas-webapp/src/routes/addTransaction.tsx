import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCategories } from '../store/slices/categoriesSlice';
import { fetchTransactions } from '../store/slices/transactionsSlice';
import {
  calculateSpendingPercent,
  fetchSpendingLimits,
  getProjectedSpendingStatus,
  getSpendingStatusColor,
  selectSpendingStatus,
} from '../store/slices/spendingLimitsSlice';
import {
  invalidateTransactionsCache,
  showSpendingLimitNotification,
} from '../utils/serviceWorkerCache';
import { apiService } from '../services/apiService';
import type { TransactionType } from '../store/slices/transactionsSlice';
import './addTransaction.css';

interface TransactionPayload {
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: number;
  date: string;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function AddTransactionPage(): React.ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: categories, loading: categoriesLoading } = useAppSelector(
    (state) => state.categories,
  );
  const spendingLimits = useAppSelector((state) => state.spendingLimits.items);
  const transactions = useAppSelector((state) => state.transactions.items);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('INCOME');
  const [categoryId, setCategoryId] = useState<number | ''>('');

  const getLocalDateString = () => {
    const localDate = new Date();
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getLocalDateString());

  useEffect(() => {
    void dispatch(fetchCategories());
    void dispatch(fetchTransactions());
    void dispatch(fetchSpendingLimits());
  }, [dispatch]);

  const spendingStatus = selectSpendingStatus({
    spendingLimits: { items: spendingLimits, loading: false, error: null },
    transactions: { items: transactions },
  });

  const limitWarning = useMemo(() => {
    if (type !== 'EXPENSE' || !categoryId || !amount) {
      return null;
    }

    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return null;
    }

    const currentStatus = spendingStatus.find((item) => item.categoryId === categoryId);
    const projected = getProjectedSpendingStatus(currentStatus, parsedAmount);

    if (!projected || projected.projectedPercent < 80) {
      return null;
    }

    return projected;
  }, [amount, categoryId, spendingStatus, type]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!categoryId) {
      setError('Selecione uma categoria.');
      setLoading(false);
      return;
    }

    const payload: TransactionPayload = {
      description,
      amount: parseFloat(amount),
      type,
      categoryId: categoryId as number,
      date,
    };

    try {
      await apiService.post('/transactions', payload);
      const currentStatus = spendingStatus.find((item) => item.categoryId === categoryId);
      if (type === 'EXPENSE' && currentStatus) {
        const projectedSpent = currentStatus.spent + parseFloat(amount);
        const projectedPercent = calculateSpendingPercent(projectedSpent, currentStatus.limitAmount);

        if (projectedPercent >= 80) {
          showSpendingLimitNotification(
            'Limite de gasto atingido',
            `A categoria ${currentStatus.categoryName ?? 'selecionada'} está em ${projectedPercent}% do limite mensal.`,
          );
        }
      }

      invalidateTransactionsCache();
      dispatch(fetchTransactions());
      navigate('/transactions');
    } catch (err) {
      console.error(err);
      setError('Falha ao cadastrar transação. Verifique os dados informados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-transaction-container">
      <div className="transaction-card">
        <header className="transaction-card__header">
          <div className="transaction-card__logo">
            <span className="transaction-card__logo-icon">↗</span>
            <span className="transaction-card__logo-text">
              Finance<span>Flow</span>
            </span>
          </div>
          <h1 className="transaction-card__title">Nova Transação</h1>
          <p className="transaction-card__subtitle">
            Insira os dados abaixo para registrar sua movimentação
          </p>
        </header>

        {error && <div className="transaction-card__error">{error}</div>}

        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="transaction-form__group">
            <label className="transaction-form__label">Tipo de Movimentação</label>
            <div className="type-toggle-group">
              <button
                type="button"
                onClick={() => setType('INCOME')}
                className={`type-toggle-btn type-toggle-btn--income ${type === 'INCOME' ? 'active' : ''
                  }`}
              >
                ▲ Receita
              </button>
              <button
                type="button"
                onClick={() => setType('EXPENSE')}
                className={`type-toggle-btn type-toggle-btn--expense ${type === 'EXPENSE' ? 'active' : ''
                  }`}
              >
                ▼ Despesa
              </button>
            </div>
          </div>

          <div className="transaction-form__group">
            <label htmlFor="description" className="transaction-form__label">
              Descrição
            </label>
            <input
              id="description"
              type="text"
              required
              placeholder="Ex: Supermercado, Salário, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="transaction-form__input"
            />
          </div>

          <div className="transaction-form__row">
            <div className="transaction-form__group">
              <label htmlFor="amount" className="transaction-form__label">
                Valor (R$)
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="transaction-form__input"
              />
            </div>

            <div className="transaction-form__group">
              <label htmlFor="date" className="transaction-form__label">
                Data
              </label>
              <input
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="transaction-form__input"
              />
            </div>
          </div>

          <div className="transaction-form__group">
            <label htmlFor="category" className="transaction-form__label">
              Categoria
            </label>
            <select
              id="category"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : '')}
              className="transaction-form__input"
              disabled={categoriesLoading}
            >
              <option value="">
                {categoriesLoading ? 'Carregando categorias...' : 'Selecione uma categoria'}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="transaction-form__actions">
            {limitWarning && (
              <div
                className="limit-warning-popup"
                role="alert"
                style={{ borderColor: getSpendingStatusColor(limitWarning.projectedPercent) }}
              >
                <strong>{limitWarning.categoryName}</strong>
                <p>
                  Esta despesa levará o uso do limite para{' '}
                  <span style={{ color: getSpendingStatusColor(limitWarning.projectedPercent) }}>
                    {limitWarning.projectedPercent}%
                  </span>
                  .
                </p>
                <p className="limit-warning-popup__detail">
                  Projeção: {formatCurrency(limitWarning.projectedSpent)} de {formatCurrency(limitWarning.limitAmount)}
                </p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Salvando...' : 'Cadastrar Transação'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/transactions')}
              className="btn-cancel"
            >
              Cancelar e voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
