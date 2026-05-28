/**
 * Testes dos subcomponentes extraídos de RelatorioChecklistReciclagem.jsx.
 *
 * Estratégia: react-dom/server (renderToStaticMarkup) para inspecionar HTML
 * sem dependências extras de DOM. Sem snapshots gigantes.
 *
 * Cobertura: ReciclagemClimaTable, ReciclagemAcompanhamentoExecucao, ReciclagemEnsaiosEmpreiteira
 *
 * Fora de escopo intencional: CSS visual, PDF, impressão, integração Base44.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';

import ReciclagemClimaTable from '@/components/relatorio-checklist-reciclagem/ReciclagemClimaTable';
import ReciclagemAcompanhamentoExecucao from '@/components/relatorio-checklist-reciclagem/ReciclagemAcompanhamentoExecucao';
import ReciclagemEnsaiosEmpreiteira from '@/components/relatorio-checklist-reciclagem/ReciclagemEnsaiosEmpreiteira';

const html = (element) => renderToStaticMarkup(element);

// ── ReciclagemClimaTable ──────────────────────────────────────────────────────
describe('ReciclagemClimaTable', () => {
  it('renderiza sem erros com periodos=undefined', () => {
    expect(() => html(<ReciclagemClimaTable />)).not.toThrow();
  });

  it('renderiza sem erros com periodos=null', () => {
    expect(() => html(<ReciclagemClimaTable periodos={null} />)).not.toThrow();
  });

  it('retorna null (string vazia) quando periodos está vazio', () => {
    const output = html(<ReciclagemClimaTable periodos={[]} />);
    expect(output).toBe('');
  });

  it('exibe o título da seção', () => {
    const periodos = [{ periodo: 'manha', temperatura_ambiente: 25, condicoes_climaticas: 'bom' }];
    const output = html(<ReciclagemClimaTable periodos={periodos} />);
    expect(output).toContain('Condições Climáticas');
  });

  it('exibe "MANHÃ" para periodo="manha"', () => {
    const periodos = [{ periodo: 'manha', temperatura_ambiente: 28, condicoes_climaticas: 'bom' }];
    const output = html(<ReciclagemClimaTable periodos={periodos} />);
    expect(output).toContain('MANHÃ');
  });

  it('exibe "TARDE" para periodo="tarde"', () => {
    const periodos = [{ periodo: 'tarde', temperatura_ambiente: 30, condicoes_climaticas: 'instavel' }];
    const output = html(<ReciclagemClimaTable periodos={periodos} />);
    expect(output).toContain('TARDE');
  });

  it('exibe "NOITE" para periodo="noite"', () => {
    const periodos = [{ periodo: 'noite', temperatura_ambiente: 22, condicoes_climaticas: 'chuva' }];
    const output = html(<ReciclagemClimaTable periodos={periodos} />);
    expect(output).toContain('NOITE');
  });

  it('exibe a temperatura do período', () => {
    const periodos = [{ periodo: 'manha', temperatura_ambiente: 32, condicoes_climaticas: 'bom' }];
    const output = html(<ReciclagemClimaTable periodos={periodos} />);
    expect(output).toContain('32');
    expect(output).toContain('°C');
  });

  it('exibe "N/A" quando temperatura_ambiente está ausente', () => {
    const periodos = [{ periodo: 'manha', condicoes_climaticas: 'bom' }];
    const output = html(<ReciclagemClimaTable periodos={periodos} />);
    expect(output).toContain('N/A');
  });

  it('exibe emoji ☀️ para clima "bom"', () => {
    const periodos = [{ periodo: 'manha', temperatura_ambiente: 25, condicoes_climaticas: 'bom' }];
    const output = html(<ReciclagemClimaTable periodos={periodos} />);
    expect(output).toContain('☀️');
    expect(output).toContain('Bom');
  });

  it('exibe emoji ⛅ para clima "instavel"', () => {
    const periodos = [{ periodo: 'tarde', temperatura_ambiente: 27, condicoes_climaticas: 'instavel' }];
    const output = html(<ReciclagemClimaTable periodos={periodos} />);
    expect(output).toContain('⛅');
    expect(output).toContain('Instável');
  });

  it('exibe emoji 🌧️ para clima "chuva"', () => {
    const periodos = [{ periodo: 'tarde', temperatura_ambiente: 20, condicoes_climaticas: 'chuva' }];
    const output = html(<ReciclagemClimaTable periodos={periodos} />);
    expect(output).toContain('🌧️');
    expect(output).toContain('Chuva');
  });

  it('renderiza múltiplos períodos', () => {
    const periodos = [
      { periodo: 'manha', temperatura_ambiente: 25, condicoes_climaticas: 'bom' },
      { periodo: 'tarde', temperatura_ambiente: 30, condicoes_climaticas: 'instavel' },
    ];
    const output = html(<ReciclagemClimaTable periodos={periodos} />);
    expect(output).toContain('MANHÃ');
    expect(output).toContain('TARDE');
    expect(output).toContain('25');
    expect(output).toContain('30');
  });
});

// ── ReciclagemAcompanhamentoExecucao ──────────────────────────────────────────
describe('ReciclagemAcompanhamentoExecucao', () => {
  it('renderiza sem erros com data=undefined', () => {
    expect(() => html(<ReciclagemAcompanhamentoExecucao />)).not.toThrow();
  });

  it('renderiza sem erros com data=null', () => {
    expect(() => html(<ReciclagemAcompanhamentoExecucao data={null} />)).not.toThrow();
  });

  it('exibe o título da seção', () => {
    const output = html(<ReciclagemAcompanhamentoExecucao />);
    expect(output).toContain('ACOMPANHAMENTO EXECUÇÃO DA CAMADA');
  });

  it('exibe todos os rótulos das linhas', () => {
    const output = html(<ReciclagemAcompanhamentoExecucao />);
    expect(output).toContain('remoção de material existente');
    expect(output).toContain('espalhado material novo');
    expect(output).toContain('compactação da camada');
    expect(output).toContain('viga Benkelman');
    expect(output).toContain('Espessura Reciclada');
    expect(output).toContain('teste de carga');
    expect(output).toContain('falha de compactação');
  });

  it('exibe cabeçalhos da tabela: Sim, Não, N/A, Observações', () => {
    const output = html(<ReciclagemAcompanhamentoExecucao />);
    expect(output).toContain('Sim');
    expect(output).toContain('Não');
    expect(output).toContain('N/A');
    expect(output).toContain('Observações');
  });

  it('exibe km_bota_fora quando fornecido', () => {
    const data = { remocao_material_existente: { sim: true, km_bota_fora: 'km 12+500' } };
    const output = html(<ReciclagemAcompanhamentoExecucao data={data} />);
    expect(output).toContain('km 12+500');
  });

  it('exibe "-" para km_bota_fora quando ausente', () => {
    const data = { remocao_material_existente: { sim: true } };
    const output = html(<ReciclagemAcompanhamentoExecucao data={data} />);
    expect(output).toContain('KM DO BOTA FORA: -');
  });

  it('exibe espessura_reciclada quando fornecida', () => {
    const data = { espessura_reciclada: '15 cm' };
    const output = html(<ReciclagemAcompanhamentoExecucao data={data} />);
    expect(output).toContain('15 cm');
  });

  it('exibe "-" para espessura_reciclada quando ausente', () => {
    const output = html(<ReciclagemAcompanhamentoExecucao data={{}} />);
    expect(output).toContain('-');
  });

  it('renderiza uma tabela com dados mínimos válidos', () => {
    const data = {
      remocao_material_existente: { sim: true },
      espalhamento_material_novo: { nao: true },
      compactacao_conforme_projeto: { na: true },
      ensaio_viga_benkelman: { sim: true },
      espessura_reciclada: '12 cm',
      teste_carga: { nao: true },
      falha_compactacao: { nao: true },
    };
    const output = html(<ReciclagemAcompanhamentoExecucao data={data} />);
    expect(output).toContain('<table');
    expect(output).toContain('12 cm');
  });
});

// ── ReciclagemEnsaiosEmpreiteira ──────────────────────────────────────────────
describe('ReciclagemEnsaiosEmpreiteira', () => {
  it('renderiza sem erros com data=undefined', () => {
    expect(() => html(<ReciclagemEnsaiosEmpreiteira />)).not.toThrow();
  });

  it('renderiza sem erros com data=null', () => {
    expect(() => html(<ReciclagemEnsaiosEmpreiteira data={null} />)).not.toThrow();
  });

  it('exibe o título da seção', () => {
    const output = html(<ReciclagemEnsaiosEmpreiteira />);
    expect(output).toContain('ACOMPANHAMENTO DOS ENSAIOS REALIZADOS PELA EMPREITEIRA');
  });

  it('exibe cabeçalhos da tabela', () => {
    const output = html(<ReciclagemEnsaiosEmpreiteira />);
    expect(output).toContain('ENSAIOS');
    expect(output).toContain('Qtde');
    expect(output).toContain('Conforme');
    expect(output).toContain('Resultado');
  });

  it('exibe todas as linhas de ensaio', () => {
    const output = html(<ReciclagemEnsaiosEmpreiteira />);
    expect(output).toContain('Compactação - Proctor');
    expect(output).toContain('Taxa de agregado');
    expect(output).toContain('Taxa de cimento');
    expect(output).toContain('frigideira');
    expect(output).toContain('massa específica aparente seca');
    expect(output).toContain('granulométrica por peneiramento');
    expect(output).toContain('Moldagem para resistência');
    expect(output).toContain('Viga Benkelman');
    expect(output).toContain('Taxa de pintura de ligação');
    expect(output).toContain('finura do cimento');
  });

  it('exibe ✓ quando realizado=true', () => {
    const data = { compactacao_proctor: { realizado: true } };
    const output = html(<ReciclagemEnsaiosEmpreiteira data={data} />);
    expect(output).toContain('✓');
  });

  it('exibe "-" quando realizado=false ou ausente', () => {
    const data = { compactacao_proctor: { realizado: false } };
    const output = html(<ReciclagemEnsaiosEmpreiteira data={data} />);
    // O "-" aparece na célula de realizado=false
    expect(output).toContain('-');
  });

  it('exibe ✓ verde quando conforme=true', () => {
    const data = { taxa_agregado: { realizado: true, conforme: true, quantidade: 3 } };
    const output = html(<ReciclagemEnsaiosEmpreiteira data={data} />);
    expect(output).toContain('✓');
  });

  it('exibe ✗ vermelho quando conforme=false', () => {
    const data = { taxa_cimento: { realizado: true, conforme: false, quantidade: 2 } };
    const output = html(<ReciclagemEnsaiosEmpreiteira data={data} />);
    expect(output).toContain('✗');
  });

  it('exibe quantidade quando fornecida', () => {
    const data = { viga_benkelman: { realizado: true, quantidade: 5, conforme: true } };
    const output = html(<ReciclagemEnsaiosEmpreiteira data={data} />);
    expect(output).toContain('5');
  });

  it('exibe resultados quando fornecidos', () => {
    const data = { granulometria: { realizado: true, resultados: 'Dentro do limite', conforme: true } };
    const output = html(<ReciclagemEnsaiosEmpreiteira data={data} />);
    expect(output).toContain('Dentro do limite');
  });

  it('exibe "-" para resultado ausente', () => {
    const data = { granulometria: { realizado: true } };
    const output = html(<ReciclagemEnsaiosEmpreiteira data={data} />);
    expect(output).toContain('-');
  });

  it('renderiza tabela com dados mínimos válidos completos', () => {
    const data = {
      compactacao_proctor: { realizado: true, quantidade: 2, conforme: true, resultados: 'Ok' },
      viga_benkelman: { realizado: false },
    };
    const output = html(<ReciclagemEnsaiosEmpreiteira data={data} />);
    expect(output).toContain('<table');
    expect(output).toContain('Ok');
  });
});