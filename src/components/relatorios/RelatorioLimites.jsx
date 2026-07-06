import React from "react";
import {
  fmtN, calcularLimites,
} from "@/utils/relatorioLimitesUtils";
import LimitesHeader from "@/components/relatorio-limites/LimitesHeader";
import LimitesInfoFields from "@/components/relatorio-limites/LimitesInfoFields";
import LimitesResumo from "@/components/relatorio-limites/LimitesResumo";
import LimitesAssinaturas from "@/components/relatorio-limites/LimitesAssinaturas";
import LLChart from "@/components/relatorio-limites/LLChart";

/* ─── Tabela genérica com colunas dinâmicas (LL / LP) ─── */
const FIELD_ROWS = [
  { label: "Nº Cápsula", field: "numero_capsula" },
  { label: "S+Ú+C (g)", field: "solo_umido_capsula" },
  { label: "S+S+C (g)", field: "solo_seco_capsula" },
  { label: "Peso C (g)", field: "peso_capsula" },
];
const th = "border border-slate-400 px-1 py-0.5 text-left font-semibold bg-slate-100 text-[8px]";
const td = "border border-slate-400 px-1 py-0.5 text-[8px]";
const tdC = "border border-slate-400 px-1 py-0.5 text-center text-[8px]";
const tdCalc = "border border-slate-400 px-1 py-0.5 text-center text-[8px] bg-gray-50 text-gray-600 font-semibold";

/* ─── MAIN EXPORT ─── */
export default function RelatorioLimites({ limites, ensaio, obra, regional }) {
  const lim = limites || {};

  const {
    higroT1, higroT2, higroMedia,
    penGrossas, granGrossaCalc, totalSeca,
    soloSecoRetido10, soloUmPassando10, sp10, amostraTotalSecaCalc,
    penFinas, granFinaCalc, amostParcSeca,
    llRows, llCalc, llPoints, llYAxisDomain, llFit,
    lpRows, lpTeors, lpMedia,
    IP, pct200, pct10, pct40, igCalc, hrb,
  } = calcularLimites(lim);

  if (!limites) return null;

  return (
    <section className="space-y-2" style={{ pageBreakBefore: 'always' }}>

      <LimitesHeader regional={regional} />
      <LimitesInfoFields ensaio={ensaio} obra={obra} />

      <div className="bg-slate-700 text-white px-2 py-0.5 font-bold text-center text-[10px]">
        ENSAIOS FÍSICOS DE CARACTERIZAÇÃO (ABNT NBR 7181 | 6459 | 7180)
      </div>

      {/* Umidade Higroscópica */}
      <div>
        <div className="bg-slate-200 px-1 py-0.5 font-bold text-[9px] mb-0.5">Umidade Higroscópica</div>
        <table className="w-full border-collapse border border-slate-400">
          <thead>
            <tr>
              <th className={th}>Campo</th>
              <th className={th + " text-center"}>Am. 1</th>
              <th className={th + " text-center"}>Am. 2</th>
              <th className={th + " text-center"}>Média</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Solo Úmido+Cápsula (g)", lim.higro_solo_umido_capsula_1, lim.higro_solo_umido_capsula_2],
              ["Solo Seco+Cápsula (g)", lim.higro_solo_seco_capsula_1, lim.higro_solo_seco_capsula_2],
              ["Peso da Cápsula (g)", lim.higro_peso_capsula_1, lim.higro_peso_capsula_2],
            ].map(([label, v1, v2]) => (
              <tr key={label}>
                <td className={td}>{label}</td>
                <td className={tdC}>{fmtN(v1)}</td>
                <td className={tdC}>{fmtN(v2)}</td>
                <td className={tdCalc}>-</td>
              </tr>
            ))}
            <tr className="bg-slate-100 font-bold">
              <td className={td}>Teor de Umidade (%)</td>
              <td className={tdCalc}>{fmtN(higroT1)}</td>
              <td className={tdCalc}>{fmtN(higroT2)}</td>
              <td className={tdCalc + " font-bold text-blue-800"}>{fmtN(higroMedia)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Granulometria */}
      <div className="grid grid-cols-2 gap-2">
        {/* Peneiramento Grosso */}
        <div>
          <div className="bg-slate-200 px-1 py-0.5 font-bold text-[9px] mb-0.5">Peneiramento Grosso</div>
          <table className="w-full border-collapse border border-slate-400">
            <thead>
              <tr><th className={th}>Peneira</th><th className={th}>mm</th><th className={th}>Ret.(g)</th><th className={th}>Pass.(g)</th><th className={th}>Pass.(%)</th></tr>
            </thead>
            <tbody>
              {penGrossas.map((pen, i) => (
                <tr key={i}>
                  <td className={td}>{pen.label}</td>
                  <td className={tdC}>{pen.mm}</td>
                  <td className={tdC}>{fmtN(pen.retido, 2)}</td>
                  <td className={tdCalc}>{granGrossaCalc[i]?.passando != null ? fmtN(granGrossaCalc[i].passando, 2) : '-'}</td>
                  <td className={tdCalc}>{granGrossaCalc[i]?.passPct != null ? fmtN(granGrossaCalc[i].passPct, 2) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-1 text-[8px] space-y-0.5">
            {[
              ["Amostra Total Úmida (g)", fmtN(lim.amostra_total_umida, 2)],
              ["Amostra Total Seca (g)", fmtN(lim.amostra_total_seca, 2)],
              ["Solo Seco Retido #10 (g)", fmtN(soloSecoRetido10, 2)],
              ["Solo Úmido Passando #10 (g)", fmtN(soloUmPassando10, 2)],
              ["Solo Seco Passando #10 — SP₁₀ (g)", fmtN(sp10, 2)],
              ["Total Seca Calc. SR₁₀+SP₁₀ (g)", fmtN(amostraTotalSecaCalc, 2)],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between border-b border-slate-200 pb-0.5">
                <span className="text-gray-700">{label}</span>
                <span className="font-semibold">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Peneiramento Fino */}
        <div>
          <div className="bg-slate-200 px-1 py-0.5 font-bold text-[9px] mb-0.5">Peneiramento Fino</div>
          <table className="w-full border-collapse border border-slate-400">
            <thead>
              <tr><th className={th}>Pen.</th><th className={th}>mm</th><th className={th}>Ret.(g)</th><th className={th}>Pass.(g)</th><th className={th}>Pass.(%)</th><th className={th}>%Total</th></tr>
            </thead>
            <tbody>
              {penFinas.map((pen, i) => {
                const totalPasePct = granFinaCalc[i]?.passPct != null && sp10 != null && totalSeca
                  ? parseFloat((granFinaCalc[i].passPct * (sp10 / totalSeca)).toFixed(1)) : null;
                return (
                  <tr key={i}>
                    <td className={td}>{pen.label}</td>
                    <td className={tdC}>{pen.mm}</td>
                    <td className={tdC}>{fmtN(pen.retido, 2)}</td>
                    <td className={tdCalc}>{granFinaCalc[i]?.passando != null ? fmtN(granFinaCalc[i].passando, 2) : '-'}</td>
                    <td className={tdCalc}>{granFinaCalc[i]?.passPct != null ? fmtN(granFinaCalc[i].passPct, 2) : '-'}</td>
                    <td className={tdCalc}>{totalPasePct != null ? fmtN(totalPasePct, 2) : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-1 text-[8px] space-y-0.5">
            {[
              ["Amostra Parcial Úmida (g)", fmtN(lim.amostra_parcial_umida, 2)],
              ["Amostra Parcial Seca (g)", fmtN(lim.amostra_parcial_seca, 2)],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between border-b border-slate-200 pb-0.5">
                <span className="text-gray-700">{label}</span>
                <span className="font-semibold">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LL e LP */}
      <div className="grid grid-cols-2 gap-2">
        {/* Limite de Liquidez */}
        <div>
          <div className="bg-slate-200 px-1 py-0.5 font-bold text-[9px] mb-0.5">Limite de Liquidez</div>
          <table className="w-full border-collapse border border-slate-400">
            <thead>
              <tr>
                <th className={th}>Campo</th>
                {llRows.map((_, i) => <th key={`ll-h-${i}`} className={th + " text-center"}>#{i+1}</th>)}
              </tr>
            </thead>
            <tbody>
              {FIELD_ROWS.map(row => (
                <tr key={row.field}>
                  <td className={td}>{row.label}</td>
                  {llRows.map((r, i) => <td key={`ll-r-${i}`} className={tdC}>{r[row.field] || '-'}</td>)}
                </tr>
              ))}
              <tr className="bg-slate-100 font-bold">
                <td className={td}>Teor (%)</td>
                {llCalc.map((c, i) => <td key={`ll-t-${i}`} className={tdCalc + " text-blue-800 font-bold"}>{c.teor != null ? fmtN(c.teor) : '-'}</td>)}
              </tr>
              <tr>
                <td className={td}>Nº Golpes</td>
                {llRows.map((r, i) => <td key={`ll-g-${i}`} className={tdC}>{r.num_golpes || '-'}</td>)}
              </tr>
            </tbody>
          </table>
          {llFit && (
            <div className="mt-0.5 text-center text-[8px] font-bold text-blue-800 bg-blue-50 border border-blue-200 rounded px-1 py-0.5">
              LL (25 golpes) = {llFit.ll}%
            </div>
          )}
        </div>

        {/* Limite de Plasticidade */}
        <div>
          <div className="bg-slate-200 px-1 py-0.5 font-bold text-[9px] mb-0.5">Limite de Plasticidade</div>
          <table className="w-full border-collapse border border-slate-400">
            <thead>
              <tr>
                <th className={th}>Campo</th>
                {lpRows.map((_, i) => <th key={`lp-h-${i+1}`} className={th + " text-center"}>#{i+1}</th>)}
              </tr>
            </thead>
            <tbody>
              {FIELD_ROWS.map(row => (
                <tr key={row.field}>
                  <td className={td}>{row.label}</td>
                  {lpRows.map((r, i) => <td key={`lp-r-${i}`} className={tdC}>{r[row.field] || '-'}</td>)}
                </tr>
              ))}
              <tr className="bg-slate-100 font-bold">
                <td className={td}>Teor (%)</td>
                {lpTeors.map((t, i) => <td key={`lp-t-${i}`} className={tdCalc + " text-blue-800 font-bold"}>{t != null ? fmtN(t) : '-'}</td>)}
              </tr>
            </tbody>
          </table>
          {lpMedia != null && (
            <div className="mt-0.5 text-center text-[8px] font-bold text-blue-800 bg-blue-50 border border-blue-200 rounded px-1 py-0.5">
              LP (média) = {lpMedia}%
            </div>
          )}
        </div>
      </div>

      {/* Gráfico LL */}
      {llPoints.length >= 2 && llFit && (
        <div>
          <div className="bg-slate-200 px-1 py-0.5 font-bold text-[9px] mb-0.5">Gráfico — Limite de Liquidez</div>
          <div style={{ height: 208 }}>
            <LLChart llPoints={llPoints} llFit={llFit} llYAxisDomain={llYAxisDomain} />
          </div>
        </div>
      )}

      <LimitesResumo
        pct10={pct10} pct40={pct40} pct200={pct200}
        ll={llFit?.ll} lp={lpMedia} ip={IP} ig={igCalc} hrb={hrb}
      />

      <LimitesAssinaturas ensaio={ensaio} />

    </section>
  );
}