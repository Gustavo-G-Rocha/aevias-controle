/**
 * Testes dos subcomponentes extraídos de RelatorioChecklistMRAF.jsx.
 *
 * Estratégia: mesma do projeto — react-dom/server (renderToStaticMarkup)
 * para inspecionar o HTML produzido sem dependências extras de DOM.
 *
 * Cobertura: CondicionamentoInsumos, PreparacaoSuperficie, AcompanhamentoAplicacao
 *
 * Fora de escopo intencional: CSS visual, PDF, impressão, integração Base44.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';

import CondicionamentoInsumos from '@/components/relatorios/checklist-mraf/CondicionamentoInsumos';
import PreparacaoSuperficie from '@/components/relatorios/checklist-mraf/PreparacaoSuperficie';
import AcompanhamentoAplicacao from '@/components/relatorios/checklist-mraf/AcompanhamentoAplicacao';

/** Helper: renderiza para string HTML */
const html = (element) => renderToStaticMarkup(element);

// ─── CondicionamentoInsumos ───────────────────────────────────────────────────
describe('CondicionamentoInsumos', () => {
  it('renderiza sem erros com data=undefined', () => {
    expect(() => html(<CondicionamentoInsumos />)).not.toThrow();
  });

  it('renderiza sem erros com data=null', () => {
    expect(() => html(<CondicionamentoInsumos data={null} />)).not.toThrow();
  });

  it('exibe o título da seção', () => {
    const output = html(<CondicionamentoInsumos />);
    expect(output).toContain('Condicionamento dos Insumos');
  });

  it('exibe todos os rótulos de linha da tabela', () => {
    const output = html(<CondicionamentoInsumos />);
    expect(output).toContain('Agregados separados no canteiro?');
    expect(output).toContain('Agregados devidamente cobertos?');
    expect(output).toContain('Filler utilizado:');
    expect(output).toContain('Utilização de aditivos?');
    expect(output).toContain('Água contaminada?');
  });

  it('exibe fallback "N/A" para filler_utilizado ausente', () => {
    const output = html(<CondicionamentoInsumos data={{}} />);
    expect(output).toContain('N/A');
  });

  it('exibe o valor de filler_utilizado quando fornecido', () => {
    const output = html(<CondicionamentoInsumos data={{ filler_utilizado: 'Cal Hidratada' }} />);
    expect(output).toContain('Cal Hidratada');
  });

  it('exibe fallback "-" para observacoes ausente', () => {
    const output = html(<CondicionamentoInsumos data={{}} />);
    expect(output).toContain('-');
  });

  it('exibe o texto de observacoes quando fornecido', () => {
    const output = html(<CondicionamentoInsumos data={{ observacoes: 'Tudo conforme.' }} />);
    expect(output).toContain('Tudo conforme.');
  });

  it('renderiza uma tabela com dados mínimos válidos', () => {
    const data = {
      agregados_separados: true,
      agregados_cobertos: false,
      filler_utilizado: 'Cimento',
      utilizacao_aditivos: true,
      agua_contaminada: false,
      observacoes: 'OK',
    };
    const output = html(<CondicionamentoInsumos data={data} />);
    expect(output).toContain('Cimento');
    expect(output).toContain('OK');
    expect(output).toContain('<table');
  });
});

// ─── PreparacaoSuperficie ─────────────────────────────────────────────────────
describe('PreparacaoSuperficie', () => {
  it('renderiza sem erros com data=undefined', () => {
    expect(() => html(<PreparacaoSuperficie />)).not.toThrow();
  });

  it('renderiza sem erros com data=null', () => {
    expect(() => html(<PreparacaoSuperficie data={null} />)).not.toThrow();
  });

  it('exibe o título da seção', () => {
    const output = html(<PreparacaoSuperficie />);
    expect(output).toContain('Preparação da Superfície');
  });

  it('exibe todos os rótulos de linha da tabela', () => {
    const output = html(<PreparacaoSuperficie />);
    expect(output).toContain('Superfície úmida?');
    expect(output).toContain('Temperatura do pavimento:');
    expect(output).toContain('Pavimento apresenta patologias?');
    expect(output).toContain('Superfície fresada?');
    expect(output).toContain('A superfície foi limpa antes da aplicação?');
  });

  it('exibe "N/A" quando temperatura_pavimento está ausente', () => {
    const output = html(<PreparacaoSuperficie data={{}} />);
    expect(output).toContain('N/A');
  });

  it('exibe temperatura formatada com °C quando fornecida', () => {
    const output = html(<PreparacaoSuperficie data={{ temperatura_pavimento: 32 }} />);
    expect(output).toContain('32 °C');
  });

  it('exibe fallback "-" para observacoes ausente', () => {
    const output = html(<PreparacaoSuperficie data={{}} />);
    expect(output).toContain('-');
  });

  it('exibe o texto de observacoes quando fornecido', () => {
    const output = html(<PreparacaoSuperficie data={{ observacoes: 'Superfície seca.' }} />);
    expect(output).toContain('Superfície seca.');
  });

  it('exibe nota de rodapé sobre vassouras mecânicas', () => {
    const output = html(<PreparacaoSuperficie />);
    expect(output).toContain('vassouras mecânicas');
  });

  it('renderiza uma tabela com dados mínimos válidos', () => {
    const data = {
      superficie_umida: false,
      temperatura_pavimento: 25,
      pavimento_patologias: true,
      superficie_fresada: true,
      superficie_limpa: true,
      observacoes: 'Verificado.',
    };
    const output = html(<PreparacaoSuperficie data={data} />);
    expect(output).toContain('25 °C');
    expect(output).toContain('Verificado.');
    expect(output).toContain('<table');
  });
});

// ─── AcompanhamentoAplicacao ──────────────────────────────────────────────────
describe('AcompanhamentoAplicacao', () => {
  it('renderiza sem erros com data=undefined', () => {
    expect(() => html(<AcompanhamentoAplicacao />)).not.toThrow();
  });

  it('renderiza sem erros com data=null', () => {
    expect(() => html(<AcompanhamentoAplicacao data={null} />)).not.toThrow();
  });

  it('exibe o título da seção', () => {
    const output = html(<AcompanhamentoAplicacao />);
    expect(output).toContain('Acompanhamento da Aplicação');
  });

  it('exibe todos os rótulos de serviço da tabela', () => {
    const output = html(<AcompanhamentoAplicacao />);
    expect(output).toContain('Aguardado tempo necessário para rompimento/cura?');
    expect(output).toContain('Taxa de Aplicação');
    expect(output).toContain('Resíduo da Emulsão');
    expect(output).toContain('Espessura da Camada');
  });

  it('exibe os limites normativos do DNIT 035/2018', () => {
    const output = html(<AcompanhamentoAplicacao />);
    expect(output).toContain('8 kg/m² a 16 kg/m²');
    expect(output).toContain('6,5% a 12,0%');
    expect(output).toContain('6 mm a 20 mm');
  });

  it('exibe fallback "-" para resultado ausente em ResultadoCell', () => {
    const output = html(<AcompanhamentoAplicacao data={{}} />);
    // Pelo menos um "-" de resultado esperado
    expect(output).toContain('-');
  });

  it('exibe o resultado quando taxa_aplicacao.resultado está presente', () => {
    const data = { taxa_aplicacao: { realizado: true, resultado: '12,5', conforme: true } };
    const output = html(<AcompanhamentoAplicacao data={data} />);
    expect(output).toContain('12,5');
  });

  it('exibe ⚠️ quando conforme=false em taxa_aplicacao', () => {
    const data = { taxa_aplicacao: { realizado: true, resultado: '5,0', conforme: false } };
    const output = html(<AcompanhamentoAplicacao data={data} />);
    expect(output).toContain('⚠️');
  });

  it('não exibe ⚠️ quando conforme=true em taxa_aplicacao', () => {
    const data = { taxa_aplicacao: { realizado: true, resultado: '10,0', conforme: true } };
    const output = html(<AcompanhamentoAplicacao data={data} />);
    expect(output).not.toContain('⚠️');
  });

  it('exibe ⚠️ em residuo_emulsao quando conforme=false', () => {
    const data = { residuo_emulsao: { realizado: true, resultado: '4,0', conforme: false } };
    const output = html(<AcompanhamentoAplicacao data={data} />);
    expect(output).toContain('⚠️');
  });

  it('exibe ⚠️ em espessura_camada quando conforme=false', () => {
    const data = { espessura_camada: { realizado: true, resultado: '3', conforme: false } };
    const output = html(<AcompanhamentoAplicacao data={data} />);
    expect(output).toContain('⚠️');
  });

  it('exibe fallback "-" para observacoes ausente', () => {
    const output = html(<AcompanhamentoAplicacao data={{}} />);
    expect(output).toContain('-');
  });

  it('exibe o texto de observacoes quando fornecido', () => {
    const output = html(<AcompanhamentoAplicacao data={{ observacoes: 'Dentro do limite.' }} />);
    expect(output).toContain('Dentro do limite.');
  });

  it('renderiza uma tabela com dados mínimos válidos completos', () => {
    const data = {
      tempo_rompimento_cura: { realizado: true },
      taxa_aplicacao: { realizado: true, resultado: '12,0', conforme: true },
      residuo_emulsao: { realizado: true, resultado: '9,5', conforme: true },
      espessura_camada: { realizado: true, resultado: '10', conforme: true },
      observacoes: 'Tudo OK.',
    };
    const output = html(<AcompanhamentoAplicacao data={data} />);
    expect(output).toContain('12,0');
    expect(output).toContain('9,5');
    expect(output).toContain('10');
    expect(output).toContain('Tudo OK.');
    expect(output).not.toContain('⚠️');
    expect(output).toContain('<table');
  });
});