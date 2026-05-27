/**
 * Relatório completo de NC — componente visual.
 */
import React from 'react';
import NCReportHeader from './NCReportHeader';
import NCReportDadosGerais from './NCReportDadosGerais';
import NCReportClassificacao from './NCReportClassificacao';
import NCReportDescricao from './NCReportDescricao';
import NCReportAssinaturas from './NCReportAssinaturas';

export default function NCReport({ nc, obra, regional }) {
  return (
    <div className="p-8 print:p-8 bg-white font-sans min-h-[29.7cm] flex flex-col">
      <NCReportHeader nc={nc} obra={obra} regional={regional} />

      <main className="flex-grow space-y-6 text-sm">
        <NCReportDadosGerais nc={nc} />
        <NCReportClassificacao nc={nc} />
        <NCReportDescricao nc={nc} />
      </main>

      <NCReportAssinaturas nc={nc} />
    </div>
  );
}