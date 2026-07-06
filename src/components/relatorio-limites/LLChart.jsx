import React from "react";
import {
  ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ─── Gráfico LL ─── */
export default function LLChart({ llPoints, llFit, llYAxisDomain }) {
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