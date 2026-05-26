import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, AlertTriangle, Loader2, Plus, Trash2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import { useBoletimSondagemData } from "@/hooks/useBoletimSondagemData";
import { useBoletimSondagemForm } from "@/hooks/useBoletimSondagemForm";
import { useBoletimSondagemActions } from "@/hooks/useBoletimSondagemActions";
import { getDensidadeInicial, calcularUmidadeMedia } from "@/utils/boletimSondagemUtils";

export default function BoletimSondagemPage() {
  const { formData, setFormData, obras, regionais, user, loading, editingBoletim } = useBoletimSondagemData();
  const {
    handleObraChange, handleCamadaChange,
    adicionarCamada, removerCamada,
    adicionarCamada2, removerCamada2,
    handleUmidadeChange, handleDensidadeChange,
    adicionarDensidade, removerDensidade,
    handlePhotoUpload, handleRemovePhoto,
  } = useBoletimSondagemForm(setFormData);
  const { saving, handleSubmit } = useBoletimSondagemActions({ formData, user, editingBoletim });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const navigate = useNavigate();

  const isApproved = editingBoletim?.approved === true;
  const isEditable = !isApproved;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-transparent">
        <Loader2 className="w-8 h-8 animate-spin text-[#00233B]/50" />
      </div>
    );
  }

  const numInput = (val, onChange, disabled, placeholder = "", step = "0.01") => (
    <Input
      type="number"
      step={step}
      value={val ?? ''}
      onChange={(e) => onChange(e.target.value !== '' ? parseFloat(e.target.value) : null)}
      disabled={disabled}
      placeholder={placeholder}
      className="h-9 text-sm"
    />
  );

  const resultField = (label, value, unit = "") => (
    <div className="p-3 bg-[#BFCF99]/20 border border-[#BFCF99]/40 rounded">
      <p className="text-xs text-[#00233B]/70 font-medium">{label}</p>
      <p className="text-base font-bold text-[#00233B]">
        {value !== null && value !== undefined ? `${value}${unit}` : '-'}
      </p>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white/20 backdrop-blur-lg border border-white/20 text-[#00233B]">
          <CardHeader>
            <CardTitle className="text-[#00233B] text-2xl">
              {editingBoletim ? 'Editar Boletim de Sondagem' : 'Novo Boletim de Sondagem (PI)'}
            </CardTitle>
            <CardDescription className="text-[#00233B]/80">
              Umidade Natural | Densidade In Situ — DNER-ME 213/94 e DNER-ME 092/94
            </CardDescription>
            {editingBoletim?.rejection_reason && (
              <div className="mt-4 flex items-start gap-2 p-3 bg-red-50/50 border border-red-200/50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-red-800">Motivo da Reprovação:</p>
                  <p className="text-sm text-red-700">{editingBoletim.rejection_reason}</p>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') e.preventDefault();
            }} className="space-y-6">

              {/* DADOS DA OBRA */}
              <Card className="bg-black/5 border-[#00233B]/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-[#00233B]">Dados da Obra</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Obra *</Label>
                      <select
                        value={formData.obra_id}
                        onChange={(e) => handleObraChange(e.target.value, obras, regionais)}
                        disabled={!isEditable || !!editingBoletim}
                        required
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">Selecione a obra</option>
                        {obras.map(obra => (
                          <option key={obra.id} value={obra.id}>{obra.name} — {obra.code}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Cliente</Label>
                      <Input value={formData.cliente} onChange={e => setFormData(p => ({ ...p, cliente: e.target.value }))} disabled={!isEditable} placeholder="Do cadastro da obra" className="h-10" />
                    </div>
                    <div>
                      <Label>Data *</Label>
                      <Input type="date" value={formData.data} onChange={e => setFormData(p => ({ ...p, data: e.target.value }))} disabled={!isEditable} required className="h-10" />
                    </div>
                    <div>
                      <Label>Rodovia</Label>
                      <select
                        value={formData.rodovia}
                        onChange={e => setFormData(p => ({ ...p, rodovia: e.target.value }))}
                        disabled={!isEditable || !formData.obra_id}
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">Selecione a rodovia</option>
                        {(obras.find(o => o.id === formData.obra_id)?.rodovias || []).map((r, i) => (
                          <option key={i} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>KM</Label>
                      <Input value={formData.km} onChange={e => setFormData(p => ({ ...p, km: e.target.value }))} disabled={!isEditable} placeholder="Ex: 125+300" className="h-10" />
                    </div>
                    <div>
                      <Label>Pista</Label>
                      <Input value={formData.pista} onChange={e => setFormData(p => ({ ...p, pista: e.target.value }))} disabled={!isEditable} placeholder="Ex: Norte" className="h-10" />
                    </div>
                    <div>
                      <Label>Bordo</Label>
                      <Input value={formData.bordo} onChange={e => setFormData(p => ({ ...p, bordo: e.target.value }))} disabled={!isEditable} placeholder="Ex: Direito" className="h-10" />
                    </div>
                    <div>
                      <Label>Furo</Label>
                      <Input value={formData.furo} onChange={e => setFormData(p => ({ ...p, furo: e.target.value }))} disabled={!isEditable} placeholder="Ex: F-01" className="h-10" />
                    </div>
                    <div>
                      <Label>Operador</Label>
                      <Input value={formData.operador} readOnly className="h-10 bg-slate-100" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SONDAGEM - CAMADAS */}
              {(() => {
                const temColuna2 = formData.camadas.some(c => c.classificacao_2 !== null);
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
                  <Card className="bg-black/5 border-[#00233B]/10">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <CardTitle className="text-base text-[#00233B]">Sondagem — Camadas</CardTitle>
                        {isEditable && (
                          <div className="flex gap-2">
                            {!temColuna2 && (
                              <Button type="button" onClick={addColuna2} size="sm" variant="outline" className="border-[#00233B]/30 text-[#00233B] hover:bg-[#00233B]/10 text-xs">
                                <Plus className="w-3.5 h-3.5 mr-1" /> 2ª Classificação
                              </Button>
                            )}
                            {temColuna2 && (
                              <Button type="button" onClick={removeColuna2} size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 text-xs">
                                <Trash2 className="w-3.5 h-3.5 mr-1" /> Remover 2ª Classificação
                              </Button>
                            )}
                            <Button type="button" onClick={adicionarCamada} size="sm" className="bg-[#00233B] text-[#F2F1EF] hover:bg-[#00233B]/90 text-xs" disabled={formData.camadas.length >= 15}>
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
                          <div className="text-xs font-semibold text-[#00233B]/70 mb-2">Classificação 1</div>
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
                              <tr className="bg-[#00233B]/10">
                                <th className="border border-[#00233B]/20 px-2 py-2 text-center font-medium">Nº</th>
                                <th className="border border-[#00233B]/20 px-2 py-2 text-center font-medium" colSpan={2}>PROF. (m)</th>
                                <th className="border border-[#00233B]/20 px-2 py-2 text-center font-medium">ESP. (m)</th>
                                <th className="border border-[#00233B]/20 px-2 py-2 text-center font-medium">N.A (m)</th>
                                <th className="border border-[#00233B]/20 px-2 py-2 text-center font-medium">CLASSIFICAÇÃO</th>
                                {isEditable && <th className="border border-[#00233B]/20 px-2 py-2"></th>}
                              </tr>
                              <tr className="bg-[#00233B]/5">
                                <th className="border border-[#00233B]/20 px-2 py-1"></th>
                                <th className="border border-[#00233B]/20 px-2 py-1 text-center text-xs font-medium">DE</th>
                                <th className="border border-[#00233B]/20 px-2 py-1 text-center text-xs font-medium">ATÉ</th>
                                <th className="border border-[#00233B]/20 px-2 py-1"></th>
                                <th className="border border-[#00233B]/20 px-2 py-1"></th>
                                <th className="border border-[#00233B]/20 px-2 py-1"></th>
                                {isEditable && <th className="border border-[#00233B]/20 px-2 py-1"></th>}
                              </tr>
                            </thead>
                            <tbody>
                              {formData.camadas.map((camada, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-white/30' : 'bg-white/10'}>
                                  <td className="border border-[#00233B]/20 px-2 py-1 text-center font-medium text-[#00233B]/70">{camada.numero}</td>
                                  {index === 0 ? (
                                    <td className="border border-[#00233B]/20 px-1 py-1">
                                      <Input type="number" step="0.01" value={camada.prof_de ?? ''} onChange={e => handleCamadaChange(0, 'prof_de', e.target.value !== '' ? parseFloat(e.target.value) : null)} disabled={!isEditable} className="h-8 text-xs text-center bg-white/50" placeholder="0,00" />
                                    </td>
                                  ) : (
                                    <td className="border border-[#00233B]/20 px-1 py-1 bg-black/10 text-center text-xs font-medium text-[#00233B]/70">
                                      {camada.prof_de !== null && camada.prof_de !== undefined ? camada.prof_de.toFixed(2) : '—'}
                                    </td>
                                  )}
                                  <td className="border border-[#00233B]/20 px-1 py-1">
                                    <Input type="number" step="0.01" value={camada.prof_ate ?? ''} onChange={e => handleCamadaChange(index, 'prof_ate', e.target.value !== '' ? parseFloat(e.target.value) : null)} disabled={!isEditable} className="h-8 text-xs text-center bg-white/50" placeholder="0,00" />
                                  </td>
                                  <td className="border border-[#00233B]/20 px-1 py-1 bg-black/10 text-center text-xs font-medium text-[#00233B]/70">
                                    {camada.espessura !== null && camada.espessura !== undefined ? camada.espessura.toFixed(2) : ''}
                                  </td>
                                  <td className="border border-[#00233B]/20 px-1 py-1">
                                    <Input type="number" step="0.01" value={camada.na ?? ''} onChange={e => handleCamadaChange(index, 'na', e.target.value !== '' ? parseFloat(e.target.value) : null)} disabled={!isEditable} className="h-8 text-xs text-center bg-white/50" />
                                  </td>
                                  <td className="border border-[#00233B]/20 px-1 py-1">
                                    <Input value={camada.classificacao_1} onChange={e => handleCamadaChange(index, 'classificacao_1', e.target.value)} disabled={!isEditable} className="h-8 text-xs bg-white/50" placeholder="Escrever" />
                                  </td>
                                  {isEditable && (
                                    <td className="border border-[#00233B]/20 px-1 py-1 text-center">
                                      {formData.camadas.length > 1 && (
                                        <button type="button" onClick={() => removerCamada(index)} className="text-red-400 hover:text-red-600">
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* TABELA 2 - Classificação 2 (quando houver) */}
                        {temColuna2 && (
                          <div className="overflow-x-auto">
                            <div className="mb-2 flex items-end gap-3">
                              <div className="flex-1">
                                <Label className="text-xs">Face da Sondagem - Classificação 2</Label>
                                <Input value={formData.face_classificacao_2 || ''} onChange={e => setFormData(p => ({ ...p, face_classificacao_2: e.target.value }))} disabled={!isEditable} placeholder="Ex.: Pista, Acostamento, etc." className="h-9 text-sm" />
                              </div>
                              <Button type="button" onClick={adicionarCamada2} size="sm" className="bg-[#00233B] text-[#F2F1EF] hover:bg-[#00233B]/90 text-xs h-9" disabled={!isEditable || (formData.camadas_2?.length || 0) >= 15}>
                                <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar
                              </Button>
                            </div>
                            <div className="text-xs font-semibold text-[#00233B]/70 mb-2">Classificação 2</div>
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
                                <tr className="bg-[#00233B]/10">
                                  <th className="border border-[#00233B]/20 px-2 py-2 text-center font-medium">Nº</th>
                                  <th className="border border-[#00233B]/20 px-2 py-2 text-center font-medium" colSpan={2}>PROF. (m)</th>
                                  <th className="border border-[#00233B]/20 px-2 py-2 text-center font-medium">ESP. (m)</th>
                                  <th className="border border-[#00233B]/20 px-2 py-2 text-center font-medium">N.A (m)</th>
                                  <th className="border border-[#00233B]/20 px-2 py-2 text-center font-medium">CLASSIFICAÇÃO</th>
                                  {isEditable && <th className="border border-[#00233B]/20 px-2 py-2"></th>}
                                </tr>
                                <tr className="bg-[#00233B]/5">
                                  <th className="border border-[#00233B]/20 px-2 py-1"></th>
                                  <th className="border border-[#00233B]/20 px-2 py-1 text-center text-xs font-medium">DE</th>
                                  <th className="border border-[#00233B]/20 px-2 py-1 text-center text-xs font-medium">ATÉ</th>
                                  <th className="border border-[#00233B]/20 px-2 py-1"></th>
                                  <th className="border border-[#00233B]/20 px-2 py-1"></th>
                                  <th className="border border-[#00233B]/20 px-2 py-1"></th>
                                  {isEditable && <th className="border border-[#00233B]/20 px-2 py-1"></th>}
                                </tr>
                              </thead>
                              <tbody>
                                {(formData.camadas_2 || []).map((camada, index) => (
                                  <tr key={index} className={index % 2 === 0 ? 'bg-white/30' : 'bg-white/10'}>
                                    <td className="border border-[#00233B]/20 px-2 py-1 text-center font-medium text-[#00233B]/70">{camada.numero}</td>
                                    <td className="border border-[#00233B]/20 px-1 py-1">
                                      <Input type="number" step="0.01" value={camada.prof_de ?? ''} onChange={e => {
                                        const newVal = e.target.value !== '' ? parseFloat(e.target.value) : null;
                                        setFormData(prev => {
                                          const newCamadas2 = [...(prev.camadas_2 || [])];
                                          newCamadas2[index].prof_de = newVal;
                                          if (newVal !== null && newCamadas2[index].prof_ate !== null) {
                                            newCamadas2[index].espessura = parseFloat((newCamadas2[index].prof_ate - newVal).toFixed(2));
                                          }
                                          return { ...prev, camadas_2: newCamadas2 };
                                        });
                                      }} disabled={!isEditable} className="h-8 text-xs text-center bg-white/50" placeholder="0,00" />
                                    </td>
                                    <td className="border border-[#00233B]/20 px-1 py-1">
                                      <Input type="number" step="0.01" value={camada.prof_ate ?? ''} onChange={e => {
                                        const newVal = e.target.value !== '' ? parseFloat(e.target.value) : null;
                                        setFormData(prev => {
                                          const newCamadas2 = [...(prev.camadas_2 || [])];
                                          newCamadas2[index].prof_ate = newVal;
                                          if (newVal !== null && newCamadas2[index].prof_de !== null) {
                                            newCamadas2[index].espessura = parseFloat((newVal - newCamadas2[index].prof_de).toFixed(2));
                                          }
                                          if (index + 1 < newCamadas2.length && newVal !== null) {
                                            newCamadas2[index + 1].prof_de = newVal;
                                          }
                                          return { ...prev, camadas_2: newCamadas2 };
                                        });
                                      }} disabled={!isEditable} className="h-8 text-xs text-center bg-white/50" placeholder="0,00" />
                                    </td>
                                    <td className="border border-[#00233B]/20 px-2 py-1 text-center text-xs font-medium text-[#00233B]/70 bg-black/10">
                                      {camada.espessura !== null && camada.espessura !== undefined ? camada.espessura.toFixed(2) : ''}
                                    </td>
                                    <td className="border border-[#00233B]/20 px-1 py-1">
                                      <Input type="number" step="0.01" value={camada.na ?? ''} onChange={e => {
                                        const newVal = e.target.value !== '' ? parseFloat(e.target.value) : null;
                                        setFormData(prev => {
                                          const newCamadas2 = [...(prev.camadas_2 || [])];
                                          newCamadas2[index].na = newVal;
                                          return { ...prev, camadas_2: newCamadas2 };
                                        });
                                      }} disabled={!isEditable} className="h-8 text-xs text-center bg-white/50" />
                                    </td>
                                    <td className="border border-[#00233B]/20 px-1 py-1">
                                      <Input value={camada.classificacao_2 ?? ''} onChange={e => {
                                        setFormData(prev => {
                                          const newCamadas2 = [...(prev.camadas_2 || [])];
                                          newCamadas2[index].classificacao_2 = e.target.value;
                                          return { ...prev, camadas_2: newCamadas2 };
                                        });
                                      }} disabled={!isEditable} className="h-8 text-xs bg-white/50" placeholder="Escrever" />
                                    </td>
                                    {isEditable && (
                                      <td className="border border-[#00233B]/20 px-1 py-1 text-center">
                                        <button type="button" onClick={() => removerCamada2(index)} className="text-red-400 hover:text-red-600">
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* UMIDADE NATURAL 1 - DNER-ME 213/94 */}
              <Card className="bg-black/5 border-[#00233B]/10">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base text-[#00233B]">Umidade Natural 1 — DNER-ME 213/94</CardTitle>
                    {isEditable && !formData.umidade_natural_2 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-[#00233B]/30 text-[#00233B] hover:bg-[#00233B]/10 text-xs"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          umidade_natural_2: {
                            camada_ensaiada_1: "",
                            no_capsula_1: "", no_capsula_2: "",
                            massa_capsula_1: null, massa_capsula_2: null,
                            massa_cap_solo_umido_1: null, massa_cap_solo_umido_2: null,
                            massa_cap_solo_seco_1: null, massa_cap_solo_seco_2: null,
                            massa_agua_1: null, massa_agua_2: null,
                            massa_solo_seco_1: null, massa_solo_seco_2: null,
                            umidade_1: null, umidade_2: null,
                          }
                        }))}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar 2ª Umidade
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-[#00233B]/10">
                          <th className="border border-[#00233B]/20 px-3 py-2 text-left font-medium text-[#00233B]">Campo</th>
                          <th className="border border-[#00233B]/20 px-3 py-2 text-center font-medium text-[#00233B]">Amostra 1</th>
                          <th className="border border-[#00233B]/20 px-3 py-2 text-center font-medium text-[#00233B]">Amostra 2</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white/30">
                          <td className="border border-[#00233B]/20 px-3 py-1.5 font-medium text-[#00233B]/80">Camada ensaiada</td>
                          <td className="border border-[#00233B]/20 px-2 py-1" colSpan={2}>
                            <Input value={formData.umidade_natural.camada_ensaiada_1 || ''} onChange={e => handleUmidadeChange('camada_ensaiada_1', e.target.value)} disabled={!isEditable} className="h-8 text-sm" placeholder="Ex.: 0,00 - 0,60m" />
                          </td>
                        </tr>
                        {[
                          { label: "Nº cápsula", fields: ['no_capsula_1', 'no_capsula_2'], type: 'text' },
                          { label: "Massa cápsula (g)", fields: ['massa_capsula_1', 'massa_capsula_2'], type: 'number' },
                          { label: "Massa cap + solo úmido (g)", fields: ['massa_cap_solo_umido_1', 'massa_cap_solo_umido_2'], type: 'number' },
                          { label: "Massa cap + solo seco (g)", fields: ['massa_cap_solo_seco_1', 'massa_cap_solo_seco_2'], type: 'number' },
                        ].map(({ label, fields, type }, ri) => (
                          <tr key={ri} className={ri % 2 === 0 ? 'bg-white/10' : 'bg-white/30'}>
                            <td className="border border-[#00233B]/20 px-3 py-1.5 font-medium text-[#00233B]/80">{label}</td>
                            {fields.map((f, fi) => (
                              <td key={fi} className="border border-[#00233B]/20 px-2 py-1">
                                {type === 'text'
                                  ? <Input value={formData.umidade_natural[f] || ''} onChange={e => handleUmidadeChange(f, e.target.value)} disabled={!isEditable} className="h-8 text-sm" />
                                  : numInput(formData.umidade_natural[f], v => handleUmidadeChange(f, v), !isEditable)
                                }
                              </td>
                            ))}
                          </tr>
                        ))}
                        {[
                          { label: "Massa da água (g)", keys: ['massa_agua_1', 'massa_agua_2'] },
                          { label: "Massa do solo seco (g)", keys: ['massa_solo_seco_1', 'massa_solo_seco_2'] },
                        ].map(({ label, keys }, ri) => (
                          <tr key={`calc-${ri}`} className="bg-[#BFCF99]/10">
                            <td className="border border-[#00233B]/20 px-3 py-1.5 font-medium text-[#00233B]/80 italic">{label}</td>
                            {keys.map((k, ki) => (
                              <td key={ki} className="border border-[#00233B]/20 px-3 py-1.5 text-center font-semibold text-[#00233B]">
                                {formData.umidade_natural[k] !== null && formData.umidade_natural[k] !== undefined ? formData.umidade_natural[k].toFixed(2) : '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                        <tr className="bg-[#BFCF99]/30">
                          <td className="border border-[#00233B]/20 px-3 py-2 font-bold text-[#00233B]">Umidade (%)</td>
                          <td className="border border-[#00233B]/20 px-3 py-2 text-center font-bold text-[#00233B] text-base" colSpan={2}>
                            {(() => {
                              const media = calcularUmidadeMedia(formData.umidade_natural.umidade_1, formData.umidade_natural.umidade_2);
                              return media !== null ? `${media} %` : '—';
                            })()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* UMIDADE NATURAL 2 - DNER-ME 213/94 */}
              {formData.umidade_natural_2 && (
                <Card className="bg-black/5 border-[#00233B]/10">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base text-[#00233B]">Umidade Natural 2 — DNER-ME 213/94</CardTitle>
                      {isEditable && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 text-xs"
                          onClick={() => setFormData(prev => ({ ...prev, umidade_natural_2: null }))}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Remover
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-[#00233B]/10">
                            <th className="border border-[#00233B]/20 px-3 py-2 text-left font-medium text-[#00233B]">Campo</th>
                            <th className="border border-[#00233B]/20 px-3 py-2 text-center font-medium text-[#00233B]">Amostra 1</th>
                            <th className="border border-[#00233B]/20 px-3 py-2 text-center font-medium text-[#00233B]">Amostra 2</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white/30">
                            <td className="border border-[#00233B]/20 px-3 py-1.5 font-medium text-[#00233B]/80">Camada ensaiada</td>
                            <td className="border border-[#00233B]/20 px-2 py-1" colSpan={2}>
                              <Input value={formData.umidade_natural_2.camada_ensaiada_1 || ''} onChange={e => setFormData(prev => ({ ...prev, umidade_natural_2: { ...prev.umidade_natural_2, camada_ensaiada_1: e.target.value } }))} disabled={!isEditable} className="h-8 text-sm" placeholder="Ex.: 0,00 - 0,60m" />
                            </td>
                          </tr>
                          {[
                            { label: "Nº cápsula", fields: ['no_capsula_1', 'no_capsula_2'], type: 'text' },
                            { label: "Massa cápsula (g)", fields: ['massa_capsula_1', 'massa_capsula_2'], type: 'number' },
                            { label: "Massa cap + solo úmido (g)", fields: ['massa_cap_solo_umido_1', 'massa_cap_solo_umido_2'], type: 'number' },
                            { label: "Massa cap + solo seco (g)", fields: ['massa_cap_solo_seco_1', 'massa_cap_solo_seco_2'], type: 'number' },
                          ].map(({ label, fields, type }, ri) => (
                            <tr key={ri} className={ri % 2 === 0 ? 'bg-white/10' : 'bg-white/30'}>
                              <td className="border border-[#00233B]/20 px-3 py-1.5 font-medium text-[#00233B]/80">{label}</td>
                              {fields.map((f, fi) => (
                                <td key={fi} className="border border-[#00233B]/20 px-2 py-1">
                                  {type === 'text'
                                    ? <Input value={formData.umidade_natural_2[f] || ''} onChange={e => setFormData(prev => ({ ...prev, umidade_natural_2: { ...prev.umidade_natural_2, [f]: e.target.value } }))} disabled={!isEditable} className="h-8 text-sm" />
                                    : <Input type="number" step="0.01" value={formData.umidade_natural_2[f] ?? ''} onChange={e => setFormData(prev => ({ ...prev, umidade_natural_2: { ...prev.umidade_natural_2, [f]: e.target.value !== '' ? parseFloat(e.target.value) : null } }))} disabled={!isEditable} className="h-8 text-sm" />
                                  }
                                </td>
                              ))}
                            </tr>
                          ))}
                          {[
                            { label: "Massa da água (g)", keys: ['massa_agua_1', 'massa_agua_2'] },
                            { label: "Massa do solo seco (g)", keys: ['massa_solo_seco_1', 'massa_solo_seco_2'] },
                          ].map(({ label, keys }, ri) => (
                            <tr key={`calc-${ri}`} className="bg-[#BFCF99]/10">
                              <td className="border border-[#00233B]/20 px-3 py-1.5 font-medium text-[#00233B]/80 italic">{label}</td>
                              {keys.map((k, ki) => {
                                const { agua, soloSeco } = (() => {
                                  const un2 = formData.umidade_natural_2;
                                  const capSoloUmido = un2[`massa_cap_solo_umido_${ki + 1}`];
                                  const capSoloSeco = un2[`massa_cap_solo_seco_${ki + 1}`];
                                  const capsula = un2[`massa_capsula_${ki + 1}`];
                                  if (capSoloUmido && capSoloSeco && capsula !== null) {
                                    return { agua: parseFloat((capSoloUmido - capSoloSeco).toFixed(2)), soloSeco: parseFloat((capSoloSeco - capsula).toFixed(2)) };
                                  }
                                  return { agua: null, soloSeco: null };
                                })();
                                return (
                                  <td key={ki} className="border border-[#00233B]/20 px-3 py-1.5 text-center font-semibold text-[#00233B]">
                                    {k.includes('agua') ? (agua !== null ? agua.toFixed(2) : '—') : (soloSeco !== null ? soloSeco.toFixed(2) : '—')}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                          <tr className="bg-[#BFCF99]/30">
                            <td className="border border-[#00233B]/20 px-3 py-2 font-bold text-[#00233B]">Umidade (%)</td>
                            <td className="border border-[#00233B]/20 px-3 py-2 text-center font-bold text-[#00233B] text-base" colSpan={2}>
                              {(() => {
                                const un2 = formData.umidade_natural_2;
                                const calcU = (idx) => {
                                  const csu = un2[`massa_cap_solo_umido_${idx}`];
                                  const css = un2[`massa_cap_solo_seco_${idx}`];
                                  const cap = un2[`massa_capsula_${idx}`];
                                  if (csu && css && cap !== null) {
                                    const ss = css - cap;
                                    return ss > 0 ? parseFloat((((csu - css) / ss) * 100).toFixed(2)) : null;
                                  }
                                  return null;
                                };
                                const media = calcularUmidadeMedia(calcU(1), calcU(2));
                                return media !== null ? `${media} %` : '—';
                              })()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* DENSIDADE IN SITU */}
              <Card className="bg-black/5 border-[#00233B]/10">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <CardTitle className="text-base text-[#00233B]">Massa Específica Aparente In Situ — DNER-ME 092/94</CardTitle>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.ensaio_insitu_realizado}
                          onChange={e => setFormData(prev => ({ ...prev, ensaio_insitu_realizado: e.target.checked }))}
                          disabled={!isEditable}
                          className="w-4 h-4 accent-[#00233B]"
                        />
                        <span className="text-sm font-medium text-[#00233B]">Ensaio realizado</span>
                      </label>
                      {isEditable && formData.ensaio_insitu_realizado && (formData.densidades_in_situ || []).length < 3 && (
                        <Button type="button" onClick={adicionarDensidade} size="sm" className="bg-[#00233B] text-[#F2F1EF] hover:bg-[#00233B]/90 text-xs">
                          <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Ensaio
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {!formData.ensaio_insitu_realizado && (
                  <CardContent>
                    <p className="text-sm text-[#00233B]/60 italic text-center py-4">Ensaio in situ não realizado neste boletim.</p>
                  </CardContent>
                )}
                {formData.ensaio_insitu_realizado && (
                  <CardContent>
                    <div className="overflow-x-auto">
                      {(() => {
                        const densidades = formData.densidades_in_situ || [getDensidadeInicial()];
                        const nEnsaios = densidades.length;
                        const numInput2 = (val, onChange, step = "0.01") => (
                          <Input type="number" step={step} value={val ?? ''} onChange={(e) => onChange(e.target.value !== '' ? parseFloat(e.target.value) : null)} disabled={!isEditable} className="h-8 text-xs text-center bg-white/50 min-w-[90px]" />
                        );
                        const calc = (val, dec = 2) => val !== null && val !== undefined ? val.toFixed(dec) : '—';
                        const rows = [
                          { label: "Camada ensaiada em campo", field: "camada_ensaiada", type: "text" },
                          { label: "— VOLUME —", section: true },
                          { label: "Peso do frasco antes (gf)", field: "peso_frasco_antes", type: "number", step: "0.001" },
                          { label: "Peso do frasco depois (gf)", field: "peso_frasco_depois", type: "number", step: "0.001" },
                          { label: "Peso da areia no funil e placa (gf)", field: "peso_areia_funil_placa", type: "number", step: "0.001" },
                          { label: "Massa esp. aparente da areia (g/dm³)", field: "massa_esp_aparente_areia", type: "number", step: "0.001" },
                          { label: "Peso da areia deslocada (gf)", field: "peso_areia_deslocada", type: "calc", dec: 2 },
                          { label: "Peso da areia na cavidade (gf)", field: "peso_areia_cavidade", type: "calc", dec: 2 },
                          { label: "Volume do buraco (dm³)", field: "volume_buraco", type: "calc", dec: 3 },
                          { label: "— MASSA —", section: true },
                          { label: "Peso do solo e recipiente (gf)", field: "peso_solo_recipiente", type: "number" },
                          { label: "Peso do recipiente (gf)", field: "peso_recipiente", type: "number" },
                          { label: "Peso do solo (gf)", field: "peso_solo", type: "calc", dec: 2 },
                          { label: "— UMIDADE —", section: true },
                          { label: "Peso do solo úmido (gf)", field: "peso_solo_umido", type: "number" },
                          { label: "Peso do solo seco (gf)", field: "peso_solo_seco", type: "number" },
                          { label: "Teor de umidade (%)", field: "teor_umidade", type: "calc", dec: 2 },
                          { label: "— RESULTADOS —", section: true },
                          { label: "Dens. Aparente Solo Úmido (g/dm³)", field: "densidade_aparente_solo_umido", type: "result", dec: 3 },
                          { label: "Dens. Aparente Solo Seco (g/dm³)", field: "densidade_aparente_solo_seco", type: "result", dec: 3 },
                        ];
                        return (
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-[#00233B]/10">
                                <th className="border border-[#00233B]/20 px-3 py-2 text-left font-medium text-[#00233B] min-w-[220px]">Campo</th>
                                {densidades.map((_, i) => (
                                  <th key={i} className="border border-[#00233B]/20 px-3 py-2 text-center font-medium text-[#00233B] min-w-[120px]">
                                    <div className="flex items-center justify-center gap-2">
                                      <span>Ensaio {i + 1}</span>
                                      {isEditable && nEnsaios > 1 && (
                                        <button type="button" onClick={() => removerDensidade(i)} className="text-red-400 hover:text-red-600">
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row, ri) => {
                                if (row.section) {
                                  return (
                                    <tr key={ri} className="bg-[#00233B]/10">
                                      <td colSpan={nEnsaios + 1} className="border border-[#00233B]/20 px-3 py-1 text-xs font-bold text-[#00233B]/60 uppercase tracking-wider">
                                        {row.label.replace(/—/g, '').trim()}
                                      </td>
                                    </tr>
                                  );
                                }
                                const isCalc = row.type === 'calc' || row.type === 'result';
                                const isResult = row.type === 'result';
                                return (
                                  <tr key={ri} className={isResult ? 'bg-[#BFCF99]/30' : isCalc ? 'bg-[#BFCF99]/10' : (ri % 2 === 0 ? 'bg-white/20' : 'bg-white/5')}>
                                    <td className={`border border-[#00233B]/20 px-3 py-1.5 font-medium text-[#00233B]/80 text-xs ${isCalc ? 'italic' : ''} ${isResult ? 'font-bold text-[#00233B]' : ''}`}>{row.label}</td>
                                    {densidades.map((d, di) => (
                                      <td key={`densidade-${di}`} className={`border border-[#00233B]/20 px-2 py-1 text-center ${isCalc ? 'font-semibold text-[#00233B]' : ''}`}>
                                        {isCalc ? (
                                          <span className={isResult ? 'text-base font-bold text-[#00233B]' : ''}>{calc(d[row.field], row.dec ?? 2)}</span>
                                        ) : row.type === 'text' ? (
                                          <Input value={d[row.field] || ''} onChange={e => handleDensidadeChange(di, row.field, e.target.value)} disabled={!isEditable} className="h-8 text-xs bg-white/50 min-w-[90px]" />
                                        ) : (
                                          numInput2(d[row.field], v => handleDensidadeChange(di, row.field, v), row.step || "0.01")
                                        )}
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        );
                      })()}
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* OBSERVAÇÕES */}
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={e => setFormData(p => ({ ...p, observacoes: e.target.value }))}
                  disabled={!isEditable}
                  rows={3}
                  maxLength={500}
                  placeholder="Observações gerais sobre o boletim..."
                />
              </div>

              {/* REGISTRO FOTOGRÁFICO */}
              <div>
                <Label>Registro Fotográfico</Label>
                {isEditable && (
                  <div className="mt-2">
                    <input id="fotos-upload" type="file" multiple accept="image/*" onChange={e => handlePhotoUpload(e, setUploadingPhoto)} disabled={uploadingPhoto} className="hidden" />
                    <label htmlFor="fotos-upload" className={`flex items-center justify-between w-full h-10 px-3 py-2 border border-[#00233B]/20 bg-white/30 rounded-md text-sm cursor-pointer hover:bg-white/50 ${uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <span className="text-[#00233B]/60">{uploadingPhoto ? 'Enviando...' : 'Selecionar fotos'}</span>
                      <span className="px-3 py-1 rounded-md text-sm font-semibold bg-[#00233B]/10 text-[#00233B] hover:bg-[#00233B]/20">
                        {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Escolher Ficheiros'}
                      </span>
                    </label>
                  </div>
                )}
                {formData.fotos && formData.fotos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {formData.fotos.map((url, index) => (
                      <div key={index} className="relative group">
                        <picture><source srcSet={url} /><img src={url} alt={`Foto ${index + 1}`} className="w-full h-32 object-cover rounded-md border border-[#00233B]/20" width="auto" height="128" /></picture>
                        {isEditable && (
                          <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemovePhoto(index)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* BOTÕES */}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate(createPageUrl('MeusEnsaios'))} className="hover:bg-black/10">Cancelar</Button>
                {isEditable && (
                  <Button type="submit" disabled={saving} className="bg-[#00233B] text-[#F2F1EF] hover:bg-[#00233B]/90">
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><Save className="w-4 h-4 mr-2" />Salvar Boletim</>}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}