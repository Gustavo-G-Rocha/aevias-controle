import { useState } from "react";
import { createPageUrl } from "@/utils";
import { useChecklistForm } from "@/hooks/useChecklistForm";
import { useOfflineDetection } from "@/hooks/useOfflineDetection";
import { buildDataToSave, validateForm } from "../utils/checklistMRAFMapper";
import { createQueueItem } from "@/utils/offlineQueue";
import { addOrUpdateQueueItem } from "@/services/syncService";
import { validateReferentialIntegrity } from "@/utils/referentialIntegrity";
import { todayISO } from "@/utils/formInitialData";
import { criarChecklist, atualizarChecklist } from "@/services/checklistsService";
import { uploadImagem } from "@/services/uploadService";
import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';

const getInitialFormData = () => ({
  obra_id: "",
  project_id: "",
  data: todayISO(),
  jornada: { horario_inicio: "", horario_fim: "" },
  laboratorista_name: "",
  empreiteira: "",
  usina: "",
  projeto_utilizado: "",
  faixa_especificada: "",
  ligante: "",
  pedreira: "",
  inspetor_campo: "",
  engenheiro_responsavel: "",
  rodovia: "",
  trecho: "",
  ensaio_realizado_por: "Afirma Evias",
  periodos_clima: [
    { periodo: "manha", temperatura_ambiente: "", condicoes_climaticas: "bom" },
    { periodo: "tarde", temperatura_ambiente: "", condicoes_climaticas: "bom" },
  ],
  condicionamento_insumos: {
    agregados_separados: false,
    agregados_cobertos: false,
    filler_utilizado: "",
    utilizacao_aditivos: false,
    agua_contaminada: false,
    observacoes: "",
  },
  preparacao_superficie: {
    superficie_umida: false,
    temperatura_pavimento: "",
    pavimento_patologias: false,
    superficie_fresada: false,
    superficie_limpa: false,
    observacoes: "",
  },
  acompanhamento_aplicacao: {
    tempo_rompimento_cura: { realizado: false, resultado: "" },
    taxa_aplicacao: { realizado: false, resultado: "", conforme: null },
    residuo_emulsao: { realizado: false, resultado: "", conforme: null },
    espessura_camada: { realizado: false, resultado: "", conforme: null },
    observacoes: "",
  },
  controle_aplicacao: {
    km_estaca_inicial: "",
    lado_inicial: "",
    km_estaca_final: "",
    lado_final: "",
    quantidade_aplicada_m2: "",
    observacoes: "",
  },
  observacoes_gerais: "",
  acoes_corretivas_realizado: null,
  acoes_corretivas_descricao: "",
  nao_conformidades: [],
  fotos: [],
  status: "rascunho",
});

export function useChecklistMRAFForm() {
  const {
    obras, regionais, projects, user, editingChecklist,
    loading, formData, setFormData, obraSelecionada,
    isApproved, isEditable, clearSavedData, navigate,
  } = useChecklistForm(getInitialFormData, 'ChecklistMRAF', 'checklist_mraf');

  const { isOnline } = useOfflineDetection();
  const [saving, setSaving] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [selectedFileNames, setSelectedFileNames] = useState("Nenhum ficheiro selecionado");

  const handleCheckboxChange = (section, field, option) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: { sim: option === 'sim', nao: option === 'nao', na: option === 'na' },
      },
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleDeepChange = (section, subsection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value,
        },
      },
    }));
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) {
      setSelectedFileNames("Nenhum ficheiro selecionado");
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast({ title: `Tipo de arquivo não suportado: ${file.type}`, variant: "destructive" });
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB`, variant: "destructive" });
        e.target.value = '';
        return;
      }
    }

    setUploadingPhotos(true);
    setSelectedFileNames(files.length === 1 ? files[0].name : `${files.length} ficheiros selecionados`);

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const result = await uploadImagem(file);
        uploadedUrls.push(result.file_url);
      }
      setFormData(prev => ({ ...prev, fotos: [...(prev.fotos || []), ...uploadedUrls] }));
    } catch (error) {
      logger.error("Erro ao fazer upload das fotos:", error);
      toast({ title: "Erro ao fazer upload das fotos.", variant: "destructive" });
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index) => {
    setFormData(prev => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== index) }));
  };

  const handleLegendChange = (index, legenda) => {
    setFormData(prev => {
      const fotos = [...prev.fotos];
      const foto = fotos[index];
      if (typeof foto === 'string') {
        fotos[index] = { url: foto, legenda };
      } else {
        fotos[index] = { ...foto, legenda };
      }
      return { ...prev, fotos };
    });
  };

  const handleSubmit = async (e, saveStatus = 'finalizado') => {
    e.preventDefault();
    const error = validateForm(formData, saveStatus);
    if (error) {
      toast({ title: error, variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const dataToSave = buildDataToSave(formData, saveStatus);

      if (isOnline) {
        // ONLINE: Comportamento original
        if (editingChecklist?.id) {
          const updateData = { ...dataToSave };
          let msg = saveStatus === 'rascunho' ? "Progresso salvo com sucesso!" : "Checklist atualizado com sucesso!";
          if (editingChecklist.approved === false && saveStatus === 'finalizado') {
            updateData.approved = null;
            updateData.rejection_reason = null;
            updateData.approved_by = null;
            updateData.approved_date = null;
            updateData.was_rejected = true;
            msg = "Checklist atualizado com sucesso! O registro voltará para análise do administrador.";
          }
          await atualizarChecklist('ChecklistMRAF', editingChecklist.id, updateData);
          toast({ title: msg });
        } else {
          await criarChecklist('ChecklistMRAF', dataToSave);
          toast({ title: saveStatus === 'rascunho' ? "Progresso salvo com sucesso!" : "Checklist criado com sucesso!" });
        }
        clearSavedData();
        navigate(createPageUrl("MeusEnsaios"));
      } else {
        // OFFLINE: Validar integridade referencial antes de enfileirar
        const refCheck = validateReferentialIntegrity(dataToSave, { obras, projects });
        if (!refCheck.valid) {
          toast({ title: refCheck.errorMessage, variant: "destructive" });
          return;
        }

        // OFFLINE: Enfileirar sincronização
        const operation = editingChecklist?.id ? 'update' : 'create';
        const queueItem = createQueueItem({
          operation,
          entityType: 'ChecklistMRAF',
          entityId: editingChecklist?.id || null,
          payload: dataToSave,
        });

        await addOrUpdateQueueItem(queueItem);
        // Notifica a UI (MeusEnsaios) para recarregar a fila offline e exibir
        // o registro com badge "Aguardando sincronização" imediatamente.
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('offline-queue-updated'));
        }
        toast({ title: `Registro salvo localmente. Será sincronizado quando a conexão voltar.` });
        clearSavedData();
        navigate(createPageUrl("MeusEnsaios"));
      }
    } catch (error) {
      logger.error("Erro ao salvar checklist:", error);
      toast({ title: `Erro ao salvar checklist: ${error.message}`, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return {
    obras,
    regionais,
    projects,
    user,
    editingChecklist,
    loading,
    formData,
    setFormData,
    obraSelecionada,
    isApproved,
    isEditable,
    clearSavedData,
    navigate,
    saving,
    uploadingPhotos,
    selectedFileNames,
    isOnline,
    handleCheckboxChange,
    handleInputChange,
    handleNestedChange,
    handleDeepChange,
    handleFileChange,
    handleRemovePhoto,
    handleLegendChange,
    handleSubmit,
  };
}