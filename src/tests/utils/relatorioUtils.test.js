import { describe, it, expect } from 'vitest';
import { formatDate, formatDateBrasilia, buildSignatureProps } from '@/utils/relatorioUtils';

describe('formatDate', () => {
  it('retorna N/A para valor nulo', () => {
    expect(formatDate(null)).toBe('N/A');
    expect(formatDate(undefined)).toBe('N/A');
    expect(formatDate('')).toBe('N/A');
  });

  it('formata data ISO em dd/mm/yyyy UTC', () => {
    // 2024-03-15 UTC deve formatar como 15/03/2024
    expect(formatDate('2024-03-15')).toBe('15/03/2024');
  });
});

describe('formatDateBrasilia', () => {
  it('retorna N/A para valor nulo', () => {
    expect(formatDateBrasilia(null)).toBe('N/A');
    expect(formatDateBrasilia('')).toBe('N/A');
  });

  it('formata uma string ISO com Z sem lançar erro', () => {
    const result = formatDateBrasilia('2024-03-15T12:00:00Z');
    expect(typeof result).toBe('string');
    expect(result).not.toBe('N/A');
  });

  it('normaliza string sem fuso (adiciona Z internamente)', () => {
    const result = formatDateBrasilia('2024-03-15T12:00:00');
    expect(typeof result).toBe('string');
    expect(result).not.toBe('N/A');
  });
});

describe('buildSignatureProps', () => {
  const record = {
    laboratorista_name: 'João Silva',
    created_by: 'joao@test.com',
    created_date: '2024-01-10T10:00:00Z',
    approved_by: 'aprovador@test.com',
    approved_date: '2024-01-11T08:00:00Z',
    approver_details: { name: 'Maria Aprovadora', position: 'Engenheira', crea_number: '12345' },
    client_signature: {
      engineer_name: 'Carlos Cliente',
      signed_by: 'carlos@cliente.com',
      crea_number: '99999',
      signed_date: '2024-01-12T09:00:00Z',
    },
  };

  it('mapeia campos do laboratorista corretamente', () => {
    const props = buildSignatureProps(record);
    expect(props.labName).toBe('João Silva');
    expect(props.labEmail).toBe('joao@test.com');
  });

  it('mapeia campos do aprovador corretamente', () => {
    const props = buildSignatureProps(record);
    expect(props.approverName).toBe('Maria Aprovadora');
    expect(props.approverEmail).toBe('aprovador@test.com');
    expect(props.approverCREA).toBe('12345');
  });

  it('mapeia campos do cliente corretamente', () => {
    const props = buildSignatureProps(record);
    expect(props.clientName).toBe('Carlos Cliente');
    expect(props.clientEmail).toBe('carlos@cliente.com');
    expect(props.clientCREA).toBe('99999');
  });

  it('usa string de posição quando passada diretamente', () => {
    const props = buildSignatureProps(record, 'Técnico');
    expect(props.labPosition).toBe('Técnico');
  });

  it('usa position do objeto de usuário quando passado', () => {
    const props = buildSignatureProps(record, { position: 'Laboratorista Sênior' });
    expect(props.labPosition).toBe('Laboratorista Sênior');
  });

  it('usa fallback "Laboratorista" quando nenhum position informado', () => {
    const props = buildSignatureProps(record);
    expect(props.labPosition).toBe('Laboratorista');
  });

  it('lida com record nulo sem lançar erro', () => {
    const props = buildSignatureProps(null);
    expect(props.labName).toBeUndefined();
  });
});