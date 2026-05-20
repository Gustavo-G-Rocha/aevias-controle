import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2, CheckCircle, Clock, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useEnsaioForm } from "@/hooks/useEnsaioForm";
import { PENEIRAS_CONFIG, filtrarPeneirasPorFaixa } from "@/constants/sieves";



const getInitialFormData = () => ({
  obra_id: "",
  project_id: "",
  data_ensaio: new Date().toISOString().split('T')[0],
  horario: "",
  placa_caminhao: "",
  local_coleta: "",
  usina_fornecedora: "",
  pedreira: "",
  rodovia: "",
  trecho: "",
  tipo_ligante: "",
  temperatura_cap: null,
  faixa_especificada: "",
  ensaio_realizado_por: "Afirma Evias",
  extracao_ligante: {
    amostra_umida: null,
    amostra_seca: null,
    umidade: null,
    amostra_com_ligante: null,
    amostra_sem_ligante: null,
    fator_correcao: 1.0,
    peso_ligante: null,
    teor_ligante: null,
    residuo_emulsao: null,
    percentual_emulsao: null
  },
  granulometria: {
    peso_retido_peneiras: {}
  },
  observacoes: "",
  status: "rascunho",
  approved: null,
  rejection_reason: null
});

export default function EnsaioMRAFPage() {
  const {
    obras, regionais, projects, faixas, user,
    editingEnsaio, setEditingEnsaio,
    loading, formData, setFormData,
    obraSelecionada, regionalSelecionada, projetosDisponiveis,
    isApproved, isEditable, clearSavedData, navigate,
  } = useEnsaioForm(getInitialFormData, 'EnsaioMRAF', 'ensaio_mraf');

  const [saving, setSaving] = useState(false);

  const selectedProject = useMemo(() =>
    projects.find(p => p.id === formData.project_id),
    [projects, formData.project_id]
  );

  const selectedFaixa = useMemo(() => {
    if (!selectedProject || !selectedProject.faixa_granulometrica_id) return null;
    return faixas.find(f => f.id === selectedProject.faixa_granulometrica_id);
  }, [selectedProject, faixas]);

  const peneirasDoProjecto = useMemo(() => filtrarPeneirasPorFaixa(selectedFaixa, PENEIRAS_CONFIG), [selectedFaixa]);

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Atualiza um campo dentro de uma seção aninhada (ex: extracao_ligante, granulometria)
  // Evita path strings dinâmicos que disparam avisos de prototype pollution
  const handleNestedChange = useCallback((section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  }, []);

  // Cálculo automático da extração de ligante
  useEffect(() => { // eslint-disable-line react-hooks/exhaustive-deps
    const ext = formData.extracao_ligante;
    
    if (ext.amostra_umida && ext.amostra_seca) {
      const umidade = ((ext.amostra_umida - ext.amostra_seca) / ext.amostra_seca) * 100;
      handleNestedChange('extracao_ligante', 'umidade', parseFloat(umidade.toFixed(2)));
    }

    if (ext.amostra_com_ligante && ext.amostra_sem_ligante && ext.fator_correcao) {
      const pesoLigante = (ext.amostra_com_ligante - ext.amostra_sem_ligante) * ext.fator_correcao;
      const teorLigante = (pesoLigante / ext.amostra_sem_ligante) * 100;
      handleNestedChange('extracao_ligante', 'peso_ligante', parseFloat(pesoLigante.toFixed(2)));
      handleNestedChange('extracao_ligante', 'teor_ligante', parseFloat(teorLigante.toFixed(2)));
    }

    // Cálculo do % de emulsão
    if (ext.teor_ligante && ext.residuo_emulsao) {
      const percentualEmulsao = (ext.teor_ligante / ext.residuo_emulsao) * 100;
      handleNestedChange('extracao_ligante', 'percentual_emulsao', parseFloat(percentualEmulsao.toFixed(2)));
    }
  }, [
    formData.extracao_ligante.amostra_umida,
    formData.extracao_ligante.amostra_seca,
    formData.extracao_ligante.amostra_com_ligante,
    formData.extracao_ligante.amostra_sem_ligante,
    formData.extracao_ligante.fator_correcao,
    formData.extracao_ligante.teor_ligante,
    formData.extracao_ligante.residuo_emulsao,
    handleNestedChange
  ]);

  const handleProjectChange = useCallback((projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      setFormData(prev => ({ ...prev, project_id: "" }));
      return;
    }

    const faixa = faixas.find(f => f.id === project.faixa_granulometrica_id);
    
    let pedreira = "";
    if (project.agregados && project.agregados.length > 0) {
      const pedreiras = project.agregados
        .map(ag => ag.pedreira)
        .filter(p => p)
        .filter((p, idx, arr) => arr.indexOf(p) === idx);
      pedreira = pedreiras.join(", ");
    }

    setFormData(prev => ({
      ...prev,
      project_id: projectId,
      faixa_especificada: faixa ? faixa.nome : "Não definida",
      tipo_ligante: project.ligante?.tipo || "",
      pedreira: pedreira
    }));
  }, [projects, faixas]);

  const handleSaveProgress = async () => {
    if (!formData.obra_id) {
      alert("Por favor, selecione uma obra para salvar o progresso.");
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        status: "rascunho",
        laboratorista_name: user?.laboratorista_name || user?.full_name
      };

      if (editingEnsaio?.id) {
        await base44.entities.EnsaioMRAF.update(editingEnsaio.id, dataToSave);
        alert("Progresso salvo com sucesso!");
      } else {
        const newEnsaio = await base44.entities.EnsaioMRAF.create(dataToSave);
        setEditingEnsaio(newEnsaio);
        alert("Progresso salvo com sucesso!");
      }
      clearSavedData();
    } catch (error) {
      console.error("Erro ao salvar progresso:", error);
      alert("Erro ao salvar progresso.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.obra_id) {
      alert("Por favor, selecione uma obra.");
      return;
    }

    if (!formData.data_ensaio) {
      alert("Por favor, informe a data do ensaio.");
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        status: "finalizado",
        laboratorista_name: user?.laboratorista_name || user?.full_name
      };

      if (editingEnsaio?.id) {
        const updateData = { ...dataToSave };
        if (editingEnsaio.approved === false) {
          updateData.approved = null;
          updateData.rejection_reason = null;
          updateData.approved_by = null;
          updateData.approved_date = null;
          await base44.entities.EnsaioMRAF.update(editingEnsaio.id, updateData);
          alert("Ensaio finalizado com sucesso! O registro voltará para análise.");
        } else {
          await base44.entities.EnsaioMRAF.update(editingEnsaio.id, updateData);
          alert("Ensaio finalizado com sucesso!");
        }
      } else {
        await base44.entities.EnsaioMRAF.create(dataToSave);
        alert("Ensaio criado e finalizado com sucesso!");
      }
      clearSavedData();
      navigate(createPageUrl('MeusEnsaios'));
    } catch (error) {
      console.error("Erro ao finalizar ensaio:", error);
      alert("Erro ao finalizar ensaio.");
    } finally {
      setSaving(false);
    }
  };

  const projetosMRAF = useMemo(() =>
    projetosDisponiveis.filter(p => p.tipo_projeto === 'MRAF'),
    [projetosDisponiveis]
  );

  const usinasDisponiveis = useMemo(() => {
    if (!obraSelecionada) return [];
    return obraSelecionada.usinas || [];
  }, [obraSelecionada]);

  const rodoviasDisponiveis = useMemo(() => {
    if (!obraSelecionada) return [];
    return obraSelecionada.rodovias || [];
  }, [obraSelecionada]);



  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{editingEnsaio?.id ? "Editar Ensaio MRAF" : "Novo Ensaio MRAF"}</CardTitle>
            <CardDescription>
              {editingEnsaio?.id ? `Editando ensaio de ${new Date(editingEnsaio.data_ensaio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}` : "Extração e Granulometria de MRAF"}
            </CardDescription>
            {formData.status === 'rascunho' && (
              <div className="mt-4 flex items-start gap-2 p-3 bg-[#BFCF99]/20 border border-[#BFCF99]/40 rounded-lg">
                <Clock className="w-5 h-5 text-[#566E3D] mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[#566E3D]">Registro em Rascunho</p>
                  <p className="text-sm text-[#00233B]/70">Este ensaio está salvo como rascunho. Clique em "Finalizar Registro" quando estiver completo.</p>
                </div>
              </div>
            )}
            {editingEnsaio?.rejection_reason && (
              <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-red-800">Motivo da Reprovação:</p>
                  <p className="text-sm text-red-700">{editingEnsaio.rejection_reason}</p>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') {
                e.preventDefault();
              }
            }} className="space-y-6">
              {/* DADOS DA OBRA */}
              <Card className="bg-slate-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Dados da Obra</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="obra_id">Obra *</Label>
                      <select
                        id="obra_id"
                        value={formData.obra_id}
                        onChange={(e) => handleChange('obra_id', e.target.value)}
                        required
                        disabled={!isEditable || isApproved || editingEnsaio?.id}
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">Selecione a obra</option>
                        {obras.map(obra => {
                          const regional = regionais.find(r => r.id === obra.regional_id);
                          return (
                            <option key={obra.id} value={obra.id}>
                              {obra.name} - {obra.code} {regional && `(${regional.nome})`}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="project_id">Projeto MRAF</Label>
                      <select
                        id="project_id"
                        value={formData.project_id}
                        onChange={(e) => handleProjectChange(e.target.value)}
                        disabled={!isEditable || isApproved || !formData.obra_id}
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">Selecione um projeto</option>
                        {projetosMRAF.map(proj => (
                          <option key={proj.id} value={proj.id}>
                            {proj.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {regionalSelecionada && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <div className="space-y-0.5 text-sm">
                        <p className="text-blue-800"><strong>📍 Regional:</strong> {regionalSelecionada.nome}</p>
                        {regionalSelecionada.cliente && (
                          <p className="text-blue-800"><strong>👤 Cliente:</strong> {regionalSelecionada.cliente}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="data_ensaio">Data *</Label>
                      <Input
                        id="data_ensaio"
                        type="date"
                        value={formData.data_ensaio}
                        onChange={(e) => handleChange('data_ensaio', e.target.value)}
                        required={formData.status === 'finalizado'}
                        disabled={!isEditable || isApproved}
                        />
                    </div>

                    <div>
                      <Label htmlFor="horario">Horário</Label>
                      <Input
                        id="horario"
                        type="time"
                        value={formData.horario}
                        onChange={(e) => handleChange('horario', e.target.value)}
                        disabled={!isEditable || isApproved}
                      />
                    </div>

                    <div>
                      <Label htmlFor="placa_caminhao">Placa Caminhão</Label>
                      <Input
                        id="placa_caminhao"
                        value={formData.placa_caminhao}
                        onChange={(e) => handleChange('placa_caminhao', e.target.value)}
                        disabled={!isEditable || isApproved}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="rodovia">Rodovia</Label>
                      {rodoviasDisponiveis.length > 0 ? (
                        <select
                          id="rodovia"
                          value={formData.rodovia}
                          onChange={(e) => handleChange('rodovia', e.target.value)}
                          disabled={!isEditable || isApproved}
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                        >
                          <option value="">Selecione a rodovia</option>
                          {rodoviasDisponiveis.map((rodovia, idx) => (
                            <option key={idx} value={rodovia}>
                              {rodovia}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          id="rodovia"
                          value={formData.rodovia}
                          onChange={(e) => handleChange('rodovia', e.target.value)}
                          disabled={!isEditable || isApproved}
                          placeholder={formData.obra_id ? "Nenhuma rodovia cadastrada na obra" : "Selecione a obra primeiro"}
                        />
                      )}
                    </div>

                    <div>
                      <Label htmlFor="trecho">Trecho</Label>
                      <Input
                        id="trecho"
                        value={formData.trecho}
                        onChange={(e) => handleChange('trecho', e.target.value)}
                        disabled={!isEditable || isApproved}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="local_coleta">Local de Coleta</Label>
                    <Input
                      id="local_coleta"
                      value={formData.local_coleta}
                      onChange={(e) => handleChange('local_coleta', e.target.value)}
                      disabled={!isEditable || isApproved}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pedreira">Pedreira</Label>
                      <Input
                        id="pedreira"
                        value={formData.pedreira}
                        onChange={(e) => handleChange('pedreira', e.target.value)}
                        disabled={!isEditable || isApproved}
                      />
                    </div>

                    <div>
                      <Label htmlFor="faixa_especificada">Faixa Especificada</Label>
                      <Input
                        id="faixa_especificada"
                        value={formData.faixa_especificada}
                        onChange={(e) => handleChange('faixa_especificada', e.target.value)}
                        disabled={!isEditable || isApproved}
                        readOnly={!!selectedProject}
                        className={selectedProject ? "bg-slate-100" : ""}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="tipo_ligante">Tipo de Ligante</Label>
                      <Input
                        id="tipo_ligante"
                        value={formData.tipo_ligante}
                        onChange={(e) => handleChange('tipo_ligante', e.target.value)}
                        disabled={!isEditable || isApproved}
                        readOnly={!!selectedProject}
                        className={selectedProject ? "bg-slate-100" : ""}
                      />
                    </div>

                    <div>
                      <Label htmlFor="ensaio_realizado_por">Ensaio realizado por:</Label>
                      <select
                        id="ensaio_realizado_por"
                        value={formData.ensaio_realizado_por}
                        onChange={(e) => handleChange('ensaio_realizado_por', e.target.value)}
                        disabled={!isEditable || isApproved}
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="Afirma Evias">Afirma Evias</option>
                        <option value="Empreiteira">Empreiteira</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* EXTRAÇÃO DE LIGANTE */}
              <Card className="bg-slate-50">
                <CardHeader>
                  <CardTitle className="text-lg">Extração de Ligante (Rotarex) *</CardTitle>
                  <CardDescription>DNIT 427/20 - ABNT NBR 15619/16</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Amostra Úmida (g) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.extracao_ligante.amostra_umida || ''}
                        onChange={(e) => handleNestedChange('extracao_ligante', 'amostra_umida', e.target.value ? parseFloat(e.target.value) : null)}
                        disabled={!isEditable || isApproved}
                        required={formData.status === 'finalizado'}
                      />
                    </div>

                    <div>
                      <Label>Amostra Seca (g) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.extracao_ligante.amostra_seca || ''}
                        onChange={(e) => handleNestedChange('extracao_ligante', 'amostra_seca', e.target.value ? parseFloat(e.target.value) : null)}
                        disabled={!isEditable || isApproved}
                        required={formData.status === 'finalizado'}
                      />
                    </div>

                    <div>
                      <Label>Umidade (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.extracao_ligante.umidade || ''}
                        readOnly
                        className="bg-slate-100"
                      />
                    </div>

                    <div>
                      <Label>Amostra com Ligante (g) {formData.status === 'finalizado' && '*'}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.extracao_ligante.amostra_com_ligante || ''}
                        onChange={(e) => handleNestedChange('extracao_ligante', 'amostra_com_ligante', e.target.value ? parseFloat(e.target.value) : null)}
                        disabled={!isEditable || isApproved}
                        required={formData.status === 'finalizado'}
                      />
                    </div>

                    <div>
                      <Label>Amostra sem Ligante (g) {formData.status === 'finalizado' && '*'}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.extracao_ligante.amostra_sem_ligante || ''}
                        onChange={(e) => handleNestedChange('extracao_ligante', 'amostra_sem_ligante', e.target.value ? parseFloat(e.target.value) : null)}
                        disabled={!isEditable || isApproved}
                        required={formData.status === 'finalizado'}
                      />
                    </div>

                    <div>
                      <Label>Fator de Correção</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.extracao_ligante.fator_correcao || 1.0}
                        onChange={(e) => handleNestedChange('extracao_ligante', 'fator_correcao', e.target.value ? parseFloat(e.target.value) : 1.0)}
                        disabled={!isEditable || isApproved}
                      />
                    </div>

                    <div>
                      <Label>Peso do Ligante (g)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.extracao_ligante.peso_ligante || ''}
                        readOnly
                        className="bg-slate-100"
                      />
                    </div>

                    <div>
                      <Label>Teor de Ligante (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.extracao_ligante.teor_ligante || ''}
                        readOnly
                        className="bg-slate-100"
                      />
                    </div>

                    <div>
                      <Label>Resíduo da Emulsão (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.extracao_ligante.residuo_emulsao || ''}
                        onChange={(e) => handleNestedChange('extracao_ligante', 'residuo_emulsao', e.target.value ? parseFloat(e.target.value) : null)}
                        disabled={!isEditable || isApproved}
                      />
                    </div>

                    <div>
                      <Label>% de Emulsão</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.extracao_ligante.percentual_emulsao || ''}
                        readOnly
                        className="bg-green-50 font-semibold"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* GRANULOMETRIA */}
              <Card className="bg-slate-50">
                <CardHeader>
                  <CardTitle className="text-lg">Granulometria *</CardTitle>
                  <CardDescription>DNIT 412/2025</CardDescription>
                  {formData.extracao_ligante.amostra_sem_ligante && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-800">
                        <strong>Peso Inicial da Amostra (sem ligante):</strong> {formData.extracao_ligante.amostra_sem_ligante} g
                      </p>
                    </div>
                  )}
                  {!selectedProject && (
                    <p className="text-sm text-amber-600 mt-2">
                      ⚠️ Selecione um projeto para ver apenas as peneiras da faixa especificada
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  {peneirasDoProjecto.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <p>Nenhuma peneira disponível. Selecione um projeto com faixa granulométrica configurada.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 px-2 py-2 text-left">Peneira ASTM</th>
                            <th className="border border-slate-300 px-2 py-2 text-left">Abertura (mm)</th>
                            <th className="border border-slate-300 px-2 py-2 text-center">Retido (g)</th>
                            <th className="border border-slate-300 px-2 py-2 text-center">% Passante</th>
                          </tr>
                        </thead>
                        <tbody>
                          {peneirasDoProjecto.map((peneira, index) => {
                            const pesoInicial = formData.extracao_ligante?.amostra_sem_ligante || 0;
                            let acumuladoRetido = 0;
                            
                            for (let i = 0; i <= index; i++) {
                              const p = peneirasDoProjecto[i];
                              acumuladoRetido += formData.granulometria.peso_retido_peneiras?.[p.key] || 0;
                            }
                            
                            const percentualPassante = pesoInicial > 0 
                              ? ((pesoInicial - acumuladoRetido) / pesoInicial * 100).toFixed(1)
                              : '-';
                            
                            return (
                              <tr key={peneira.key}>
                                <td className="border border-slate-300 px-2 py-2 font-medium">{peneira.label}</td>
                                <td className="border border-slate-300 px-2 py-2">{peneira.abertura}</td>
                                <td className="border border-slate-300 px-1 py-1">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.granulometria.peso_retido_peneiras?.[peneira.key] || ''}
                                    onChange={(e) => {
                                     const newPesos = { ...formData.granulometria.peso_retido_peneiras, [peneira.key]: e.target.value ? parseFloat(e.target.value) : null };
                                     handleNestedChange('granulometria', 'peso_retido_peneiras', newPesos);
                                    }}
                                    disabled={!isEditable || isApproved}
                                    className="h-8 text-sm"
                                  />
                                </td>
                                <td className="border border-slate-300 px-2 py-2 text-center font-semibold text-blue-600">
                                  {percentualPassante}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* OBSERVAÇÕES */}
              <div>
                <Label htmlFor="observacoes">Observações Gerais</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleChange('observacoes', e.target.value)}
                  disabled={!isEditable || isApproved}
                  rows={3}
                  maxLength="500"
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <Button type="button" variant="outline" onClick={() => {
                  clearSavedData();
                  navigate(createPageUrl('MeusEnsaios'));
                }} disabled={saving}>
                  Cancelar
                </Button>
                {isEditable && !isApproved && (
                  <>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleSaveProgress}
                      disabled={saving || !formData.obra_id}
                      className="border-[#BFCF99] text-[#00233B] hover:bg-[#BFCF99]/10"
                    >
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Salvar Progresso
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                      Finalizar Registro
                    </Button>
                  </>
                )}
                {isApproved && (
                  <Badge className="bg-green-500 hover:bg-green-500 px-4 py-2 text-md">
                    <CheckCircle className="mr-2 h-4 w-4" /> Aprovado
                  </Badge>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}