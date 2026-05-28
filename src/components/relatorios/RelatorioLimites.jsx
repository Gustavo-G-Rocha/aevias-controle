import React, { useMemo } from "react";
import {
  ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  fmtN, calcUmidade, calcLLRow, fitLogLine, calcIG, classificarHRB,
} from "@/utils/relatorioLimitesUtils";
import LimitesHeader from "@/components/relatorio-limites/LimitesHeader";
import LimitesInfoFields from "@/components/relatorio-limites/LimitesInfoFields";
import LimitesResumo from "@/components/relatorio-limites/LimitesResumo";
import LimitesAssinaturas from "@/components/relatorio-limites/LimitesAssinaturas";

const PENEIRAS_GROSSAS = [
  { label: '3"', mm: 76.2 }, { label: '2"', mm: 50.8 }, { label: '1"', mm: 25.4 },
  { label: '3/8"', mm: 9.52 }, { label: '4°', mm: 4.76 }, { label: '10°', mm: 2.0 },
];
const PENEIRAS_FINAS = [{ label: '40', mm: 0.42 }, { label: '200', mm: 0.075 }];

/* ─── Gráfico LL ─── */
function LLChart({ llPoints, llFit, llYAxisDomain }) {
  if (llPoints.length < 2) return (
    <div className="text-[7px] text-gray-400 flex items-center justify-center h-full">Insuficiente</div>
  );
  const xs = llPoints.map(p => p.x);
  const minX = Math.max(1, Math.min(...xs) - 2), maxX = Math.max(...xs) + 2;
  const curveData = [
    { x: minX, y: parseFloat((llFit.a * minX + llFit.b).toFixed(2)) },
    { x: maxX, y: parseFloat((llFit.a * maxX + llFit.b).toFixed(2)) },
  ];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart margin={{ top: 6, right: 6, left: 6, bottom: 16 }}>
        <CartesianGrid strokeDasharray="2 2" stroke="#ccc" />
        <XAxis dataKey="x" type="number"
          label={{ value: 'Nº Golpes', position: 'insideBottom', offset: -10, fontSize: 7 }}
          tick={{ fontSize: 7 }} />
        <YAxis dataKey="y" type="number" domain={llYAxisDomain}
          label={{ value: '% Água', angle: -90, position: 'insideLeft', offset: 10, fontSize: 7 }}
          tick={{ fontSize: 7 }} width={36} tickCount={6} />
        <Tooltip formatter={(v) => `${Number(v).toFixed(2)}%`} />
        <Line data={curveData} dataKey="y" type="monotone" stroke="#1e3a5f" strokeWidth={1.5} dot={false} isAnimationActive={false} />
        <Line data={[{ x: 25, y: 0 }, { x: 25, y: llFit.ll }]} dataKey="y" type="monotone" stroke="red" strokeDasharray="3 2" strokeWidth={1} dot={false} name="LL ref" />
        <Line data={[{ x: 0, y: llFit.ll }, { x: 25, y: llFit.ll }]} dataKey="y" type="monotone" stroke="red" strokeDasharray="3 2" strokeWidth={1} dot={false} isAnimationActive={false}
          label={{ value: `LL=${llFit.ll}%`, fill: 'red', fontSize: 7, position: 'top' }} />
        <Scatter data={llPoints} dataKey="y" fill="#6b8f3e" stroke="#1e3a5f" r={4} isAnimationActive={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

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

  /* Umidade higroscópica */
  const higroT1 = calcUmidade(lim.higro_solo_umido_capsula_1, lim.higro_solo_seco_capsula_1, lim.higro_peso_capsula_1);
  const higroT2 = calcUmidade(lim.higro_solo_umido_capsula_2, lim.higro_solo_seco_capsula_2, lim.higro_peso_capsula_2);
  const higroMedia = useMemo(() => {
    const valid = [higroT1, higroT2].filter(v => v != null);
    return valid.length > 0 ? parseFloat((valid.reduce((s, v) => s + v, 0) / valid.length).toFixed(2)) : null;
  }, [higroT1, higroT2]);

  /* Peneiramento grosso */
  const penGrossas = lim.peneiras_grossas || PENEIRAS_GROSSAS.map(p => ({ ...p, retido: "" }));
  const retidosGrossos = penGrossas.map(p => parseFloat(p.retido) || 0);
  const totalSeca = parseFloat(lim.amostra_total_seca) || null;
  const granGrossaCalc = useMemo(() => {
    if (!totalSeca || totalSeca <= 0) return [];
    let acum = totalSeca;
    return retidosGrossos.map(ret => {
      const passando = parseFloat((acum - ret).toFixed(3));
      const pct = parseFloat((passando / totalSeca * 100).toFixed(1));
      acum = passando;
      return { retido: ret, passando, passPct: pct };
    });
  }, [retidosGrossos, totalSeca]);

  /* SP10 */
  const soloSecoRetido10 = useMemo(() => {
    const t = retidosGrossos.reduce((s, r) => s + r, 0);
    return t > 0 ? parseFloat(t.toFixed(3)) : null;
  }, [retidosGrossos]);

  const soloUmPassando10 = useMemo(() => {
    const ut = parseFloat(lim.amostra_total_umida);
    if (isNaN(ut) || !retidosGrossos.length) return null;
    const r = parseFloat((ut - retidosGrossos.reduce((s, x) => s + x, 0)).toFixed(3));
    return r > 0 ? r : null;
  }, [lim.amostra_total_umida, retidosGrossos]);

  const sp10 = useMemo(() => {
    if (soloUmPassando10 == null || higroMedia == null) return null;
    return parseFloat((soloUmPassando10 / (higroMedia / 100 + 1)).toFixed(3));
  }, [soloUmPassando10, higroMedia]);

  const amostraTotalSecaCalc = useMemo(() => {
    if (soloSecoRetido10 == null || sp10 == null) return null;
    return parseFloat((soloSecoRetido10 + sp10).toFixed(3));
  }, [soloSecoRetido10, sp10]);

  /* Peneiramento fino */
  const penFinas = lim.peneiras_finas || PENEIRAS_FINAS.map(p => ({ ...p, retido: "" }));
  const amostParcSeca = parseFloat(lim.amostra_parcial_seca) || null;
  const granFinaCalc = useMemo(() => {
    if (!amostParcSeca || amostParcSeca <= 0) return [];
    let acum = amostParcSeca;
    return penFinas.map(pen => {
      const ret = parseFloat(pen.retido) || 0;
      const passando = parseFloat((acum - ret).toFixed(3));
      const pct = parseFloat((passando / amostParcSeca * 100).toFixed(1));
      acum = passando;
      return { retido: ret, passando, passPct: pct };
    });
  }, [penFinas, amostParcSeca]);

  /* LL */
  const llRows = lim.ll_rows || [];
  const llCalc = useMemo(() => llRows.map(calcLLRow), [llRows]);
  const llPoints = useMemo(() =>
    llRows.map((r, i) => ({ x: parseFloat(r.num_golpes), y: llCalc[i].teor }))
      .filter(p => p.x > 0 && p.y != null),
    [llRows, llCalc]);
  const llYAxisDomain = useMemo(() => {
    if (llPoints.length === 0) return ['auto', 'auto'];
    const yValues = llPoints.map(p => p.y).filter(y => y != null);
    return [parseFloat((Math.min(...yValues) - 5).toFixed(2)), parseFloat((Math.max(...yValues) + 5).toFixed(2))];
  }, [llPoints]);
  const llFit = useMemo(() => fitLogLine(llPoints), [llPoints]);

  /* LP */
  const lpRows = lim.lp_rows || [];
  const lpTeors = useMemo(() => lpRows.map(r => calcUmidade(r.solo_umido_capsula, r.solo_seco_capsula, r.peso_capsula)), [lpRows]);
  const lpMedia = useMemo(() => {
    const valid = lpTeors.filter(v => v != null);
    return valid.length > 0 ? parseFloat((valid.reduce((s, v) => s + v, 0) / valid.length).toFixed(1)) : null;
  }, [lpTeors]);

  /* IP, IG, HRB */
  const IP = llFit?.ll != null && lpMedia != null ? parseFloat((llFit.ll - lpMedia).toFixed(1)) : null;
  const pct200 = useMemo(() => {
    if (!granFinaCalc.length || !totalSeca || sp10 == null || !amostParcSeca) return null;
    const passando200 = granFinaCalc[granFinaCalc.length - 1]?.passando || 0;
    return parseFloat(((passando200 / amostParcSeca) * (sp10 / totalSeca) * 100).toFixed(1));
  }, [granFinaCalc, totalSeca, sp10, amostParcSeca]);
  const pct10 = granGrossaCalc[5]?.passando != null && totalSeca
    ? parseFloat((granGrossaCalc[5].passando / totalSeca * 100).toFixed(1)) : null;
  const pct40 = granFinaCalc[0]?.passando != null && totalSeca && sp10 && amostParcSeca
    ? parseFloat(((granFinaCalc[0].passando / amostParcSeca) * (sp10 / totalSeca) * 100).toFixed(1)) : null;
  const igCalc = calcIG(pct200, llFit?.ll, IP);
  const hrb = classificarHRB(pct10, pct40, pct200, llFit?.ll ?? null, IP, igCalc);

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