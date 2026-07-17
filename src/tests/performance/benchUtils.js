/**
 * tests/performance/benchUtils.js
 * Helper compartilhado dos benchmarks: mede N iterações, acumula
 * resultados e imprime o relatório tabular no afterAll.
 */
import { expect } from 'vitest';

export function createBenchSuite(titulo) {
  const results = [];

  async function bench(categoria, nome, iterations, budgetMs, fn) {
    const times = [];
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      times.push(performance.now() - start);
    }
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    results.push({
      categoria, nome,
      avg: Math.round(avg * 10) / 10,
      min: Math.round(Math.min(...times) * 10) / 10,
      max: Math.round(Math.max(...times) * 10) / 10,
      budget: budgetMs,
    });
    expect(avg, `${nome} estourou o orçamento de ${budgetMs}ms (média ${Math.round(avg)}ms)`).toBeLessThan(budgetMs);
    return avg;
  }

  function printReport() {
    const pad = (s, n) => String(s).padEnd(n);
    const lines = [
      '',
      `════════════ ${titulo} ════════════`,
      `${pad('Categoria', 12)} │ ${pad('Item', 60)} │ ${pad('Média', 9)} │ ${pad('Mín', 9)} │ ${pad('Máx', 9)} │ Budget`,
      '─'.repeat(120),
      ...results.map(r =>
        `${pad(r.categoria, 12)} │ ${pad(r.nome, 60)} │ ${pad(r.avg + 'ms', 9)} │ ${pad(r.min + 'ms', 9)} │ ${pad(r.max + 'ms', 9)} │ <${r.budget}ms`
      ),
      '═'.repeat(120),
    ];
     
    console.log(lines.join('\n'));
  }

  return { bench, printReport, results };
}

/** Gera registros sintéticos com campos comuns às entidades do app. */
export function generateRecords(count, entityType, extra = {}) {
  const records = [];
  for (let i = 0; i < count; i++) {
    records.push({
      id: `${entityType}-${i}`,
      obra_id: `obra-${i % 50}`,
      data: '2026-01-01',
      created_by: `lab${i % 20}@x.com`,
      laboratorista_name: `Lab ${i % 20}`,
      approved: i % 3 === 0 ? true : i % 3 === 1 ? false : null,
      status: i % 2 === 0 ? 'finalizado' : 'rascunho',
      observacoes: `Observação de teste número ${i} com texto razoavelmente longo para simular dados reais`,
      created_date: `2026-${String((i % 12) + 1).padStart(2, '0')}-15T10:00:00.000000`,
      ...extra,
    });
  }
  return records;
}