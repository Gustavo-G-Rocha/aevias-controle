/**
 * Testes de roteamento e exibição de notificações in-app.
 *
 * Cobre: destino do clique por tipo de notificação, fallbacks seguros
 * e configuração visual (ícone/cor/título) de cada tipo.
 */
import { describe, it, expect } from 'vitest';
import { getNotificationLink, getNotificationDisplay } from '@/utils/notificationRouting';

describe('getNotificationLink — destino do clique por tipo', () => {
  it('chamado_respondido leva para a página de chamados', () => {
    const n = { tipo: 'chamado_respondido', entity_name: 'BugReport', entity_id: 'abc' };
    expect(getNotificationLink(n)).toBe('/ReportarErro');
  });

  it('entity_name BugReport leva para chamados mesmo sem tipo', () => {
    const n = { entity_name: 'BugReport', entity_id: 'abc' };
    expect(getNotificationLink(n)).toBe('/ReportarErro');
  });

  it('RelatorioNC leva para o relatório de NC com id', () => {
    const n = { tipo: 'reprovacao', entity_name: 'RelatorioNC', entity_id: 'nc-123' };
    expect(getNotificationLink(n)).toBe('/RelatorioNC?id=nc-123');
  });

  it('reprovacao de ensaio resolve via mapeamento de relatórios (contém o id)', () => {
    const n = { tipo: 'reprovacao', entity_name: 'EnsaioCAUQ', entity_id: 'e-456' };
    const link = getNotificationLink(n);
    expect(typeof link).toBe('string');
    expect(link).toContain('e-456');
  });

  it('assinatura_pendente resolve via mapeamento de relatórios (contém o id)', () => {
    const n = { tipo: 'assinatura_pendente', entity_name: 'DiarioObra', entity_id: 'd-789' };
    const link = getNotificationLink(n);
    expect(typeof link).toBe('string');
    expect(link).toContain('d-789');
  });

  it('notificação nula retorna a home (fail-safe)', () => {
    expect(getNotificationLink(null)).toBe('/');
    expect(getNotificationLink(undefined)).toBe('/');
  });
});

describe('getNotificationDisplay — configuração visual por tipo', () => {
  it('reprovacao: ícone vermelho e título "foi reprovado"', () => {
    const d = getNotificationDisplay({ tipo: 'reprovacao' }, 'Ensaio CAUQ');
    expect(d.icon).toBe('reprovacao');
    expect(d.colorClass).toBe('text-red-600');
    expect(d.title).toBe('Ensaio CAUQ foi reprovado');
    expect(d.messagePrefix).toBe('Motivo: ');
  });

  it('chamado_respondido: ícone azul e título de resposta', () => {
    const d = getNotificationDisplay({ tipo: 'chamado_respondido' }, 'Chamado');
    expect(d.icon).toBe('resposta');
    expect(d.colorClass).toBe('text-blue-600');
    expect(d.title).toBe('Seu chamado recebeu uma resposta');
    expect(d.messagePrefix).toBe('Resposta: ');
  });

  it('assinatura_pendente: ícone âmbar e título de assinatura', () => {
    const d = getNotificationDisplay({ tipo: 'assinatura_pendente' }, 'Diário de Obra');
    expect(d.icon).toBe('assinatura');
    expect(d.colorClass).toBe('text-amber-600');
    expect(d.title).toBe('Diário de Obra aguarda sua assinatura');
    expect(d.messagePrefix).toBe('');
  });

  it('tipo desconhecido cai no fallback de reprovação (fail-safe)', () => {
    const d = getNotificationDisplay({ tipo: 'algo_novo' }, 'Registro X');
    expect(d.icon).toBe('reprovacao');
    expect(d.title).toBe('Registro X foi reprovado');
  });

  it('sem nome de entidade usa fallback "Registro"', () => {
    const d = getNotificationDisplay({ tipo: 'assinatura_pendente' }, null);
    expect(d.title).toBe('Registro aguarda sua assinatura');
  });
});