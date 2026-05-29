import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RecordsByObraChart({ data, activeObraId, onSliceClick }) {
  if (!data.length) return null;

  // Encontrar o valor máximo para a escala das barras
  const maxValue = Math.max(...data.map(entry => entry.value));

  return (
    <Card className="border-0" style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)' }}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
          Registros por Obra
          <span className="text-xs font-normal ml-2" style={{ color: 'var(--color-text-subtle)' }}>(clique para filtrar)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {data.map((entry, index) => {
            const isActive = !activeObraId || entry.obraId === activeObraId;
            const barWidth = (entry.value / maxValue) * 100;

            return (
              <div
                key={`obra-${index}`}
                className="space-y-1 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onSliceClick({ obraId: entry.obraId })}
              >
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--color-text)', fontSize: '0.875rem', fontWeight: 500 }}>
                    {entry.name}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                    {entry.value}
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '24px',
                    backgroundColor: 'var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${barWidth}%`,
                      height: '100%',
                      backgroundColor: entry.color || 'var(--color-primary)',
                      opacity: isActive ? 1 : 0.4,
                      transition: 'width 0.3s ease, opacity 0.3s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}