import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text)',
  boxShadow: 'var(--shadow-md)',
};

const TOOLTIP_ITEM_STYLE = { color: 'var(--color-text)' };
const TOOLTIP_LABEL_STYLE = { color: 'var(--color-text-muted)' };

export default function RecordsByTypeChart({ data, activeTipoRegistro, onSliceClick }) {
  if (!data.length) return null;
  return (
    <Card className="border-0" style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)' }}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
          Tipos de Registros
          <span className="text-xs font-normal ml-2" style={{ color: 'var(--color-text-subtle)' }}>(clique para filtrar)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(300, data.length * 40)}>
          <BarChart
            data={data}
            layout="vertical"
            onClick={e => e?.activePayload && onSliceClick(e.activePayload[0].payload)}
            margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
          >
            <CartesianGrid stroke="none" />
            <XAxis type="number" stroke="var(--color-text-subtle)" allowDecimals={false} domain={[0, dataMax => Math.ceil(dataMax * 1.2)]} />
            <YAxis type="category" dataKey="name" stroke="var(--color-text-subtle)" width={140} tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
            <Bar dataKey="value" name="Registros" radius={[0, 4, 4, 0]} style={{ cursor: 'pointer' }}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={activeTipoRegistro && entry.entityType !== activeTipoRegistro ? 0.3 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}