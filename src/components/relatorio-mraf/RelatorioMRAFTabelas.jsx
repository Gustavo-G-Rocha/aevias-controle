import React from 'react';
import { getHeightClass } from '@/utils/relatorioMRAFUtils';

export default function RelatorioMRAFTabelas({ ensaio, project, faixa, dadosGranulometria }) {
  return (
    <>
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-3 py-2 font-bold text-center mb-2 mt-2 text-[10px] leading-tight print:px-2 print:py-1 print:mb-1.5 print:mt-1.5">
        DADOS DO ENSAIO
      </div>

      <div className="grid grid-cols-12 gap-2 mb-3 print:gap-1 print:mb-2">
        <div className="col-span-7 border border-slate-400">
          <div className="bg-slate-200 font-bold text-center border-b border-slate-400 px-2 py-1 text-[10px] print:px-1 print:py-0.5">
            ENSAIO DE GRANULOMETRIA - DNIT 412/2025
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[8px] leading-tight">
              <thead>
                <tr className="bg-slate-100">
                  <th rowSpan="2" className="border-r border-slate-300 font-bold leading-tight px-2 py-1 print:px-1 print:py-0.5">PENEIRAS<br/>ASTM (mm)</th>
                  <th colSpan="3" className="border-r border-slate-300 font-bold text-center leading-tight px-2 py-1 print:px-1 print:py-0.5">PESO DA AMOSTRA (g)</th>
                  <th colSpan="2" className="border-r border-slate-300 font-bold text-center leading-tight px-2 py-1 print:px-1 print:py-0.5">FAIXA DE TRABALHO</th>
                  <th colSpan="2" className="font-bold text-center leading-tight px-2 py-1 print:px-1 print:py-0.5">FAIXA ESPECIFICADA<br/>{faixa?.especificacao || ''}</th>
                </tr>
                <tr className="bg-slate-100">
                  <th className="border-r border-slate-300 font-bold leading-tight px-2 py-1 print:px-1 print:py-0.5">RETIDO (g)</th>
                  <th className="border-r border-slate-300 font-bold leading-tight px-2 py-1 print:px-1 print:py-0.5">PASS. (g)</th>
                  <th className="border-r border-slate-300 font-bold leading-tight px-2 py-1 print:px-1 print:py-0.5">% PASS.</th>
                  <th className="border-r border-slate-300 font-bold leading-tight px-2 py-1 print:px-1 print:py-0.5">MÍN. (%)</th>
                  <th className="border-r border-slate-300 font-bold leading-tight px-2 py-1 print:px-1 print:py-0.5">MÁX. (%)</th>
                  <th className="border-r border-slate-300 font-bold leading-tight px-2 py-1 print:px-1 print:py-0.5">MÍN. (%)</th>
                  <th className="font-bold leading-tight px-2 py-1 print:px-1 print:py-0.5">MÁX. (%)</th>
                </tr>
              </thead>
              <tbody>
                {dadosGranulometria.map((dado, idx) => {
                  const heightClass = getHeightClass(dadosGranulometria.length);
                  return (
                    <tr key={dado.astm} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className={`border-r border-slate-300 px-2 py-1 text-center font-semibold ${heightClass} print:px-1 print:py-0.5`}>{dado.astm}</td>
                      <td className={`border-r border-slate-300 px-2 py-1 text-center ${heightClass} print:px-1 print:py-0.5`}>{dado.retido}</td>
                      <td className={`border-r border-slate-300 px-2 py-1 text-center ${heightClass} print:px-1 print:py-0.5`}>{dado.passante}</td>
                      <td className={`border-r border-slate-300 px-2 py-1 text-center font-semibold ${heightClass} print:px-1 print:py-0.5`}>{dado.percentualPassante}</td>
                      <td className={`border-r border-slate-300 px-2 py-1 text-center ${heightClass} print:px-1 print:py-0.5`}>{dado.faixaTrabalhoMin ? parseFloat(dado.faixaTrabalhoMin).toFixed(1) : ''}</td>
                      <td className={`border-r border-slate-300 px-2 py-1 text-center ${heightClass} print:px-1 print:py-0.5`}>{dado.faixaTrabalhoMax ? parseFloat(dado.faixaTrabalhoMax).toFixed(1) : ''}</td>
                      <td className={`border-r border-slate-300 px-2 py-1 text-center ${heightClass} print:px-1 print:py-0.5`}>{dado.limiteMin ? parseFloat(dado.limiteMin).toFixed(1) : ''}</td>
                      <td className={`px-2 py-1 text-center ${heightClass} print:px-1 print:py-0.5`}>{dado.limiteMax ? parseFloat(dado.limiteMax).toFixed(1) : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-5">
          <div className="border border-slate-400 border-l-0">
            <div className="bg-slate-200 font-bold text-center border-b border-slate-400 leading-tight px-2 py-1 text-[9px] print:px-1 print:py-0.5">
              EXTRAÇÃO LIGANTE (ROTAREX)<br/>ABNT NBR 16208/2013
            </div>
            <table className="w-full border-collapse table-fixed text-[8px]">
              <colgroup>
                <col className="w-[35%]" />
                <col className="w-[65%]" />
              </colgroup>
              <tbody>
                <tr className="bg-white">
                  <td className="border-r border-slate-300 font-bold px-2 py-1.5 print:px-1 print:py-1">EMULSÃO:</td>
                  <td className="px-2 py-1.5 print:px-1 print:py-1">{project?.emulsao_utilizada || '-'}</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border-r border-slate-300 font-bold px-2 py-1.5 print:px-1 print:py-1">TIPO LIG.:</td>
                  <td className="px-2 py-1.5 print:px-1 print:py-1">{ensaio?.tipo_ligante || '-'}</td>
                </tr>

                {ensaio?.extracao_ligante && (
                  <>
                    <tr className="bg-white">
                      <td className="border-r border-slate-300 font-bold px-2 py-1.5 print:px-1 print:py-1">AM. C/ LIG.:</td>
                      <td className="px-2 py-1.5 print:px-1 print:py-1">{ensaio.extracao_ligante.amostra_com_ligante || '-'} g</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="border-r border-slate-300 font-bold px-2 py-1.5 print:px-1 print:py-1">AM. S/ LIG.:</td>
                      <td className="px-2 py-1.5 print:px-1 print:py-1">{ensaio.extracao_ligante.amostra_sem_ligante || '-'} g</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="border-r border-slate-300 font-bold px-2 py-1.5 print:px-1 print:py-1">FAT. CORR.:</td>
                      <td className="px-2 py-1.5 print:px-1 print:py-1">{ensaio.extracao_ligante.fator_correcao || '1.0000'}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="border-r border-slate-300 font-bold px-2 py-1.5 print:px-1 print:py-1">PESO LIG.:</td>
                      <td className="px-2 py-1.5 print:px-1 print:py-1">{ensaio.extracao_ligante.peso_ligante || '-'} g</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="border-r border-slate-300 font-bold px-2 py-1.5 print:px-1 print:py-1">TEOR LIG.:</td>
                      <td className="font-semibold px-2 py-1.5 print:px-1 print:py-1">{ensaio.extracao_ligante.teor_ligante || '-'}%</td>
                    </tr>
                    <tr className="bg-blue-50">
                      <td className="border-r border-slate-300 font-bold px-2 py-1.5 print:px-1 print:py-1">% DE EMULSÃO:</td>
                      <td className="font-semibold text-blue-700 px-2 py-1.5 print:px-1 print:py-1">
                        {ensaio.extracao_ligante.teor_ligante && ensaio.extracao_ligante.residuo_emulsao 
                          ? ((ensaio.extracao_ligante.teor_ligante / ensaio.extracao_ligante.residuo_emulsao) * 100).toFixed(2)
                          : '-'}%
                      </td>
                    </tr>

                    {ensaio.extracao_ligante.amostra_umida && (
                      <tr className="bg-blue-50">
                        <td className="border-r border-slate-300 font-bold px-2 py-1.5 print:px-1 print:py-1">UMIDADE:</td>
                        <td className="font-semibold text-blue-700 px-2 py-1.5 print:px-1 print:py-1">{ensaio.extracao_ligante.umidade || 0}%</td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}