import { describe, it, expect } from 'vitest';
import {
  getChartVisibility,
  getFilterConfig,
  isValidPeriod,
  isValidStatus,
  mapStatusLabelToValue,
} from '@/utils/dashboardUtils';

describe('dashboardUtils', () => {
  describe('getChartVisibility', () => {
    it('deve mostrar ambos gráficos para admin com dados', () => {
      const charts = { porObra: [{ id: '1' }], porTipo: [{ id: '2' }] };
      const result = getChartVisibility('admin', charts);
      expect(result.showObraChart).toBe(true);
      expect(result.showBothCharts).toBe(true);
    });

    it('deve mostrar apenas tipo para gestor_contrato', () => {
      const charts = { porObra: [], porTipo: [{ id: '2' }] };
      const result = getChartVisibility('gestor_contrato', charts);
      expect(result.showObraChart).toBe(false);
      expect(result.showTypeChartSeparate).toBe(true);
      expect(result.showTypeChartOnly).toBe(true);
    });

    it('deve não mostrar nada se sem dados', () => {
      const charts = { porObra: [], porTipo: [] };
      const result = getChartVisibility('admin', charts);
      expect(result.showObraChart).toBe(false);
      expect(result.showTypeChartSeparate).toBe(false);
    });
  });

  describe('getFilterConfig', () => {
    it('deve retornar config de filtros', () => {
      const config = getFilterConfig();
      expect(config.periodo).toHaveLength(3);
      expect(config.status).toHaveLength(3);
    });

    it('deve ter valores corretos em periodo', () => {
      const config = getFilterConfig();
      const periodos = config.periodo.map((p) => p.value);
      expect(periodos).toEqual(['1mes', '3meses', '6meses']);
    });

    it('deve ter status corretos', () => {
      const config = getFilterConfig();
      const statuses = config.status.map((s) => s.value);
      expect(statuses).toEqual(['approved', 'pending', 'rejected']);
    });
  });

  describe('isValidPeriod', () => {
    it('deve validar período válido', () => {
      expect(isValidPeriod('1mes')).toBe(true);
      expect(isValidPeriod('3meses')).toBe(true);
      expect(isValidPeriod('6meses')).toBe(true);
    });

    it('deve rejeitar período inválido', () => {
      expect(isValidPeriod('12meses')).toBe(false);
      expect(isValidPeriod('invalid')).toBe(false);
      expect(isValidPeriod(null)).toBe(false);
    });
  });

  describe('isValidStatus', () => {
    it('deve validar status válidos', () => {
      expect(isValidStatus('approved')).toBe(true);
      expect(isValidStatus('pending')).toBe(true);
      expect(isValidStatus('rejected')).toBe(true);
      expect(isValidStatus(null)).toBe(true);
    });

    it('deve rejeitar status inválidos', () => {
      expect(isValidStatus('invalid')).toBe(false);
      expect(isValidStatus('completed')).toBe(false);
    });
  });

  describe('mapStatusLabelToValue', () => {
    it('deve mapear labels para valores', () => {
      expect(mapStatusLabelToValue('Aprovados')).toBe('approved');
      expect(mapStatusLabelToValue('Pendentes')).toBe('pending');
      expect(mapStatusLabelToValue('Reprovados')).toBe('rejected');
    });

    it('deve retornar null para label inválido', () => {
      expect(mapStatusLabelToValue('Invalid')).toBeNull();
      expect(mapStatusLabelToValue('')).toBeNull();
    });

    it('deve mapear aliases (cliente)', () => {
      expect(mapStatusLabelToValue('Assinados')).toBe('approved');
      expect(mapStatusLabelToValue('Aguardando')).toBe('pending');
    });
  });
});