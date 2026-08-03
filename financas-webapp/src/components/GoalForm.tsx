import { useEffect, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import styles from './GoalForm.module.css';

interface GoalFormValues {
  name: string;
  targetAmount: number;
  deadline: string;
  categoryId?: number;
}

interface GoalFormProps {
  onSubmit: (values: GoalFormValues) => void;
  initialValues?: Partial<GoalFormValues> | null;
  submitLabel?: string;
  onCancel?: () => void;
}

export function GoalForm({ onSubmit, initialValues, submitLabel = 'Salvar meta', onCancel }: GoalFormProps): React.ReactElement {
  const categories = useAppSelector((state) => state.categories.items);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name ?? '');
      setTargetAmount(initialValues.targetAmount?.toString() ?? '');
      setDeadline(initialValues.deadline ?? '');
      setCategoryId(initialValues.categoryId?.toString() ?? '');
    } else {
      setName('');
      setTargetAmount('');
      setDeadline('');
      setCategoryId('');
    }
  }, [initialValues]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!name.trim()) {
      nextErrors.name = 'Nome da meta é obrigatório';
    }

    if (!targetAmount.trim()) {
      nextErrors.targetAmount = 'Valor alvo é obrigatório';
    }

    if (!deadline.trim()) {
      nextErrors.deadline = 'Data limite é obrigatória';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      name: name.trim(),
      targetAmount: Number(targetAmount),
      deadline,
      categoryId: categoryId ? Number(categoryId) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="goal-name" className={styles.label}>Nome da meta</label>
        <input id="goal-name" className={styles.input} value={name} onChange={(event) => setName(event.target.value)} />
        {errors.name && <p className={styles.error}>{errors.name}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="goal-target" className={styles.label}>Valor alvo</label>
        <input id="goal-target" className={styles.input} type="number" value={targetAmount} onChange={(event) => setTargetAmount(event.target.value)} />
        {errors.targetAmount && <p className={styles.error}>{errors.targetAmount}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="goal-deadline" className={styles.label}>Data limite</label>
        <input id="goal-deadline" className={styles.input} type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
        {errors.deadline && <p className={styles.error}>{errors.deadline}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="goal-category" className={styles.label}>Categoria</label>
        <select id="goal-category" className={styles.input} value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
          <option value="">Sem categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button type="submit" className={styles.button}>{submitLabel}</button>
        {onCancel && (
          <button type="button" className={styles.secondaryButton} onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
