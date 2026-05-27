import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const SectionTitle = ({ children }) => (
  <CardHeader className="bg-slate-50 border-b">
    <CardTitle className="text-sm font-semibold text-slate-700">{children}</CardTitle>
  </CardHeader>
);

export default function ResultadosSection({ formData, onInputChange }) {
  return (
    <Card className="mb-6">
      <SectionTitle>Resultados</SectionTitle>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Limites Estabelecidos - Mancha de Areia</Label>
            <Input value={formData.limites_mancha} onChange={(e) => onInputChange('limites_mancha', e.target.value)} />
          </div>

          <div>
            <Label>Limites Estabelecidos - Pêndulo Britânico</Label>
            <Input value={formData.limites_pendulo} onChange={(e) => onInputChange('limites_pendulo', e.target.value)} />
          </div>
        </div>

        <div>
          <Label>Condição de Conformidade</Label>
          <div className="p-3 bg-slate-50 rounded border">
            <p className={`text-lg font-bold ${formData.condicao_conformidade === 'CONFORME' ? 'text-green-700' : formData.condicao_conformidade === 'NÃO CONFORME' ? 'text-red-700' : 'text-slate-400'}`}>
              {formData.condicao_conformidade || 'Aguardando dados dos ensaios'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Avaliado automaticamente com base nos limites do órgão selecionado</p>
          </div>
        </div>

        <div>
          <Label>Observações</Label>
          <Textarea value={formData.observacoes} onChange={(e) => onInputChange('observacoes', e.target.value)} rows={4} />
        </div>
      </CardContent>
    </Card>
  );
}