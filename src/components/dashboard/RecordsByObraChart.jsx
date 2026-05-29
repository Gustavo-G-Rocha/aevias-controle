import React from 'react';
import { Treemap, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text)',
  boxShadow: 'var(--shadow-md)',
};

const TreemapContent = (props) => {
  const { x, y, width, height, fill } = props;

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      style={{ cursor: 'pointer' }}
    />
  );
};

const TreemapLabel = (props) => {
  const { x, y, width, height, name, value } = props;
  
  return (
    <g>
      <text
        x={x + width / 2}
        y={y + height / 2 - 7}
        textAnchor="middle"
        fill="white"
        fontSize={12}
        fontWeight="bold"
      >
        {name}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 10}
        textAnchor="middle"
        fill="white"
        fontSize={14}
        fontWeight="bold"
      >
        {value}
      </text>
    </g>
  );
};

export default function RecordsByObraChart({ data, activeObraId, onSliceClick }) {
  if (!data.length) return null;

  // Preparar dados para Treemap com nó root
  const chartData = [
    {
      name: 'Registros',
      children: data.map(entry => ({
        ...entry,
        activeObra: !activeObraId || entry.obraId === activeObraId,
      })),
    },
  ];

  const handleTreemapClick = (entry) => {
    if (entry.obraId) {
      onSliceClick({ obraId: entry.obraId });
    }
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
          <Treemap
            data={chartData}
            dataKey="value"
            stroke="var(--color-border)"
            fill="var(--color-primary)"
            onClick={(e) => handleTreemapClick(e.payload)}
            content={<TreemapContent />}
            label={<TreemapLabel />}
          >
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </Treemap>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}