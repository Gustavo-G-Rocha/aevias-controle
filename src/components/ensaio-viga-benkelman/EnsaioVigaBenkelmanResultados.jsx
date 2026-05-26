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
      <Card className="bg-white/20 backdrop-blur-lg border border-white/20">
        <CardHeader className="bg-[#BFCF99]/20 border-b border-white/10">
          <div className="flex justify-between items-center">
            <CardTitle className="text-[#00233B]">Levantamento Deflectométrico</CardTitle>
            {formData.faixas.length < 4 && (
              <Button onClick={onAddFaixa} size="sm" className="bg-[#00233B] text-white">
                <Plus className="w-4 h-4 mr-1" /> Adicionar Faixa
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeFaixaTab} onValueChange={setActiveFaixaTab} className="w-full">
            <TabsList className="flex flex-row gap-2 bg-transparent border-b border-white/20">
              {formData.faixas.map((faixa) => (
                <div key={faixa.id} className="relative">
                  <TabsTrigger
                    value={String(faixa.id)}
                    className="data-[state=active]:bg-[#00233B]/10 text-[#00233B] border-b-2 border-transparent data-[state=active]:border-[#00233B]"
                  >
                    {faixa.nome || `Faixa ${faixa.id}`}
                  </TabsTrigger>
                </div>
              ))}
            </TabsList>

            {formData.faixas.map((faixa) => (
              <TabsContent key={faixa.id} value={String(faixa.id)} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium text-[#00233B] whitespace-nowrap">Faixa:</span>
                  <Input
                    value={faixa.nome}
                    onChange={(e) => onUpdateFaixaNome(faixa.id, e.target.value)}
                    placeholder="Digitar nome da faixa"
                    className="bg-white/20 border-white/30 text-[#00233B] h-8 w-48 text-sm"
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
                      <col style={{ width: '100px' }} />
                      <col style={{ width: '100px' }} />
                      <col style={{ width: '100px' }} />
                      <col style={{ width: '100px' }} />
                      <col style={{ width: '100px' }} />
                      <col style={{ width: '100px' }} />
                    </colgroup>
                    <thead>
                      <tr className="bg-[#00233B]/10 border border-[#00233B]/20">
                        <th rowSpan="2" className="border border-[#00233B]/20 px-3 py-2 text-[#00233B] font-bold text-center">Estaca / km</th>
                        <th colSpan="2" className="border border-[#00233B]/20 px-3 py-2 text-[#00233B] font-bold text-center">BORDO ESQUERDO</th>
                        <th colSpan="2" className="border border-[#00233B]/20 px-3 py-2 text-[#00233B] font-bold text-center">EIXO</th>
                        <th colSpan="2" className="border border-[#00233B]/20 px-3 py-2 text-[#00233B] font-bold text-center">BORDO DIREITO</th>
                      </tr>
                      <tr className="bg-[#00233B]/5 border border-[#00233B]/20">
                        <th className="border border-[#00233B]/20 px-2 py-1 text-[#00233B] font-semibold text-center">L. Inicial (A)</th>
                        <th className="border border-[#00233B]/20 px-2 py-1 text-[#00233B] font-semibold text-center">L. Final (B)</th>
                        <th className="border border-[#00233B]/20 px-2 py-1 text-[#00233B] font-semibold text-center">L. Inicial (A)</th>
                        <th className="border border-[#00233B]/20 px-2 py-1 text-[#00233B] font-semibold text-center">L. Final (B)</th>
                        <th className="border border-[#00233B]/20 px-2 py-1 text-[#00233B] font-semibold text-center">L. Inicial (A)</th>
                        <th className="border border-[#00233B]/20 px-2 py-1 text-[#00233B] font-semibold text-center">L. Final (B)</th>
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
                          <tr key={idx} className={`border border-[#00233B]/20 ${idx % 2 === 0 ? 'bg-white/5' : 'bg-white/10'} ${temExcesso ? 'bg-red-100/20' : ''}`}>
                            <td className="border border-[#00233B]/20 px-3 py-2 text-center font-semibold">
                              <Input value={lev.estaca_km} onChange={(e) => onUpdateLevantamento(faixa.id, idx, null, 'estaca_km', e.target.value)} placeholder="Estaca" className="bg-white/20 border-white/30 text-[#00233B] h-9 text-sm text-center" />
                            </td>
                            <td className="border border-[#00233B]/20 px-2 py-2">
                              <Input type="number" step="0.01" value={lev.bordo_esquerdo.leitura_inicial} onChange={(e) => onUpdateLevantamento(faixa.id, idx, 'bordo_esquerdo', 'leitura_inicial', e.target.value)} className="bg-white/20 border-white/30 text-[#00233B] h-9 text-center text-sm" />
                            </td>
                            <td className="border border-[#00233B]/20 px-2 py-2">
                              <Input type="number" step="0.01" value={lev.bordo_esquerdo.leitura_final} onChange={(e) => onUpdateLevantamento(faixa.id, idx, 'bordo_esquerdo', 'leitura_final', e.target.value)} className="bg-white/20 border-white/30 text-[#00233B] h-9 text-center text-sm" />
                            </td>
                            <td className={`border border-[#00233B]/20 px-2 py-2 ${lev.eixo.deflexao > def_admissivel && def_admissivel > 0 ? 'text-red-700 font-bold' : ''}`}>
                              <Input type="number" step="0.01" value={lev.eixo.leitura_inicial} onChange={(e) => onUpdateLevantamento(faixa.id, idx, 'eixo', 'leitura_inicial', e.target.value)} className="bg-white/20 border-white/30 text-[#00233B] h-9 text-center text-sm" />
                            </td>
                            <td className={`border border-[#00233B]/20 px-2 py-2 ${lev.eixo.deflexao > def_admissivel && def_admissivel > 0 ? 'text-red-700 font-bold' : ''}`}>
                              <Input type="number" step="0.01" value={lev.eixo.leitura_final} onChange={(e) => onUpdateLevantamento(faixa.id, idx, 'eixo', 'leitura_final', e.target.value)} className="bg-white/20 border-white/30 text-[#00233B] h-9 text-center text-sm" />
                            </td>
                            <td className="border border-[#00233B]/20 px-2 py-2">
                              <Input type="number" step="0.01" value={lev.bordo_direito.leitura_inicial} onChange={(e) => onUpdateLevantamento(faixa.id, idx, 'bordo_direito', 'leitura_inicial', e.target.value)} className="bg-white/20 border-white/30 text-[#00233B] h-9 text-center text-sm" />
                            </td>
                            <td className="border border-[#00233B]/20 px-2 py-2">
                              <Input type="number" step="0.01" value={lev.bordo_direito.leitura_final} onChange={(e) => onUpdateLevantamento(faixa.id, idx, 'bordo_direito', 'leitura_final', e.target.value)} className="bg-white/20 border-white/30 text-[#00233B] h-9 text-center text-sm" />
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
                    <div key={idx} className={`border border-[#00233B]/20 rounded-lg p-3 ${idx % 2 === 0 ? 'bg-white/5' : 'bg-white/10'}`}>
                      <div className="mb-3">
                        <span className="block text-xs font-bold text-[#00233B] mb-1">Estaca / km</span>
                        <Input value={lev.estaca_km} onChange={(e) => onUpdateLevantamento(faixa.id, idx, null, 'estaca_km', e.target.value)} placeholder="Estaca" className="bg-white/20 border-white/30 text-[#00233B] h-9 text-sm" />
                      </div>
                      {['bordo_esquerdo', 'eixo', 'bordo_direito'].map((lado) => (
                        <div key={lado} className="col-span-3 mb-3">
                          <p className="text-xs font-bold text-[#00233B] text-center bg-[#00233B]/10 rounded px-2 py-1 mb-2">
                            {lado === 'bordo_esquerdo' ? 'BORDO ESQUERDO' : lado === 'eixo' ? 'EIXO' : 'BORDO DIREITO'}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="block text-xs text-[#00233B]/70 mb-1">L. Inicial (A)</span>
                              <Input type="number" step="0.01" value={lev[lado].leitura_inicial} onChange={(e) => onUpdateLevantamento(faixa.id, idx, lado, 'leitura_inicial', e.target.value)} className="bg-white/20 border-white/30 text-[#00233B] h-9 text-sm" />
                            </div>
                            <div>
                              <span className="block text-xs text-[#00233B]/70 mb-1">L. Final (B)</span>
                              <Input type="number" step="0.01" value={lev[lado].leitura_final} onChange={(e) => onUpdateLevantamento(faixa.id, idx, lado, 'leitura_final', e.target.value)} className="bg-white/20 border-white/30 text-[#00233B] h-9 text-sm" />
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
      <Card className="bg-white/20 backdrop-blur-lg border border-white/20">
        <CardHeader className="bg-[#BFCF99]/20 border-b border-white/10">
          <CardTitle className="text-[#00233B]">Observações</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Textarea
            value={formData.observacoes}
            onChange={(e) => onInputChange('observacoes', e.target.value)}
            placeholder="Observações gerais sobre o ensaio"
            className="bg-white/10 border-white/20 text-[#00233B] h-24"
          />
        </CardContent>
      </Card>
    </div>
  );
}