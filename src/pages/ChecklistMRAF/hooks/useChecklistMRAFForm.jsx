import { useState, useCallback, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useChecklistForm } from "@/hooks/useChecklistForm";
import { buildDataToSave, validateForm } from "../utils/checklistMRAFMapper";

const getInitialFormData = () => ({
  obra_id: "",
  project_id: "",
  data: new Date().toISOString().split('T')[0],
  jornada: { horario_inicio: "", horario_fim: "" },
  rodovia: "",
  trecho: "",
  empreiteira: "",
  usina: "",
  projeto_utilizado: "",
  faixa_especificada: "",
  ligante: "",
  pedreira: "",
  inspetor_campo: "",
  ensaio_realizado_por: "Afirma Evias",
  periodos_clima: [
    { periodo: "manha", temperatura_ambiente: null, condicoes_climaticas: "bom" },
    { periodo: "tarde", temperatura_ambiente: null, condicoes_climaticas: "bom" },
  ],
  condicionamento_insumos: {
    agregados_separados: null,
    agregados_cobertos: null,
    filler_utilizado: "",
    utilizacao_aditivos: null,
    agua_contaminada: null,
    observacoes: "",
  },
  preparacao_superficie: {
    superficie_umida: null,
    temperatura_pavimento: null,
    pavimento_patologias: null,
    superficie_fresada: null,
    superficie_limpa: null,
    observacoes: "",
  },
  acompanhamento_aplicacao: {
    tempo_rompimento_cura: { realizado: null, resultado: "" },
    taxa_aplicacao: { realizado: null, resultado: null, conforme: null },
    residuo_emulsao: { realizado: null, resultado: null, conforme: null },
    espessura_camada: { realizado: null, resultado: null, conforme: null },
    observacoes: "",
  },
  controle_aplicacao: {
    km_estaca_inicial: "",
    lado_inicial: "direito",
    km_estaca_final: "",
    lado_final: "direito",
    quantidade_aplicada_m2: null,
    observacoes: "",
  },
  observacoes_gerais: "",
  acoes_corretivas_realizado: null,
  acoes_corretivas_descricao: "",
  nao_conformidades: [],
  fotos: [],
  status: "rascunho",
  approved: null,
  rejection_reason: null,
});

export function useChecklistMRAFForm() {
  const {
    obras, regionais, projects, faixas, user, editingChecklist,
    loading, formData, setFormData, obraSelecionada, regionalSelecionada,
    isApproved, isEditable, clearSavedData, navigate,
  } = useChecklistForm(getInitialFormData, 'ChecklistMRAF', 'checklist_mraf');

  const [loadingUpload, setLoadingUpload] = useState(false);
  const [selectedFileNames, setSelectedFileNames] = useState("Nenhum ficheiro selecionado");
  const [uploadProgress, setUploadProgress] = useState([]);

  const projetosDisponiveis = useMemo(() => {
    if (!regionalSelecionada || !projects) return [];
    return projects.filter(p =>
      (regionalSelecionada.project_ids || []).includes(p.id) &&
      p.status === 'ativo' &&
      p.tipo_projeto === 'MRAF'
    );
  }, [regionalSelecionada, projects]);

  const selectedProject = useMemo(() =>
    projects.find(p => p.id === formData.project_id),
    [projects, formData.project_id]
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [setFormData]);

  const handleObraChange = useCallback((obraId) => {
    setFormData(prev => ({ ...prev, obra_id: obraId, project_id: "" }));
  }, [setFormData]);

  const handleProjectChange = useCallback((projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) { setFormData(prev => ({ ...prev, project_id: "" })); return; }
    const faixa = faixas.find(f => f.id === project.faixa_granulometrica_id);
    const pedreiras = [...new Set((project.agregados || []).map(ag => ag.pedreira).filter(Boolean))].join(' + ');
    setFormData(prev => ({
      ...prev,
      project_id: projectId,
      faixa_especificada: faixa ? faixa.nome : "Não definida",
      ligante: project.emulsao_utilizada || "",
      pedreira: pedreiras,
    }));
  }, [projects, faixas, setFormData]);

  // field=null → replace entire section object; field=string → update one key
  const handleNestedChange = useCallback((section, field, value) => {
    if (field === null) {
      setFormData(prev => ({ ...prev, [section]: value }));
    } else {
      setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    }
  }, [setFormData]);

  const handleAcompChange = useCallback((key, field, value) => {
    setFormData(prev => ({
      ...prev,
      acompanhamento_aplicacao: {
        ...prev.acompanhamento_aplicacao,
        [key]: { ...prev.acompanhamento_aplicacao[key], [field]: value },
      },
    }));
  }, [setFormData]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) { setSelectedFileNames("Nenhum ficheiro selecionado"); return; }
    setLoadingUpload(true);
    setSelectedFileNames(files.length === 1 ? files[0].name : `${files.length} ficheiros selecionados`);
    setUploadProgress(files.map((file, i) => ({ id: `${file.name}-${i}`, fileName: file.name, status: 'pending', error: null })));

    const uploadedUrls = [];
    const errors = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = `${file.name}-${i}`;
      try {
        setUploadProgress(prev => prev.map(p => p.id === id ? { ...p, status: 'uploading' } : p));
        const result = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(result.file_url);
        setUploadProgress(prev => prev.map(p => p.id === id ? { ...p, status: 'success' } : p));
      } catch (error) {
        errors.push({ fileName: file.name, error: error.message });
        setUploadProgress(prev => prev.map(p => p.id === id ? { ...p, status: 'error', error: error.message } : p));
      }
    }
    if (uploadedUrls.length > 0) setFormData(prev => ({ ...prev, fotos: [...(prev.fotos || []), ...uploadedUrls] }));
    if (errors.length > 0) alert(`${uploadedUrls.length} de ${files.length} arquivos enviados.\n\nErros:\n` + errors.map(e => `• ${e.fileName}: ${e.error}`).join('\n'));
    setLoadingUpload(false);
    setUploadProgress([]);
    e.target.value = '';
  };

  const handleRemovePhoto = useCallback((indexToRemove) => {
    setFormData(prev => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== indexToRemove) }));
  }, [setFormData]);

  const handleSubmit = async (e, saveStatus = 'finalizado') => {
    e.preventDefault();
    const error = validateForm(formData, saveStatus);
    if (error) { alert(error); return; }

    const dataToSave = buildDataToSave(formData, saveStatus, user);

    if (editingChecklist?.id) {
      const updateData = { ...dataToSave };
      let msg = saveStatus === 'rascunho' ? "Progresso salvo com sucesso!" : "Checklist atualizado com sucesso!";
      if (editingChecklist.approved === false && saveStatus === 'finalizado') {
        updateData.approved = null; updateData.rejection_reason = null;
        updateData.approved_by = null; updateData.approved_date = null;
        updateData.was_rejected = true;
        msg = "Checklist atualizado com sucesso! O registro voltará para análise do administrador.";
      }
      await base44.entities.ChecklistMRAF.update(editingChecklist.id, updateData);
      alert(msg);
    } else {
      await base44.entities.ChecklistMRAF.create(dataToSave);
      alert(saveStatus === 'rascunho' ? "Progresso salvo com sucesso!" : "Checklist criado com sucesso!");
    }
    clearSavedData();
    navigate(createPageUrl('MeusEnsaios'));
  };

  return {
    obras, regionais, projects, user, editingChecklist,
    loading, formData, setFormData, obraSelecionada, regionalSelecionada,
    isApproved, isEditable, clearSavedData, navigate,
    loadingUpload, selectedFileNames, uploadProgress,
    projetosDisponiveis, selectedProject,
    handleChange, handleObraChange, handleProjectChange,
    handleNestedChange, handleAcompChange,
    handleFileChange, handleRemovePhoto, handleSubmit,
  };
}