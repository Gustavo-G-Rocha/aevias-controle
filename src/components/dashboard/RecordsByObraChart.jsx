import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text)',
  boxShadow: 'var(--shadow-md)',
};

const LollipopDot = (props) => {
  const { cx, cy, fill, payload } = props;
  const opacity = payload.activeObra ? 1 : 0.6;
  
  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill={fill}
      opacity={opacity}
      style={{ cursor: 'pointer' }}
    />
  );
};

export default function RecordsByObraChart({ data, activeObraId, onSliceClick }) {
  if (!data.length) return null;

  // Adicionar flag de atividade aos dados
  const chartData = data.map(entry => ({
    ...entry,
    activeObra: !activeObraId || entry.obraId === activeObraId,
  }));

  const handleBarClick = (entry) => {
    onSliceClick({ obraId: entry.obraId });
  };

  return (
    <Card className="border-0" style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)' }}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
          Registros por Obra
          <span className="text-xs font-normal ml-2" style={{ color: 'var(--color-text-subtle)' }}>(clique para filtrar)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-border)"
              strokeWidth={2}
              isAnimationActive={false}
              dot={<LollipopDot />}
            />
            <Bar
              dataKey="value"
              fill="transparent"
              onClick={(e) => handleBarClick(e.payload)}
              style={{ cursor: 'pointer' }}
              shape={<g />}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}