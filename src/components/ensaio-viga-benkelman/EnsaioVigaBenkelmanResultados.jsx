import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EnsaioVigaBenkelmanResultados({
  formData,
  activeFaixaTab,
  setActiveFaixaTab,
  onAddFaixa,
  onRemoveFaixa,
  onUpdateFaixaNome,
  onUpdateLevantamento,
  onInputChange,
}) {
  const def_admissivel = parseFloat(formData.def_admissivel) || 0;

  return (
    <div className="space-y-6">
      {/* Levantamentos com Faixas */}
      <Card className="bg-card border border-border">
        <CardHeader className="bg-muted/50 border-b border-border">
          <div className="flex justify-between items-center">
            <CardTitle className="text-foreground">Levantamento Deflectométrico</CardTitle>
            {formData.faixas.length < 4 && (
              <Button onClick={onAddFaixa} size="sm" >
                <Plus className="w-4 h-4 mr-1" /> Adicionar Faixa
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeFaixaTab} onValueChange={setActiveFaixaTab} className="w-full">
            <TabsList className="flex flex-row gap-2 bg-transparent border-b border-border">
              {formData.faixas.map((faixa) => (
                <div key={faixa.id} className="relative">
                  <TabsTrigger
                    value={String(faixa.id)}
                    className="data-[state=active]:bg-primary/10 text-foreground border-b-2 border-transparent data-[state=active]:border-primary"
                  >
                    {faixa.nome || `Faixa ${faixa.id}`}
                  </TabsTrigger>
                </div>
              ))}
            </TabsList>

            {formData.faixas.map((faixa) => (
              <TabsContent key={faixa.id} value={String(faixa.id)} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">Faixa:</span>
                  <Input
                    value={faixa.nome}
                    onChange={(e) => onUpdateFaixaNome(faixa.id, e.target.value)}
                    placeholder="Digitar nome da faixa"
                    className="bg-muted/30 border-border text-foreground h-8 w-48 text-sm"
                  />
                  {formData.faixas.length > 1 && (
                    <Button onClick={() => onRemoveFaixa(faixa.id)} variant="destructive" size="sm" className="h-8 px-2 ml-auto">
                      <X className="w-4 h-4" /> Remover Faixa
                    </Button>
                  )}
                </div>

                {/* Desktop: tabela */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <colgroup>
                      <col style={{ width: '120px' }} />
                      <col style={{ width: '65px' }} />
                      <col style={{ width: '65px' }} />
                      <col style={{ width: '65px' }} />
                      <col style={{ width: '65px' }} />
                      <col style={{ width: '65px' }} />
                      <col style={{ width: '65px' }} />
                      <col style={{ width: '65px' }} />
                      <col style={{ width: '65px' }} />
                      <col style={{ width: '65px' }} />
                      <col style={{ width: '65px' }} />
                      <col style={{ width: '65px' }} />
                      <col style={{ width: '65px' }} />
                    </colgroup>
                    <thead>
                      <tr className="bg-primary/10 border border-border">
                        <th rowSpan="2" className="border border-border px-3 py-2 text-foreground font-bold text-center">Estaca / km</th>
                        <th colSpan="4" className="border border-border px-3 py-2 text-foreground font-bold text-center">BORDO ESQUERDO</th>
                        <th colSpan="4" className="border border-border px-3 py-2 text-foreground font-bold text-center">EIXO</th>
                        <th colSpan="4" className="border border-border px-3 py-2 text-foreground font-bold text-center">BORDO DIREITO</th>
                      </tr>
                      <tr className="bg-muted/30 border border-border">
                        <th className="border border-border px-2 py-1 text-foreground font-semibold text-center">L. Inicial (A)</th>
                        <th className="border border-border px-2 py-1 text-foreground font-semibold text-center">L. Final (B)</th>
                        <th className="border border-border px-2 py-1 text-foreground font-semibold text-center">Dif. (C = A - B)</th>
                        <th className="border border-border px-2 py-1 text-foreground font-semibold text-center">Defl. (x10⁻²mm)</th>
                        <th className="border border-border px-2 py-1 text-foreground font-semibold text-center">L. Inicial (A)</th>
                        <th className="border border-border px-2 py-1 text-foreground font-semibold text-center">L. Final (B)</th>
                        <th className="border border-border px-2 py-1 text-foreground font-semibold text-center">Dif. (C = A - B)</th>
                        <th className="border border-border px-2 py-1 text-foreground font-semibold text-center">Defl. (x10⁻²mm)</th>
                        <th className="border border-border px-2 py-1 text-foreground font-semibold text-center">L. Inicial (A)</th>
                        <th className="border border-border px-2 py-1 text-foreground font-semibold text-center">L. Final (B)</th>
                        <th className="border border-border px-2 py-1 text-foreground font-semibold text-center">Dif. (C = A - B)</th>
                        <th className="border border-border px-2 py-1 text-foreground font-semibold text-center">Defl. (x10⁻²mm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {faixa.levantamentos.map((lev, idx) => {
                        const temExcesso = def_admissivel > 0 && (
                          lev.bordo_esquerdo.deflexao > def_admissivel ||
                          lev.eixo.deflexao > def_admissivel ||
                          lev.bordo_direito.deflexao > def_admissivel
                        );
                        return (
                          <tr key={idx} className={`border border-border ${idx % 2 === 0 ? 'bg-muted/20' : 'bg-background'} ${temExcesso ? 'bg-destructive/10' : ''}`}>
                            <td className="border border-border px-3 py-2 text-center font-semibold">
                              <Input value={lev.estaca_km} onChange={(e) => onUpdateLevantamento(faixa.id, idx, null, 'estaca_km', e.target.value)} placeholder="Estaca" className="bg-muted/30 border-border text-foreground h-9 text-sm text-center" />
                            </td>
                            {/* BORDO ESQUERDO */}
                            <td className="border border-border px-2 py-2">
                              <Input type="number" step="0.01" value={lev.bordo_esquerdo.leitura_inicial} onChange={(e) => onUpdateLevantamento(faixa.id, idx, 'bordo_esquerdo', 'leitura_inicial', e.target.value)} className="bg-muted/30 border-border text-foreground h-9 text-center text-sm" />
                            </td>
                            <td className="border border-border px-2 py-2">
                              <Input type="number" step="0.01" value={lev.bordo_esquerdo.leitura_final} onChange={(e) => onUpdateLevantamento(faixa.id, idx, 'bordo_esquerdo', 'leitura_final', e.target.value)} className="bg-muted/30 border-border text-foreground h-9 text-center text-sm" />
                            </td>
                            <td className="border border-border px-2 py-2 text-center text-sm font-medium text-foreground">
                              {lev.bordo_esquerdo.diferenca || 0}
                            </td>
                            <td className={`border border-border px-2 py-2 text-center text-sm font-bold ${lev.bordo_esquerdo.deflexao > def_admissivel && def_admissivel > 0 ? 'text-red-600' : 'text-foreground'}`}>
                              {lev.bordo_esquerdo.deflexao || 0}
                            </td>
                            {/* EIXO */}
                            <td className="border border-border px-2 py-2">
                              <Input type="number" step="0.01" value={lev.eixo.leitura_inicial} onChange={(e) => onUpdateLevantamento(faixa.id, idx, 'eixo', 'leitura_inicial', e.target.value)} className="bg-muted/30 border-border text-foreground h-9 text-center text-sm" />
                            </td>
                            <td className="border border-border px-2 py-2">
                              <Input type="number" step="0.01" value={lev.eixo.leitura_final} onChange={(e) => onUpdateLevantamento(faixa.id, idx, 'eixo', 'leitura_final', e.target.value)} className="bg-muted/30 border-border text-foreground h-9 text-center text-sm" />
                            </td>
                            <td className="border border-border px-2 py-2 text-center text-sm font-medium text-foreground">
                              {lev.eixo.diferenca || 0}
                            </td>
                            <td className={`border border-border px-2 py-2 text-center text-sm font-bold ${lev.eixo.deflexao > def_admissivel && def_admissivel > 0 ? 'text-red-600' : 'text-foreground'}`}>
                              {lev.eixo.deflexao || 0}
                            </td>
                            {/* BORDO DIREITO */}
                            <td className="border border-border px-2 py-2">
                              <Input type="number" step="0.01" value={lev.bordo_direito.leitura_inicial} onChange={(e) => onUpdateLevantamento(faixa.id, idx, 'bordo_direito', 'leitura_inicial', e.target.value)} className="bg-muted/30 border-border text-foreground h-9 text-center text-sm" />
                            </td>
                            <td className="border border-border px-2 py-2">
                              <Input type="number" step="0.01" value={lev.bordo_direito.leitura_final} onChange={(e) => onUpdateLevantamento(faixa.id, idx, 'bordo_direito', 'leitura_final', e.target.value)} className="bg-muted/30 border-border text-foreground h-9 text-center text-sm" />
                            </td>
                            <td className="border border-border px-2 py-2 text-center text-sm font-medium text-foreground">
                              {lev.bordo_direito.diferenca || 0}
                            </td>
                            <td className={`border border-border px-2 py-2 text-center text-sm font-bold ${lev.bordo_direito.deflexao > def_admissivel && def_admissivel > 0 ? 'text-red-600' : 'text-foreground'}`}>
                              {lev.bordo_direito.deflexao || 0}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile: cards por estaca */}
                <div className="md:hidden space-y-4">
                  {faixa.levantamentos.map((lev, idx) => (
                    <div key={idx} className={`border border-border rounded-lg p-3 ${idx % 2 === 0 ? 'bg-muted/20' : 'bg-background'}`}>
                      <div className="mb-3">
                        <span className="block text-xs font-bold text-foreground mb-1">Estaca / km</span>
                        <Input value={lev.estaca_km} onChange={(e) => onUpdateLevantamento(faixa.id, idx, null, 'estaca_km', e.target.value)} placeholder="Estaca" className="bg-muted/30 border-border text-foreground h-9 text-sm" />
                      </div>
                      {['bordo_esquerdo', 'eixo', 'bordo_direito'].map((lado) => (
                        <div key={lado} className="col-span-3 mb-3">
                          <p className="text-xs font-bold text-foreground text-center bg-primary/10 rounded px-2 py-1 mb-2">
                            {lado === 'bordo_esquerdo' ? 'BORDO ESQUERDO' : lado === 'eixo' ? 'EIXO' : 'BORDO DIREITO'}
                          </p>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div>
                              <span className="block text-xs text-muted-foreground mb-1">L. Inicial (A)</span>
                              <Input type="number" step="0.01" value={lev[lado].leitura_inicial} onChange={(e) => onUpdateLevantamento(faixa.id, idx, lado, 'leitura_inicial', e.target.value)} className="bg-muted/30 border-border text-foreground h-9 text-sm" />
                            </div>
                            <div>
                              <span className="block text-xs text-muted-foreground mb-1">L. Final (B)</span>
                              <Input type="number" step="0.01" value={lev[lado].leitura_final} onChange={(e) => onUpdateLevantamento(faixa.id, idx, lado, 'leitura_final', e.target.value)} className="bg-muted/30 border-border text-foreground h-9 text-sm" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-muted/30 rounded p-2 text-center">
                              <span className="block text-xs text-muted-foreground/70">Dif. (A - B)</span>
                              <span className="text-sm font-medium text-foreground">{lev[lado].diferenca || 0}</span>
                            </div>
                            <div className={`rounded p-2 text-center ${lev[lado].deflexao > def_admissivel && def_admissivel > 0 ? 'bg-destructive/10' : 'bg-muted/30'}`}>
                              <span className="block text-xs text-muted-foreground/70">Defl. (x10⁻²mm)</span>
                              <span className={`text-sm font-bold ${lev[lado].deflexao > def_admissivel && def_admissivel > 0 ? 'text-red-600' : 'text-foreground'}`}>{lev[lado].deflexao || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card className="bg-card border border-border">
        <CardHeader className="bg-muted/50 border-b border-border">
          <CardTitle className="text-foreground">Observações</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Textarea
            value={formData.observacoes}
            onChange={(e) => onInputChange('observacoes', e.target.value)}
            placeholder="Observações gerais sobre o ensaio"
            className="bg-background border-border text-foreground h-24"
          />
        </CardContent>
      </Card>
    </div>
  );
}