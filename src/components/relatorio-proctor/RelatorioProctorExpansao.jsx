import React from 'react';
import { calcExpansao, fmtN, fmtDate } from '@/utils/relatorioProctorUtils';

export default function RelatorioProctorExpansao({ ensaio }) {
  const exps      = ensaio.expansao_cilindros || [];
  const altInicial = exps[0]?.altura_inicial;

  return (
    <section>
      <div className="bg-slate-700 text-white px-2 py-0.5 font-bold text-center text-[10px] mb-1">EXPANSÃO</div>
      <div className="text-[9px] mb-1 px-1">
        <strong>Altura Inicial (mm):</strong> {fmtN(altInicial, 2)}
      </div>
      <table className="w-full border-collapse border border-slate-400 text-[8px]">
        <thead>
          <tr className="bg-slate-200">
            <th className="border border-slate-400 px-1 py-0.5">Data</th>
            <th className="border border-slate-400 px-1 py-0.5">Hora</th>
            <th className="border border-slate-400 px-1 py-0.5">Cilindro</th>
            <th className="border border-slate-400 px-1 py-0.5 bg-slate-100">1° dia (mm)</th>
            <th className="border border-slate-400 px-1 py-0.5 bg-slate-100">2° dia (mm)</th>
            <th className="border border-slate-400 px-1 py-0.5 bg-slate-100">3° dia (mm)</th>
            <th className="border border-slate-400 px-1 py-0.5 bg-slate-100">4° dia (mm)</th>
            <th className="border border-slate-400 px-1 py-0.5">Dif. (mm)</th>
            <th className="border border-slate-400 px-1 py-0.5 font-bold">Exp. (%)</th>
          </tr>
        </thead>
        <tbody>
          {exps.map((exp, i) => {
            const { diferenca, expansao_pct } = calcExpansao(exp);
            const cilNome = ensaio.densidades?.[i]?.cilindro_numero || (i + 1);
            return (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="border border-slate-400 px-1 py-0.5 text-center">{exp.data ? fmtDate(exp.data) : '-'}</td>
                <td className="border border-slate-400 px-1 py-0.5 text-center">{exp.hora || '-'}</td>
                <td className="border border-slate-400 px-1 py-0.5 text-center font-semibold">{cilNome}</td>
                {['leitura_1dia', 'leitura_2dia', 'leitura_3dia', 'leitura_4dia'].map(f => (
                  <td key={f} className="border border-slate-400 px-1 py-0.5 text-center bg-gray-100">{fmtN(exp[f], 2)}</td>
                ))}
                <td className="border border-slate-400 px-1 py-0.5 text-center">{diferenca != null ? fmtN(diferenca, 2) : '-'}</td>
                <td className="border border-slate-400 px-1 py-0.5 text-center font-bold text-blue-800">{expansao_pct != null ? fmtN(expansao_pct, 2) : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}