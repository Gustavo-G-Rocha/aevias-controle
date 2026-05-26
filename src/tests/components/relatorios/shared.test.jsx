/**
 * Testes dos componentes compartilhados de relatório.
 *
 * Estratégia: como o projeto usa environment='node' sem @testing-library/react,
 * os testes verificam a lógica de cada componente usando react-dom/server (renderToStaticMarkup)
 * para inspecionar o HTML produzido — sem dependências extras de DOM.
 *
 * Cobertura: ReportCheckmark, ReportSectionTitle, ReportNaoConformidadesTable,
 *            ReportLogoHeader, ReportPhotoPage
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';

import ReportCheckmark from '@/components/relatorios/shared/ReportCheckmark';
import ReportSectionTitle from '@/components/relatorios/shared/ReportSectionTitle';
import ReportNaoConformidadesTable from '@/components/relatorios/shared/ReportNaoConformidadesTable';
import ReportLogoHeader from '@/components/relatorios/shared/ReportLogoHeader';
import ReportPhotoPage from '@/components/relatorios/shared/ReportPhotoPage';

/** Helper: renderiza para string HTML */
const html = (element) => renderToStaticMarkup(element);

const DEFAULT_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png";

// ─── ReportCheckmark ──────────────────────────────────────────────────────────
describe('ReportCheckmark — modo booleano', () => {
  it('exibe ✓ e classe text-green-600 quando checked=true', () => {
    const output = html(<ReportCheckmark checked={true} />);
    expect(output).toContain('✓');
    expect(output).toContain('text-green-600');
  });

  it('exibe ✗ e classe text-red-600 quando checked=false', () => {
    const output = html(<ReportCheckmark checked={false} />);
    expect(output).toContain('✗');
    expect(output).toContain('text-red-600');
  });

  it('exibe - e classe text-slate-500 quando checked=null', () => {
    const output = html(<ReportCheckmark checked={null} />);
    expect(output).toContain('-');
    expect(output).toContain('text-slate-500');
  });

  it('exibe - quando checked=undefined', () => {
    const output = html(<ReportCheckmark checked={undefined} />);
    expect(output).toContain('-');
  });
});

describe('ReportCheckmark — modo tri-state (column)', () => {
  it('exibe ✓ verde para column="sim" quando sim=true', () => {
    const output = html(<ReportCheckmark checked={{ sim: true }} column="sim" />);
    expect(output).toContain('✓');
    expect(output).toContain('text-green-600');
  });

  it('não renderiza nada para column="sim" quando sim=false', () => {
    const output = html(<ReportCheckmark checked={{ sim: false }} column="sim" />);
    expect(output).toBe('');
  });

  it('exibe ✗ vermelho para column="nao" quando nao=true', () => {
    const output = html(<ReportCheckmark checked={{ nao: true }} column="nao" />);
    expect(output).toContain('✗');
    expect(output).toContain('text-red-600');
  });

  it('não renderiza nada para column="nao" quando nao=false', () => {
    const output = html(<ReportCheckmark checked={{ nao: false }} column="nao" />);
    expect(output).toBe('');
  });

  it('exibe N/A e text-slate-500 para column="na" quando na=true', () => {
    const output = html(<ReportCheckmark checked={{ na: true }} column="na" />);
    expect(output).toContain('N/A');
    expect(output).toContain('text-slate-500');
  });

  it('exibe - quando checked não é objeto (null)', () => {
    const output = html(<ReportCheckmark checked={null} column="sim" />);
    expect(output).toContain('-');
  });

  it('não renderiza nada quando nenhuma coluna corresponde ao objeto', () => {
    const output = html(<ReportCheckmark checked={{ sim: false, nao: false }} column="sim" />);
    expect(output).toBe('');
  });
});

// ─── ReportSectionTitle ───────────────────────────────────────────────────────
describe('ReportSectionTitle', () => {
  it('renderiza o texto passado como filho', () => {
    const output = html(<ReportSectionTitle>CONDIÇÕES CLIMÁTICAS</ReportSectionTitle>);
    expect(output).toContain('CONDIÇÕES CLIMÁTICAS');
  });

  it('usa tag h2', () => {
    const output = html(<ReportSectionTitle>Título</ReportSectionTitle>);
    expect(output).toMatch(/^<h2/);
  });

  it('tamanho padrão (md) contém text-sm', () => {
    const output = html(<ReportSectionTitle>T</ReportSectionTitle>);
    expect(output).toContain('text-sm');
  });

  it('tamanho sm contém text-[10px] e não text-sm', () => {
    const output = html(<ReportSectionTitle size="sm">T</ReportSectionTitle>);
    expect(output).toContain('text-[10px]');
    expect(output).not.toContain('text-sm');
  });

  it('sempre tem classe uppercase', () => {
    const output = html(<ReportSectionTitle>T</ReportSectionTitle>);
    expect(output).toContain('uppercase');
  });

  it('sempre tem fundo bg-slate-100', () => {
    const output = html(<ReportSectionTitle>T</ReportSectionTitle>);
    expect(output).toContain('bg-slate-100');
  });
});

// ─── ReportNaoConformidadesTable ──────────────────────────────────────────────
describe('ReportNaoConformidadesTable', () => {
  const ncs = [
    { local_nc: 'CAMPO', categoria_nc: 'Pavimentação', parametro_nc: 'Espessura' },
    { local_nc: 'USINA', categoria_nc: 'Mistura', parametro_nc: 'Granulometria' },
  ];

  it('retorna string vazia quando naoConformidades é undefined', () => {
    expect(html(<ReportNaoConformidadesTable />)).toBe('');
  });

  it('retorna string vazia quando array vazio', () => {
    expect(html(<ReportNaoConformidadesTable naoConformidades={[]} />)).toBe('');
  });

  it('renderiza cabeçalhos LOCAL, CATEGORIA e PARÂMETRO', () => {
    const output = html(<ReportNaoConformidadesTable naoConformidades={ncs} />);
    expect(output).toContain('LOCAL');
    expect(output).toContain('CATEGORIA');
    expect(output).toContain('PARÂMETRO');
  });

  it('renderiza o local_nc, categoria_nc e parametro_nc de cada NC', () => {
    const output = html(<ReportNaoConformidadesTable naoConformidades={ncs} />);
    expect(output).toContain('CAMPO');
    expect(output).toContain('Pavimentação');
    expect(output).toContain('Espessura');
    expect(output).toContain('USINA');
    expect(output).toContain('Mistura');
    expect(output).toContain('Granulometria');
  });

  it('exibe N/A para campos ausentes', () => {
    const output = html(<ReportNaoConformidadesTable naoConformidades={[{}]} />);
    // 3 células todas com N/A
    expect(output.split('N/A').length - 1).toBeGreaterThanOrEqual(3);
  });

  it('renderiza uma tabela (tag table)', () => {
    const output = html(<ReportNaoConformidadesTable naoConformidades={ncs} />);
    expect(output).toMatch(/^<table/);
  });

  it('renderiza exatamente 2 linhas no tbody para 2 NCs', () => {
    const output = html(<ReportNaoConformidadesTable naoConformidades={ncs} />);
    const trMatches = output.match(/<tr /g) || [];
    // 1 tr do thead + 2 trs do tbody
    expect(trMatches).toHaveLength(3);
  });
});

// ─── ReportLogoHeader ─────────────────────────────────────────────────────────
describe('ReportLogoHeader', () => {
  it('renderiza o título fornecido', () => {
    const output = html(<ReportLogoHeader title="CHECKLIST DE USINA" />);
    expect(output).toContain('CHECKLIST DE USINA');
  });

  it('renderiza a data quando fornecida', () => {
    const output = html(<ReportLogoHeader title="T" date="26/05/2026" />);
    expect(output).toContain('26/05/2026');
  });

  it('não renderiza bloco de data quando date não fornecida', () => {
    const output = html(<ReportLogoHeader title="T" />);
    expect(output).not.toContain('border-gray-400');
  });

  it('renderiza subtítulo quando fornecido', () => {
    const output = html(<ReportLogoHeader title="T" subtitle="Obra XYZ" />);
    expect(output).toContain('Obra XYZ');
  });

  it('não renderiza subtítulo quando ausente', () => {
    const output = html(<ReportLogoHeader title="T" />);
    expect(output).not.toContain('text-gray-600');
  });

  it('usa logo_url do regional quando fornecido', () => {
    const regional = { logo_url: 'https://example.com/logo.png' };
    const output = html(<ReportLogoHeader title="T" regional={regional} />);
    expect(output).toContain('https://example.com/logo.png');
  });

  it('usa logo padrão quando regional não tem logo_url', () => {
    const output = html(<ReportLogoHeader title="T" regional={{}} />);
    expect(output).toContain(DEFAULT_LOGO);
  });

  it('usa logo padrão quando regional é undefined', () => {
    const output = html(<ReportLogoHeader title="T" />);
    expect(output).toContain(DEFAULT_LOGO);
  });

  it('modo compact usa border-b sem border-b-2', () => {
    const output = html(<ReportLogoHeader title="T" compact={true} />);
    expect(output).toContain('border-b ');
    expect(output).not.toContain('border-b-2');
  });

  it('modo padrão usa border-b-2', () => {
    const output = html(<ReportLogoHeader title="T" />);
    expect(output).toContain('border-b-2');
  });

  it('aplica classe de altura customizada via logoHeight', () => {
    const output = html(<ReportLogoHeader title="T" logoHeight="h-16" />);
    expect(output).toContain('h-16');
  });

  it('usa tag header como raiz', () => {
    const output = html(<ReportLogoHeader title="T" />);
    expect(output).toMatch(/^<header/);
  });
});

// ─── ReportPhotoPage ──────────────────────────────────────────────────────────
describe('ReportPhotoPage', () => {
  const photos = [
    'https://example.com/foto1.jpg',
    'https://example.com/foto2.jpg',
    'https://example.com/foto3.jpg',
  ];

  it('renderiza o título fornecido', () => {
    const output = html(<ReportPhotoPage photos={photos} pageOffset={0} title="Relatório Fotográfico" />);
    expect(output).toContain('Relatório Fotográfico');
  });

  it('numera fotos corretamente a partir de pageOffset=0', () => {
    const output = html(<ReportPhotoPage photos={photos} pageOffset={0} title="Fotos" />);
    expect(output).toContain('Foto 1');
    expect(output).toContain('Foto 2');
    expect(output).toContain('Foto 3');
  });

  it('numera fotos corretamente a partir de pageOffset=1 (segunda página)', () => {
    const output = html(<ReportPhotoPage photos={photos} pageOffset={1} title="Fotos" />);
    expect(output).toContain('Foto 7');
    expect(output).toContain('Foto 8');
    expect(output).toContain('Foto 9');
  });

  it('usa photosPerPage customizado para calcular offset da página', () => {
    const output = html(<ReportPhotoPage photos={[photos[0]]} pageOffset={1} photosPerPage={4} title="Fotos" />);
    expect(output).toContain('Foto 5');
  });

  it('renderiza subtítulo quando fornecido', () => {
    const output = html(<ReportPhotoPage photos={photos} pageOffset={0} title="Fotos" subtitle="Obra ABC" />);
    expect(output).toContain('Obra ABC');
  });

  it('renderiza a data quando fornecida', () => {
    const output = html(<ReportPhotoPage photos={photos} pageOffset={0} title="Fotos" date="26/05/2026" />);
    expect(output).toContain('26/05/2026');
  });

  it('usa logo_url do regional quando fornecido', () => {
    const regional = { logo_url: 'https://example.com/logo.png' };
    const output = html(<ReportPhotoPage photos={photos} pageOffset={0} title="Fotos" regional={regional} />);
    expect(output).toContain('https://example.com/logo.png');
  });

  it('usa logo padrão quando regional é undefined', () => {
    const output = html(<ReportPhotoPage photos={photos} pageOffset={0} title="Fotos" />);
    expect(output).toContain(DEFAULT_LOGO);
  });

  it('inclui os srcs das fotos no HTML gerado', () => {
    const output = html(<ReportPhotoPage photos={photos} pageOffset={0} title="Fotos" />);
    photos.forEach(src => expect(output).toContain(src));
  });

  it('lista vazia de fotos não gera nenhuma tag img de foto', () => {
    const output = html(<ReportPhotoPage photos={[]} pageOffset={0} title="Fotos" />);
    // Apenas o logo está presente, sem fotos
    expect(output).not.toContain('foto1.jpg');
  });
});