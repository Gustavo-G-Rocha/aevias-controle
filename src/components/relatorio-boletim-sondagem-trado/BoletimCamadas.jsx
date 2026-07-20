/**
 * Seção de camadas (estratigrafia) do boletim.
 */
import React from 'react';
import { formatNumber, getFaceTitle } from '@/utils/relatorioBoletimSondagemTradoUtils';

export default function BoletimCamadas({ camadas, faceClassificacao }) {
  const faceTitle = getFaceTitle(faceClassificacao);

  return (
    <section>
      <div className="bg-[#BFCF99] text-[#00233B] px-2 py-0.5 font-bold text-center text-[10px] mb-1">
        SONDAGEM — CAMADAS
      </div>
      <div className="bg-[#E8EDD5] text-[#00233B] px-1 py-0.5 font-bold text-center text-[9px] mb-0.5">
        {faceTitle}
      </div>
      <table className="w-full border-collapse text-[9px]">
        <thead>
          <tr className="bg-[#E8EDD5]">
            <th rowSpan={2} className="px-1 py-0.5 text-center font-bold">
              Nº
            </th>
            <th colSpan={2} className="px-1 py-0.5 text-center font-bold">
              PROF. (m)
            </th>
            <th rowSpan={2} className="px-1 py-0.5 text-center font-bold">
              ESP.
            </th>
            <th rowSpan={2} className="px-1 py-0.5 text-center font-bold">
              N.A
            </th>
            <th rowSpan={2} className="px-1 py-0.5 text-center font-bold">
              CLASSIFICAÇÃO
            </th>
          </tr>
          <tr className="bg-[#E8EDD5]">
            <th className="px-1 py-0.5 text-center text-[8px]">
              DE
            </th>
            <th className="px-1 py-0.5 text-center text-[8px]">
              ATÉ
            </th>
          </tr>
        </thead>
        <tbody>
          {camadas.map((c, i) => (
            <tr key={i} className={'bg-white'}>
              <td className="px-1 py-0.5 text-center font-semibold">
                {c.numero}
              </td>
              <td className="px-1 py-0.5 text-center">
                {c.prof_de != null ? formatNumber(c.prof_de) : '-'}
              </td>
              <td className="px-1 py-0.5 text-center">
                {c.prof_ate != null ? formatNumber(c.prof_ate) : '-'}
              </td>
              <td className="px-1 py-0.5 text-center">
                {c.espessura != null ? formatNumber(c.espessura) : '-'}
              </td>
              <td className="px-1 py-0.5 text-center">
                {c.na != null ? formatNumber(c.na) : '-'}
              </td>
              <td className="px-1 py-0.5">
                {c.classificacao_1 || ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}