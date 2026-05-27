/**
 * Gráfico de curva granulométrica.
 */
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function GranuMisturaGrafico({ chartData }) {
  if (!chartData || chartData.length === 0) return null;

  const temMin = chartData.some((d) => d.min !== undefined);
  const temMax = chartData.some((d) => d.max !== undefined);

  return (
    <div className="mt-2 border border-slate-400 p-2 print:break-inside-avoid">
      <div className="bg-slate-100 px-2 py-0.5 font-bold text-[9px] mb-1">
        CURVA GRANULOMÉTRICA
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart
          data={chartData}
          margin={{ top: 4, right: 10, left: 0, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="abertura"
            tick={{ fontSize: 8 }}
            label={{
              value: 'Abertura (mm)',
              position: 'insideBottomRight',
              offset: -5,
              fontSize: 8,
            }}
          />
          <YAxis
            tick={{ fontSize: 8 }}
            label={{
              value: '% Passando',
              angle: -90,
              position: 'insideLeft',
              fontSize: 8,
            }}
          />
          <Tooltip wrapperStyle={{ fontSize: 9 }} />
          <Legend wrapperStyle={{ fontSize: 9 }} />
          <Line
            type="monotone"
            dataKey="passante"
            stroke="#1e3a5f"
            strokeWidth={2}
            name="% Passante"
            dot={{ r: 2 }}
          />
          {temMin && (
            <Line
              type="monotone"
              dataKey="min"
              stroke="#16a34a"
              strokeDasharray="4 4"
              name="Mín. Especificação"
              dot={false}
            />
          )}
          {temMax && (
            <Line
              type="monotone"
              dataKey="max"
              stroke="#dc2626"
              strokeDasharray="4 4"
              name="Máx. Especificação"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}