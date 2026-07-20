/**
 * Seção de umidade natural do boletim.
 */
import React from 'react';
import { formatNumber, calcularUmidade, calcularMediaUmidade } from '@/utils/relatorioBoletimSondagemTradoUtils';

const SECTION_BAND =
  'bg-[#BFCF99] text-[#00233B] border border-[#94a3b8] px-2 py-0.5 font-bold text-center text-[10px] uppercase tracking-wider mb-1';
const SUB_BAND =
  'bg-[#f1f5f9] text-[#00233B] border border-[#94a3b8] px-1 py-0.5 font-bold text-center text-[9px] mb-0.5';
const TABLE = 'w-full border-collapse border border-[#94a3b8] text-[9px]';
const TH = 'border border-[#94a3b8] bg-[#f1f5f9] px-1 py-0.5 font-bold text-[#00233B]';
const TD = 'border border-[#94a3b8] px-1 py-0.5 text-[#00233B]';

function UmidadeTable({ uData: _uData, rows, umidMedia, subtitle }) {
  return (
    <div>
      {subtitle && <div className={SUB_BAND}>{subtitle}</div>}
      <table className={TABLE}>
        <thead>
          <tr>
            <th className={TH + ' text-left'}>Campo</th>
            <th className={TH}>Am. 1</th>
            <th className={TH}>Am. 2</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, v1, v2, isNum], ri) => (
            <tr key={ri} className="bg-white">
              <td className={TD + ' text-left'}>{label}</td>
              <td className={TD + ' text-center'}>{isNum ? formatNumber(v1) : v1 || '-'}</td>
              <td className={TD + ' text-center'}>{isNum ? formatNumber(v2) : v2 || '-'}</td>
            </tr>
          ))}
          <tr className="bg-[#f1f5f9]">
            <td className={TD + ' text-left font-bold'}>Umidade (%)</td>
            <td className={TD + ' text-center font-bold text-[#00233B]'} colSpan={2}>
              {umidMedia}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function BoletimUmidade({ boletim }) {
  const un = boletim.umidade_natural || {};
  const un2 = boletim.umidade_natural_2 || {};

  const simpleRows = [
    ['Nº cápsula', un.no_capsula_1, un.no_capsula_2, false],
    ['Massa cápsula (g)', un.massa_capsula_1, un.massa_capsula_2, true],
    ['Massa cap + solo úmido (g)', un.massa_cap_solo_umido_1, un.massa_cap_solo_umido_2, true],
    ['Massa cap + solo seco (g)', un.massa_cap_solo_seco_1, un.massa_cap_solo_seco_2, true],
  ];

  const un2Rows = [
    ['Nº cápsula', un2.no_capsula_1, un2.no_capsula_2, false],
    ['Massa cápsula (g)', un2.massa_capsula_1, un2.massa_capsula_2, true],
    ['Massa cap + solo úmido (g)', un2.massa_cap_solo_umido_1, un2.massa_cap_solo_umido_2, true],
    ['Massa cap + solo seco (g)', un2.massa_cap_solo_seco_1, un2.massa_cap_solo_seco_2, true],
  ];

  const umid1Media = calcularMediaUmidade(un.umidade_1, un.umidade_2);

  const calcU2 = (idx) => {
    return calcularUmidade(
      un2[`massa_cap_solo_umido_${idx}`],
      un2[`massa_cap_solo_seco_${idx}`],
      un2[`massa_capsula_${idx}`],
    );
  };

  const u2_1 = calcU2(1);
  const u2_2 = calcU2(2);
  const umid2Media = calcularMediaUmidade(u2_1, u2_2);

  const hasSingleUmidade = !boletim.umidade_natural_2;

  return (
    <section>
      <div className={SECTION_BAND}>Umidade Natural — DNER-ME 213/94</div>

      {hasSingleUmidade ? (
        <UmidadeTable
          uData={un}
          rows={[
            ['Camada ensaiada', un.camada_ensaiada_1, null, false],
            ...simpleRows,
          ]}
          umidMedia={umid1Media}
        />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <UmidadeTable
            uData={un}
            rows={simpleRows}
            umidMedia={umid1Media}
            subtitle={`Camada ensaiada: ${un.camada_ensaiada_1 || '-'}`}
          />
          <UmidadeTable
            uData={un2}
            rows={un2Rows}
            umidMedia={umid2Media}
            subtitle={`Camada ensaiada: ${un2.camada_ensaiada_1 || '-'}`}
          />
        </div>
      )}
    </section>
  );
}