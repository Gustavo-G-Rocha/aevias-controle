import React from 'react';
import {
  ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { fitLinear, buildParabolaCurve, fmtN } from '@/utils/relatorioProctorUtils';

function MiniChartTooltip({ active, payload, yLabel }) {
  if (!active || !payload?.length) return null;
  const pt = payload[0]?.payload;
  if (!pt) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #ccc', padding: '4px 8px', fontSize: 8 }}>
      <div><strong>Umidade:</strong> {Number(pt.x).toFixed(2)}%</div>
      <div><strong>{yLabel}:</strong> {Number(pt.y).toFixed(3)}</div>
    </div>
  );
}

function MiniChart({ data, lineData, refX, refY, xLabel, yLabel, refLabel, color = "#1e3a5f", isLinear = false }) {
  if (!data?.length) return <div className="flex items-center justify-center h-full text-[8px] text-gray-400">Sem dados</div>;

  const lineDataFinal = isLinear && data.length >= 2 ? (() => {
    const linear = fitLinear(data);
    if (!linear) return [];
    const xs = data.map(p => p.x);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    return Array.from({ length: 30 }, (_, i) => {
      const x = minX + (maxX - minX) * i / 29;
      return { x: parseFloat(x.toFixed(2)), y: parseFloat((linear.a * x + linear.b).toFixed(3)) };
    });
  })() : lineData || [];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart margin={{ top: 8, right: 8, left: 8, bottom: 18 }}>
        <CartesianGrid strokeDasharray="2 2" stroke="#ccc" />
        <XAxis dataKey="x" type="number" domain={['dataMin - 0.3', 'dataMax + 0.3']}
          label={{ value: xLabel, position: 'insideBottom', offset: -12, fontSize: 7 }}
          tick={{ fontSize: 7 }} tickFormatter={v => v.toFixed(1)} tickCount={6} />
        <YAxis dataKey="y" type="number" domain={['dataMin - 0.02', 'dataMax + 0.02']}
          label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 12, fontSize: 7 }}
          tick={{ fontSize: 7 }} tickFormatter={v => v.toFixed(2)} width={40} tickCount={6} />
        <Tooltip content={<MiniChartTooltip yLabel={yLabel} />} />
        {lineDataFinal?.length > 0 && (
          <Line data={lineDataFinal} dataKey="y" type="monotone" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} name="Curva" />
        )}
        <Scatter data={data} dataKey="y" fill="#6b8f3e" stroke={color} strokeWidth={1} r={4} name="Pontos" isAnimationActive={false} />
        {refX != null && <ReferenceLine x={refX} stroke="red" strokeDasharray="3 2" strokeWidth={1} />}
        {refY != null && (
          <ReferenceLine y={refY} stroke="red" strokeDasharray="3 2" strokeWidth={1}
            label={{ value: refLabel, fill: 'red', fontSize: 7, position: 'insideTopRight' }} />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export default function RelatorioProctorGraficos({
  chartPoints, parabola, iscPoints, expPoints,
  iscParabola, expParabola, iscAtWotima, expAtWotima,
}) {
  const curveData   = buildParabolaCurve(chartPoints, parabola);
  const iscCurve    = buildParabolaCurve(iscPoints,   iscParabola);
  const expCurve    = buildParabolaCurve(expPoints,   expParabola);

  return (
    <section>
      <div className="bg-slate-700 text-white px-2 py-0.5 font-bold text-center text-[10px] mb-1">GRÁFICOS</div>
      <div className="grid grid-cols-3 gap-2" style={{ height: 213 }}>
        {/* Proctor */}
        <div className="border border-slate-300 p-1 relative">
          <div className="text-[7px] text-center text-gray-500 mb-0.5 font-semibold">Densidade do Solo Seco (g/cm³)</div>
          {parabola && (
            <div className="absolute bottom-1 right-1 text-[6px] text-gray-600 text-right leading-tight print:hidden">
              <div>Dens. máx. = {fmtN(parabola.gamma_max, 3)} g/cm³</div>
              <div>Hótima = {fmtN(parabola.w_otima, 1)}%</div>
            </div>
          )}
          <div style={{ height: 198 }}>
            <MiniChart
              data={chartPoints.map(p => ({ x: p.x, y: p.y }))}
              lineData={curveData}
              refX={parabola?.w_otima}
              refY={parabola?.gamma_max}
              xLabel="Umidade (%)" yLabel="γd (g/cm³)"
            />
          </div>
        </div>
        {/* ISC */}
        <div className="border border-slate-300 p-1 relative">
          <div className="text-[7px] text-center text-gray-500 mb-0.5 font-semibold">ISC (%)</div>
          <div style={{ height: 198 }}>
            <MiniChart
              data={iscPoints}
              lineData={iscCurve}
              refX={parabola?.w_otima}
              refY={iscAtWotima}
              xLabel="Umidade (%)" yLabel="ISC (%)"
              color="#1e3a5f"
            />
          </div>
        </div>
        {/* Expansão */}
        <div className="border border-slate-300 p-1 relative">
          <div className="text-[7px] text-center text-gray-500 mb-0.5 font-semibold">Expansão (%)</div>
          <div style={{ height: 198 }}>
            <MiniChart
              data={expPoints}
              lineData={expCurve}
              refX={parabola?.w_otima}
              refY={expAtWotima}
              xLabel="Umidade (%)" yLabel="Exp. (%)"
              color="#1e3a5f"
            />
          </div>
        </div>
      </div>
    </section>
  );
}