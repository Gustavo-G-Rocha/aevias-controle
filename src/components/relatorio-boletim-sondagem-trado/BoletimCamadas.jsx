/**
 * Seção de camadas (estratigrafia) do boletim.
 */
import React from 'react';
import { formatNumber, getFaceTitle } from '@/utils/relatorioBoletimSondagemTradoUtils';

const SECTION_BAND =
  'bg-[#BFCF99] text-[#00233B] border border-[#94a3b8] px-2 py-0.5 font-bold text-center text-[10px] uppercase tracking-wider mb-1';
const SUB_BAND =
  'bg-[#f1f5f9] text-[#00233B] border border-[#94a3b8] px-1 py-0.5 font-bold text-center text-[9px] mb-0.5';
const TABLE = 'w-full border-collapse border border-[#94a3b8] text-[9px]';
const TH = 'border border-[#94a3b8] bg-[#f1f5f9] px-1 py-0.5 text-center font-bold text-[#00233B]';
const TD = 'border border-[#94a3b8] px-1 py-0.5 text-center text-[#00233B]';

export default function BoletimCamadas({ camadas, faceClassificacao }) {
  const faceTitle = getFaceTitle(faceClassificacao);

  return (
    <section>
      <div className={SECTION_BAND}>Sondagem — Camadas</div>
      <div className={SUB_BAND}>{faceTitle}</div>
      <table className={TABLE}>
        <thead>
          <tr>
            <th rowSpan={2} className={TH}>Nº</th>
            <th colSpan={2} className={TH}>PROF. (m)</th>
            <th rowSpan={2} className={TH}>ESP.</th>
            <th rowSpan={2} className={TH}>N.A</th>
            <th rowSpan={2} className={TH}>CLASSIFICAÇÃO</th>
          </tr>
          <tr>
            <th className={TH + ' text-[8px]'}>DE</th>
            <th className={TH + ' text-[8px]'}>ATÉ</th>
          </tr>
        </thead>
        <tbody>
          {camadas.map((c, i) => (
            <tr key={i} className="bg-white">
              <td className={TD + ' font-semibold'}>{c.numero}</td>
              <td className={TD}>{c.prof_de != null ? formatNumber(c.prof_de) : '-'}</td>
              <td className={TD}>{c.prof_ate != null ? formatNumber(c.prof_ate) : '-'}</td>
              <td className={TD}>{c.espessura != null ? formatNumber(c.espessura) : '-'}</td>
              <td className={TD}>{c.na != null ? formatNumber(c.na) : '-'}</td>
              <td className={TD + ' text-left'}>{c.classificacao_1 || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}