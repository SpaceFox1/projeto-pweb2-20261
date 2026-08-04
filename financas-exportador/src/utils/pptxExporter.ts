import type { Transaction } from './types';
import { calcTotals, currencyFormatter, formatDate } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function exportToPPTX(transactions: Transaction[], goals: any[] = [], limits: any[] = [], chartImages: string[] = []): Promise<void> {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const prs = new PptxGenJS();

  prs.layout = 'LAYOUT_WIDE'; // 13.33" x 7.5"
  prs.author = 'FinanceFlow';
  prs.company = 'FinanceFlow';
  prs.subject = 'Relatório Financeiro';

  const { totalIncome, totalExpense, balance } = calcTotals(transactions);

  // ── Color tokens
  const GREEN = '10B981';
  const RED = 'EF4444';
  const DARK = '0F172A';
  const SLATE = '64748B';
  const WHITE = 'FFFFFF';
  const AMBER = 'F59E0B';
  const PURPLE = '8B5CF6';
  const LIGHT_BG = 'F8FAFC';

  function loadImageFromUrl(url: string): Promise<string> {
    return fetch(url).then((res) => res.blob()).then((blob) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read image data'));
        }
      };
      reader.readAsDataURL(blob);
    }));
  }

  const logoData = await loadImageFromUrl('/images/Logo.png');

  // Helper to add header band on each slide
  async function addHeader(slide: any, title: string, subtitle?: string) {
    // Green header band
    slide.addShape(prs.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 1.1,
      fill: { color: GREEN },
      line: { type: 'none' },
    });

    // add logo png from public/images/logo.png
    slide.addImage({
      x: 0.25, y: 0.15, w: 0.8, h: 0.8,
      data: logoData,
    });

    // App title
    slide.addText('FinanceFlow', {
      x: 1.1, y: 0.2, w: 3, h: 0.4,
      fontSize: 14, bold: true, color: WHITE,
    });
    slide.addText('Análise Financeira', {
      x: 1.1, y: 0.58, w: 3, h: 0.3,
      fontSize: 9, color: 'D1FAE5',
    });

    // Slide title (right side)
    slide.addText(title, {
      x: 4.5, y: 0.15, w: 8.5, h: 0.55,
      align: 'right', fontSize: 22, bold: true, color: WHITE,
    });
    if (subtitle) {
      slide.addText(subtitle, {
        x: 4.5, y: 0.68, w: 8.5, h: 0.28,
        align: 'right', fontSize: 9, color: 'D1FAE5',
      });
    }
  }

  // Helper footer with page indicator
  function addFooter(slide: any, pageNum: number, total: number) {
    slide.addShape(prs.ShapeType.rect, {
      x: 0, y: 7.1, w: '100%', h: 0.4,
      fill: { color: LIGHT_BG },
      line: { color: 'E2E8F0', pt: 1 },
    });
    slide.addText(`FinanceFlow  •  Relatório Exportado em ${new Date().toLocaleDateString('pt-BR')}  •  Slide ${pageNum} de ${total}`, {
      x: 0, y: 7.1, w: '100%', h: 0.4,
      align: 'center', fontSize: 8, color: SLATE,
    });
  }

  // ── Total slides count estimate for footer
  const totalSlides = 1 + 1 + (limits.length > 0 ? 1 : 0) + (goals.length > 0 ? 1 : 0) + (chartImages.length > 0 ? Math.ceil(chartImages.length / 4) : 0) + 1;
  let slideNum = 0;

  // ─────────────────────────────────────────────────
  // SLIDE 1: Capa
  // ─────────────────────────────────────────────────
  slideNum++;
  {
    const slide = prs.addSlide();

    // Full green background
    slide.addShape(prs.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: '100%',
      fill: { color: '064E3B' },
      line: { type: 'none' },
    });

    // Decorative circle
    slide.addShape(prs.ShapeType.ellipse, {
      x: 8.5, y: -1.5, w: 6, h: 6,
      fill: { color: GREEN, transparency: 80 },
      line: { type: 'none' },
    });
    slide.addShape(prs.ShapeType.ellipse, {
      x: -2, y: 4, w: 5, h: 5,
      fill: { color: GREEN, transparency: 85 },
      line: { type: 'none' },
    });

    // Logo 
    slide.addImage({
      x: 0.6, y: 0.8, w: 1.5, h: 1.5,
      data: logoData,
    });

    slide.addText('FinanceFlow', {
      x: 2.3, y: 1.2, w: 6, h: 0.7,
      fontSize: 30, bold: true, color: '6EE7B7',
    });
    slide.addText('Relatório de Análise Financeira', {
      x: 0.5, y: 2.3, w: 12, h: 1.2,
      align: 'center', fontSize: 42, bold: true, color: WHITE,
    });
    slide.addText(`Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`, {
      x: 0.5, y: 3.8, w: 12, h: 0.5,
      align: 'center', fontSize: 14, color: '6EE7B7',
    });

    // Summary quick stats
    const stats = [
      { label: 'Transações', value: `${transactions.length}` },
      { label: 'Metas', value: `${goals.length}` },
      { label: 'Limites', value: `${limits.length}` },
    ];
    stats.forEach((s, i) => {
      const x = 2.8 + i * 2.8;
      slide.addShape(prs.ShapeType.rect, {
        x, y: 5.2, w: 2.3, h: 1.0,
        fill: { color: WHITE, transparency: 90 },
        line: { color: WHITE, transparency: 70, pt: 1 },
        rectRadius: 0.12,
      });
      slide.addText(s.value, { x, y: 5.25, w: 2.3, h: 0.5, align: 'center', fontSize: 22, bold: true, color: WHITE });
      slide.addText(s.label, { x, y: 5.72, w: 2.3, h: 0.35, align: 'center', fontSize: 10, color: '6EE7B7' });
    });

    addFooter(slide, slideNum, totalSlides);
  }

  // ─────────────────────────────────────────────────
  // SLIDE 2: Resumo Financeiro
  // ─────────────────────────────────────────────────
  slideNum++;
  {
    const slide = prs.addSlide();
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: LIGHT_BG }, line: { type: 'none' } });
    await addHeader(slide, 'Resumo Financeiro', 'Visão geral das finanças do período');

    const cards = [
      { label: 'Total de Receitas', value: currencyFormatter.format(totalIncome), color: GREEN, icon: '▲' },
      { label: 'Total de Despesas', value: currencyFormatter.format(totalExpense), color: RED, icon: '▼' },
      { label: 'Saldo Líquido', value: currencyFormatter.format(balance), color: balance >= 0 ? GREEN : RED, icon: balance >= 0 ? '✓' : '!' },
      { label: 'Nº de Transações', value: `${transactions.length}`, color: '3B82F6', icon: '#' },
    ];

    cards.forEach((card, i) => {
      const x = 0.3 + i * 3.2;
      slide.addShape(prs.ShapeType.rect, {
        x, y: 1.4, w: 3.0, h: 2.0,
        fill: { color: WHITE },
        line: { color: 'E2E8F0', pt: 1 },
        shadow: { type: 'outer', blur: 6, offset: 2, angle: 270, color: '0F172A' },
        rectRadius: 0.15,
      });
      // Color accent bar
      slide.addShape(prs.ShapeType.rect, {
        x, y: 1.4, w: 0.08, h: 2.0,
        fill: { color: card.color },
        line: { type: 'none' },
      });
      slide.addText(card.icon, { x: x + 0.2, y: 1.5, w: 2.7, h: 0.5, fontSize: 22, bold: true, color: card.color });
      slide.addText(card.label, { x: x + 0.2, y: 1.95, w: 2.7, h: 0.35, fontSize: 10, color: SLATE });
      slide.addText(card.value, { x: x + 0.2, y: 2.3, w: 2.7, h: 0.6, fontSize: 17, bold: true, color: DARK });
    });

    // Recent transactions table
    slide.addText('Transações Recentes', {
      x: 0.3, y: 3.65, w: 12.7, h: 0.35,
      fontSize: 12, bold: true, color: DARK,
    });

    const recent = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);

    const tableRows: any[] = [
      [
        { text: 'Tipo', options: { bold: true, color: WHITE, fill: { color: DARK }, align: 'center' } },
        { text: 'Descrição', options: { bold: true, color: WHITE, fill: { color: DARK } } },
        { text: 'Categoria', options: { bold: true, color: WHITE, fill: { color: DARK } } },
        { text: 'Data', options: { bold: true, color: WHITE, fill: { color: DARK }, align: 'center' } },
        { text: 'Valor', options: { bold: true, color: WHITE, fill: { color: DARK }, align: 'right' } },
      ],
      ...recent.map((t, idx) => [
        { text: t.type === 'INCOME' ? '▲ Receita' : '▼ Despesa', options: { color: t.type === 'INCOME' ? GREEN : RED, bold: true, align: 'center', fill: { color: idx % 2 === 0 ? 'F8FAFC' : WHITE } } },
        { text: t.description || '—', options: { color: DARK, fill: { color: idx % 2 === 0 ? 'F8FAFC' : WHITE } } },
        { text: t.categoryName, options: { color: SLATE, fill: { color: idx % 2 === 0 ? 'F8FAFC' : WHITE } } },
        { text: formatDate(t.date), options: { color: SLATE, align: 'center', fill: { color: idx % 2 === 0 ? 'F8FAFC' : WHITE } } },
        { text: `${t.type === 'INCOME' ? '+' : '-'}${currencyFormatter.format(t.amount)}`, options: { color: t.type === 'INCOME' ? GREEN : RED, bold: true, align: 'right', fill: { color: idx % 2 === 0 ? 'F8FAFC' : WHITE } } },
      ]),
    ];

    slide.addTable(tableRows, {
      x: 0.3, y: 4.05, w: 12.7,
      fontSize: 9,
      border: { type: 'solid', color: 'E2E8F0', pt: 0.5 },
      rowH: 0.38,
    });

    addFooter(slide, slideNum, totalSlides);
  }

  // ─────────────────────────────────────────────────
  // SLIDE 3: Limites de Gastos
  // ─────────────────────────────────────────────────
  if (limits.length > 0) {
    slideNum++;
    const slide = prs.addSlide();
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: LIGHT_BG }, line: { type: 'none' } });
    await addHeader(slide, 'Limites de Gastos Mensais', 'Controle de orçamento por categoria');

    const cols = limits.length > 5 ? 2 : 1;
    const colW = cols === 2 ? 6.3 : 12.7;
    const startY = 1.35;
    const itemH = cols === 2 ? (5.5 / Math.ceil(limits.length / 2)) : (5.5 / limits.length);

    limits.forEach((l, i) => {
      const col = cols === 2 ? Math.floor(i / Math.ceil(limits.length / 2)) : 0;
      const row = cols === 2 ? i % Math.ceil(limits.length / 2) : i;
      const x = 0.3 + col * (colW + 0.2);
      const y = startY + row * itemH;
      const barH = 0.18;
      const barW = colW - 0.8;
      const pct = Math.min(l.percentUsed, 100) / 100;
      const barColor = l.percentUsed >= 100 ? RED : l.percentUsed >= 80 ? AMBER : GREEN;

      slide.addText(l.categoryName, { x, y, w: colW * 0.55, h: 0.3, fontSize: 10, bold: true, color: DARK });
      slide.addText(`${l.percentUsed}%  •  ${currencyFormatter.format(l.spent)} de ${currencyFormatter.format(l.limitAmount)}`,
        { x: x + colW * 0.55, y, w: colW * 0.45, h: 0.3, fontSize: 9, color: SLATE, align: 'right' });

      // Background bar
      slide.addShape(prs.ShapeType.rect, { x, y: y + 0.32, w: barW, h: barH, fill: { color: 'E2E8F0' }, line: { type: 'none' }, rectRadius: 0.05 });
      // Fill bar
      if (pct > 0) {
        slide.addShape(prs.ShapeType.rect, { x, y: y + 0.32, w: barW * pct, h: barH, fill: { color: barColor }, line: { type: 'none' }, rectRadius: 0.05 });
      }
    });

    addFooter(slide, slideNum, totalSlides);
  }

  // ─────────────────────────────────────────────────
  // SLIDE 4: Metas Financeiras
  // ─────────────────────────────────────────────────
  if (goals.length > 0) {
    slideNum++;
    const slide = prs.addSlide();
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: LIGHT_BG }, line: { type: 'none' } });
    await addHeader(slide, 'Metas Financeiras', 'Progresso em direção aos objetivos de poupança');

    const cols = goals.length > 4 ? 2 : 1;
    const colW = cols === 2 ? 6.3 : 12.7;
    const startY = 1.35;
    const itemH = cols === 2 ? (5.5 / Math.ceil(goals.length / 2)) : (5.5 / Math.min(goals.length, 6));

    goals.slice(0, 10).forEach((g, i) => {
      const col = cols === 2 ? Math.floor(i / Math.ceil(goals.length / 2)) : 0;
      const row = cols === 2 ? i % Math.ceil(goals.length / 2) : i;
      const x = 0.3 + col * (colW + 0.2);
      const y = startY + row * itemH;
      const barH = 0.18;
      const barW = colW - 0.8;
      const percentUsed = g.percentUsed || 0;
      const savedAmount = g.savedAmount || 0;
      const pct = Math.min(percentUsed, 100) / 100;

      slide.addText(g.name, { x, y, w: colW * 0.55, h: 0.3, fontSize: 10, bold: true, color: DARK });
      slide.addText(`${percentUsed}%  •  ${currencyFormatter.format(savedAmount)} de ${currencyFormatter.format(g.targetAmount)}  •  Prazo ${formatDate(g.deadline)}`,
        { x: x + colW * 0.45, y, w: colW * 0.55, h: 0.3, fontSize: 8.5, color: SLATE, align: 'right' });

      // Background bar
      slide.addShape(prs.ShapeType.rect, { x, y: y + 0.32, w: barW, h: barH, fill: { color: 'E2E8F0' }, line: { type: 'none' }, rectRadius: 0.05 });
      // Fill bar (purple for goals)
      if (pct > 0) {
        const goalColor = percentUsed >= 100 ? GREEN : PURPLE;
        slide.addShape(prs.ShapeType.rect, { x, y: y + 0.32, w: barW * pct, h: barH, fill: { color: goalColor }, line: { type: 'none' }, rectRadius: 0.05 });
      }
    });

    addFooter(slide, slideNum, totalSlides);
  }

  // ─────────────────────────────────────────────────
  // SLIDES 5+: Gráficos (4 por página / 2x2 grid)
  // ─────────────────────────────────────────────────
  const chartTitles = [
    'Receitas vs Despesas',
    'Despesas por Categoria',
    'Evolução do Saldo (12 Meses)',
    'Despesas ao Longo do Tempo',
    'Progresso das Metas (%)',
    'Consumo de Limites Mensais (%)',
  ];

  for (let i = 0; i < chartImages.length; i += 4) {
    slideNum++;
    const slide = prs.addSlide();
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: LIGHT_BG }, line: { type: 'none' } });
    await addHeader(slide, 'Análise Financeira Visual', '');

    const batch = chartImages.slice(i, i + 4);
    const positions = [
      { x: 0.2, y: 1.25 },
      { x: 6.8, y: 1.25 },
      { x: 0.2, y: 4.15 },
      { x: 6.8, y: 4.15 },
    ];

    const promises: Promise<void>[] = [];
    batch.forEach((imgData, j) => {
      const pos = positions[j];
      const imgIndex = i + j;
      slide.addText(chartTitles[imgIndex] || `Gráfico ${imgIndex + 1}`, {
        x: pos.x, y: pos.y, w: 6.3, h: 0.3,
        fontSize: 10, bold: true, color: DARK,
      });
      // calculate image aspect ratio to avoid stretching
      promises.push(new Promise<void>((resolve) => {
        const img = new Image();
        img.src = imgData;
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          // draw image as contain centered on the 6.3 x 2.8 grid cell
          const imgW = 6.3;
          const imgH = 2.8;
          let posX = pos.x;
          let posY = pos.y + 0.35;
          if (aspectRatio > imgW / imgH) {
            // image is wider than cell, fit width
            const scaledH = imgW / aspectRatio;
            posY += (imgH - scaledH) / 2;
            slide.addImage({
              data: imgData,
              x: posX, y: posY,
              w: imgW, h: scaledH,
            });
          } else {
            // image is taller than cell, fit height
            const scaledW = imgH * aspectRatio;
            posX += (imgW - scaledW) / 2;
            slide.addImage({
              data: imgData,
              x: posX, y: posY,
              w: scaledW, h: imgH,
            });
          }
          resolve();
        };
      }));
    });
    await Promise.all(promises);

    addFooter(slide, slideNum, totalSlides);
  }

  // ─────────────────────────────────────────────────
  // SLIDE FINAL: Obrigado / Encerramento
  // ─────────────────────────────────────────────────
  slideNum++;
  {
    const slide = prs.addSlide();
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: '064E3B' }, line: { type: 'none' } });

    slide.addShape(prs.ShapeType.ellipse, { x: -1, y: 4.5, w: 5, h: 5, fill: { color: GREEN, transparency: 85 }, line: { type: 'none' } });
    slide.addShape(prs.ShapeType.ellipse, { x: 9, y: -1.5, w: 6, h: 6, fill: { color: GREEN, transparency: 80 }, line: { type: 'none' } });

    slide.addText('Este relatório foi gerado automaticamente pelo FinanceFlow', {
      x: 0.5, y: 3.5, w: 12.3, h: 0.5,
      align: 'center', fontSize: 14, color: '6EE7B7',
    });
    slide.addText(`${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`, {
      x: 0.5, y: 4.1, w: 12.3, h: 0.4,
      align: 'center', fontSize: 12, color: '6EE7B7', italic: true,
    });

    addFooter(slide, slideNum, totalSlides);
  }

  prs.writeFile({ fileName: `apresentacao_financas_${new Date().toISOString().slice(0, 10)}.pptx` });
}
