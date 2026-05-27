import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text)',
  boxShadow: 'var(--shadow-md)',
};

export default function RecordsByObraChart({ data, activeObraId, onSliceClick }) {
  if (!data.length) return null;
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
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              onClick={onSliceClick}
              style={{ cursor: 'pointer' }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={activeObraId && entry.obraId !== activeObraId ? 0.3 : 1}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ color: 'var(--color-text-muted)' }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}