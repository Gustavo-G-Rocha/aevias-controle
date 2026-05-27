import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text)',
  boxShadow: 'var(--shadow-md)',
};

export default function MonthlyChart({ data, isClienteUser }) {
  return (
    <Card className="border-0" style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)' }}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
          Registros nos Últimos Meses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" stroke="var(--color-text-subtle)" tick={{ fontSize: 12 }} />
            <YAxis stroke="var(--color-text-subtle)" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ color: 'var(--color-text-muted)', fontSize: 12 }} />
            <Bar dataKey="ensaios" fill="var(--color-primary)" name="Total de Registros" radius={[4, 4, 0, 0]} />
            {isClienteUser
              ? <Bar dataKey="assinados" fill="#BFCF99" name="Assinados" radius={[4, 4, 0, 0]} />
              : <Bar dataKey="aprovados" fill="#BFCF99" name="Aprovados" radius={[4, 4, 0, 0]} />
            }
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}