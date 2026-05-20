import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, Plus, Trash2, AlertTriangle, XCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AcoesCorretivasNC from "@/components/checklists/AcoesCorretivasNC";
import { useChecklistConcretagem } from "@/hooks/useChecklistConcretagem";

export default function ChecklistConcretagem() {
  const {
    loading, saving, obras, projects, regionais,
    uploadingPhotos, selectedFileNames, editingChecklist,
    formData, setFormData,
    adicionarCarga, removerCarga, handleCargaChange, handleCPConfigChange,
    getQuantidadeCPs, getTipoRupturaCPs,
    handleFileChange, handleRemovePhoto, handleSubmit, handleCancel,
  } = useChecklistConcretagem();

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  const selectedProject = projects.find(p => p.id === formData.project_id);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{editingChecklist ? "Editar Checklist de Concretagem" : "Novo Checklist de Concretagem"}</CardTitle>
            <CardDescription>
              {editingChecklist ? `Editando checklist de ${new Date(editingChecklist.data).toLocaleDateString("pt-BR")}` : "Controle Tecnológico de Concreto"}
            </CardDescription>
            {formData.status === "rascunho" && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-blue-800">Em Rascunho</p>
                  <p className="text-sm text-blue-700">Este registro ainda está em edição e não será visível aos gestores até que você o finalize.</p>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="overflow-hidden">
            <form
              onSubmit={(e) => handleSubmit(e, "finalizado")}
              onKeyDown={(e) => { if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && e.target.type !== "submit") e.preventDefault(); }}
              className="space-y-6"
            >
              {/* DADOS DA OBRA */}
              <Card className="bg-slate-50">
                <CardHeader><CardTitle className="text-lg">Dados da Obra</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Obra *</Label>
                      <Select value={formData.obra_id || ""} onValueChange={(v) => setFormData({ ...formData, obra_id: v })} disabled={!!editingChecklist?.id}>
                        <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
                        <SelectContent>{obras.map(o => <SelectItem key={o.id} value={o.id}>{o.name} - {o.code}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Carta Traço de Concreto</Label>
                      <Select value={formData.project_id || ""} onValueChange={(v) => setFormData({ ...formData, project_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Selecione a carta traço" /></SelectTrigger>
                        <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Data *</Label>
                      <Input type="date" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Horário Início *</Label>
                      <Input type="time" value={formData.jornada?.horario_inicio || ""} onChange={(e) => setFormData({ ...formData, jornada: { ...formData.jornada, horario_inicio: e.target.value } })} required />
                    </div>
                    <div>
                      <Label>Horário Fim *</Label>
                      <Input type="time" value={formData.jornada?.horario_fim || ""} onChange={(e) => setFormData({ ...formData, jornada: { ...formData.jornada, horario_fim: e.target.value } })} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Concreteira</Label>
                      <Input value={formData.concreteira} onChange={(e) => setFormData({ ...formData, concreteira: e.target.value })} placeholder="Nome da concreteira" />
                    </div>
                    <div>
                      <Label>Empreiteira</Label>
                      <Select value={formData.empreiteira} onValueChange={(v) => setFormData({ ...formData, empreiteira: v })} disabled={!formData.obra_id}>
                        <SelectTrigger><SelectValue placeholder="Selecione a empreiteira" /></SelectTrigger>
                        <SelectContent>{(obras.find(o => o.id === formData.obra_id)?.empreiteiras || []).map((em, i) => <SelectItem key={i} value={em}>{em}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Rodovia</Label>
                      <Select value={formData.rodovia} onValueChange={(v) => setFormData({ ...formData, rodovia: v })}>
                        <SelectTrigger><SelectValue placeholder="Selecione a rodovia" /></SelectTrigger>
                        <SelectContent>{(obras.find(o => o.id === formData.obra_id)?.rodovias || []).map((r, i) => <SelectItem key={i} value={r}>{r}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Trecho</Label>
                      <Input value={formData.trecho} onChange={(e) => setFormData({ ...formData, trecho: e.target.value })} placeholder="Descrição do trecho" />
                    </div>
                    <div>
                      <Label>Volume (m³)</Label>
                      <Input type="number" step="0.1" value={formData.volume} onChange={(e) => setFormData({ ...formData, volume: e.target.value })} />
                    </div>
                    <div>
                      <Label>Fck (MPa)</Label>
                      <Input type="number" step="0.1" value={formData.fck} onChange={(e) => setFormData({ ...formData, fck: e.target.value })} placeholder="Ex: 25" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Estrutura</Label>
                      <Input value={formData.estrutura} onChange={(e) => setFormData({ ...formData, estrutura: e.target.value })} />
                    </div>
                    <div>
                      <Label>Ensaio realizado por</Label>
                      <Select value={formData.ensaio_realizado_por || "Afirma Evias"} onValueChange={(v) => setFormData({ ...formData, ensaio_realizado_por: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Afirma Evias">Afirma Evias</SelectItem>
                          <SelectItem value="Empreiteira">Empreiteira</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Inspetor Campo</Label>
                      <Input value={formData.inspetor_campo} onChange={(e) => setFormData({ ...formData, inspetor_campo: e.target.value })} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CONDIÇÕES CLIMÁTICAS */}
              <Card className="bg-slate-50">
                <CardHeader><CardTitle className="text-lg">Condições Climáticas</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {formData.periodos_clima.map((periodo, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-3"><CardTitle className="text-base capitalize">{periodo.periodo}</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-sm">Temperatura (°C)</Label>
                            <Input type="number" step="0.1" value={periodo.temperatura_ambiente}
                              onChange={(e) => { const p = [...formData.periodos_clima]; p[index].temperatura_ambiente = e.target.value; setFormData({ ...formData, periodos_clima: p }); }} />
                          </div>
                          <div>
                            <Label className="text-sm">Condições</Label>
                            <Select value={periodo.condicoes_climaticas}
                              onValueChange={(v) => { const p = [...formData.periodos_clima]; p[index].condicoes_climaticas = v; setFormData({ ...formData, periodos_clima: p }); }}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bom">Bom</SelectItem>
                                <SelectItem value="instavel">Instável</SelectItem>
                                <SelectItem value="chuva">Chuva</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* CARGAS DE CONCRETO */}
              <Card className="bg-slate-50">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Cargas de Concreto</CardTitle>
                    {formData.cargas_concreto.length < 10 && (
                      <Button type="button" onClick={adicionarCarga} className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" /> Adicionar Carga
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.cargas_concreto.map((carga, index) => (
                    <Card key={index} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">Carga {carga.numero_carga}</CardTitle>
                          {formData.cargas_concreto.length > 1 && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => removerCarga(index)} className="text-red-500 hover:text-red-700 p-0 h-auto">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Nota Fiscal Nº</Label>
                            <Input value={carga.nota_fiscal} onChange={(e) => handleCargaChange(index, "nota_fiscal", e.target.value)} />
                          </div>
                          <div>
                            <Label>Placa da Betoneira</Label>
                            <Input value={carga.placa_betoneira} onChange={(e) => handleCargaChange(index, "placa_betoneira", e.target.value)} />
                          </div>
                        </div>

                        {/* Ensaios de Qualidade */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">Ensaios de Qualidade</h4>
                            <p className="text-xs text-slate-600 italic">Determinar a conformidade dos parâmetros</p>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-300 text-sm">
                              <thead>
                                <tr className="bg-slate-100">
                                  <th className="border border-slate-300 px-2 py-2 text-left font-medium">Ensaio</th>
                                  <th className="border border-slate-300 px-2 py-2 text-center font-medium w-24">Realizado</th>
                                  <th className="border border-slate-300 px-2 py-2 text-center font-medium">Resultado (cm)</th>
                                  <th className="border border-slate-300 px-2 py-2 text-center font-medium">Padrão do Projeto</th>
                                  <th className="border border-slate-300 px-2 py-2 text-center font-medium w-24">Conformidade</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border border-slate-300 px-2 py-2 font-medium bg-slate-50">Slump Test</td>
                                  <td className="border border-slate-300 px-2 py-1 text-center">
                                    <input type="checkbox" checked={carga.slump_test.realizado} onChange={(e) => handleCargaChange(index, "slump_test.realizado", e.target.checked)} className="w-4 h-4" />
                                  </td>
                                  <td className="border border-slate-300 px-1 py-1">
                                    <Input type="number" step="0.1" value={carga.slump_test.resultado || ""} onChange={(e) => handleCargaChange(index, "slump_test.resultado", e.target.value)} disabled={!carga.slump_test.realizado || !selectedProject} className="h-8 text-sm" placeholder="Resultado" />
                                  </td>
                                  <td className={`border border-slate-300 px-2 py-1 text-center text-xs ${selectedProject ? "bg-blue-50 text-blue-800" : "bg-slate-100 text-slate-500"}`}>{carga.slump_test.limite || "N/A"}</td>
                                  <td className="border border-slate-300 px-2 py-1 text-center">
                                    {carga.slump_test.realizado ? (
                                      carga.slump_test.conforme === true ? <span className="text-green-600 font-bold text-xl">✓</span>
                                      : carga.slump_test.conforme === false ? <span className="text-red-600 font-bold text-xl">✗</span>
                                      : <span className="text-slate-500">-</span>
                                    ) : <span className="text-slate-500">-</span>}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="border border-slate-300 px-2 py-2 font-medium bg-slate-50">Espessura da Camada</td>
                                  <td className="border border-slate-300 px-2 py-1 text-center">
                                    <input type="checkbox" checked={carga.espessura_camada.realizado} onChange={(e) => handleCargaChange(index, "espessura_camada.realizado", e.target.checked)} className="w-4 h-4" />
                                  </td>
                                  <td className="border border-slate-300 px-1 py-1">
                                    <Input type="number" step="0.1" value={carga.espessura_camada.resultado || ""} onChange={(e) => handleCargaChange(index, "espessura_camada.resultado", e.target.value)} disabled={!carga.espessura_camada.realizado} className="h-8 text-sm" placeholder="Resultado" />
                                  </td>
                                  <td className="border border-slate-300 px-1 py-1">
                                    <Input value={carga.espessura_camada.limite} onChange={(e) => handleCargaChange(index, "espessura_camada.limite", e.target.value)} disabled={!carga.espessura_camada.realizado} className="h-8 text-sm" placeholder="Limite manual" />
                                  </td>
                                  <td className="border border-slate-300 px-2 py-1 text-center">
                                    <div className="flex gap-2 justify-center">
                                      <label className="flex items-center gap-1 cursor-pointer">
                                        <input type="checkbox" checked={carga.espessura_camada.conforme === true} onChange={(e) => handleCargaChange(index, "espessura_camada.conforme", e.target.checked ? true : null)} disabled={!carga.espessura_camada.realizado} className="w-4 h-4 accent-green-500" />
                                        <span className="text-xs text-green-600">✓</span>
                                      </label>
                                      <label className="flex items-center gap-1 cursor-pointer">
                                        <input type="checkbox" checked={carga.espessura_camada.conforme === false} onChange={(e) => handleCargaChange(index, "espessura_camada.conforme", e.target.checked ? false : null)} disabled={!carga.espessura_camada.realizado} className="w-4 h-4 accent-red-500" />
                                        <span className="text-xs text-red-600">✗</span>
                                      </label>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div className="mt-3">
                            <Label>Equipamento de Lançamento</Label>
                            <Select value={carga.equipamento_lancamento || ""} onValueChange={(v) => handleCargaChange(index, "equipamento_lancamento", v)}>
                              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="convencional">Convencional</SelectItem>
                                <SelectItem value="bombeado">Bombeado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Acompanhamento Lançamento */}
                        <div className="border-t pt-4 space-y-3">
                          <h4 className="font-semibold">Acompanhamento Lançamento Concreto</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-300 text-sm">
                              <thead>
                                <tr className="bg-slate-100">
                                  <th className="border border-slate-300 px-2 py-2 text-left font-medium">Serviço</th>
                                  <th className="border border-slate-300 px-2 py-2 text-center font-medium w-20">Sim</th>
                                  <th className="border border-slate-300 px-2 py-2 text-center font-medium w-20">Não</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[
                                  { label: "A superfície foi tratada e limpa?", field: "superficie_tratada_limpa" },
                                  { label: "Foi realizado adensamento do concreto?", field: "adensamento_realizado" },
                                ].map(({ label, field }) => (
                                  <tr key={field}>
                                    <td className="border border-slate-300 px-2 py-2 font-medium bg-slate-50">{label}</td>
                                    <td className="border border-slate-300 px-2 py-1 text-center">
                                      <input type="checkbox" checked={carga[field] === true} onChange={(e) => handleCargaChange(index, field, e.target.checked ? true : null)} className="w-4 h-4 accent-green-500" />
                                    </td>
                                    <td className="border border-slate-300 px-2 py-1 text-center">
                                      <input type="checkbox" checked={carga[field] === false} onChange={(e) => handleCargaChange(index, field, e.target.checked ? false : null)} className="w-4 h-4 accent-red-500" />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div>
                            <Label>Observações</Label>
                            <Textarea value={carga.observacoes_lancamento} onChange={(e) => handleCargaChange(index, "observacoes_lancamento", e.target.value)} rows={2} />
                          </div>
                        </div>

                        {/* Moldes para Fiscalização */}
                        <div className="border-t pt-4 space-y-3">
                          <h4 className="font-semibold">Moldes para Fiscalização</h4>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id={`moldado_${index}`} checked={carga.moldado_fiscalizacao}
                              onChange={(e) => {
                                handleCargaChange(index, "moldado_fiscalizacao", e.target.checked);
                                if (!e.target.checked) {
                                  const newCargas = [...formData.cargas_concreto];
                                  newCargas[index].corpos_prova = [];
                                  setFormData(prev => ({ ...prev, cargas_concreto: newCargas }));
                                }
                              }}
                              className="w-4 h-4" />
                            <Label htmlFor={`moldado_${index}`} className="text-sm cursor-pointer">Moldado para Fiscalização</Label>
                          </div>
                          {carga.moldado_fiscalizacao && (
                            <div className="space-y-3">
                              <Label className="font-semibold">Configuração dos Corpos de Prova</Label>
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-slate-300 text-sm">
                                  <thead className="bg-slate-100">
                                    <tr>
                                      <th className="border border-slate-300 p-2 text-center font-medium">Dias para Ruptura</th>
                                      <th className="border border-slate-300 p-2 text-center font-medium">Quantidade de CPs</th>
                                      <th className="border border-slate-300 p-2 text-center font-medium">Tipo de Ruptura</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {[3, 7, 28, 63].map((dias) => (
                                      <tr key={dias}>
                                        <td className="border border-slate-300 p-2 text-center font-medium bg-slate-50">{dias} dias</td>
                                        <td className="border border-slate-300 p-2">
                                          <Input type="number" min="0" max="10" value={getQuantidadeCPs(index, dias)} onChange={(e) => handleCPConfigChange(index, dias, "quantidade", e.target.value)} className="h-9 text-center" placeholder="0" />
                                        </td>
                                        <td className="border border-slate-300 p-2">
                                          <Select value={getTipoRupturaCPs(index, dias)} onValueChange={(v) => handleCPConfigChange(index, dias, "tipo_ruptura", v)} disabled={getQuantidadeCPs(index, dias) === 0}>
                                            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="compressao_axial">Compressão Axial</SelectItem>
                                              <SelectItem value="comp_diametral">Compressão Diametral</SelectItem>
                                              <SelectItem value="tracao_flexao">Tração na Flexão</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              {carga.corpos_prova?.length > 0 && (
                                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                                  <p className="text-sm text-blue-800">
                                    <strong>Total de CPs moldados:</strong> {carga.corpos_prova.length}
                                    {[3, 7, 28, 63].map(d => carga.corpos_prova.filter(cp => cp.dias_ruptura === d).length > 0 ? ` | ${d} dias: ${carga.corpos_prova.filter(cp => cp.dias_ruptura === d).length}` : "").join("")}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              {/* OBSERVAÇÕES GERAIS */}
              <div>
                <Label>Observações Gerais</Label>
                <Textarea value={formData.observacoes_gerais} onChange={(e) => setFormData({ ...formData, observacoes_gerais: e.target.value })} rows={3} placeholder="Observações gerais..." maxLength="500" />
                <p className="text-xs text-right text-slate-500 mt-1">{formData.observacoes_gerais?.length || 0} / 500</p>
              </div>

              {/* AÇÕES CORRETIVAS / NÃO CONFORMIDADES */}
              <AcoesCorretivasNC
                acoesRealizadas={formData.acoes_corretivas_realizado}
                acoesDescricao={formData.acoes_corretivas_descricao}
                naoConformidades={formData.nao_conformidades || []}
                onAcoesRealizadasChange={(v) => setFormData(prev => ({ ...prev, acoes_corretivas_realizado: v, acoes_corretivas_descricao: v === false ? "" : prev.acoes_corretivas_descricao }))}
                onAcoesDescricaoChange={(v) => setFormData(prev => ({ ...prev, acoes_corretivas_descricao: v }))}
                onNaoConformidadesChange={(ncs) => setFormData(prev => ({ ...prev, nao_conformidades: ncs }))}
                disabled={false}
                locaisPermitidos={["CAMPO"]}
              />

              {/* FOTOS */}
              <div>
                <Label>Registro Fotográfico</Label>
                <div>
                  <Input id="fotos" type="file" multiple accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onChange={handleFileChange} disabled={uploadingPhotos} className="hidden" />
                  <Label htmlFor="fotos" className={`flex items-center justify-between w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm cursor-pointer hover:bg-slate-50 ${uploadingPhotos ? "opacity-50 cursor-not-allowed" : ""}`}>
                    <span className="truncate text-slate-500">{selectedFileNames}</span>
                    <span className="flex-shrink-0 ml-4 px-3 py-1 rounded-md text-sm font-semibold bg-blue-50 text-blue-700">{uploadingPhotos ? "Enviando..." : "Escolher Ficheiros"}</span>
                  </Label>
                </div>
                {uploadingPhotos && <div className="flex items-center gap-2 text-sm text-slate-600 mt-2"><Loader2 className="w-4 h-4 animate-spin" /><span>Fazendo upload das fotos...</span></div>}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {formData.fotos?.map((url, i) => (
                    <div key={i} className="relative group">
                      <picture><source srcSet={url} /><img src={url} alt={`Foto ${i + 1}`} className="w-full h-32 object-cover rounded-md border" width="auto" height="128" /></picture>
                      <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemovePhoto(i)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* BOTÕES */}
              <div className="flex justify-end gap-4 mt-6">
                <Button type="button" variant="outline" onClick={handleCancel}>Cancelar</Button>
                <Button type="button" variant="outline" disabled={saving || uploadingPhotos} onClick={(e) => handleSubmit(e, "rascunho")} className="border-blue-500 text-blue-600 hover:bg-blue-50">
                  <Save className="mr-2 h-4 w-4" /> Salvar Progresso
                </Button>
                <Button type="submit" disabled={saving || uploadingPhotos} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><Save className="mr-2 h-4 w-4" />Finalizar</>}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}