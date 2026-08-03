import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createGoal, deleteGoal, fetchGoals, selectGoalProgress, updateGoal, type Goal } from '../store/slices/goalsSlice';
import { fetchCategories } from '../store/slices/categoriesSlice';
import { fetchTransactions } from '../store/slices/transactionsSlice';
import { GoalForm } from '../components/GoalForm';
import styles from './goals.module.css';

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));

export function GoalsPage(): React.ReactElement {
  const dispatch = useAppDispatch();
  const { items: goals, loading, error } = useAppSelector((state) => state.goals);
  const transactions = useAppSelector((state) => state.transactions.items);
  const [, setIsSubmitting] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  useEffect(() => {
    void dispatch(fetchGoals());
    void dispatch(fetchTransactions());
    void dispatch(fetchCategories());
  }, [dispatch]);

  const handleSubmit = async (values: { name: string; targetAmount: number; deadline: string; categoryId?: number }) => {
    setIsSubmitting(true);
    const result = editingGoal
      ? await dispatch(updateGoal({ id: editingGoal.id, ...values }))
      : await dispatch(createGoal(values));
    setIsSubmitting(false);

    if ((editingGoal ? updateGoal.fulfilled : createGoal.fulfilled).match(result)) {
      setEditingGoal(null);
    }
  };

  const handleEdit = (goal: Goal): void => {
    setEditingGoal(goal);
  };

  const handleDelete = async (goal: Goal): Promise<void> => {
    const confirmed = window.confirm(`Deseja excluir a meta “${goal.name}”?`);
    if (!confirmed) {
      return;
    }

    const result = await dispatch(deleteGoal(goal.id));
    if (deleteGoal.fulfilled.match(result)) {
      if (editingGoal?.id === goal.id) {
        setEditingGoal(null);
      }
    }
  };

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <h1>Metas financeiras</h1>
        <p>Cadastre objetivos de poupança e acompanhe o progresso com base nas receitas registradas.</p>
      </header>

      {error && <p role="alert">{error}</p>}

      <div className={styles.content}>
        <section className={styles.panel}>
          <h2>{editingGoal ? 'Editar meta' : 'Nova meta'}</h2>
          <GoalForm
            onSubmit={handleSubmit}
            initialValues={editingGoal ? {
              name: editingGoal.name,
              targetAmount: editingGoal.targetAmount,
              deadline: editingGoal.deadline,
              categoryId: editingGoal.categoryId ?? undefined,
            } : null}
            submitLabel={editingGoal ? 'Atualizar meta' : 'Salvar meta'}
            onCancel={() => setEditingGoal(null)}
          />
        </section>

        <section className={styles.panel}>
          <h2>Metas cadastradas</h2>
          {loading ? <p>Carregando metas...</p> : null}

          {goals.length === 0 && !loading ? (
            <div className={styles.emptyState}>Nenhuma meta cadastrada ainda.</div>
          ) : null}

          <div className={styles.goalsList}>
            {goals.map((goal: Goal) => {
              const progress = selectGoalProgress(goal.id)({
                goals: { items: goals, loading, error },
                transactions: { items: transactions },
              });

              return (
                <article key={goal.id} className={styles.goalCard}>
                  <div className={styles.goalHeader}>
                    <div>
                      <h3>{goal.name}</h3>
                      <p className={styles.goalMeta}>Prazo: {formatDate(goal.deadline)}</p>
                    </div>
                    <span className={styles.goalAmount}>{formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className={styles.progressTrack} aria-label={`Progresso da meta ${goal.name}`}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                  </div>
                  <div className={styles.goalFooter}>
                    <span className={styles.progressPercent}>{progress}%</span>
                    <span>{goal.categoryName ?? 'Sem categoria'}</span>
                  </div>
                  <div className={styles.actionRow}>
                    <button type="button" className={styles.editButton} onClick={() => handleEdit(goal)}>
                      ✎ Editar
                    </button>
                    <button type="button" className={styles.deleteButton} onClick={() => void handleDelete(goal)}>
                      🗑 Excluir
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}
