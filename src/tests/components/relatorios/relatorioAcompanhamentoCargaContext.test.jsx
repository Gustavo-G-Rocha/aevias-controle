import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  RelatorioAcompanhamentoCargaProvider,
  useRelatorioAcompanhamentoCargaCtx,
} from '@/components/relatorios/acompanhamento-carga/RelatorioAcompanhamentoCargaContext';

// Dados de teste espelhados do relatorioAcompanhamentoCargaMapper.test.js
const acompanhamentoBruto = {
  data: '2024-03-15',
  rodovia: 'BR-116',
  sub_trecho: 'Sub-trecho A',
  trecho: 'Trecho X',
  usina_fornecedora: 'Usina Beta',
  laboratorista_name: 'João Silva',
  servico: 'remendos',
  cargas: [{ placa: 'ABC-1234', peso_toneladas: 25 }],
  observacoes_gerais: 'Observação de teste',
  created_by: 'joao@test.com',
  created_date: '2024-03-15T10:00:00Z',
};

const regional = { cliente: 'Cliente Alpha', logo_url: 'https://exemplo.com/logo.png' };
const obra = { name: 'Obra 1' };
const projeto = { name: 'Projeto CAUQ' };
const faixaGranulometrica = { nome: 'Faixa IV' };

/** Consumer que serializa o valor do contexto para inspeção nos testes */
function ContextProbe({ onValue }) {
  const ctx = useRelatorioAcompanhamentoCargaCtx();
  onValue(ctx);
  return React.createElement('div', { 'data-testid': 'probe' });
}

function renderProbe(props, onValue) {
  return renderToString(
    React.createElement(
      RelatorioAcompanhamentoCargaProvider,
      props,
      React.createElement(ContextProbe, { onValue })
    )
  );
}

describe('RelatorioAcompanhamentoCargaContext', () => {
  describe('importabilidade', () => {
    it('Provider é exportado como função', () => {
      expect(typeof RelatorioAcompanhamentoCargaProvider).toBe('function');
    });

    it('hook é exportado como função', () => {
      expect(typeof useRelatorioAcompanhamentoCargaCtx).toBe('function');
    });
  });

  describe('Provider — derivação do presentation model', () => {
    it('expõe o presentation model computado pelo mapper', () => {
      let captured;
      renderProbe(
        { acompanhamento: acompanhamentoBruto, obra, regional, projeto, faixaGranulometrica },
        (ctx) => { captured = ctx; }
      );

      expect(captured.data).not.toBeNull();
      expect(captured.data.cliente).toBe('Cliente Alpha');
      expect(captured.data.rodovia).toBe('BR-116');
      expect(captured.data.projeto_nome).toBe('Projeto CAUQ');
      expect(captured.data.obra_nome).toBe('Obra 1');
      expect(captured.data.faixa_especificada).toBe('Faixa IV');
      expect(captured.data.laboratorista).toBe('João Silva');
      expect(captured.data.servico_label).toBe('Remendos');
      expect(captured.data.data).toBe('15/03/2024');
      expect(captured.data.cargas).toHaveLength(1);
      expect(captured.data.cargas[0].numero).toBe(1);
    });

    it('expõe data=null quando acompanhamento é null', () => {
      let captured;
      renderProbe({ acompanhamento: null }, (ctx) => { captured = ctx; });
      expect(captured.data).toBeNull();
    });

    it('expõe data=null quando acompanhamento é undefined', () => {
      let captured;
      renderProbe({}, (ctx) => { captured = ctx; });
      expect(captured.data).toBeNull();
    });

    it('inclui logo_url no presentation model (eliminando prop regional redundante)', () => {
      let captured;
      renderProbe(
        { acompanhamento: acompanhamentoBruto, regional },
        (ctx) => { captured = ctx; }
      );
      expect(captured.data.logo_url).toBe('https://exemplo.com/logo.png');
    });

    it('usa logo padrão quando regional não tem logo_url', () => {
      let captured;
      renderProbe({ acompanhamento: acompanhamentoBruto }, (ctx) => { captured = ctx; });
      expect(captured.data.logo_url).toContain('base44-prod');
    });

    it('inclui signatureProps prontas para SignatureFooter', () => {
      let captured;
      renderProbe(
        { acompanhamento: acompanhamentoBruto, regional },
        (ctx) => { captured = ctx; }
      );
      expect(captured.data.signatureProps).toBeDefined();
      expect(captured.data.signatureProps.labName).toBe('João Silva');
      expect(captured.data.signatureProps.labEmail).toBe('joao@test.com');
    });
  });

  describe('Provider — renderização de children', () => {
    it('renderiza children dentro do Provider', () => {
      const html = renderToString(
        React.createElement(
          RelatorioAcompanhamentoCargaProvider,
          { acompanhamento: acompanhamentoBruto, regional },
          React.createElement('div', null, 'Child Content')
        )
      );
      expect(html).toContain('Child Content');
    });
  });
});