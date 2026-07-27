import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const tooltipStyle = { backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderRadius: '8px', border: '1px solid var(--color-border)' };

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">{`${(percent * 100).toFixed(0)}%`}</text>;
};

/**
 * Pizza com legenda vertical rolável ao lado.
 * Altura fixa — todos os cartões ficam alinhados, sem corte nem sobra.
 * data: [{ name, value, color, ... }]
 * isDimmed(entry): true quando o filtro ativo não corresponde ao item
 * onItemClick(entry): clique na fatia ou no item da legenda
 */
export default function PieWithLegend({ data, valueSuffix = "", isDimmed, onItemClick, height = 300 }) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-2" style={{ height }}>
      <div className="w-full sm:w-1/2 h-1/2 sm:h-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius="45%" outerRadius="80%" dataKey="value" labelLine={false} label={<CustomLabel />} onClick={onItemClick} style={{ cursor: 'pointer' }}>
              {data.map((e, i) => <Cell key={i} fill={e.color} opacity={isDimmed?.(e) ? 0.3 : 1} />)}
            </Pie>
            <Tooltip formatter={(v, n) => [v + valueSuffix, n]} contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full sm:w-1/2 h-1/2 sm:h-full min-w-0 overflow-y-auto pr-1 space-y-0.5">
        {data.map((e, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onItemClick?.(e)}
            className="w-full flex items-center gap-2 text-left rounded px-1.5 py-1 hover:bg-muted transition-colors"
            style={{ opacity: isDimmed?.(e) ? 0.4 : 1 }}
          >
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: e.color }} />
            <span className="text-[11px] truncate flex-1" style={{ color: 'var(--color-text)' }} title={e.name}>{e.name}</span>
            <span className="text-[11px] font-semibold flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>{e.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}