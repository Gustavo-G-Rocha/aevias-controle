import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SectionTitle = ({ children }) => (
  <CardHeader className="bg-slate-50 border-b">
    <CardTitle className="text-sm font-semibold text-slate-700">{children}</CardTitle>
  </CardHeader>
);

export default function PenduloSection({ formData, onPenduloChange }) {
  return (
    <Card className="mb-6">
      <SectionTitle>Pêndulo Britânico - Método ABNT NBR 16780:2019</SectionTitle>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-300 text-xs">
            <thead className="bg-slate-100">
              <tr>
                <th className="border border-slate-300 p-2">#</th>
                <th className="border border-slate-300 p-2">Estaca</th>
                <th className="border border-slate-300 p-2">Faixa/Pista</th>
                <th className="border border-slate-300 p-2">Bordo</th>
                <th className="border border-slate-300 p-2">Temp. Pavimento (°C)</th>
                <th className="border border-slate-300 p-2">1º</th>
                <th className="border border-slate-300 p-2">2º</th>
                <th className="border border-slate-300 p-2">3º</th>
                <th className="border border-slate-300 p-2">4º</th>
                <th className="border border-slate-300 p-2">5º</th>
                <th className="border border-slate-300 p-2">Máxima</th>
                <th className="border border-slate-300 p-2">Mínima</th>
                <th className="border border-slate-300 p-2">VRD</th>
                <th className="border border-slate-300 p-2">Classe</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 15 }).map((_, index) => {
                const ensaio = formData.ensaios_pendulo[index] || {};
                return (
                  <tr key={index}>
                    <td className="border border-slate-300 p-1 text-center">{index + 1}</td>
                    <td className="border border-slate-300 p-1">
                      <Input value={ensaio.estaca || ''} onChange={(e) => onPenduloChange(index, 'estaca', e.target.value)} className="h-8 text-xs" />
                    </td>
                    <td className="border border-slate-300 p-1">
                      <Input value={ensaio.faixa_pista || ''} onChange={(e) => onPenduloChange(index, 'faixa_pista', e.target.value)} className="h-8 text-xs" />
                    </td>
                    <td className="border border-slate-300 p-1">
                      <Select value={ensaio.bordo || ''} onValueChange={(value) => onPenduloChange(index, 'bordo', value)}>
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
                      <Input type="number" value={ensaio.temp_pavimento || ''} onChange={(e) => onPenduloChange(index, 'temp_pavimento', parseFloat(e.target.value))} className="h-8 text-xs min-w-[70px]" />
                    </td>
                    <td className="border border-slate-300 p-1">
                      <Input type="number" value={ensaio.leitura_1 || ''} onChange={(e) => onPenduloChange(index, 'leitura_1', parseFloat(e.target.value))} className="h-8 text-xs min-w-[60px]" />
                    </td>
                    <td className="border border-slate-300 p-1">
                      <Input type="number" value={ensaio.leitura_2 || ''} onChange={(e) => onPenduloChange(index, 'leitura_2', parseFloat(e.target.value))} className="h-8 text-xs min-w-[60px]" />
                    </td>
                    <td className="border border-slate-300 p-1">
                      <Input type="number" value={ensaio.leitura_3 || ''} onChange={(e) => onPenduloChange(index, 'leitura_3', parseFloat(e.target.value))} className="h-8 text-xs min-w-[60px]" />
                    </td>
                    <td className="border border-slate-300 p-1">
                      <Input type="number" value={ensaio.leitura_4 || ''} onChange={(e) => onPenduloChange(index, 'leitura_4', parseFloat(e.target.value))} className="h-8 text-xs min-w-[60px]" />
                    </td>
                    <td className="border border-slate-300 p-1">
                      <Input type="number" value={ensaio.leitura_5 || ''} onChange={(e) => onPenduloChange(index, 'leitura_5', parseFloat(e.target.value))} className="h-8 text-xs min-w-[60px]" />
                    </td>
                    <td className="border border-slate-300 p-1 text-center bg-slate-50">{ensaio.maxima || ''}</td>
                    <td className="border border-slate-300 p-1 text-center bg-slate-50">{ensaio.minima || ''}</td>
                    <td className="border border-slate-300 p-1 text-center bg-slate-50">{ensaio.vrd || ''}</td>
                    <td className="border border-slate-300 p-1 text-center bg-slate-50">{ensaio.classe || ''}</td>
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