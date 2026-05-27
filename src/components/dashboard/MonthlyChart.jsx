import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TOOLTIP_STYLE = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E1E6EC',
  borderRadius: '10px',
  color: '#0D2137',
  boxShadow: '0 4px 12px rgba(0,35,59,0.09)',
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
            <CartesianGrid strokeDasharray="3 3" stroke="#E1E6EC" />
            <XAxis dataKey="name" stroke="#8FA0AE" tick={{ fontSize: 12 }} />
            <YAxis stroke="#8FA0AE" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ color: '#526070', fontSize: 12 }} />
            <Bar dataKey="ensaios" fill="#00233B" name="Total de Registros" radius={[4, 4, 0, 0]} />
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