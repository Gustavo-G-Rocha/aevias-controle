import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AgregadosForm from "@/components/projects/AgregadosForm";

export default function ProjectFormMRAF({
  formData,
  peneirasCarregadas,
  peneirasDisponiveis,
  agregados,
  onFaixaTrabalhoChange,
  onInputChange,
  onNestedChange,
  onAgregadoAdd,
  onAgregadoRemove,
  onAgregadoChange,
  onAgregadoGranChange,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Parâmetros MRAF</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Emulsão Utilizada</Label>
          <Input
            value={formData.emulsao_utilizada || ''}
            onChange={(e) => onInputChange('emulsao_utilizada', e.target.value)}
          />
        </div>

        <div>
          <Label>Percentual de Emulsão (%)</Label>
          <Input
            type="number" step="0.1"
            value={formData.percentual_emulsao || ''}
            onChange={(e) => onInputChange('percentual_emulsao', e.target.value === '' ? '' : parseFloat(e.target.value))}
          />
        </div>

        <div>
          <Label>Densidade da Mistura (g/cm³)</Label>
          <Input
            type="number" step="0.01"
            value={formData.densidade_mistura_mraf || ''}
            onChange={(e) => onInputChange('densidade_mistura_mraf', e.target.value === '' ? '' : parseFloat(e.target.value))}
          />
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">Teor de Ligante Residual</h4>
          <div className="grid grid-cols-3 gap-4">
            {['min', 'max', 'otimo'].map(f => (
              <div key={f}>
                <Label>{f === 'min' ? 'Mínimo (%)' : f === 'max' ? 'Máximo (%)' : 'Ótimo (%)'}</Label>
                <Input type="number" step="0.1"
                  value={formData.teor_ligante_residual?.[f] || ''}
                  onChange={(e) => onNestedChange('teor_ligante_residual', f, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">Taxa de Aplicação</h4>
          <div className="grid grid-cols-3 gap-4">
            {['min', 'max', 'otimo'].map(f => (
              <div key={f}>
                <Label>{f === 'min' ? 'Mínima (l/m²)' : f === 'max' ? 'Máxima (l/m²)' : 'Ótima (l/m²)'}</Label>
                <Input type="number" step="0.1"
                  value={formData.taxa_aplicacao_mraf?.[f] || ''}
                  onChange={(e) => onNestedChange('taxa_aplicacao_mraf', f, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        {/* Faixa de trabalho */}
        {peneirasCarregadas && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Faixa de Trabalho</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="border px-2 py-1 text-left">Peneira</th>
                    <th className="border px-2 py-1">Esp. Mín (%)</th>
                    <th className="border px-2 py-1">Esp. Máx (%)</th>
                    <th className="border px-2 py-1">Trabalho Mín (%)</th>
                    <th className="border px-2 py-1">Trabalho Ótimo (%)</th>
                    <th className="border px-2 py-1">Trabalho Máx (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {peneirasDisponiveis.map(p => (
                    <tr key={p.key} className="hover:bg-muted/30">
                      <td className="border px-2 py-1 font-medium">{p.nome} ({p.astm})</td>
                      <td className="border px-1 py-1 text-center text-muted-foreground">{p.especificacao_min ?? '-'}</td>
                      <td className="border px-1 py-1 text-center text-muted-foreground">{p.especificacao_max ?? '-'}</td>
                      <td className="border px-1 py-1">
                        <Input type="number" step="0.1" className="h-7 text-xs px-1"
                          value={formData.faixa_trabalho_min?.[p.key] ?? ''}
                          onChange={(e) => onFaixaTrabalhoChange(p.key, 'min', e.target.value)} />
                      </td>
                      <td className="border px-1 py-1">
                        <Input type="number" step="0.1" className="h-7 text-xs px-1"
                          value={formData.faixa_trabalho?.[p.key] ?? ''}
                          onChange={(e) => onFaixaTrabalhoChange(p.key, 'otimo', e.target.value)} />
                      </td>
                      <td className="border px-1 py-1">
                        <Input type="number" step="0.1" className="h-7 text-xs px-1"
                          value={formData.faixa_trabalho_max?.[p.key] ?? ''}
                          onChange={(e) => onFaixaTrabalhoChange(p.key, 'max', e.target.value)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <AgregadosForm
          agregados={agregados}
          peneirasDisponiveis={peneirasDisponiveis}
          peneirasCarregadas={peneirasCarregadas}
          onAdd={onAgregadoAdd}
          onRemove={onAgregadoRemove}
          onChange={onAgregadoChange}
          onGranChange={onAgregadoGranChange}
        />
      </CardContent>
    </Card>
  );
}