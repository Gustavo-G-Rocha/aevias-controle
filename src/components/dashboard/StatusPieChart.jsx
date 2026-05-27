import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TOOLTIP_STYLE = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E1E6EC',
  borderRadius: '10px',
  color: '#0D2137',
  boxShadow: '0 4px 12px rgba(0,35,59,0.09)',
};

const STATUS_MAP = {
  'Aprovados': 'approved', 'Pendentes': 'pending', 'Reprovados': 'rejected',
  'Assinados': 'approved', 'Aguardando': 'pending',
};

export default function StatusPieChart({ data, activeStatus, isClienteUser, onSliceClick }) {
  return (
    <Card className="border-0" style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)' }}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
          {isClienteUser ? 'Status das Assinaturas' : 'Status dos Registros'}
          <span className="text-xs font-normal ml-2" style={{ color: 'var(--color-text-subtle)' }}>(clique para filtrar)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} onClick={e => e?.activePayload && onSliceClick(e.activePayload[0].payload)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E1E6EC" />
            <XAxis dataKey="name" stroke="#8FA0AE" tick={{ fontSize: 12 }} />
            <YAxis stroke="#8FA0AE" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="value" name="Registros" style={{ cursor: 'pointer' }} radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={activeStatus && STATUS_MAP[entry.name] !== activeStatus ? 0.3 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}