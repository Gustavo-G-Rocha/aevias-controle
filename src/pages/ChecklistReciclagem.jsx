import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, XCircle, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useChecklistForm } from "@/hooks/useChecklistForm";
import AcoesCorretivasNC from "@/components/checklists/AcoesCorretivasNC";
import ChecklistFooter from "@/components/checklists/ChecklistFooter";

const SectionTitle = ({ children }) => (
  <CardHeader>
    <CardTitle className="text-lg">{children}</CardTitle>
  </CardHeader>
);

const CheckboxGroup = ({ value, onChange }) => (
  <div className="flex gap-4 justify-center">
    <label className="flex items-center gap-1 cursor-pointer">
      <input type="checkbox" checked={value?.sim || false} onChange={(e) => { e.stopPropagation(); onChange('sim'); }} className="w-4 h-4 accent-green-500" />
      <span className="text-xs">Sim</span>
    </label>
    <label className="flex items-center gap-1 cursor-pointer">
      <input type="checkbox" checked={value?.nao || false} onChange={(e) => { e.stopPropagation(); onChange('nao'); }} className="w-4 h-4 accent-red-500" />
      <span className="text-xs">Não</span>
    </label>
    <label className="flex items-center gap-1 cursor-pointer">
      <input type="checkbox" checked={value?.na || false} onChange={(e) => { e.stopPropagation(); onChange('na'); }} className="w-4 h-4 accent-gray-500" />
      <span className="text-xs">N/A</span>
    </label>
  </div>
);

const getInitialFormData = () => {
  const today = new Date().toISOString().split('T')[0];
  return {
    obra_id: "",
    project_id: "",
    data: today,
    jornada: { horario_inicio: "", horario_fim: "" },
    rodovia: "",
    empreiteira: "",
    estaca: "",
    trecho: "",
    faixa: "",
    material: "",
    inspetor_fiscal: "",
    ensaio_realizado_por: "Afirma Evias",
    periodos_clima: [
      { periodo: "manha", temperatura_ambiente: "", condicoes_climaticas: "bom" },
      { periodo: "tarde", temperatura_ambiente: "", condicoes_climaticas: "bom" },
      { periodo: "noite", temperatura_ambiente: "", condicoes_climaticas: "bom" }
    ],
    acompanhamento_execucao: {
      remocao_material_existente: { sim: false, nao: false, na: false, km_bota_fora: "" },
      espalhamento_material_novo: { sim: false, nao: false, na: false, tipo_material: "" },
      compactacao_conforme_projeto: { sim: false, nao: false, na: false, rolo_liso: false, rolo_pneu: false, rolo_pe_carneiro: false },
      ensaio_viga_benkelman: { sim: false, nao: false, na: false },
      espessura_reciclada: "",
      teste_carga: { sim: false, nao: false, na: false },
      falha_compactacao: { sim: false, nao: false, na: false },
      observacoes: ""
    },
    ensaios_empreiteira: {
      compactacao_proctor: { realizado: false, quantidade: null, conforme: null, resultados: "", observacoes: "" },
      taxa_agregado: { realizado: false, quantidade: null, conforme: null, resultados: "", observacoes: "" },
      taxa_cimento: { realizado: false, quantidade: null, conforme: null, resultados: "", observacoes: "" },
      umidade_frigideira: { realizado: false, quantidade: null, conforme: null, resultados: "", observacoes: "" },
      massa_especifica_in_situ: { realizado: false, quantidade: null, conforme: null, resultados: "", observacoes: "" },
      granulometria: { realizado: false, quantidade: null, conforme: null, resultados: "", observacoes: "" },
      moldagem_resistencia: { realizado: false, quantidade: null, conforme: null, resultados: "", observacoes: "" },
      viga_benkelman: { realizado: false, quantidade: null, conforme: null, resultados: "", observacoes: "" },
      taxa_pintura_ligacao: { realizado: false, quantidade: null, conforme: null, resultados: "", observacoes: "" },
      finura_cimento: { realizado: false, quantidade: null, conforme: null, resultados: "", observacoes: "" }
    },
    observacoes_gerais: "",
    acoes_corretivas_realizado: null,
    acoes_corretivas_descricao: "",
    nao_conformidades: [],
    fotos: [],
    status: "rascunho"
  };
};

export default function ChecklistReciclagem() {
  const {
    obras, projects, user, editingChecklist,
    loading, formData, setFormData, obraSelecionada,
    isApproved, isEditable, clearSavedData, navigate,
  } = useChecklistForm(getInitialFormData, 'ChecklistReciclagem', 'checklist_reciclagem');

  const [saving, setSaving] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [selectedFileNames, setSelectedFileNames] = useState("Nenhum ficheiro selecionado");

  const handleCheckboxChange = (section, field, option) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: { ...prev[section][field], sim: option === 'sim', nao: option === 'nao', na: option === 'na' }
      }
    }));
  };

  const handleRoloChange = (rolo) => {
    setFormData(prev => ({
      ...prev,
      acompanhamento_execucao: {
        ...prev.acompanhamento_execucao,
        compactacao_conforme_projeto: {
          ...prev.acompanhamento_execucao.compactacao_conforme_projeto,
          [rolo]: !prev.acompanhamento_execucao.compactacao_conforme_projeto[rolo]
        }
      }
    }));
  };

  const handleEnsaioChange = (ensaio, field, value) => {
    setFormData(prev => ({
      ...prev,
      ensaios_empreiteira: {
        ...prev.ensaios_empreiteira,
        [ensaio]: { ...prev.ensaios_empreiteira[ensaio], [field]: value }
      }
    }));
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) { setSelectedFileNames("Nenhum ficheiro selecionado"); return; }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) { alert(`Tipo não suportado: ${file.type}`); e.target.value = ''; return; }
      if (file.size > 10 * 1024 * 1024) { alert(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB`); e.target.value = ''; return; }
    }

    setUploadingPhotos(true);
    setSelectedFileNames(files.length === 1 ? files[0].name : `${files.length} ficheiros selecionados`);
    const uploadedUrls = [];
    for (const file of files) {
      const result = await base44.integrations.Core.UploadFile({ file });
      uploadedUrls.push(result.file_url);
    }
    setFormData(prev => ({ ...prev, fotos: [...(prev.fotos || []), ...uploadedUrls] }));
    setUploadingPhotos(false);
    e.target.value = '';
  };

  const handleRemovePhoto = (index) => {
    setFormData(prev => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e, saveStatus = 'finalizado') => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!formData.obra_id) { alert("Por favor, selecione uma obra."); setSaving(false); return; }

      if (saveStatus === 'finalizado') {
        const required = [
          [formData.rodovia?.trim(), "Rodovia"],
          [formData.empreiteira?.trim(), "Empreiteira"],
          [formData.estaca?.trim(), "Estaca"],
          [formData.trecho?.trim(), "Trecho"],
          [formData.faixa?.trim(), "Faixa"],
          [formData.material?.trim(), "Material"],
          [formData.inspetor_fiscal?.trim(), "Inspetor de Campo"],
          [formData.jornada?.horario_inicio?.trim(), "Horário de Início"],
          [formData.jornada?.horario_fim?.trim(), "Horário Fim"],
        ];
        for (const [val, label] of required) {
          if (!val) { alert(`Por favor, preencha o campo ${label}.`); setSaving(false); return; }
        }
        for (const p of formData.periodos_clima) {
          if (!p.temperatura_ambiente && p.temperatura_ambiente !== 0) {
            alert(`Preencha a temperatura do período ${p.periodo === 'manha' ? 'Manhã' : p.periodo === 'tarde' ? 'Tarde' : 'Noite'}.`);
            setSaving(false); return;
          }
        }
        if (formData.acoes_corretivas_realizado === true && !formData.acoes_corretivas_descricao?.trim()) {
          alert("Por favor, descreva as ações corretivas realizadas."); setSaving(false); return;
        }
      }

      const dataToSave = {
        ...formData,
        status: saveStatus,
        periodos_clima: formData.periodos_clima.map(p => ({
          ...p, temperatura_ambiente: p.temperatura_ambiente ? parseFloat(p.temperatura_ambiente) : null
        })),
        ensaios_empreiteira: Object.fromEntries(
          Object.entries(formData.ensaios_empreiteira).map(([key, value]) => [
            key,
            value && typeof value === 'object' ? { ...value, quantidade: value.quantidade ? parseInt(value.quantidade) : null } : value
          ])
        )
      };

      if (editingChecklist?.id) {
        const updateData = { ...dataToSave };
        let msg = saveStatus === 'rascunho' ? "Progresso salvo com sucesso!" : "Checklist atualizado com sucesso!";
        if (editingChecklist.approved === false && saveStatus === 'finalizado') {
          updateData.approved = null; updateData.rejection_reason = null;
          updateData.approved_by = null; updateData.approved_date = null; updateData.was_rejected = true;
          msg = "Checklist atualizado com sucesso! O registro voltará para análise do administrador.";
        }
        await base44.entities.ChecklistReciclagem.update(editingChecklist.id, updateData);
        alert(msg);
      } else {
        await base44.entities.ChecklistReciclagem.create(dataToSave);
        alert(saveStatus === 'rascunho' ? "Progresso salvo com sucesso!" : "Checklist criado com sucesso!");
      }
      clearSavedData();
      navigate(createPageUrl("MeusEnsaios"));
    } catch (error) {
      alert(`Erro ao salvar checklist: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{editingChecklist ? 'Editar Checklist de Reciclagem' : 'Novo Checklist de Reciclagem'}</CardTitle>
            <CardDescription>
              {editingChecklist ? `Editando checklist de ${new Date(editingChecklist.data).toLocaleDateString('pt-BR')}` : 'Controle Tecnológico de Reciclagem'}
            </CardDescription>
            {formData.status === 'rascunho' && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-blue-800">Em Rascunho</p>
                  <p className="text-sm text-blue-700">Este registro ainda está em edição e não será visível aos gestores até que você o finalize.</p>
                </div>
              </div>
            )}
            {formData.approved === false && formData.rejection_reason && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-red-800">Registro Reprovado</p>
                  <p className="text-sm text-red-700">{formData.rejection_reason}</p>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="overflow-hidden">
            <form onSubmit={(e) => handleSubmit(e, 'finalizado')} className="space-y-6">

              {/* DADOS DA OBRA */}
              <Card className="bg-slate-50">
                <CardHeader><CardTitle className="text-lg">Dados da Obra</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Obra *</Label>
                      <Select value={formData.obra_id || ""} onValueChange={(v) => setFormData({ ...formData, obra_id: v, project_id: "", faixa: "" })} disabled={!!editingChecklist?.id || !isEditable}>
                        <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
                        <SelectContent>{obras.map(o => <SelectItem key={o.id} value={o.id}>{o.name} - {o.code}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Data *</Label>
                      <Input type="date" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} disabled={!isEditable} required />
                    </div>
                    <div>
                      <Label>Horário Início *</Label>
                      <Input type="time" value={formData.jornada?.horario_inicio || ""} onChange={(e) => setFormData({ ...formData, jornada: { ...formData.jornada, horario_inicio: e.target.value } })} disabled={!isEditable} required />
                    </div>
                    <div>
                      <Label>Horário Fim *</Label>
                      <Input type="time" value={formData.jornada?.horario_fim || ""} onChange={(e) => setFormData({ ...formData, jornada: { ...formData.jornada, horario_fim: e.target.value } })} disabled={!isEditable} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Rodovia *</Label>
                      <Select value={formData.rodovia} onValueChange={(v) => setFormData({ ...formData, rodovia: v })} disabled={!formData.obra_id || !isEditable}>
                        <SelectTrigger><SelectValue placeholder="Selecione a rodovia" /></SelectTrigger>
                        <SelectContent>{(obraSelecionada?.rodovias || []).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Empreiteira *</Label>
                      <Select value={formData.empreiteira} onValueChange={(v) => setFormData({ ...formData, empreiteira: v })} disabled={!formData.obra_id || !isEditable}>
                        <SelectTrigger><SelectValue placeholder="Selecione a empreiteira" /></SelectTrigger>
                        <SelectContent>{(obraSelecionada?.empreiteiras || []).map((em) => <SelectItem key={em} value={em}>{em}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Estaca *</Label>
                      <Input value={formData.estaca} onChange={(e) => setFormData({ ...formData, estaca: e.target.value })} disabled={!isEditable} placeholder="Ex: km 10+500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Projeto</Label>
                      <Select value={formData.project_id || ""} onValueChange={(v) => setFormData({ ...formData, project_id: v })} disabled={!formData.obra_id || !isEditable}>
                        <SelectTrigger><SelectValue placeholder="Selecione o projeto" /></SelectTrigger>
                        <SelectContent>{projects.filter(p => p.tipo_projeto === 'CAMADAS_GRANULARES').map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Trecho</Label>
                      <Input value={formData.trecho} onChange={(e) => setFormData({ ...formData, trecho: e.target.value })} disabled={!isEditable} placeholder="Descrição do trecho" />
                    </div>
                    <div>
                      <Label>Faixa</Label>
                      <Input value={formData.faixa} onChange={(e) => setFormData({ ...formData, faixa: e.target.value })} disabled={!isEditable} placeholder="Faixa especificada" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Material *</Label>
                      <Input value={formData.material} onChange={(e) => setFormData({ ...formData, material: e.target.value })} disabled={!isEditable} placeholder="Material utilizado" />
                    </div>
                    <div>
                      <Label>Inspetor de Campo</Label>
                      <Input value={formData.inspetor_fiscal} onChange={(e) => setFormData({ ...formData, inspetor_fiscal: e.target.value })} disabled={!isEditable} />
                    </div>
                    <div>
                      <Label>Ensaio realizado por:</Label>
                      <Select value={formData.ensaio_realizado_por || "Afirma Evias"} onValueChange={(v) => setFormData({ ...formData, ensaio_realizado_por: v })} disabled={!isEditable}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Afirma Evias">Afirma Evias</SelectItem>
                          <SelectItem value="Empreiteira">Empreiteira</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Card key={`clima-${index}`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base capitalize">{periodo.periodo === 'manha' ? 'Manhã' : periodo.periodo === 'tarde' ? 'Tarde' : 'Noite'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-sm">Temperatura (°C) *</Label>
                            <Input type="number" step="0.1" value={periodo.temperatura_ambiente} disabled={!isEditable}
                              onChange={(e) => { const p = [...formData.periodos_clima]; p[index].temperatura_ambiente = e.target.value; setFormData({ ...formData, periodos_clima: p }); }} required />
                          </div>
                          <div>
                            <Label className="text-sm">Condições *</Label>
                            <Select value={periodo.condicoes_climaticas} disabled={!isEditable}
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

              {/* ACOMPANHAMENTO EXECUÇÃO */}
              <Card className="bg-slate-50">
                <SectionTitle>Acompanhamento Execução da Camada</SectionTitle>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-300 text-sm">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-300 px-2 py-2 text-left font-medium">Controle</th>
                          <th className="border border-slate-300 px-2 py-2 text-center font-medium w-32">Resposta</th>
                          <th className="border border-slate-300 px-2 py-2 text-left font-medium">Observações</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-300 px-2 py-2 bg-slate-50">Foi realizado remoção de material existente?</td>
                          <td className="border border-slate-300 px-2 py-2">
                            <CheckboxGroup value={formData.acompanhamento_execucao.remocao_material_existente} onChange={(opt) => handleCheckboxChange('acompanhamento_execucao', 'remocao_material_existente', opt)} />
                          </td>
                          <td className="border border-slate-300 px-2 py-2">
                            <Input placeholder="KM DO BOTA FORA" value={formData.acompanhamento_execucao.remocao_material_existente.km_bota_fora || ""} disabled={!isEditable}
                              onChange={(e) => setFormData(prev => ({ ...prev, acompanhamento_execucao: { ...prev.acompanhamento_execucao, remocao_material_existente: { ...prev.acompanhamento_execucao.remocao_material_existente, km_bota_fora: e.target.value } } }))}
                              className="h-8 text-sm" />
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 px-2 py-2 bg-slate-50">Foi espalhado material novo para construção da camada?</td>
                          <td className="border border-slate-300 px-2 py-2">
                            <CheckboxGroup value={formData.acompanhamento_execucao.espalhamento_material_novo} onChange={(opt) => handleCheckboxChange('acompanhamento_execucao', 'espalhamento_material_novo', opt)} />
                          </td>
                          <td className="border border-slate-300 px-2 py-2">
                            <Input placeholder="TIPO DE MATERIAL" value={formData.acompanhamento_execucao.espalhamento_material_novo.tipo_material || ""} disabled={!isEditable}
                              onChange={(e) => setFormData(prev => ({ ...prev, acompanhamento_execucao: { ...prev.acompanhamento_execucao, espalhamento_material_novo: { ...prev.acompanhamento_execucao.espalhamento_material_novo, tipo_material: e.target.value } } }))}
                              className="h-8 text-sm" />
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 px-2 py-2 bg-slate-50">
                            A compactação da camada foi realizada em conformidade à energia de projeto?
                            <div className="flex gap-4 mt-2 ml-4">
                              {['rolo_pe_carneiro', 'rolo_liso', 'rolo_pneu'].map(rolo => (
                                <label key={rolo} className="flex items-center gap-1">
                                  <input type="checkbox" checked={formData.acompanhamento_execucao.compactacao_conforme_projeto[rolo]} onChange={() => handleRoloChange(rolo)} className="w-4 h-4" disabled={!isEditable} />
                                  <span className="text-xs">{rolo === 'rolo_pe_carneiro' ? 'ROLO PÉ DE CARNEIRO' : rolo === 'rolo_liso' ? 'ROLO LISO' : 'ROLO PNEU'}</span>
                                </label>
                              ))}
                            </div>
                          </td>
                          <td className="border border-slate-300 px-2 py-2">
                            <CheckboxGroup value={formData.acompanhamento_execucao.compactacao_conforme_projeto} onChange={(opt) => handleCheckboxChange('acompanhamento_execucao', 'compactacao_conforme_projeto', opt)} />
                          </td>
                          <td className="border border-slate-300 px-2 py-2"></td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 px-2 py-2 bg-slate-50">Foi realizado ensaio de viga Benkelman para liberação da camada?</td>
                          <td className="border border-slate-300 px-2 py-2">
                            <CheckboxGroup value={formData.acompanhamento_execucao.ensaio_viga_benkelman} onChange={(opt) => handleCheckboxChange('acompanhamento_execucao', 'ensaio_viga_benkelman', opt)} />
                          </td>
                          <td className="border border-slate-300 px-2 py-2"></td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 px-2 py-2 bg-slate-50">Espessura Reciclada?</td>
                          <td className="border border-slate-300 px-2 py-2" colSpan="2">
                            <Input placeholder="Informe a espessura" value={formData.acompanhamento_execucao.espessura_reciclada || ""} disabled={!isEditable}
                              onChange={(e) => setFormData(prev => ({ ...prev, acompanhamento_execucao: { ...prev.acompanhamento_execucao, espessura_reciclada: e.target.value } }))}
                              className="h-8 text-sm" />
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 px-2 py-2 bg-slate-50">Foi realizado teste de carga para liberação da camada?</td>
                          <td className="border border-slate-300 px-2 py-2">
                            <CheckboxGroup value={formData.acompanhamento_execucao.teste_carga} onChange={(opt) => handleCheckboxChange('acompanhamento_execucao', 'teste_carga', opt)} />
                          </td>
                          <td className="border border-slate-300 px-2 py-2"></td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 px-2 py-2 bg-slate-50">Há algum ponto de falha de compactação (borrachudo)?</td>
                          <td className="border border-slate-300 px-2 py-2">
                            <CheckboxGroup value={formData.acompanhamento_execucao.falha_compactacao} onChange={(opt) => handleCheckboxChange('acompanhamento_execucao', 'falha_compactacao', opt)} />
                          </td>
                          <td className="border border-slate-300 px-2 py-2"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4">
                    <Label>Observações do Acompanhamento</Label>
                    <Textarea value={formData.acompanhamento_execucao.observacoes} disabled={!isEditable}
                      onChange={(e) => setFormData(prev => ({ ...prev, acompanhamento_execucao: { ...prev.acompanhamento_execucao, observacoes: e.target.value } }))}
                      rows={2} placeholder="Observações sobre o acompanhamento..." />
                  </div>
                </CardContent>
              </Card>

              {/* ENSAIOS DA EMPREITEIRA */}
              <Card className="bg-slate-50">
                <CardHeader><CardTitle className="text-lg">Acompanhamento dos Ensaios Realizados pela Empreiteira</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-300 text-sm">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-300 px-2 py-2 text-left font-medium">Ensaios</th>
                          <th className="border border-slate-300 px-2 py-2 text-center font-medium w-24">Realizado</th>
                          <th className="border border-slate-300 px-2 py-2 text-center font-medium w-20">Qtde</th>
                          <th className="border border-slate-300 px-2 py-2 text-center font-medium w-32">Conformidade</th>
                          <th className="border border-slate-300 px-2 py-2 text-left font-medium">Resultado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { key: 'compactacao_proctor', label: 'Compactação - Proctor' },
                          { key: 'taxa_agregado', label: 'Taxa de agregado' },
                          { key: 'taxa_cimento', label: 'Taxa de cimento' },
                          { key: 'umidade_frigideira', label: 'Umidade pelo método expedito da "frigideira"' },
                          { key: 'massa_especifica_in_situ', label: 'Determinação da massa específica aparente seca "in situ"' },
                          { key: 'granulometria', label: 'Análise granulométrica por peneiramento' },
                          { key: 'moldagem_resistencia', label: 'Moldagem para resistência' },
                          { key: 'viga_benkelman', label: 'Viga Benkelman' },
                          { key: 'taxa_pintura_ligacao', label: 'Taxa de pintura de ligação' },
                          { key: 'finura_cimento', label: 'Determinação da finura do cimento' }
                        ].map(ensaio => (
                          <tr key={ensaio.key}>
                            <td className="border border-slate-300 px-2 py-2 bg-slate-50">{ensaio.label}</td>
                            <td className="border border-slate-300 px-2 py-1 text-center">
                              <input type="checkbox" checked={formData.ensaios_empreiteira[ensaio.key].realizado} disabled={!isEditable}
                                onChange={(e) => handleEnsaioChange(ensaio.key, 'realizado', e.target.checked)} className="w-4 h-4" />
                            </td>
                            <td className="border border-slate-300 px-1 py-1">
                              <Input type="number" min="0" value={formData.ensaios_empreiteira[ensaio.key].quantidade || ''} disabled={!formData.ensaios_empreiteira[ensaio.key].realizado || !isEditable}
                                onChange={(e) => handleEnsaioChange(ensaio.key, 'quantidade', e.target.value)} className="h-8 text-sm text-center" placeholder="0" />
                            </td>
                            <td className="border border-slate-300 px-2 py-1">
                              <div className="flex gap-2 justify-center">
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input type="checkbox" checked={formData.ensaios_empreiteira[ensaio.key].conforme === true} disabled={!formData.ensaios_empreiteira[ensaio.key].realizado || !isEditable}
                                    onChange={(e) => handleEnsaioChange(ensaio.key, 'conforme', e.target.checked ? true : null)} className="w-4 h-4 accent-green-500" />
                                  <span className="text-xs text-green-600">✓</span>
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input type="checkbox" checked={formData.ensaios_empreiteira[ensaio.key].conforme === false} disabled={!formData.ensaios_empreiteira[ensaio.key].realizado || !isEditable}
                                    onChange={(e) => handleEnsaioChange(ensaio.key, 'conforme', e.target.checked ? false : null)} className="w-4 h-4 accent-red-500" />
                                  <span className="text-xs text-red-600">✗</span>
                                </label>
                              </div>
                            </td>
                            <td className="border border-slate-300 px-1 py-1">
                              <Input value={formData.ensaios_empreiteira[ensaio.key].resultados} disabled={!formData.ensaios_empreiteira[ensaio.key].realizado || !isEditable}
                                onChange={(e) => handleEnsaioChange(ensaio.key, 'resultados', e.target.value)} className="h-8 text-sm" placeholder="Resultado" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* OBSERVAÇÕES GERAIS */}
              <div>
                <Label>Observações Gerais</Label>
                <Textarea value={formData.observacoes_gerais} disabled={!isEditable}
                  onChange={(e) => setFormData({ ...formData, observacoes_gerais: e.target.value })}
                  rows={3} placeholder="Observações gerais sobre o checklist..." maxLength={500} />
                <p className="text-xs text-right text-slate-500 mt-1">{formData.observacoes_gerais?.length || 0} / 500</p>
              </div>

              {/* AÇÕES CORRETIVAS / NÃO CONFORMIDADES */}
              <AcoesCorretivasNC
                acoesRealizadas={formData.acoes_corretivas_realizado}
                acoesDescricao={formData.acoes_corretivas_descricao}
                naoConformidades={formData.nao_conformidades || []}
                onAcoesRealizadasChange={(value) => setFormData(prev => ({ ...prev, acoes_corretivas_realizado: value, acoes_corretivas_descricao: value === false ? "" : prev.acoes_corretivas_descricao }))}
                onAcoesDescricaoChange={(value) => setFormData(prev => ({ ...prev, acoes_corretivas_descricao: value }))}
                onNaoConformidadesChange={(ncs) => setFormData(prev => ({ ...prev, nao_conformidades: ncs }))}
                disabled={!isEditable}
                locaisPermitidos={["CAMPO"]}
                instanceId="reciclagem"
              />

              {/* FOTOS */}
              <div>
                <Label>Registro Fotográfico</Label>
                {isEditable && (
                  <div>
                    <Input id="fotos-rec" type="file" multiple accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onChange={handleFileChange} disabled={uploadingPhotos} className="hidden" />
                    <Label htmlFor="fotos-rec" className={`flex items-center justify-between w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm cursor-pointer hover:bg-slate-50 ${uploadingPhotos ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <span className="truncate text-slate-500">{selectedFileNames}</span>
                      <span className="flex-shrink-0 ml-4 px-3 py-1 rounded-md text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100">
                        {uploadingPhotos ? 'Enviando...' : 'Escolher Ficheiros'}
                      </span>
                    </Label>
                  </div>
                )}
                {uploadingPhotos && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Fazendo upload das fotos...</span>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {(formData.fotos || []).map((url, index) => (
                    <div key={index} className="relative group">
                      <picture><source srcSet={url} /><img src={url} alt={`Foto ${index + 1}`} className="w-full h-32 object-cover rounded-md border" width="auto" height="128" /></picture>
                      {isEditable && (
                        <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemovePhoto(index)}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <ChecklistFooter
                isEditable={isEditable}
                isApproved={isApproved}
                loadingUpload={saving || uploadingPhotos}
                onCancel={() => { clearSavedData(); navigate(createPageUrl('MeusEnsaios')); }}
                onSaveProgress={async (e) => { e.preventDefault(); await handleSubmit(e, 'rascunho'); }}
                onFinalize={() => {}}
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}