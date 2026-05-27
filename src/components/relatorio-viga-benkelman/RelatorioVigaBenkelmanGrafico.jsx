import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RelatorioVigaBenkelmanGrafico({ chartData }) {
  return (
    <div className="mb-1 print:break-inside-avoid">
      <div className="bg-slate-200 px-1.5 py-0 font-bold text-center text-[8px] border" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px' }}>
        REPRESENTAÇÃO GRÁFICA
      </div>
      <div className="p-3">
        <ResponsiveContainer width="100%" height={275}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 60, left: 60, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="estaca"
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 8 }}
            />
            <YAxis
              label={{ value: 'Deflexão (x10⁻²mm)', angle: -90, position: 'center', style: { fontSize: 10, textAnchor: 'middle' }, offset: 10 }}
              tick={{ fontSize: 8 }}
              domain={[0, 'dataMax + 10']}
            />
            <Tooltip contentStyle={{ fontSize: 10 }} />
            <Legend wrapperStyle={{ fontSize: 9 }} verticalAlign="bottom" height={4} />
            <Bar dataKey="Bordo Esquerdo" fill="#566e3d" />
            <Bar dataKey="Eixo" fill="#00233b" />
            <Bar dataKey="Bordo Direito" fill="#bfcf99" />
            <Line type="monotone" dataKey="Def. Admissível" stroke="#dc2626" strokeDasharray="5 5" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}