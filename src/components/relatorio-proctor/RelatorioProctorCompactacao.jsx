import React from 'react';
import { fmtN } from '@/utils/relatorioProctorUtils';

/* ─── Compactação Higroscópica ─── */
function CompactacaoHigroscopica({ ensaio }) {
  const u0 = (ensaio.umidades || [])[0] || {};
  const densidades = ensaio.densidades || [];
  const umidMedia = fmtN(u0.teor_umidade_media, 2);

  const higRows = [
    ["Cápsula Nº", u0.capsula_numero_1 || '-', u0.capsula_numero_2 || '-'],
    ["C+S+A (g)", fmtN(u0.capsula_solo_umido_1), fmtN(u0.capsula_solo_umido_2)],
    ["C+S (g)", fmtN(u0.capsula_solo_seco_1), fmtN(u0.capsula_solo_seco_2)],
    ["A - Água (g)", fmtN(u0.capsula_solo_umido_1 - u0.capsula_solo_seco_1), fmtN(u0.capsula_solo_umido_2 - u0.capsula_solo_seco_2)],
    ["C - Cápsula (g)", fmtN(u0.peso_capsula_1), fmtN(u0.peso_capsula_2)],
    ["S - Solo (g)", fmtN(u0.capsula_solo_seco_1 - u0.peso_capsula_1), fmtN(u0.capsula_solo_seco_2 - u0.peso_capsula_2)],
    ["Umidade (%)", fmtN(u0.teor_umidade_1), fmtN(u0.teor_umidade_2)],
    ["Umidade média (%)", umidMedia, ''],
  ];

  const moldeRowLabels = [
    "Umidade calculada (%)", "Água adicionada (g)", "% Água adicionada",
    "M+S+A (g)", "S+A (g)", "Dens. úmida (g/cm³)", "Dens. seca (g/cm³)",
  ];
  const moldeRowValues = densidades.map(d => {
    const pctAgua = (d.agua_adicionada_ml != null && d.peso_seco > 0)
      ? parseFloat((d.agua_adicionada_ml / d.peso_seco * 100).toFixed(1)) : null;
    return [
      fmtN(d.umidade_calculada, 1), fmtN(d.agua_adicionada_ml, 1), fmtN(pctAgua, 1),
      fmtN(d.cilindro_solo_umido, 1), fmtN(d.peso_solo_umido, 1),
      fmtN(d.dens_ap_umida, 3), fmtN(d.dens_ap_seca, 3),
    ];
  });

  return (
    <section>
      <div className="bg-slate-700 text-white px-2 py-0.5 font-bold text-center text-[10px] mb-1">COMPACTAÇÃO</div>
      <table className="w-full border-collapse border border-slate-400 text-[8px]">
        <thead>
          <tr className="bg-slate-200">
            <th className="border border-slate-400 px-1 text-center" style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}} colSpan={3}>UMIDADE HIGROSCÓPICA</th>
            <th className="border border-slate-400 px-1 text-center" style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}} colSpan={6}>
              Nº MOLDES — {densidades.map(d => d.cilindro_numero || '?').join(' | ')}
            </th>
            <th className="border border-slate-400 px-1 text-center" style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}} colSpan={3}>CILINDROS</th>
          </tr>
          <tr className="bg-slate-100">
            <th className="border border-slate-400 px-1 text-left"   style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}>Campo</th>
            <th className="border border-slate-400 px-1 text-center" style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}>Am. 1</th>
            <th className="border border-slate-400 px-1 text-center" style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}>Am. 2</th>
            <th className="border border-slate-400 px-1 text-left"   style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}>Campo</th>
            {densidades.map((d, i) => (
              <th key={i} className="border border-slate-400 px-1 text-center" style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}>{d.cilindro_numero || i+1}</th>
            ))}
            <th className="border border-slate-400 px-1 text-center" style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}>Nº</th>
            <th className="border border-slate-400 px-1 text-center" style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}>Peso (g)</th>
            <th className="border border-slate-400 px-1 text-center" style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}>Vol (cm³)</th>
          </tr>
        </thead>
        <tbody>
          {higRows.map(([label, am1, am2], ri) => {
            const isMediaRow = label === 'Umidade média (%)';
            const moldeLabel = moldeRowLabels[ri] || '';
            return (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="border border-slate-400 px-1 font-medium" style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}>{label}</td>
                {isMediaRow ? (
                  <td className="border border-slate-400 px-1 text-center font-bold" colSpan={2} style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}>{am1}</td>
                ) : (
                  <>
                    <td className="border border-slate-400 px-1 text-center" style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}>{am1}</td>
                    <td className="border border-slate-400 px-1 text-center" style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}>{am2}</td>
                  </>
                )}
                <td className="border border-slate-400 px-1 font-medium" style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}>{moldeLabel}</td>
                {densidades.map((_, di) => (
                  <td key={di} className="border border-slate-400 px-1 text-center" style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}>
                    {moldeRowValues[di]?.[ri] ?? '-'}
                  </td>
                ))}
                {ri < densidades.length ? (
                  <>
                    <td className="border border-slate-400 px-1 text-center font-semibold" style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}>{densidades[ri].cilindro_numero || ri+1}</td>
                    <td className="border border-slate-400 px-1 text-center" style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}>{fmtN(densidades[ri].peso_cilindro, 1)}</td>
                    <td className="border border-slate-400 px-1 text-center" style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}>{fmtN(densidades[ri].volume_cilindro, 1)}</td>
                  </>
                ) : ri === densidades.length ? (
                  <>
                    <td className="border border-slate-400 px-1 font-medium" colSpan={2} style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}>Peso mat. (g)</td>
                    <td className="border border-slate-400 px-1 text-center" style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}>{fmtN(densidades[0]?.peso_amostra_umida, 1)}</td>
                  </>
                ) : ri === densidades.length + 1 ? (
                  <>
                    <td className="border border-slate-400 px-1 font-medium" colSpan={2} style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}>Peso seco (g)</td>
                    <td className="border border-slate-400 px-1 text-center" style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}>{fmtN(densidades[0]?.peso_seco, 1)}</td>
                  </>
                ) : (
                  <td colSpan={3} className="border border-slate-400" style={{paddingTop:'0.185rem',paddingBottom:'0.185rem'}}></td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

/* ─── Compactação Ponto a Ponto ─── */
function CompactacaoPontoAPonto({ ensaio }) {
  const densidades = ensaio.densidades || [];
  const umidades   = ensaio.umidades   || [];

  const densRows = [
    { label: "Cilindro+Solo Úmido (g)",    sym: "A",       field: "cilindro_solo_umido" },
    { label: "Peso do Cilindro (g)",        sym: "B",       field: "peso_cilindro" },
    { label: "Peso do Solo Úmido (g)",      sym: "C=A-B",  field: "peso_solo_umido",  calc: true },
    { label: "Volume do Cilindro (cm³)",    sym: "D",       field: "volume_cilindro" },
    { label: "Dens. Apar. Úmida (g/cm³)",  sym: "E=C/D",  field: "dens_ap_umida",    calc: true, dec: 3 },
  ];

  const umidRows = [
    { label: "Cápsula Nº",                 sym: "-",       field: "capsula_numero_1",     str: true },
    { label: "Cápsula+Solo Úmido (g)",     sym: "F",       field: "capsula_solo_umido_1" },
    { label: "Cápsula+Solo Seco (g)",      sym: "G",       field: "capsula_solo_seco_1" },
    { label: "Peso da Cápsula (g)",        sym: "I",       field: "peso_capsula_1" },
    { label: "Teor de Umidade (%)",        sym: "K",       field: "teor_umidade_media",   calc: true },
    { label: "Dens. Apar. Seca (g/cm³)",  sym: "L=E/(100+K)", field: "dens_ap_seca",     calc: true, dec: 3 },
  ];

  const getCilVal = (d, row) => {
    if (row.str) return d[row.field] || '-';
    const v = d[row.field];
    return (v != null && !isNaN(v)) ? fmtN(v, row.dec ?? 1) : '-';
  };

  const getUmVal = (u, d, row) => {
    if (row.str) return u[row.field] || '-';
    if (row.field === 'dens_ap_seca') {
      return (d?.dens_ap_seca != null && !isNaN(d.dens_ap_seca)) ? fmtN(d.dens_ap_seca, row.dec ?? 3) : '-';
    }
    const v = u[row.field];
    return (v != null && !isNaN(v)) ? fmtN(v, row.dec ?? 1) : '-';
  };

  return (
    <section>
      <div className="bg-slate-700 text-white px-2 py-0.5 font-bold text-center text-[10px] mb-1">DETERMINAÇÃO DA UMIDADE E DENSIDADE</div>
      <table className="w-full border-collapse border border-slate-400 text-[8px] mb-1" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '30%' }} />
          <col style={{ width: '10%' }} />
          {densidades.map((_, i) => <col key={i} style={{ width: `${60 / densidades.length}%` }} />)}
        </colgroup>
        <thead>
          <tr className="bg-slate-200">
            <th className="border border-slate-400 px-1 py-0.5 text-left">Campo</th>
            <th className="border border-slate-400 px-1 py-0.5 text-center">Fórmula</th>
            {densidades.map((d, i) => (
              <th key={i} className="border border-slate-400 px-1 py-0.5 text-center">Cil. {d.cilindro_numero || i+1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {densRows.map((row, ri) => (
            <tr key={ri} className={row.calc ? 'bg-slate-100 font-semibold' : ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="border border-slate-400 px-1 py-0.5 font-medium">{row.label}</td>
              <td className="border border-slate-400 px-1 py-0.5 text-center text-[7px] text-gray-500">{row.sym}</td>
              {densidades.map((d, di) => (
                <td key={di} className={`border border-slate-400 px-1 py-0.5 text-center ${row.calc ? 'text-blue-800' : ''}`}>
                  {getCilVal(d, row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <table className="w-full border-collapse border border-slate-400 text-[8px]" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '30%' }} />
          <col style={{ width: '10%' }} />
          {umidades.map((_, i) => <col key={i} style={{ width: `${60 / umidades.length}%` }} />)}
        </colgroup>
        <thead>
          <tr className="bg-slate-200">
            <th className="border border-slate-400 px-1 py-0.5 text-left">Campo</th>
            <th className="border border-slate-400 px-1 py-0.5 text-center">Fórmula</th>
            {umidades.map((_, i) => (
              <th key={i} className="border border-slate-400 px-1 py-0.5 text-center">Ponto {i+1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {umidRows.map((row, ri) => (
            <tr key={ri} className={row.calc ? 'bg-slate-100 font-semibold' : ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="border border-slate-400 px-1 py-0.5 font-medium">{row.label}</td>
              <td className="border border-slate-400 px-1 py-0.5 text-center text-[7px] text-gray-500">{row.sym}</td>
              {umidades.map((u, ui) => (
                <td key={ui} className={`border border-slate-400 px-1 py-0.5 text-center ${row.calc ? 'text-blue-800' : ''}`}>
                  {getUmVal(u, densidades[ui], row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function RelatorioProctorCompactacao({ ensaio, isHigro }) {
  return isHigro
    ? <CompactacaoHigroscopica ensaio={ensaio} />
    : <CompactacaoPontoAPonto  ensaio={ensaio} />;
}