import React from 'react';
import { ReportSectionTitle } from '@/components/relatorios/shared';
import { ENSAIOS_EMPREITEIRA_RECICLAGEM } from '@/utils/relatorioChecklistReciclagemUtils';

export default function ReciclagemEnsaiosEmpreiteira({ data = {} }) {
  const d = data || {};

  return (
    <div className="overflow-x-auto mb-2">
      <ReportSectionTitle size="sm">ACOMPANHAMENTO DOS ENSAIOS REALIZADOS PELA EMPREITEIRA</ReportSectionTitle>
      <table className="w-full border-collapse border border-slate-300 text-[9px]">
        <thead>
          <tr className="bg-white">
            <th className="border border-slate-300 px-1 py-1.5 text-left font-medium">ENSAIOS</th>
            <th className="border border-slate-300 px-1 py-1.5 text-center font-medium w-10">Sim</th>
            <th className="border border-slate-300 px-1 py-1.5 text-center font-medium w-10">Não</th>
            <th className="border border-slate-300 px-1 py-1.5 text-center font-medium w-10">Qtde</th>
            <th className="border border-slate-300 px-1 py-1.5 text-center font-medium w-12">Conforme</th>
            <th className="border border-slate-300 px-1 py-1.5 text-center font-medium w-14">Não Conforme</th>
            <th className="border border-slate-300 px-1 py-1.5 text-left font-medium">Resultado</th>
          </tr>
        </thead>
        <tbody>
          {ENSAIOS_EMPREITEIRA_RECICLAGEM.map(ensaio => {
            const dados = d[ensaio.key] || {};
            return (
              <tr key={ensaio.key}>
                <td className="border border-slate-300 px-1 py-1.5 bg-white">{ensaio.label}</td>
                <td className="border border-slate-300 px-1 py-1.5 text-center">
                  {dados.realizado ? <span className="text-green-600 font-bold text-sm">✓</span> : <span className="text-slate-500">-</span>}
                </td>
                <td className="border border-slate-300 px-1 py-1.5 text-center">-</td>
                <td className="border border-slate-300 px-1 py-1.5 text-center">{dados.quantidade || '-'}</td>
                <td className="border border-slate-300 px-1 py-1.5 text-center">
                  {dados.conforme === true && <span className="text-green-600 font-bold text-sm">✓</span>}
                </td>
                <td className="border border-slate-300 px-1 py-1.5 text-center">
                  {dados.conforme === false && <span className="text-red-600 font-bold text-sm">✗</span>}
                </td>
                <td className="border border-slate-300 px-1 py-1.5 font-medium text-center">{dados.resultados || '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}