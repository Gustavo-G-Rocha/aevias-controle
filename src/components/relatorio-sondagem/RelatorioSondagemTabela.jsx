import React from "react";
import { formatDate, formatarDensidade, formatarGC, isForaLimitesGCProjeto, isForaLimitesGCRice } from "@/utils/relatorioSondagemUtils";

export default function RelatorioSondagemTabela({ cpsValidos, ensaio, slice = [0, 10] }) {
  const [start, end] = slice;
  const cpsToShow = cpsValidos.slice(start, end);

  return (
    <>
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-2 py-0.5 font-bold text-center mb-0 mt-0">
        DADOS DO ENSAIO
      </div>

      <div className="overflow-x-auto mb-0">
        <table className="w-full border-collapse border border-slate-400 text-[8px]">
          <thead>
            <tr className="bg-slate-200">
              <th rowSpan="2" className="border border-slate-400 px-0.5 py-0.5 font-bold text-[7px]">Nº</th>
              <th colSpan="2" className="border border-slate-400 px-0.5 py-0.5 font-bold text-[7px]">LOCALIZAÇÃO</th>
              <th rowSpan="2" className="border border-slate-400 px-0.5 py-0.5 font-bold text-[7px]">DATA<br/>EXEC.</th>
              <th colSpan="2" className="border border-slate-400 px-0.5 py-0.5 font-bold text-[7px]">ESPESSURA</th>
              <th colSpan="3" className="border border-slate-400 px-0.5 py-0.5 font-bold text-[7px]">DETERM. DENS. APARENTE C.P.</th>
              <th rowSpan="2" className="border border-slate-400 px-0.5 py-0.5 font-bold text-[7px]">VOL.<br/>(cm³)</th>
              <th rowSpan="2" className="border border-slate-400 px-0.5 py-0.5 font-bold text-[7px]">DENS.<br/>(g/cm³)</th>
              <th rowSpan="2" className="border border-slate-400 px-0.5 py-0.5 font-bold text-[7px]">G.C<br/>PROJ.<br/>(%)</th>
              <th rowSpan="2" className="border border-slate-400 px-0.5 py-0.5 font-bold text-[7px]">RICE<br/>DIA<br/>(g/cm³)</th>
              <th rowSpan="2" className="border border-slate-400 px-0.5 py-0.5 font-bold text-[7px]">G.C<br/>RICE<br/>(%)</th>
              <th rowSpan="2" className="border border-slate-400 px-0.5 py-0.5 font-bold text-[7px]">VOL.<br/>VAZ.<br/>(%)</th>
              <th colSpan="2" className="border border-slate-400 px-0.5 py-0.5 font-bold text-[7px]">ROMPIMENTO</th>
            </tr>
            <tr className="bg-slate-200">
              <th className="border border-slate-400 px-0.5 py-0.5 font-bold text-[7px]">EST.</th>
              <th className="border border-slate-400 px-0.5 py-0.5 font-bold text-[7px]">L.</th>
              <th className="border border-slate-400 px-0.5 py-0.5 font-bold text-[7px]">MED.</th>
              <th className="border border-slate-400 px-0.5 py-0.5 font-bold text-[7px]">MÉD.<br/>(cm)</th>
              <th className="border border-slate-400 px-0.5 py-0.5 font-bold text-[7px]">P.AR<br/>(g)</th>
              <th className="border border-slate-400 px-0.5 py-0.5 font-bold text-[7px]">P.IM.<br/>(g)</th>
              <th className="border border-slate-400 px-0.5 py-0.5 font-bold text-[7px]">P.SAT.<br/>(g)</th>
              <th className="border border-slate-400 px-0.5 py-0.5 font-bold text-[7px]">LEIT.<br/>(Kgf)</th>
              <th className="border border-slate-400 px-0.5 py-0.5 font-bold text-[7px]">RTCD<br/>(MPa)</th>
            </tr>
          </thead>
          <tbody>
            {cpsToShow.map((cp, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="border border-slate-400 px-0.5 py-0.5 text-center font-semibold">{cp.numero}</td>
                <td className="border border-slate-400 px-0.5 py-0.5 text-center">{cp.estaca || '-'}</td>
                <td className="border border-slate-400 px-0.5 py-0.5 text-center">{cp.lado === 'direito' ? 'D' : 'E'}</td>
                <td className="border border-slate-400 px-0.5 py-0.5 text-center">{formatDate(cp.data_execucao)}</td>
                <td className="border border-slate-400 px-0.5 py-0.5 text-center text-[7px]">
                  {cp.medidas_espessura && cp.medidas_espessura.filter(m => m).length > 0
                    ? cp.medidas_espessura.filter(m => m).join('/')
                    : '-'}
                </td>
                <td className="border border-slate-400 px-0.5 py-0.5 text-center font-semibold">{cp.media_espessura || '-'}</td>
                <td className="border border-slate-400 px-0.5 py-0.5 text-center">{cp.peso_ao_ar || '-'}</td>
                <td className="border border-slate-400 px-0.5 py-0.5 text-center">{cp.peso_imerso || '-'}</td>
                <td className="border border-slate-400 px-0.5 py-0.5 text-center">{cp.peso_saturado || '-'}</td>
                <td className="border border-slate-400 px-0.5 py-0.5 text-center font-semibold">{cp.volume || '-'}</td>
                <td className="border border-slate-400 px-0.5 py-0.5 text-center font-semibold">{formatarDensidade(cp.densidade)}</td>
                <td className={`border border-slate-400 px-0.5 py-0.5 text-center font-bold ${isForaLimitesGCProjeto(cp.gc_dens_projeto, ensaio.servico) ? 'text-red-600' : 'text-blue-700'}`}>
                  {formatarGC(cp.gc_dens_projeto)}
                </td>
                <td className="border border-slate-400 px-0.5 py-0.5 text-center">{formatarDensidade(cp.dens_rice_do_dia)}</td>
                <td className={`border border-slate-400 px-0.5 py-0.5 text-center font-bold ${isForaLimitesGCRice(cp.gc_dens_rice_dia) ? 'text-red-600' : 'text-blue-700'}`}>
                  {formatarGC(cp.gc_dens_rice_dia)}
                </td>
                <td className="border border-slate-400 px-0.5 py-0.5 text-center">{cp.volume_vazios ? parseFloat(cp.volume_vazios).toFixed(1) : '-'}</td>
                <td className="border border-slate-400 px-0.5 py-0.5 text-center">{cp.leitura || '-'}</td>
                <td className="border border-slate-400 px-0.5 py-0.5 text-center font-semibold">{cp.rtcd_25c || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}