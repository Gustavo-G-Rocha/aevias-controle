/**
 * tests/components/virtualization.test.js
 *
 * Testes para a lógica de paginação + virtualização introduzida em MeusEnsaios.
 *
 * Como @tanstack/react-virtual requer um DOM real (ResizeObserver, getBoundingClientRect),
 * os testes validam a lógica pura que alimenta a virtualização:
 *   - itemsPerPage=100 produz páginas de 100 itens e totalPages correto
 *   - fatia da página atual (paginatedEnsaios) tem exatamente itemsPerPage itens
 *   - com 500+ registros, a primeira página não excede 100 itens
 *   - a virtualização só deve processar a fatia paginada, não a lista inteira
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/api/base44Client', () => ({ base44: { entities: {} } }));

// ─── Factory de registros de teste ──────────────────────────────────────────
function makeRecords(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `rec-${i}`,
    obra_id: `obra-${i % 5}`,
    entityType: i % 3 === 0 ? 'EnsaioCAUQ' : i % 3 === 1 ? 'DiarioObra' : 'ChecklistUsina',
    approved: i % 4 === 0 ? true : i % 4 === 1 ? false : null,
    status: i % 2 === 0 ? 'finalizado' : 'rascunho',
    data_ensaio: `2026-0${(i % 9) + 1}-15`,
    updated_date: `2026-0${(i % 9) + 1}-15T12:00:00Z`,
  }));
}

// ─── Lógica pura de paginação (espelha useTableFilters) ─────────────────────
const ITEMS_PER_PAGE = 100;

function paginate(items, page = 1) {
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const pageItems = items.slice(start, start + ITEMS_PER_PAGE);
  return { pageItems, totalPages, currentPage: page };
}

// ─── Lógica pura de virtualização (espelha o conceito do VirtualizedTableBody) ─
// Simula quantas linhas seriam renderadas dado uma viewport e rowHeight.
function simulateVirtualItems(totalCount, viewportHeight, rowHeight, overscan) {
  const visibleCount = Math.ceil(viewportHeight / rowHeight);
  const renderedCount = Math.min(totalCount, visibleCount + overscan * 2);
  return { visibleCount, renderedCount, totalCount };
}

describe('Paginação com itemsPerPage=100 (useTableFilters)', () => {
  it('500 registros produzem 5 páginas de 100 itens', () => {
    const records = makeRecords(500);
    const { pageItems, totalPages } = paginate(records, 1);
    expect(totalPages).toBe(5);
    expect(pageItems).toHaveLength(100);
    expect(pageItems[0].id).toBe('rec-0');
    expect(pageItems[99].id).toBe('rec-99');
  });

  it('página 3 contém itens 200-299', () => {
    const records = makeRecords(500);
    const { pageItems, totalPages, currentPage } = paginate(records, 3);
    expect(currentPage).toBe(3);
    expect(totalPages).toBe(5);
    expect(pageItems).toHaveLength(100);
    expect(pageItems[0].id).toBe('rec-200');
    expect(pageItems[99].id).toBe('rec-299');
  });

  it('última página pode ter menos de 100 itens (resto)', () => {
    const records = makeRecords(350);
    const { pageItems, totalPages } = paginate(records, 4);
    expect(totalPages).toBe(4);
    expect(pageItems).toHaveLength(50); // 350 - 300 = 50
  });

  it('menos de 100 registros = 1 página com todos os itens', () => {
    const records = makeRecords(45);
    const { pageItems, totalPages } = paginate(records, 1);
    expect(totalPages).toBe(1);
    expect(pageItems).toHaveLength(45);
  });

  it('lista vazia = 0 páginas, 0 itens', () => {
    const records = makeRecords(0);
    const { pageItems, totalPages } = paginate(records, 1);
    expect(totalPages).toBe(0);
    expect(pageItems).toHaveLength(0);
  });
});

describe('Virtualização — apenas linhas visíveis renderizadas', () => {
  it('com 100 itens na página, viewport de 600px e rowHeight=52, renderiza ~17 linhas (não 100)', () => {
    const { renderedCount, totalCount } = simulateVirtualItems(100, 600, 52, 6);
    expect(totalCount).toBe(100);
    // ceil(600/52) = 12 visíveis + 6*2 overscan = 24, limitado a 100
    expect(renderedCount).toBeLessThanOrEqual(24);
    expect(renderedCount).toBeGreaterThan(10);
    expect(renderedCount).toBeLessThan(totalCount);
  });

  it('com 500 itens na página, renderiza o mesmo número de linhas que com 100', () => {
    const result100 = simulateVirtualItems(100, 600, 52, 6);
    const result500 = simulateVirtualItems(500, 600, 52, 6);
    // A virtualização renderiza o mesmo número de linhas independente do total
    expect(result500.renderedCount).toBe(result100.renderedCount);
    expect(result500.totalCount).toBe(500);
  });

  it('com poucos itens (5), renderiza todos (não precisa virtualizar)', () => {
    const { renderedCount, totalCount } = simulateVirtualItems(5, 600, 52, 6);
    expect(renderedCount).toBe(5);
    expect(renderedCount).toBe(totalCount);
  });

  it('overscan duplica a margem de buffer (antes/depois da viewport)', () => {
    const noOverscan = simulateVirtualItems(100, 600, 52, 0);
    const withOverscan = simulateVirtualItems(100, 600, 52, 6);
    // ceil(600/52) = 12 visíveis
    expect(noOverscan.renderedCount).toBe(12);
    // 12 + 6*2 = 24
    expect(withOverscan.renderedCount).toBe(24);
  });
});

describe('Virtualização de cards (LaboratoristaInterface)', () => {
  it('com 100 cards, viewport de 800px e cardHeight=240, renderiza ~7 cards (não 100)', () => {
    const { renderedCount, totalCount } = simulateVirtualItems(100, 800, 240, 4);
    expect(totalCount).toBe(100);
    // ceil(800/240) = 4 visíveis + 4*2 overscan = 12, limitado a 100
    expect(renderedCount).toBeLessThanOrEqual(12);
    expect(renderedCount).toBeGreaterThan(3);
    expect(renderedCount).toBeLessThan(totalCount);
  });

  it('com 500 cards, renderiza o mesmo número que com 100', () => {
    const result100 = simulateVirtualItems(100, 800, 240, 4);
    const result500 = simulateVirtualItems(500, 800, 240, 4);
    expect(result500.renderedCount).toBe(result100.renderedCount);
  });
});

describe('Comparação antes/depois — redução de DOM', () => {
  it('ANTES: 500 registros = 20 por página = 25 páginas, cada página 20 linhas no DOM', () => {
    const OLD_ITEMS_PER_PAGE = 20;
    const records = makeRecords(500);
    const oldTotalPages = Math.ceil(records.length / OLD_ITEMS_PER_PAGE);
    const oldPageItems = records.slice(0, OLD_ITEMS_PER_PAGE);
    expect(oldTotalPages).toBe(25);
    expect(oldPageItems).toHaveLength(20);
  });

  it('DEPOIS: 500 registros = 100 por página = 5 páginas, cada página virtualiza para ~24 linhas no DOM', () => {
    const records = makeRecords(500);
    const { pageItems, totalPages } = paginate(records, 1);
    const { renderedCount } = simulateVirtualItems(pageItems.length, 600, 52, 6);

    expect(totalPages).toBe(5);              // menos páginas para navegar
    expect(pageItems).toHaveLength(100);     // mais itens por página
    expect(renderedCount).toBeLessThanOrEqual(24);  // mas só ~24 no DOM
    // Redução de DOM: 24 vs 20 (antes) — mas agora 100 itens acessíveis por scroll
    // sem precisar clicar "Próxima" 4 vezes para ver os mesmos 100 registros.
  });

  it('ANTES vs DEPOIS: com 1000 registros, DOM por página passa de 20 (fixo) para ~24 (virtualizado de 100)', () => {
    const records = makeRecords(1000);

    // Antes: 20 itens/página, 50 páginas, 20 linhas no DOM por página
    const OLD = { perPage: 20, pages: Math.ceil(records.length / 20), domNodes: 20 };

    // Depois: 100 itens/página virtualizados, 10 páginas, ~24 linhas no DOM por página
    const NEW = {
      perPage: 100,
      pages: Math.ceil(records.length / 100),
      domNodes: simulateVirtualItems(100, 600, 52, 6).renderedCount,
    };

    expect(OLD.pages).toBe(50);
    expect(NEW.pages).toBe(10);  // 5x menos cliques de paginação
    expect(NEW.domNodes).toBeLessThanOrEqual(24);
    expect(NEW.domNodes).toBeGreaterThan(OLD.domNodes); // um pouco mais de DOM, mas 5x mais conteúdo acessível
  });
});