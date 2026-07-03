import { useState } from "react";
import { createPageUrl } from "@/utils";
import { useChecklistForm } from "@/hooks/useChecklistForm";
import { buildDataToSave, validateForm } from "../utils/checklistReciclagemMapper";
import { todayISO } from "@/utils/formInitialData";
import { criarChecklist, atualizarChecklist } from "@/services/checklistsService";
import { uploadImagem } from "@/services/uploadService";

const getInitialFormData = () => ({
  obra_id: "",
  project_id: "",
  data: todayISO(),
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
    { periodo: "noite", temperatura_ambiente: "", condicoes_climaticas: "bom" },
  ],
  acompanhamento_execucao: {
    remocao_material_existente: { sim: false, nao: false, na: false, km_bota_fora: "" },
    espalhamento_material_novo: { sim: false, nao: false, na: false, tipo_material: "" },
    compactacao_conforme_projeto: { sim: false, nao: false, na: false, rolo_liso: false, rolo_pneu: false, rolo_pe_carneiro: false },
    ensaio_viga_benkelman: { sim: false, nao: false, na: false },
    espessura_reciclada: "",
    teste_carga: { sim: false, nao: false, na: false },
    falha_compactacao: { sim: false, nao: false, na: false },
    observacoes: "",
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
    finura_cimento: { realizado: false, quantidade: null, conforme: null, resultados: "", observacoes: "" },
  },
  observacoes_gerais: "",
  acoes_corretivas_realizado: null,
  acoes_corretivas_descricao: "",
  nao_conformidades: [],
  fotos: [],
  status: "rascunho",
});

export function useChecklistReciclagemForm() {
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
        [field]: { ...prev[section][field], sim: option === 'sim', nao: option === 'nao', na: option === 'na' },
      },
    }));
  };

  const handleRoloChange = (rolo) => {
    setFormData(prev => ({
      ...prev,
      acompanhamento_execucao: {
        ...prev.acompanhamento_execucao,
        compactacao_conforme_projeto: {
          ...prev.acompanhamento_execucao.compactacao_conforme_projeto,
          [rolo]: !prev.acompanhamento_execucao.compactacao_conforme_projeto[rolo],
        },
      },
    }));
  };

  const handleEnsaioChange = (ensaio, field, value) => {
    setFormData(prev => ({
      ...prev,
      ensaios_empreiteira: {
        ...prev.ensaios_empreiteira,
        [ensaio]: { ...prev.ensaios_empreiteira[ensaio], [field]: value },
      },
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
      const result = await uploadImagem(file);
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
    const error = validateForm(formData, saveStatus);
    if (error) { alert(error); return; }

    setSaving(true);
    try {
      const dataToSave = buildDataToSave(formData, saveStatus);

      if (editingChecklist?.id) {
        const updateData = { ...dataToSave };
        let msg = saveStatus === 'rascunho' ? "Progresso salvo com sucesso!" : "Checklist atualizado com sucesso!";
        if (editingChecklist.approved === false && saveStatus === 'finalizado') {
          updateData.approved = null; updateData.rejection_reason = null;
          updateData.approved_by = null; updateData.approved_date = null; updateData.was_rejected = true;
          msg = "Checklist atualizado com sucesso! O registro voltará para análise do administrador.";
        }
        await atualizarChecklist('ChecklistReciclagem', editingChecklist.id, updateData);
        alert(msg);
      } else {
        await criarChecklist('ChecklistReciclagem', dataToSave);
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

  return {
    obras, projects, editingChecklist,
    loading, formData, setFormData, obraSelecionada,
    isApproved, isEditable, clearSavedData, navigate,
    saving, uploadingPhotos, selectedFileNames,
    handleCheckboxChange, handleRoloChange, handleEnsaioChange,
    handleFileChange, handleRemovePhoto, handleSubmit,
  };
}