/**
 * tests/hooks/useDashboardData.test.js
 *
 * Teste de contrato (source-based) para useDashboardData — hook de
 * carregamento/filtragem de dados do Dashboard. Valida filtros padrão,
 * regras de acesso por perfil, filtros de período/status/tipo e formato
 * de retorno. Ambiente 'node' sem DOM/RTL — validação via leitura do source.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(resolve(__dirname, '../../hooks/useDashboardData.js'), 'utf-8');

const returnBlock = (() => {
  const blocks = [...src.matchAll(/return\s*{([\s\S]*?)};/g)];
  return blocks[blocks.length - 1]?.[1] ?? '';
})();

describe('useDashboardData — contrato', () => {
  it('exporta useDashboardData', () => {
    expect(src).toContain('export function useDashboardData()');
  });

  it('DEFAULT_FILTERS inicia com filtros nulos e período 6meses', () => {
    expect(src).toContain('obraId: null');
    expect(src).toContain('status: null');
    expect(src).toContain('tipoRegistro: null');
    expect(src).toContain("periodo: '6meses'");
  });

  it('needsRegionais derivado dos perfis cliente, sala_tecnica e gestor_contrato', () => {
    expect(src).toContain("['cliente', 'sala_tecnica_afirmaevias', 'gestor_contrato'].includes(userAccessLevel)");
  });

  it('filtra ensaios por created_by para access level user', () => {
    expect(src).toContain("userAccessLevel === 'user'");
    expect(src).toContain('e.created_by === user.email');
  });

  it('para needsRegionais filtra obras/projects/ensaios pelas regionais do usuário', () => {
    expect(src).toContain('getAccessibleObraIds(auxData.obras, auxData.regionais');
    expect(src).toContain('obrasIds.has(o.id)');
    expect(src).toContain('filterRegionaisByUser(auxData.regionais');
    expect(src).toContain('projectIdsPermitidos.has(p.id)');
    expect(src).toContain('obrasIds.has(e.obra_id)');
  });

  it('cliente filtra apenas registros aprovados ou assinados', () => {
    expect(src).toContain("e.approved === true || e.client_signature?.signed_by");
  });

  it('filtro de período usa subMonths 1/3/6 e compara created_date', () => {
    expect(src).toContain("filters.periodo === '1mes'");
    expect(src).toContain('subMonths(now, 1)');
    expect(src).toContain("filters.periodo === '3meses'");
    expect(src).toContain('subMonths(now, 3)');
    expect(src).toContain('subMonths(now, 6)');
    expect(src).toContain('new Date(e.created_date) >= startDate');
  });

  it('filtro de status approved/pending/rejected', () => {
    expect(src).toContain("filters.status === 'approved'");
    expect(src).toContain("filters.status === 'pending'");
    expect(src).toContain("filters.status === 'rejected'");
    expect(src).toContain('e.approved === true');
    expect(src).toContain('e.approved === null');
    expect(src).toContain('e.approved === false');
  });

  it('filtro tipoRegistro por entityType', () => {
    expect(src).toContain('e.entityType === filters.tipoRegistro');
  });

  it('filtro de obra por obraId', () => {
    expect(src).toContain('e.obra_id === filters.obraId');
  });

  it('charts calculados via funções de dashboardCalculations', () => {
    expect(src).toContain('calcularStats(');
    expect(src).toContain('calcularGraficoMensal(');
    expect(src).toContain('calcularGraficoStatus(');
    expect(src).toContain('calcularGraficoPorObra(');
    expect(src).toContain('calcularGraficoPorTipo(');
    expect(src).toContain('calcularApprovalPercentage(');
  });

  it('clearFilters reseta DEFAULT_FILTERS', () => {
    expect(src).toContain('setFilters(DEFAULT_FILTERS)');
  });

  it('hasActiveFilters considera obraId, status e tipoRegistro', () => {
    expect(src).toContain('Boolean(filters.obraId || filters.status || filters.tipoRegistro)');
  });

  it('expõe contrato de retorno completo', () => {
    for (const k of [
      'loading', 'user', 'filters', 'setFilters', 'clearFilters',
      'hasActiveFilters', 'stats', 'charts', 'approvalPercentage',
      'obras', 'isClienteUser', 'isEngenheiroUser',
    ]) {
      expect(returnBlock).toContain(k);
    }
  });
});