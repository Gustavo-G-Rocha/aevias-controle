import React from 'react';
import { PENETRACOES, TEMPOS, PRESSAO_PADRAO, calcISC, fmtN } from '@/utils/relatorioProctorUtils';

export default function RelatorioProctorISC({ ensaio }) {
  const cbr    = ensaio.cbr_cilindros || [];
  const fator  = ensaio.cbr_fator_anel;
  const hasData = cbr.some(c => (c.leituras || []).some(l => parseFloat(l) > 0));

  if (!hasData) return null;

  return (
    <section>
      <div className="bg-slate-700 text-white px-2 py-0.5 font-bold text-center text-[10px] mb-1">CÁLCULO DO ISC</div>
      <table className="w-full border-collapse border border-slate-400 text-[8px]">
        <tbody>
          <tr className="bg-slate-100">
            <td className="border border-slate-400 px-1 py-0.5 font-bold" rowSpan={2}>Nº Cilindro</td>
            <td className="border border-slate-400 px-1 py-0.5 font-bold">Penetração (mm)</td>
            {PENETRACOES.map(p => (
              <td key={p} className="border border-slate-400 px-1 py-0.5 text-center font-bold">{p}</td>
            ))}
          </tr>
          <tr className="bg-slate-100">
            <td className="border border-slate-400 px-1 py-0.5 font-bold">Tempo (min)</td>
            {TEMPOS.map(t => (
              <td key={t} className="border border-slate-400 px-1 py-0.5 text-center font-bold">{t}</td>
            ))}
          </tr>
          <tr className="bg-slate-200 font-bold">
            <td className="border border-slate-400 px-1 py-0.5 text-[7px]"></td>
            <td className="border border-slate-400 px-1 py-0.5 text-[7px]">Pressão Padrão</td>
            {PENETRACOES.map((_, pi) => (
              <td key={pi} className="border border-slate-400 px-1 py-0.5 text-center text-[7px]">{PRESSAO_PADRAO[pi] || ''}</td>
            ))}
          </tr>
          {cbr.map((cil, cidx) => {
            const { pressoes: _pressoes, isc254, isc508 } = calcISC(cil, fator);
            return (
              <React.Fragment key={cil.cilindro_numero ?? cidx}>
                <tr className="bg-white">
                  <td className="border border-slate-400 px-1 py-0.5 font-semibold" rowSpan={2}>{cil.cilindro_numero || cidx + 1}</td>
                  <td className="border border-slate-400 px-1 py-0.5 text-[7px]">Leitura do anel</td>
                  {(cil.leituras || Array(9).fill('')).map((l, li) => (
                    <td key={li} className="border border-slate-400 px-1 py-0.5 text-center">{parseFloat(l) > 0 ? fmtN(l, 0) : ''}</td>
                  ))}
                </tr>
                <tr className="bg-slate-100 font-bold">
                  <td className="border border-slate-400 px-1 py-0.5 text-[7px]">ISC (%)</td>
                  {PENETRACOES.map((_, pi) => (
                    <td key={pi} className="border border-slate-400 px-1 py-0.5 text-center text-blue-800">
                      {pi === 3 && isc254 != null ? isc254 : pi === 5 && isc508 != null ? isc508 : ''}
                    </td>
                  ))}
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}