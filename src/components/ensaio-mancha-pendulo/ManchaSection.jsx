import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SectionTitle = ({ children }) => (
  <CardHeader className="bg-slate-50 border-b">
    <CardTitle className="text-sm font-semibold text-slate-700">{children}</CardTitle>
  </CardHeader>
);

export default function ManchaSection({ formData, onManchaChange }) {
  return (
    <Card className="mb-6">
      <SectionTitle>Mancha de Areia - Método ABNT NBR 16504:2016</SectionTitle>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-300 text-xs">
            <thead className="bg-slate-100">
              <tr>
                <th className="border border-slate-300 p-2">#</th>
                <th className="border border-slate-300 p-2">Estaca</th>
                <th className="border border-slate-300 p-2">Faixa/Pista</th>
                <th className="border border-slate-300 p-2">Bordo</th>
                <th className="border border-slate-300 p-2">D1 (Ø) mm</th>
                <th className="border border-slate-300 p-2">D2 (Ø) mm</th>
                <th className="border border-slate-300 p-2">D3 (Ø) mm</th>
                <th className="border border-slate-300 p-2">D4 (Ø) mm</th>
                <th className="border border-slate-300 p-2">D(Ø) Média mm</th>
                <th className="border border-slate-300 p-2">Área cm²</th>
                <th className="border border-slate-300 p-2">HS cm</th>
                <th className="border border-slate-300 p-2">HS mm</th>
                <th className="border border-slate-300 p-2">Tipo Superfície</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 15 }).map((_, index) => {
                const ensaio = formData.ensaios_mancha[index] || {};
                return (
                  <tr key={index}>
                    <td className="border border-slate-300 p-1 text-center">{index + 1}</td>
                    <td className="border border-slate-300 p-1">
                      <Input value={ensaio.estaca || ''} onChange={(e) => onManchaChange(index, 'estaca', e.target.value)} className="h-8 text-xs" />
                    </td>
                    <td className="border border-slate-300 p-1">
                      <Input value={ensaio.faixa_pista || ''} onChange={(e) => onManchaChange(index, 'faixa_pista', e.target.value)} className="h-8 text-xs" />
                    </td>
                    <td className="border border-slate-300 p-1">
                      <Select value={ensaio.bordo || ''} onValueChange={(value) => onManchaChange(index, 'bordo', value)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="B.I.">B.I.</SelectItem>
                          <SelectItem value="B.E.">B.E.</SelectItem>
                          <SelectItem value="E.X.">E.X.</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="border border-slate-300 p-1">
                      <Input type="number" step="0.1" value={ensaio.d1 || ''} onChange={(e) => onManchaChange(index, 'd1', parseFloat(e.target.value))} className="h-8 text-xs min-w-[70px]" />
                    </td>
                    <td className="border border-slate-300 p-1">
                      <Input type="number" step="0.1" value={ensaio.d2 || ''} onChange={(e) => onManchaChange(index, 'd2', parseFloat(e.target.value))} className="h-8 text-xs min-w-[70px]" />
                    </td>
                    <td className="border border-slate-300 p-1">
                      <Input type="number" step="0.1" value={ensaio.d3 || ''} onChange={(e) => onManchaChange(index, 'd3', parseFloat(e.target.value))} className="h-8 text-xs min-w-[70px]" />
                    </td>
                    <td className="border border-slate-300 p-1">
                      <Input type="number" step="0.1" value={ensaio.d4 || ''} onChange={(e) => onManchaChange(index, 'd4', parseFloat(e.target.value))} className="h-8 text-xs min-w-[70px]" />
                    </td>
                    <td className="border border-slate-300 p-1 text-center bg-slate-50">{ensaio.d_media?.toFixed(1) || ''}</td>
                    <td className="border border-slate-300 p-1 text-center bg-slate-50">{ensaio.area?.toFixed(2) || ''}</td>
                    <td className="border border-slate-300 p-1 text-center bg-slate-50">{ensaio.hs_cm?.toFixed(2) || ''}</td>
                    <td className="border border-slate-300 p-1 text-center bg-slate-50">{ensaio.hs_mm?.toFixed(2) || ''}</td>
                    <td className="border border-slate-300 p-1 text-center bg-slate-50 text-xs">{ensaio.tipo_superficie || ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}