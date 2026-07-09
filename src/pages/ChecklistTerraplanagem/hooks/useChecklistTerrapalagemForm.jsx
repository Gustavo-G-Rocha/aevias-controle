import { useState } from "react";
import { createPageUrl } from "@/utils";
import { useChecklistForm } from "@/hooks/useChecklistForm";
import { useOfflineDetection } from "@/hooks/useOfflineDetection";
import { buildDataToSave, validateForm } from "../utils/checklistTerrapalagemMapper";
import { createQueueItem } from "@/utils/offlineQueue";
import { addOrUpdateQueueItem } from "@/services/syncService";
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
  rodovia: "",
  empreiteira: "",
  estaca: "",
  camada: "",
  inspetor_fiscal: "",
  material: "",
  origem_material: "",
  nome_material: "",
  umidade_otima_proctor: "",
  umidade_in_situ: "",
  ensaio_realizado_por: "Afirma Evias",
  periodos_clima: [
    { periodo: "manha", temperatura_ambiente: "", condicoes_climaticas: "bom" },
    { periodo: "tarde", temperatura_ambiente: "", condicoes_climaticas: "bom" },
  ],
  acompanhamento_execucao: {
    remocao_material_existente: { sim: false, nao: false, na: false },
    espalhamento_material_novo: { sim: false, nao: false, na: false },
    compactacao_conforme_projeto: { sim: false, nao: false, na: false, rolo_liso: false, rolo_pneu: false, rolo_pe_carneiro: false },
    ensaio_viga_benkelman: { sim: false, nao: false, na: false },
    teste_carga: { sim: false, nao: false, na: false },
    falha_compactacao: { sim: false, nao: false, na: false },
    observacoes: "",
  },
  ensaios_empreiteira: {
    compactacao_proctor: { realizado: false, quantidade: null, conforme: null, resultados: "", observacoes: "" },
    isc: { realizado: false, quantidade: null, conforme: null, resultados: "", observacoes: "" },
    umidade_frigideira: { realizado: false, quantidade: null, conforme: null, resultados: "", observacoes: "" },
    massa_especifica_in_situ: { realizado: false, quantidade: null, conforme: null, resultados: "", observacoes: "" },
    granulometria: { realizado: false, quantidade: null, conforme: null, resultados: "", observacoes: "" },
    variacao_umidade_conforme: null,
    grau_compactacao_conforme: null,
  },
  observacoes_gerais: "",
  acoes_corretivas_realizado: null,
  acoes_corretivas_descricao: "",
  nao_conformidades: [],
  fotos: [],
  status: "rascunho",
});

export function useChecklistTerrapalagemForm() {
  const {
    obras, regionais, projects, user, editingChecklist,
    loading, formData, setFormData, obraSelecionada,
    isApproved, isEditable, clearSavedData, navigate,
  } = useChecklistForm(getInitialFormData, 'ChecklistTerraplanagem', 'checklist_terraplanagem');

  const { isOnline } = useOfflineDetection();
  const [saving, setSaving] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [selectedFileNames, setSelectedFileNames] = useState("Nenhum ficheiro selecionado");

  // ── Cálculos derivados ─────────────────────────────────────────────────────
  const variacaoUmidade = (() => {
    const uOtima = parseFloat(formData.umidade_otima_proctor);
    const uInSitu = parseFloat(formData.umidade_in_situ);
    if (isNaN(uOtima) || isNaN(uInSitu)) return null;
    return (uInSitu - uOtima).toFixed(2);
  })();

  const grauCompactacao = (() => {
    const inSituArr = formData.ensaios_empreiteira.massa_especifica_in_situ?.resultados;
    const proctorArr = formData.ensaios_empreiteira.compactacao_proctor?.resultados;
    const densInSitu = parseFloat(Array.isArray(inSituArr) ? inSituArr[0] : inSituArr);
    const densProctor = parseFloat(Array.isArray(proctorArr) ? proctorArr[0] : proctorArr);
    if (isNaN(densInSitu) || isNaN(densProctor) || densProctor === 0) return null;
    return ((densInSitu / densProctor) * 100).toFixed(2);
  })();

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCheckboxChange = (section, field, option) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: { sim: option === 'sim', nao: option === 'nao', na: option === 'na' },
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

  const handleEnsaioChange = (ensaioKey, field, value) => {
    setFormData(prev => {
      const ensaio = { ...(prev.ensaios_empreiteira[ensaioKey] || {}) };
      const ensaios = { ...prev.ensaios_empreiteira };

      if (field === 'realizado') {
        ensaio.realizado = value;
        if (!value) { ensaio.quantidade = 0; ensaio.resultados = []; ensaio.conforme = null; }
      } else if (field === 'quantidade') {
        const newQty = Math.max(0, Math.min(parseInt(value) || 0, 3));
        ensaio.quantidade = newQty;
        const current = Array.isArray(ensaio.resultados)
          ? ensaio.resultados
          : (typeof ensaio.resultados === 'string' && ensaio.resultados.trim() !== '')
            ? ensaio.resultados.split('|').map(s => s.trim()) : [];
        ensaio.resultados = newQty > current.length
          ? [...current, ...Array(newQty - current.length).fill(null)]
          : current.slice(0, newQty);
        if (newQty === 0) ensaio.conforme = null;
      } else if (field === 'conforme') {
        ensaio.conforme = value;
      } else if (field.startsWith('resultado_')) {
        const idx = parseInt(field.replace('resultado_', ''));
        const novos = Array.isArray(ensaio.resultados)
          ? [...ensaio.resultados]
          : (typeof ensaio.resultados === 'string' && ensaio.resultados.trim() !== '')
            ? ensaio.resultados.split('|').map(s => s.trim()) : [];
        novos[idx] = value !== '' ? value : null;
        ensaio.resultados = novos;
      } else {
        ensaio[field] = value;
      }

      ensaios[ensaioKey] = ensaio;
      return { ...prev, ensaios_empreiteira: ensaios };
    });
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) { setSelectedFileNames("Nenhum ficheiro selecionado"); return; }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) { toast({ title: `Tipo de arquivo não suportado: ${file.type}`, variant: "destructive" }); e.target.value = ''; return; }
      if (file.size > 10 * 1024 * 1024) { toast({ title: `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB`, variant: "destructive" }); e.target.value = ''; return; }
    }

    setUploadingPhotos(true);
    setSelectedFileNames(files.length === 1 ? files[0].name : `${files.length} ficheiros selecionados`);

    try {
      // Upload em paralelo — todas as imagens são enviadas simultaneamente
      // em vez de uma por vez, reduzindo o tempo total drasticamente.
      const results = await Promise.allSettled(files.map(file => uploadImagem(file)));
      const uploadedUrls = [];
      let firstError = null;
      for (const result of results) {
        if (result.status === 'fulfilled') {
          uploadedUrls.push(result.value.file_url);
        } else if (!firstError) {
          firstError = result.reason;
        }
      }
      if (uploadedUrls.length > 0) {
        setFormData(prev => ({ ...prev, fotos: [...(prev.fotos || []), ...uploadedUrls] }));
      }
      if (uploadedUrls.length < files.length) {
        const failed = files.length - uploadedUrls.length;
        toast({ title: `${failed} imagem(ns) falharam ao enviar. ${uploadedUrls.length} enviada(s) com sucesso.`, variant: "destructive" });
      }
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
    if (error) { toast({ title: error, variant: "destructive" }); return; }

    setSaving(true);
    try {
      const dataToSave = buildDataToSave(formData, saveStatus);
      dataToSave.laboratorista_name = user.laboratorista_name || user.full_name;

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
          await atualizarChecklist('ChecklistTerraplanagem', editingChecklist.id, updateData);
          toast({ title: msg });
        } else {
          await criarChecklist('ChecklistTerraplanagem', dataToSave);
          toast({ title: saveStatus === 'rascunho' ? "Progresso salvo com sucesso!" : "Checklist criado com sucesso!" });
        }
        clearSavedData();
        navigate(createPageUrl("MeusEnsaios"));
      } else {
        // OFFLINE: Enfileirar sincronização
        const operation = editingChecklist?.id ? 'update' : 'create';
        const queueItem = createQueueItem({
          operation,
          entityType: 'ChecklistTerraplanagem',
          entityId: editingChecklist?.id || null,
          payload: dataToSave,
        });

        await addOrUpdateQueueItem(queueItem);
        toast({ title: `Registro salvo localmente. Será sincronizado quando a conexão voltar.${editingChecklist?.id ? '' : ''}` });
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
    obras, regionais, projects, user, editingChecklist,
    loading, formData, setFormData, obraSelecionada,
    isApproved, isEditable, clearSavedData, navigate,
    saving, uploadingPhotos, selectedFileNames,
    variacaoUmidade, grauCompactacao,
    isOnline,
    handleCheckboxChange, handleRoloChange, handleEnsaioChange,
    handleFileChange, handleRemovePhoto, handleLegendChange, handleSubmit,
  };
}