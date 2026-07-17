import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import CamadaMobileCard from "@/components/boletim-sondagem/CamadaMobileCard";

export default function BoletimSondagemCamadas({
  formData, setFormData, isEditable,
  handleCamadaChange, adicionarCamada, removerCamada,
  adicionarCamada2, removerCamada2,
}) {
  const isMobile = useIsMobile();
  const temColuna2 = formData.camadas.some(c => c.classificacao_2 !== null);

  // Handler unificado para camadas_2 (usado pela visão mobile) — replica a
  // lógica dos handlers inline da tabela desktop.
  const handleCamada2Change = (index, field, value) => {
    setFormData(prev => {
      const c2 = [...(prev.camadas_2 || [])];
      c2[index] = { ...c2[index], [field]: value };
      if (field === 'prof_de' && value !== null && c2[index].prof_ate !== null && c2[index].prof_ate !== undefined) {
        c2[index].espessura = parseFloat((c2[index].prof_ate - value).toFixed(2));
      }
      if (field === 'prof_ate') {
        if (value !== null && c2[index].prof_de !== null && c2[index].prof_de !== undefined) {
          c2[index].espessura = parseFloat((value - c2[index].prof_de).toFixed(2));
        }
        if (index + 1 < c2.length && value !== null) {
          c2[index + 1] = { ...c2[index + 1], prof_de: value };
        }
      }
      return { ...prev, camadas_2: c2 };
    });
  };

  const addColuna2 = () => {
    setFormData(prev => ({
      ...prev,
      camadas: prev.camadas.map(c => ({ ...c, classificacao_2: c.classificacao_2 ?? "" })),
      camadas_2: [],
    }));
  };

  const removeColuna2 = () => setFormData(prev => ({
    ...prev,
    camadas: prev.camadas.map(c => ({ ...c, classificacao_2: null })),
  }));

  return (
    <Card className="bg-muted/30 border-border">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle className="text-base">Sondagem — Camadas</CardTitle>
          {isEditable && (
            <div className="flex gap-2">
              {!temColuna2 && (
                <Button type="button" onClick={addColuna2} size="sm" variant="outline" className=" text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> 2ª Classificação
                </Button>
              )}
              {temColuna2 && (
                <Button type="button" onClick={removeColuna2} size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs">
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Remover 2ª Classificação
                </Button>
              )}
              <Button type="button" onClick={adicionarCamada} size="sm" className=" text-xs" disabled={formData.camadas.length >= 15}>
                <Plus className="w-4 h-4 mr-1" /> Adicionar Camada
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* TABELA 1 - Classificação 1 */}
          <div className="overflow-x-auto">
            <div className="mb-2 flex items-end gap-3">
              <div className="flex-1">
                <Label className="text-xs">Face da Sondagem - Classificação 1</Label>
                <Input value={formData.face_classificacao_1 || ''} onChange={e => setFormData(p => ({ ...p, face_classificacao_1: e.target.value }))} disabled={!isEditable} placeholder="Ex.: Pista, Acostamento, etc." className="h-9 text-sm" />
              </div>
            </div>
            <div className="text-xs font-semibold text-muted-foreground mb-2">Classificação 1</div>
            {isMobile ? (
              <div className="space-y-3">
                {formData.camadas.map((camada, index) => (
                  <CamadaMobileCard
                    key={index}
                    camada={camada}
                    classificacaoField="classificacao_1"
                    isEditable={isEditable}
                    profDeEditable={index === 0}
                    onFieldChange={(field, value) => handleCamadaChange(index, field, value)}
                    onRemove={() => removerCamada(index)}
                    canRemove={formData.camadas.length > 1}
                  />
                ))}
              </div>
            ) : (
            <table className="w-full text-sm border-collapse">
              <colgroup>
                <col className="w-12" />
                <col className="w-[130px]" />
                <col className="w-[130px]" />
                <col className="w-[90px]" />
                <col className="w-[110px]" />
                <col />
                {isEditable && <col className="w-10" />}
              </colgroup>
              <thead>
                <tr className="bg-primary/10">
                  <th className="border border-border px-2 py-2 text-center font-medium">Nº</th>
                  <th className="border border-border px-2 py-2 text-center font-medium" colSpan={2}>PROF. (m)</th>
                  <th className="border border-border px-2 py-2 text-center font-medium">ESP. (m)</th>
                  <th className="border border-border px-2 py-2 text-center font-medium">N.A (m)</th>
                  <th className="border border-border px-2 py-2 text-center font-medium">CLASSIFICAÇÃO</th>
                  {isEditable && <th className="border border-border px-2 py-2"></th>}
                </tr>
                <tr className="bg-muted/30">
                  <th className="border border-border px-2 py-1"></th>
                  <th className="border border-border px-2 py-1 text-center text-xs font-medium">DE</th>
                  <th className="border border-border px-2 py-1 text-center text-xs font-medium">ATÉ</th>
                  <th className="border border-border px-2 py-1"></th>
                  <th className="border border-border px-2 py-1"></th>
                  <th className="border border-border px-2 py-1"></th>
                  {isEditable && <th className="border border-border px-2 py-1"></th>}
                </tr>
              </thead>
              <tbody>
                {formData.camadas.map((camada, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-muted/20' : 'bg-muted/10'}>
                    <td className="border border-border px-2 py-1 text-center font-medium text-muted-foreground">{camada.numero}</td>
                    {index === 0 ? (
                      <td className="border border-border px-1 py-1">
                        <Input type="number" step="0.01" value={camada.prof_de ?? ''} onChange={e => handleCamadaChange(0, 'prof_de', e.target.value !== '' ? parseFloat(e.target.value) : null)} disabled={!isEditable} className="h-8 text-xs text-center bg-background" placeholder="0,00" />
                      </td>
                    ) : (
                      <td className="border border-border px-1 py-1 bg-muted/40 text-center text-xs font-medium text-muted-foreground">
                        {camada.prof_de !== null && camada.prof_de !== undefined ? camada.prof_de.toFixed(2) : '—'}
                      </td>
                    )}
                    <td className="border border-border px-1 py-1">
                      <Input type="number" step="0.01" value={camada.prof_ate ?? ''} onChange={e => handleCamadaChange(index, 'prof_ate', e.target.value !== '' ? parseFloat(e.target.value) : null)} disabled={!isEditable} className="h-8 text-xs text-center bg-background" placeholder="0,00" />
                    </td>
                    <td className="border border-border px-1 py-1 bg-muted/40 text-center text-xs font-medium text-muted-foreground">
                      {camada.espessura !== null && camada.espessura !== undefined ? camada.espessura.toFixed(2) : ''}
                    </td>
                    <td className="border border-border px-1 py-1">
                      <Input type="number" step="0.01" value={camada.na ?? ''} onChange={e => handleCamadaChange(index, 'na', e.target.value !== '' ? parseFloat(e.target.value) : null)} disabled={!isEditable} className="h-8 text-xs text-center bg-background" />
                    </td>
                    <td className="border border-border px-1 py-1">
                      <Input value={camada.classificacao_1} onChange={e => handleCamadaChange(index, 'classificacao_1', e.target.value)} disabled={!isEditable} className="h-8 text-xs bg-background" placeholder="Escrever" />
                    </td>
                    {isEditable && (
                      <td className="border border-border px-1 py-1 text-center">
                        {formData.camadas.length > 1 && (
                          <button type="button" onClick={() => removerCamada(index)} className="text-destructive hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>

          {/* TABELA 2 - Classificação 2 (quando houver) */}
          {temColuna2 && (
            <div className="overflow-x-auto">
              <div className="mb-2 flex items-end gap-3">
                <div className="flex-1">
                  <Label className="text-xs">Face da Sondagem - Classificação 2</Label>
                  <Input value={formData.face_classificacao_2 || ''} onChange={e => setFormData(p => ({ ...p, face_classificacao_2: e.target.value }))} disabled={!isEditable} placeholder="Ex.: Pista, Acostamento, etc." className="h-9 text-sm" />
                </div>
                <Button type="button" onClick={adicionarCamada2} size="sm" className=" text-xs h-9" disabled={!isEditable || (formData.camadas_2?.length || 0) >= 15}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar
                </Button>
              </div>
              <div className="text-xs font-semibold text-muted-foreground mb-2">Classificação 2</div>
              {isMobile ? (
                <div className="space-y-3">
                  {(formData.camadas_2 || []).map((camada, index) => (
                    <CamadaMobileCard
                      key={index}
                      camada={camada}
                      classificacaoField="classificacao_2"
                      isEditable={isEditable}
                      profDeEditable
                      onFieldChange={(field, value) => handleCamada2Change(index, field, value)}
                      onRemove={() => removerCamada2(index)}
                      canRemove
                    />
                  ))}
                </div>
              ) : (
              <table className="w-full text-sm border-collapse">
                <colgroup>
                  <col className="w-12" />
                  <col className="w-[130px]" />
                  <col className="w-[130px]" />
                  <col className="w-[90px]" />
                  <col className="w-[110px]" />
                  <col />
                  {isEditable && <col className="w-10" />}
                </colgroup>
                <thead>
                  <tr className="bg-primary/10">
                    <th className="border border-border px-2 py-2 text-center font-medium">Nº</th>
                    <th className="border border-border px-2 py-2 text-center font-medium" colSpan={2}>PROF. (m)</th>
                    <th className="border border-border px-2 py-2 text-center font-medium">ESP. (m)</th>
                    <th className="border border-border px-2 py-2 text-center font-medium">N.A (m)</th>
                    <th className="border border-border px-2 py-2 text-center font-medium">CLASSIFICAÇÃO</th>
                    {isEditable && <th className="border border-border px-2 py-2"></th>}
                  </tr>
                  <tr className="bg-muted/30">
                    <th className="border border-border px-2 py-1"></th>
                    <th className="border border-border px-2 py-1 text-center text-xs font-medium">DE</th>
                    <th className="border border-border px-2 py-1 text-center text-xs font-medium">ATÉ</th>
                    <th className="border border-border px-2 py-1"></th>
                    <th className="border border-border px-2 py-1"></th>
                    <th className="border border-border px-2 py-1"></th>
                    {isEditable && <th className="border border-border px-2 py-1"></th>}
                  </tr>
                </thead>
                <tbody>
                  {(formData.camadas_2 || []).map((camada, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-muted/20' : 'bg-muted/10'}>
                      <td className="border border-border px-2 py-1 text-center font-medium text-muted-foreground">{camada.numero}</td>
                      <td className="border border-border px-1 py-1">
                        <Input type="number" step="0.01" value={camada.prof_de ?? ''} onChange={e => {
                          const newVal = e.target.value !== '' ? parseFloat(e.target.value) : null;
                          setFormData(prev => {
                            const c2 = [...(prev.camadas_2 || [])];
                            c2[index] = { ...c2[index], prof_de: newVal };
                            if (newVal !== null && c2[index].prof_ate !== null) {
                              c2[index].espessura = parseFloat((c2[index].prof_ate - newVal).toFixed(2));
                            }
                            return { ...prev, camadas_2: c2 };
                          });
                        }} disabled={!isEditable} className="h-8 text-xs text-center bg-background" placeholder="0,00" />
                      </td>
                      <td className="border border-border px-1 py-1">
                        <Input type="number" step="0.01" value={camada.prof_ate ?? ''} onChange={e => {
                          const newVal = e.target.value !== '' ? parseFloat(e.target.value) : null;
                          setFormData(prev => {
                            const c2 = [...(prev.camadas_2 || [])];
                            c2[index] = { ...c2[index], prof_ate: newVal };
                            if (newVal !== null && c2[index].prof_de !== null) {
                              c2[index].espessura = parseFloat((newVal - c2[index].prof_de).toFixed(2));
                            }
                            if (index + 1 < c2.length && newVal !== null) {
                              c2[index + 1] = { ...c2[index + 1], prof_de: newVal };
                            }
                            return { ...prev, camadas_2: c2 };
                          });
                        }} disabled={!isEditable} className="h-8 text-xs text-center bg-background" placeholder="0,00" />
                      </td>
                      <td className="border border-border px-2 py-1 text-center text-xs font-medium text-muted-foreground bg-muted/40">
                        {camada.espessura !== null && camada.espessura !== undefined ? camada.espessura.toFixed(2) : ''}
                      </td>
                      <td className="border border-border px-1 py-1">
                        <Input type="number" step="0.01" value={camada.na ?? ''} onChange={e => {
                          const newVal = e.target.value !== '' ? parseFloat(e.target.value) : null;
                          setFormData(prev => {
                            const c2 = [...(prev.camadas_2 || [])];
                            c2[index] = { ...c2[index], na: newVal };
                            return { ...prev, camadas_2: c2 };
                          });
                        }} disabled={!isEditable} className="h-8 text-xs text-center bg-background" />
                      </td>
                      <td className="border border-border px-1 py-1">
                        <Input value={camada.classificacao_2 ?? ''} onChange={e => {
                          setFormData(prev => {
                            const c2 = [...(prev.camadas_2 || [])];
                            c2[index] = { ...c2[index], classificacao_2: e.target.value };
                            return { ...prev, camadas_2: c2 };
                          });
                        }} disabled={!isEditable} className="h-8 text-xs bg-background" placeholder="Escrever" />
                      </td>
                      {isEditable && (
                        <td className="border border-border px-1 py-1 text-center">
                          <button type="button" onClick={() => removerCamada2(index)} className="text-destructive hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}