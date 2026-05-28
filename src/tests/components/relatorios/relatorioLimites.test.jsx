/**
 * Testes dos subcomponentes extraídos de RelatorioLimites.
 * Estratégia: renderToStaticMarkup — sem DOM, sem snapshots gigantes.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';

import LimitesHeader from '@/components/relatorio-limites/LimitesHeader';
import LimitesInfoFields from '@/components/relatorio-limites/LimitesInfoFields';
import LimitesResumo from '@/components/relatorio-limites/LimitesResumo';
import LimitesAssinaturas from '@/components/relatorio-limites/LimitesAssinaturas';

const html = (element) => renderToStaticMarkup(element);

const DEFAULT_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png";

// ─── LimitesHeader ────────────────────────────────────────────────────────────
describe('LimitesHeader', () => {
  it('renderiza sem erros com regional=undefined', () => {
    expect(() => html(<LimitesHeader />)).not.toThrow();
  });

  it('exibe o título CARACTERIZAÇÃO MECÂNICA', () => {
    const output = html(<LimitesHeader />);
    expect(output).toContain('CARACTERIZAÇÃO MECÂNICA');
  });

  it('usa logo padrão quando regional não tem logo_url', () => {
    const output = html(<LimitesHeader regional={{}} />);
    expect(output).toContain(DEFAULT_LOGO);
  });

  it('usa logo_url do regional quando fornecido', () => {
    const output = html(<LimitesHeader regional={{ logo_url: 'https://example.com/logo.png' }} />);
    expect(output).toContain('https://example.com/logo.png');
    expect(output).not.toContain(DEFAULT_LOGO);
  });

  it('renderiza tag header como raiz', () => {
    const output = html(<LimitesHeader />);
    expect(output).toMatch(/^<header/);
  });
});

// ─── LimitesInfoFields ────────────────────────────────────────────────────────
describe('LimitesInfoFields', () => {
  it('retorna string vazia quando ensaio=undefined', () => {
    expect(html(<LimitesInfoFields />)).toBe('');
  });

  it('retorna string vazia quando ensaio=null', () => {
    expect(html(<LimitesInfoFields ensaio={null} />)).toBe('');
  });

  it('exibe todos os rótulos de campo', () => {
    const output = html(<LimitesInfoFields ensaio={{}} obra={{}} />);
    ['OBRA', 'LOCAL', 'MATERIAL', 'RODOVIA', 'ENERGIA', 'LABORATORISTA', 'TRECHO', 'CAMADA', 'DATA'].forEach(label => {
      expect(output).toContain(label);
    });
  });

  it('exibe nome da obra quando fornecido', () => {
    const output = html(<LimitesInfoFields ensaio={{}} obra={{ name: 'Obra Teste ABC' }} />);
    expect(output).toContain('Obra Teste ABC');
  });

  it('exibe fallback "-" para obra sem nome', () => {
    const output = html(<LimitesInfoFields ensaio={{ laboratorista_name: 'João' }} obra={{}} />);
    expect(output).toContain('-');
  });

  it('exibe laboratorista_name quando fornecido', () => {
    const output = html(<LimitesInfoFields ensaio={{ laboratorista_name: 'Maria Silva' }} />);
    expect(output).toContain('Maria Silva');
  });

  it('exibe data formatada quando data_ensaio fornecida', () => {
    const output = html(<LimitesInfoFields ensaio={{ data_ensaio: '2025-06-15' }} />);
    expect(output).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

// ─── LimitesResumo ────────────────────────────────────────────────────────────
describe('LimitesResumo', () => {
  it('renderiza sem erros com todas as props undefined', () => {
    expect(() => html(<LimitesResumo />)).not.toThrow();
  });

  it('exibe o título Resumo de Caracterização', () => {
    const output = html(<LimitesResumo />);
    expect(output).toContain('Resumo de Caracterização');
  });

  it('exibe todos os rótulos do resumo', () => {
    const output = html(<LimitesResumo />);
    expect(output).toContain('% Passante #10');
    expect(output).toContain('% Passante #40');
    expect(output).toContain('% Passante #200');
    expect(output).toContain('Limite de Liquidez');
    expect(output).toContain('Limite de Plasticidade');
    expect(output).toContain('Índice de Plasticidade');
    expect(output).toContain('Índice de Grupo');
    expect(output).toContain('Classificação HRB');
  });

  it('exibe fallback "-" para valores ausentes', () => {
    const output = html(<LimitesResumo />);
    // Deve ter vários "-" (um por linha sem dado)
    expect((output.match(/>-</g) || []).length).toBeGreaterThanOrEqual(7);
  });

  it('exibe os valores numéricos quando fornecidos', () => {
    const output = html(<LimitesResumo pct10={85} pct40={60} pct200={30} ll={38} lp={22} ip={16} ig={3} hrb="A6" />);
    expect(output).toContain('85%');
    expect(output).toContain('60%');
    expect(output).toContain('30%');
    expect(output).toContain('38%');
    expect(output).toContain('22%');
    expect(output).toContain('16%');
    expect(output).toContain('3');
    expect(output).toContain('A6');
  });

  it('renderiza uma tabela', () => {
    const output = html(<LimitesResumo />);
    expect(output).toContain('<table');
  });
});

// ─── LimitesAssinaturas ───────────────────────────────────────────────────────
describe('LimitesAssinaturas', () => {
  it('retorna string vazia quando ensaio=undefined', () => {
    expect(html(<LimitesAssinaturas />)).toBe('');
  });

  it('retorna string vazia quando ensaio=null', () => {
    expect(html(<LimitesAssinaturas ensaio={null} />)).toBe('');
  });

  it('exibe os três títulos de coluna de assinatura', () => {
    const output = html(<LimitesAssinaturas ensaio={{}} />);
    expect(output).toContain('LABORATORISTA RESPONSÁVEL');
    expect(output).toContain('ENGENHEIRO RESPONSÁVEL');
    expect(output).toContain('ENGENHEIRO CLIENTE');
  });

  it('exibe nome do laboratorista quando fornecido', () => {
    const output = html(<LimitesAssinaturas ensaio={{ laboratorista_name: 'Carlos Souza' }} />);
    expect(output).toContain('Carlos Souza');
  });

  it('exibe nome do aprovador quando fornecido', () => {
    const ensaio = { approver_details: { name: 'Eng. Aprovador', crea_number: '12345-D/SP' }, approved_by: 'eng@test.com' };
    const output = html(<LimitesAssinaturas ensaio={ensaio} />);
    expect(output).toContain('Eng. Aprovador');
    expect(output).toContain('CREA: 12345-D/SP');
  });

  it('exibe dados do cliente quando client_signature fornecida', () => {
    const ensaio = {
      client_signature: {
        engineer_name: 'Eng. Cliente',
        signed_by: 'cliente@test.com',
        crea_number: '99999-D/RJ',
        signed_date: '2025-06-01T10:00:00Z',
      }
    };
    const output = html(<LimitesAssinaturas ensaio={ensaio} />);
    expect(output).toContain('Eng. Cliente');
    expect(output).toContain('CREA: 99999-D/RJ');
  });

  it('renderiza footer como raiz', () => {
    const output = html(<LimitesAssinaturas ensaio={{}} />);
    expect(output).toMatch(/^<footer/);
  });
});