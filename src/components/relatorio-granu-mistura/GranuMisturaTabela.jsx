/**
 * Tabela de granulometria do relatório.
 */
import React from 'react';
import { temEspecificacao } from '@/utils/relatorioGranuMisturaUtils';
import SectionHeader from './SectionHeader';

export default function GranuMisturaTabela({ record, peneirasParaMostrar }) {
  const mostraEspec = temEspecificacao(peneirasParaMostrar);

  return (
    <>
      <SectionHeader label="ENSAIO DE GRANULOMETRIA — DNIT 412/25 - ME" />
      <div className="mt-1">
        <div className="text-[9px] mb-1">
          <strong>PESO DA AMOSTRA (g):</strong> {record.peso_amostra || '—'}
        </div>
        <table
          className="w-full border-collapse border border-slate-400 text-[9px]"
          style={{ tableLayout: 'fixed' }}
        >
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-400 px-1 py-0.5">ASTM</th>
              <th className="border border-slate-400 px-1 py-0.5">(mm)</th>
              <th className="border border-slate-400 px-1 py-0.5">RETIDO (g)</th>
              <th className="border border-slate-400 px-1 py-0.5">PASS. (g)</th>
              <th className="border border-slate-400 px-1 py-0.5">% PASS.</th>
              {mostraEspec && (
                <>
                  <th className="border border-slate-400 px-1 py-0.5">MÍN.</th>
                  <th className="border border-slate-400 px-1 py-0.5">MÁX.</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {peneirasParaMostrar.map((p, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
              >
                <td className="border border-slate-400 px-1 py-0.5 font-semibold text-center">
                  {p.astm}
                </td>
                <td className="border border-slate-400 px-1 py-0.5 text-center">
                  {p.abertura_mm}
                </td>
                <td className="border border-slate-400 px-1 py-0.5 text-center">
                  {p.retido_g ?? '—'}
                </td>
                <td className="border border-slate-400 px-1 py-0.5 text-center">
                  {p.passante_g ?? '—'}
                </td>
                <td className="border border-slate-400 px-1 py-0.5 text-center font-bold text-blue-800">
                  {p.passante_pct ?? '—'}
                </td>
                {mostraEspec && (
                  <>
                    <td className="border border-slate-400 px-1 py-0.5 text-center text-green-700">
                      {p.especMin ?? '—'}
                    </td>
                    <td className="border border-slate-400 px-1 py-0.5 text-center text-green-700">
                      {p.especMax ?? '—'}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}