import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
import type { Transaction } from '../utils/types';
import { calcTotals } from '../utils/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface PDFChartsHandle {
  captureCharts: () => Promise<string[]>;
}

interface Props {
  transactions: Transaction[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  goals: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  limits: any[];
}

export const PDFCharts = forwardRef<PDFChartsHandle, Props>(({ transactions, goals, limits }, ref) => {
  const chart1Ref = useRef<any>(null);
  const chart2Ref = useRef<any>(null);
  const chart3Ref = useRef<any>(null);
  const chart4Ref = useRef<any>(null);
  const chart5Ref = useRef<any>(null);
  const chart6Ref = useRef<any>(null);

  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Wait a brief moment to ensure fonts are loaded and charts are rendered
    const timer = setTimeout(() => {
      setFontsLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useImperativeHandle(ref, () => ({
    captureCharts: async () => {
      if (!fontsLoaded) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      const refs = [chart1Ref, chart2Ref, chart3Ref, chart4Ref, chart5Ref, chart6Ref];
      const images: string[] = [];
      
      for (const r of refs) {
        if (r.current) {
          // Render a white background for PDF compatibility
          const chartInstance = r.current;
          const canvas = chartInstance.canvas;
          if (canvas) {
            images.push(chartInstance.toBase64Image('image/png', 1));
          }
        }
      }
      return images;
    },
  }));

  // Calculations
  const { totalIncome, totalExpense } = calcTotals(transactions);

  // 1. Receitas vs Despesas
  const data1 = {
    labels: ['Receitas', 'Despesas'],
    datasets: [{
      data: [totalIncome, totalExpense],
      backgroundColor: ['#10B981', '#EF4444'],
    }],
  };

  // 2. Despesas por Categoria
  const expensesByCategory = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      acc[t.categoryName] = (acc[t.categoryName] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
  const cats = Object.keys(expensesByCategory).sort((a, b) => expensesByCategory[b] - expensesByCategory[a]).slice(0, 8);
  const catData = cats.map(c => expensesByCategory[c]);
  const catColors = ['#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F43F5E', '#6366F1', '#84CC16'];

  const data2 = {
    labels: cats,
    datasets: [{
      data: catData,
      backgroundColor: catColors,
    }],
  };

  // Monthly grouping
  const monthlyStats = transactions.reduce((acc, t) => {
    const d = new Date(t.date);
    const m = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    if (!acc[m]) acc[m] = { income: 0, expense: 0 };
    if (t.type === 'INCOME') acc[m].income += t.amount;
    else acc[m].expense += t.amount;
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);
  
  const sortedMonths = Object.keys(monthlyStats).sort((a, b) => {
    const [m1, y1] = a.split('/').map(Number);
    const [m2, y2] = b.split('/').map(Number);
    return y1 === y2 ? m1 - m2 : y1 - y2;
  }).slice(-12);

  // 3. Evolução de Saldo
  let runningBalance = 0;
  const balanceData = sortedMonths.map(m => {
    runningBalance += (monthlyStats[m].income - monthlyStats[m].expense);
    return runningBalance;
  });

  const data3 = {
    labels: sortedMonths,
    datasets: [{
      label: 'Saldo Acumulado',
      data: balanceData,
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      fill: true,
      tension: 0.3,
    }],
  };

  // 4. Despesas ao Longo do Tempo
  const expData = sortedMonths.map(m => monthlyStats[m].expense);
  const data4 = {
    labels: sortedMonths,
    datasets: [{
      label: 'Despesas Mensais',
      data: expData,
      backgroundColor: '#EF4444',
    }],
  };

  // 5. Progresso de Metas
  const goalNames = goals.map(g => g.name);
  const goalPercent = goals.map(g => g.percentUsed);
  const data5 = {
    labels: goalNames,
    datasets: [{
      label: '% Atingido',
      data: goalPercent,
      backgroundColor: '#8B5CF6',
    }],
  };

  // 6. Consumo de Limites
  const limitNames = limits.map(l => l.categoryName);
  const limitPercent = limits.map(l => l.percentUsed);
  const data6 = {
    labels: limitNames,
    datasets: [{
      label: '% Consumido',
      data: limitPercent,
      backgroundColor: limitPercent.map(p => p >= 100 ? '#EF4444' : (p >= 80 ? '#F59E0B' : '#10B981')),
    }],
  };

  const chartOptions = {
    responsive: false,
    animation: { duration: 0 } as const,
    plugins: {
      legend: { position: 'bottom' as const },
    },
  };
  
  const barOptions = {
    ...chartOptions,
    scales: {
      y: { beginAtZero: true },
    }
  };

  const horizontalBarOptions = {
    ...chartOptions,
    indexAxis: 'y' as const,
    scales: {
      x: { beginAtZero: true, max: 100 },
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-9999px',
    left: '-9999px',
    visibility: 'hidden',
    width: '800px', // Fixed wide layout for better PDF export resolution
  };

  return (
    <div style={containerStyle}>
      <div style={{ width: '400px', height: '400px', background: 'white' }}>
        <Doughnut ref={chart1Ref} data={data1} options={{ ...chartOptions, plugins: { title: { display: true, text: 'Receitas vs Despesas' } } }} width={400} height={400} />
      </div>
      <div style={{ width: '400px', height: '400px', background: 'white' }}>
        <Pie ref={chart2Ref} data={data2} options={{ ...chartOptions, plugins: { title: { display: true, text: 'Despesas por Categoria (Top 8)' } } }} width={400} height={400} />
      </div>
      <div style={{ width: '600px', height: '400px', background: 'white' }}>
        <Line ref={chart3Ref} data={data3} options={{ ...chartOptions, plugins: { title: { display: true, text: 'Evolução do Saldo (12 Meses)' } } }} width={600} height={400} />
      </div>
      <div style={{ width: '600px', height: '400px', background: 'white' }}>
        <Bar ref={chart4Ref} data={data4} options={{ ...barOptions, plugins: { title: { display: true, text: 'Despesas ao Longo do Tempo' } } }} width={600} height={400} />
      </div>
      <div style={{ width: '600px', height: '400px', background: 'white' }}>
        <Bar ref={chart5Ref} data={data5} options={{ ...horizontalBarOptions, plugins: { title: { display: true, text: 'Progresso das Metas (%)' }, legend: { display: false } } }} width={600} height={400} />
      </div>
      <div style={{ width: '600px', height: '400px', background: 'white' }}>
        <Bar ref={chart6Ref} data={data6} options={{ ...horizontalBarOptions, plugins: { title: { display: true, text: 'Consumo de Limites Mensais (%)' }, legend: { display: false } } }} width={600} height={400} />
      </div>
    </div>
  );
});
