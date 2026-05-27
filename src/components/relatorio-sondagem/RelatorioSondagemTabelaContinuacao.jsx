import React from "react";
import { formatDate, formatarDensidade, formatarGC, isForaLimitesGCProjeto, isForaLimitesGCRice } from "@/utils/relatorioSondagemUtils";

export default function RelatorioSondagemTabelaContinuacao({ cpsValidos, ensaio }) {
  const cpsToShow = cpsValidos.slice(10);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-slate-400 text-[10px]">
        <thead>
          <tr className="bg-slate-200">
            <th className="border border-slate-400 px-1 py-1 font-bold">Nº</th>
            <th className="border border-slate-400 px-1 py-1 font-bold">ESTACA</th>
            <th className="border border-slate-400 px-1 py-1 font-bold">LADO</th>
            <th className="border border-slate-400 px-1 py-1 font-bold">DATA EXEC.</th>
            <th className="border border-slate-400 px-1 py-1 font-bold">MÉDIA ESP.<br/>(cm)</th>
            <th className="border border-slate-400 px-1 py-1 font-bold">DENSIDADE<br/>(g/cm³)</th>
            <th className="border border-slate-400 px-1 py-1 font-bold">G.C DENS.<br/>PROJETO (%)</th>
            <th className="border border-slate-400 px-1 py-1 font-bold">G.C DENS.<br/>RICE (%)</th>
            <th className="border border-slate-400 px-1 py-1 font-bold">RTCD 25°C<br/>(MPa)</th>
          </tr>
        </thead>
        <tbody>
          {cpsToShow.map((cp, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="border border-slate-400 px-1 py-1 text-center font-semibold">{cp.numero}</td>
              <td className="border border-slate-400 px-1 py-1 text-center">{cp.estaca || '-'}</td>
              <td className="border border-slate-400 px-1 py-1 text-center">{cp.lado === 'direito' ? 'D' : 'E'}</td>
              <td className="border border-slate-400 px-1 py-1 text-center">{formatDate(cp.data_execucao)}</td>
              <td className="border border-slate-400 px-1 py-1 text-center font-semibold">{cp.media_espessura || '-'}</td>
              <td className="border border-slate-400 px-1 py-1 text-center font-semibold">{formatarDensidade(cp.densidade)}</td>
              <td className={`border border-slate-400 px-1 py-1 text-center font-bold ${isForaLimitesGCProjeto(cp.gc_dens_projeto, ensaio.servico) ? 'text-red-600' : 'text-blue-700'}`}>
                {formatarGC(cp.gc_dens_projeto)}
              </td>
              <td className={`border border-slate-400 px-1 py-1 text-center font-bold ${isForaLimitesGCRice(cp.gc_dens_rice_dia) ? 'text-red-600' : 'text-blue-700'}`}>
                {formatarGC(cp.gc_dens_rice_dia)}
              </td>
              <td className="border border-slate-400 px-1 py-1 text-center font-semibold">{cp.rtcd_25c || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}