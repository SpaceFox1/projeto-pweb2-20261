import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { apiService } from '../services/apiService';
import type { TransactionType } from '../store/slices/transactionsSlice';

interface TransactionPayload {
  description: string;
  amount: number;
  type: TransactionType;
  categoryName: string;
  date: string; // Formato YYYY-MM-DD
}

export function AddTransactionPage(): React.ReactElement {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [categoryName, setCategoryName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Data do dia atual por padrão

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Montagem do payload
    const payload: TransactionPayload = {
      description,
      amount: parseFloat(amount),
      type,
      categoryName,
      date,
    };

    try {

      await apiService.post('/transactions', payload);
      
      // Redireciona o usuário de volta para a rota principal após o sucesso
      navigate('/transactions');
    } catch (err) {
      console.error(err);
      setError('Falha ao cadastrar transação. Verifique os dados informados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', padding: '24px' }}>
      
      {/* Container Central - Mesma estrutura limpa do Card de Login do Figma */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(11, 21, 40, 0.05)', width: '100%', maxWidth: '480px', boxSizing: 'border-box' }}>
        
        {/* Cabeçalho da Página */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '20px' }}>↗</span>
            <span style={{ fontWeight: 700, fontSize: '18px', color: '#0B1528', letterSpacing: '-0.5px' }}>Finance<span style={{ color: '#10B981' }}>Flow</span></span>
          </div>
          <h1 style={{ color: '#0B1528', fontSize: '24px', margin: '0 0 6px 0', fontWeight: 700 }}>Nova Transação</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '14px' }}>Insira os dados abaixo para registrar sua movimentação</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#EF4444', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', textAlign: 'center', fontWeight: 500 }}>
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Seletor de Tipo (Receita / Despesa) usando os tons do Figma */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Tipo de Movimentação</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setType('INCOME')}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: type === 'INCOME' ? '2px solid #10B981' : '1px solid #E2E8F0', backgroundColor: type === 'INCOME' ? '#ECFDF5' : '#FFF', color: type === 'INCOME' ? '#047857' : '#475569', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                ▲ Receita
              </button>
              <button
                type="button"
                onClick={() => setType('EXPENSE')}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: type === 'EXPENSE' ? '2px solid #EF4444' : '1px solid #E2E8F0', backgroundColor: type === 'EXPENSE' ? '#FEF2F2' : '#FFF', color: type === 'EXPENSE' ? '#B91C1C' : '#475569', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                ▼ Despesa
              </button>
            </div>
          </div>

          {/* Campo: Descrição */}
          <div>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Descrição</label>
            <input
              id="description"
              type="text"
              required
              placeholder="Ex: Supermercado, Salário, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Grupo de Linha Alternativa: Valor e Data */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="amount" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Valor (R$)</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label htmlFor="date" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Data</label>
              <input
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ width: '100%', padding: '11px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#334155' }}
              />
            </div>
          </div>

          {/* Campo: Categoria */}
          <div>
            <label htmlFor="category" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Categoria</label>
            <input
              id="category"
              type="text"
              required
              placeholder="Ex: Alimentação, Transporte, Lazer"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Botões de Ação Baseados no Figma */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '14px', backgroundColor: '#0B1528', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s' }}
            >
              {loading ? 'Salvando...' : 'Cadastrar Transação'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#64748B', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
            >
              Cancelar e voltar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}