import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AgregadosForm from "@/components/projects/AgregadosForm";

export default function ProjectFormCAUQ({
  formData,
  peneirasCarregadas,
  peneirasDisponiveis,
  agregados,
  onLiganteChange,
  onAgregadoAdd,
  onAgregadoRemove,
  onAgregadoChange,
  onAgregadoGranChange,
  onFaixaTrabalhoChange,
  onTemperaturaChange,
  onNestedChange,
  onInputChange,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Parâmetros CAUQ</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ligante" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ligante">Ligante</TabsTrigger>
            <TabsTrigger value="temperaturas">Temperaturas</TabsTrigger>
            <TabsTrigger value="teor">Teor Ligante</TabsTrigger>
            <TabsTrigger value="marshall">Marshall</TabsTrigger>
          </TabsList>

          {/* Ligante */}
          <TabsContent value="ligante" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Ligante</Label>
                <Input
                  value={formData.ligante?.tipo || ''}
                  onChange={(e) => onLiganteChange('tipo', e.target.value)}
                />
              </div>
              <div>
                <Label>Fornecedor</Label>
                <Input
                  value={formData.ligante?.fornecedor || ''}
                  onChange={(e) => onLiganteChange('fornecedor', e.target.value)}
                />
              </div>
              <div>
                <Label>Densidade (g/cm³)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.ligante?.densidade || ''}
                  onChange={(e) => onLiganteChange('densidade', e.target.value)}
                />
              </div>
            </div>

            {/* Agregados */}
            <AgregadosForm
              agregados={agregados}
              peneirasDisponiveis={peneirasDisponiveis}
              peneirasCarregadas={peneirasCarregadas}
              onAdd={onAgregadoAdd}
              onRemove={onAgregadoRemove}
              onChange={onAgregadoChange}
              onGranChange={onAgregadoGranChange}
            />

            {/* Faixa de trabalho */}
            {peneirasCarregadas && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Faixa de Trabalho</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
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
                        <tr key={p.key} className="hover:bg-slate-50">
                          <td className="border px-2 py-1 font-medium">{p.nome} ({p.astm})</td>
                          <td className="border px-1 py-1 text-center text-slate-500">{p.especificacao_min ?? '-'}</td>
                          <td className="border px-1 py-1 text-center text-slate-500">{p.especificacao_max ?? '-'}</td>
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
          </TabsContent>

          {/* Temperaturas */}
          <TabsContent value="temperaturas" className="space-y-4 mt-4">
            {[
              { key: 'mistura', label: 'Mistura (°C)' },
              { key: 'compactacao', label: 'Compactação (°C)' },
              { key: 'espalhamento', label: 'Espalhamento (°C)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <h4 className="font-semibold mb-3 text-sm">{label}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Mín.</Label>
                    <Input type="number"
                      value={formData.temperaturas?.[key]?.min || ''}
                      onChange={(e) => onTemperaturaChange(key, 'min', e.target.value)} />
                  </div>
                  <div>
                    <Label>Máx.</Label>
                    <Input type="number"
                      value={formData.temperaturas?.[key]?.max || ''}
                      onChange={(e) => onTemperaturaChange(key, 'max', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Teor de Ligante */}
          <TabsContent value="teor" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              {['min', 'max', 'otimo'].map(f => (
                <div key={f}>
                  <Label>{f === 'min' ? 'Mínimo (%)' : f === 'max' ? 'Máximo (%)' : 'Ótimo (%)'}</Label>
                  <Input type="number" step="0.1"
                    value={formData.teor_ligante?.[f] || ''}
                    onChange={(e) => onNestedChange('teor_ligante', f, e.target.value)} />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Massa Específica Aparente</h4>
              <Input type="number" step="0.001"
                value={formData.massa_especifica_aparente || ''}
                onChange={(e) => onInputChange('massa_especifica_aparente', e.target.value === '' ? '' : parseFloat(e.target.value))} />
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Densidade Máxima Medida (RICE)</h4>
              <Input type="number" step="0.001"
                value={formData.densidade_maxima_medida || ''}
                onChange={(e) => onInputChange('densidade_maxima_medida', e.target.value === '' ? '' : parseFloat(e.target.value))} />
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Relação Fíler/Betume (%)</h4>
              <Input type="number" step="0.01"
                value={formData.relacao_filer_betume || ''}
                onChange={(e) => onInputChange('relacao_filer_betume', e.target.value === '' ? '' : parseFloat(e.target.value))} />
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">Volume de Vazios (%)</h4>
              <div className="grid grid-cols-3 gap-4">
                {['min', 'max', 'otimo'].map(f => (
                  <div key={f}>
                    <Label>{f === 'min' ? 'Mínimo' : f === 'max' ? 'Máximo' : 'Ótimo'}</Label>
                    <Input type="number" step="0.1"
                      value={formData.volume_vazios?.[f] || ''}
                      onChange={(e) => onNestedChange('volume_vazios', f, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">RTCD Mínimo (MPa)</h4>
              <Input type="number" step="0.001"
                value={formData.rtcd?.min || ''}
                onChange={(e) => onNestedChange('rtcd', 'min', e.target.value)} />
            </div>
          </TabsContent>

          {/* Marshall */}
          <TabsContent value="marshall" className="space-y-4 mt-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Estabilidade (kgf)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mínima</Label>
                  <Input type="number"
                    value={formData.estabilidade?.min || ''}
                    onChange={(e) => onNestedChange('estabilidade', 'min', e.target.value)} />
                </div>
                <div>
                  <Label>Projeto</Label>
                  <Input type="number"
                    value={formData.estabilidade?.projeto || ''}
                    onChange={(e) => onNestedChange('estabilidade', 'projeto', e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">Fluência (mm)</h4>
              <div className="grid grid-cols-3 gap-4">
                {['min', 'max', 'projeto'].map(f => (
                  <div key={f}>
                    <Label>{f === 'min' ? 'Mínima' : f === 'max' ? 'Máxima' : 'Projeto'}</Label>
                    <Input type="number" step="0.1"
                      value={formData.fluencia?.[f] || ''}
                      onChange={(e) => onNestedChange('fluencia', f, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">VAM (%)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mínimo</Label>
                  <Input type="number" step="0.1"
                    value={formData.vam?.min || ''}
                    onChange={(e) => onNestedChange('vam', 'min', e.target.value)} />
                </div>
                <div>
                  <Label>Projeto</Label>
                  <Input type="number" step="0.1"
                    value={formData.vam?.projeto || ''}
                    onChange={(e) => onNestedChange('vam', 'projeto', e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">RBV (%)</h4>
              <div className="grid grid-cols-3 gap-4">
                {['min', 'max', 'projeto'].map(f => (
                  <div key={f}>
                    <Label>{f === 'min' ? 'Mínimo' : f === 'max' ? 'Máximo' : 'Projeto'}</Label>
                    <Input type="number" step="0.1"
                      value={formData.rbv?.[f] || ''}
                      onChange={(e) => onNestedChange('rbv', f, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}