import { describe, it, expect } from 'vitest';
import {
  getServicoLabel,
  mapCargaToRow,
  mapAcompanhamentoToPresentation,
} from '@/utils/relatorioAcompanhamentoCargaMapper';

// ── getServicoLabel ───────────────────────────────────────────────────────────
describe('getServicoLabel', () => {
  it('mapeia "remendos" para "Remendos"', () => {
    expect(getServicoLabel('remendos')).toBe('Remendos');
  });

  it('mapeia "capa_reperfilagem" para "Capa/Reperfilagem"', () => {
    expect(getServicoLabel('capa_reperfilagem')).toBe('Capa/Reperfilagem');
  });

  it('retorna "N/A" para valor nulo', () => {
    expect(getServicoLabel(null)).toBe('N/A');
  });

  it('retorna o valor original para código desconhecido', () => {
    expect(getServicoLabel('outro')).toBe('outro');
  });
});

// ── mapCargaToRow ─────────────────────────────────────────────────────────────
describe('mapCargaToRow', () => {
  const cargaBruta = {
    placa: 'ABC-1234',
    hora_saida: '08:00',
    peso_toneladas: 25.5,
    hora_chegada: '08:30',
    temp_chegada: 150,
    hora_aplicacao: '09:00',
    temp_espalhamento: 140,
    temp_compactacao: 130,
    pista: 'Direita',
    espessura_cm: 5,
    estaca_inicial: '100',
    estaca_final: '200',
    observacoes: 'Sem observações',
  };

  it('define numero como index + 1', () => {
    expect(mapCargaToRow(cargaBruta, 0).numero).toBe(1);
    expect(mapCargaToRow(cargaBruta, 2).numero).toBe(3);
  });

  it('preserva todos os campos preenchidos', () => {
    const row = mapCargaToRow(cargaBruta, 0);
    expect(row.placa).toBe('ABC-1234');
    expect(row.peso_toneladas).toBe(25.5);
    expect(row.temp_chegada).toBe(150);
    expect(row.observacoes).toBe('Sem observações');
  });

  it('substitui campos nulos por string vazia', () => {
    const row = mapCargaToRow({ placa: null, peso_toneladas: null }, 0);
    expect(row.placa).toBe('');
    expect(row.peso_toneladas).toBe('');
  });

  it('substitui campos undefined por string vazia', () => {
    const row = mapCargaToRow({}, 0);
    expect(row.placa).toBe('');
    expect(row.hora_saida).toBe('');
    expect(row.observacoes).toBe('');
  });

  it('lida com carga null sem lançar erro', () => {
    const row = mapCargaToRow(null, 0);
    expect(row.numero).toBe(1);
    expect(row.placa).toBe('');
  });
});

// ── mapAcompanhamentoToPresentation ───────────────────────────────────────────
describe('mapAcompanhamentoToPresentation', () => {
  const acompanhamentoBruto = {
    data: '2024-03-15',
    rodovia: 'BR-116',
    sub_trecho: 'Sub-trecho A',
    trecho: 'Trecho X',
    usina_fornecedora: 'Usina Beta',
    laboratorista_name: 'João Silva',
    servico: 'remendos',
    cargas: [
      { placa: 'ABC-1234', peso_toneladas: 25 },
      { placa: 'XYZ-5678', peso_toneladas: 30 },
    ],
    observacoes_gerais: 'Observação de teste',
    created_by: 'joao@test.com',
    created_date: '2024-03-15T10:00:00Z',
    approved_by: 'maria@test.com',
    approved_date: '2024-03-16T08:00:00Z',
    approver_details: { name: 'Maria', position: 'Engenheira', crea_number: '12345' },
    client_signature: {
      engineer_name: 'Carlos',
      signed_by: 'carlos@cliente.com',
      crea_number: '99999',
      signed_date: '2024-03-17T09:00:00Z',
    },
  };

  const regional = { cliente: 'Cliente Alpha', logo_url: 'https://exemplo.com/logo.png' };
  const obra = { name: 'Obra 1' };
  const projeto = { name: 'Projeto CAUQ' };
  const faixaGranulometrica = { nome: 'Faixa IV' };

  it('retorna null quando acompanhamento é null', () => {
    expect(mapAcompanhamentoToPresentation({ acompanhamento: null })).toBeNull();
  });

  it('retorna null quando acompanhamento é undefined', () => {
    expect(mapAcompanhamentoToPresentation({})).toBeNull();
  });

  it('formata data no padrão dd/mm/yyyy UTC', () => {
    const result = mapAcompanhamentoToPresentation({ acompanhamento: acompanhamentoBruto, regional, obra, projeto, faixaGranulometrica });
    expect(result.data).toBe('15/03/2024');
  });

  it('extrai e formata campos de dados da obra', () => {
    const result = mapAcompanhamentoToPresentation({ acompanhamento: acompanhamentoBruto, regional, obra, projeto, faixaGranulometrica });
    expect(result.cliente).toBe('Cliente Alpha');
    expect(result.rodovia).toBe('BR-116');
    expect(result.sub_trecho).toBe('Sub-trecho A');
    expect(result.projeto_nome).toBe('Projeto CAUQ');
    expect(result.obra_nome).toBe('Obra 1');
    expect(result.trecho).toBe('Trecho X');
    expect(result.usina_fornecedora).toBe('Usina Beta');
    expect(result.faixa_especificada).toBe('Faixa IV');
    expect(result.laboratorista).toBe('João Silva');
  });

  it('mapeia servico para label correto', () => {
    const result = mapAcompanhamentoToPresentation({ acompanhamento: acompanhamentoBruto, regional });
    expect(result.servico_label).toBe('Remendos');
  });

  it('normaliza cargas para rows de apresentação', () => {
    const result = mapAcompanhamentoToPresentation({ acompanhamento: acompanhamentoBruto, regional });
    expect(result.cargas).toHaveLength(2);
    expect(result.cargas[0].numero).toBe(1);
    expect(result.cargas[0].placa).toBe('ABC-1234');
    expect(result.cargas[1].numero).toBe(2);
    expect(result.cargas[1].placa).toBe('XYZ-5678');
  });

  it('retorna array vazio quando não há cargas', () => {
    const result = mapAcompanhamentoToPresentation({ acompanhamento: { ...acompanhamentoBruto, cargas: undefined }, regional });
    expect(result.cargas).toEqual([]);
  });

  it('substitui observacoes_gerais vazias por "—"', () => {
    const result = mapAcompanhamentoToPresentation({ acompanhamento: { ...acompanhamentoBruto, observacoes_gerais: '' }, regional });
    expect(result.observacoes_gerais).toBe('—');
  });

  it('preserva observacoes_gerais preenchidas', () => {
    const result = mapAcompanhamentoToPresentation({ acompanhamento: acompanhamentoBruto, regional });
    expect(result.observacoes_gerais).toBe('Observação de teste');
  });

  it('gera signatureProps com dados do laboratorista', () => {
    const result = mapAcompanhamentoToPresentation({ acompanhamento: acompanhamentoBruto, regional });
    expect(result.signatureProps.labName).toBe('João Silva');
    expect(result.signatureProps.labEmail).toBe('joao@test.com');
    expect(result.signatureProps.labPosition).toBe('Laboratorista');
  });

  it('gera signatureProps com dados do approver', () => {
    const result = mapAcompanhamentoToPresentation({ acompanhamento: acompanhamentoBruto, regional });
    expect(result.signatureProps.approverName).toBe('Maria');
    expect(result.signatureProps.approverEmail).toBe('maria@test.com');
    expect(result.signatureProps.approverCREA).toBe('12345');
  });

  it('gera signatureProps com dados do cliente', () => {
    const result = mapAcompanhamentoToPresentation({ acompanhamento: acompanhamentoBruto, regional });
    expect(result.signatureProps.clientName).toBe('Carlos');
    expect(result.signatureProps.clientEmail).toBe('carlos@cliente.com');
    expect(result.signatureProps.clientCREA).toBe('99999');
  });

  it('usa "N/A" para campos ausentes de entidades relacionadas', () => {
    const result = mapAcompanhamentoToPresentation({ acompanhamento: acompanhamentoBruto });
    expect(result.cliente).toBe('N/A');
    expect(result.projeto_nome).toBe('N/A');
    expect(result.obra_nome).toBe('N/A');
    expect(result.faixa_especificada).toBe('N/A');
  });

  it('usa logo padrão quando regional não tem logo_url', () => {
    const result = mapAcompanhamentoToPresentation({ acompanhamento: acompanhamentoBruto });
    expect(result.logo_url).toContain('base44-prod');
  });
});