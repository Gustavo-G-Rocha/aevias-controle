/**
 * useChecklistAplicacaoForm.js
 *
 * Hook de estado e handlers para o formulário de Checklist de Aplicação.
 * Centraliza:
 *   - handler simples de campos diretos (handleInputChange)
 *   - handler de campos aninhados 2 níveis: formData[s1][field] (handleNestedChange)
 *   - handler de campos aninhados 3 níveis: formData[s1][s2][field] (handleDeepChange)
 *   - upload/remoção de fotos
 *   - submit (rascunho e finalizado)
 *
 * Não importa nem renderiza JSX.
 */
import { useCallback } from "react";
import { createPageUrl } from "@/utils";
import { uploadMultipleFiles } from "@/utils/imageUpload";
import { criarChecklist, atualizarChecklist } from "@/services/checklistsService";

export function useChecklistAplicacaoForm({
  formData,
  setFormData,
  projects,
  faixas,
  editingChecklist,
  user,
  setSaving,
  setUploadingPhoto,
  clearSavedData,
  navigate,
}) {

  // ── campo simples / primeiro nível ───────────────────────────────────────────
  const handleInputChange = useCallback((field, value) => {
    if (field === 'obra_id') {
      setFormData(prev => ({ ...prev, obra_id: value, project_id: "" }));
      return;
    }
    if (field === 'project_id') {
      const proj = projects.find(p => p.id === value);
      if (proj) {
        const faixa = faixas.find(f => f.id === proj.faixa_granulometrica_id);
        const pedreiras = [...new Set((proj.agregados || []).map(ag => ag.pedreira).filter(Boolean))];
        setFormData(prev => ({
          ...prev,
          project_id: value,
          projeto_utilizado: proj.name,
          faixa_especificada: faixa ? faixa.nome : "Não definida",
          ligante: proj.ligante?.tipo || "",
          pedreira: pedreiras.join(' + '),
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          project_id: "", projeto_utilizado: "",
          faixa_especificada: "", ligante: "", pedreira: "",
        }));
      }
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [projects, faixas, setFormData]);

  // ── campo aninhado 2 níveis: formData[s1][field] ─────────────────────────────
  const handleNestedChange = useCallback((s1, field, value) => {
    setFormData(prev => ({
      ...prev,
      [s1]: { ...prev[s1], [field]: value },
    }));
  }, [setFormData]);

  // ── campo aninhado 3 níveis: formData[s1][s2][field] ─────────────────────────
  const handleDeepChange = useCallback((s1, s2, field, value) => {
    setFormData(prev => ({
      ...prev,
      [s1]: {
        ...prev[s1],
        [s2]: { ...(prev[s1]?.[s2] ?? {}), [field]: value },
      },
    }));
  }, [setFormData]);

  // ── upload de fotos ──────────────────────────────────────────────────────────
  const handlePhotoUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    setUploadingPhoto(true);
    const { urls, errors } = await uploadMultipleFiles(files);
    if (urls.length > 0) {
      setFormData(prev => ({ ...prev, fotos: [...(prev.fotos || []), ...urls] }));
    }
    if (errors.length > 0) {
      alert(`${urls.length} de ${files.length} fotos enviadas.\n\nErros:\n` + errors.map(err => `• ${err.fileName}: ${err.error}`).join('\n'));
    }
    setUploadingPhoto(false);
    e.target.value = '';
  }, [setFormData, setUploadingPhoto]);

  const handleRemovePhoto = useCallback((index) => {
    setFormData(prev => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== index) }));
  }, [setFormData]);

  // ── submit (rascunho e finalizado) ───────────────────────────────────────────
  const handleSubmit = useCallback(async (e, saveStatus = 'finalizado') => {
    e.preventDefault();

    if (saveStatus === 'finalizado') {
      const required = ['obra_id', 'project_id', 'data', 'rodovia', 'trecho', 'empreiteira', 'usina', 'ligante', 'pedreira', 'ensaio_realizado_por'];
      if (required.some(f => !formData[f])) {
        alert("Preencha todos os campos obrigatórios (Obra, Projeto Vinculado, Data, Rodovia, Trecho, Empreiteira, Usina, Ligante, Pedreira, Ensaio realizado por).");
        return;
      }
    } else {
      if (!formData.obra_id) { alert("Por favor, selecione uma obra."); return; }
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        status: saveStatus,
        laboratorista_name: user?.laboratorista_name || user?.full_name,
        inspetor_campo: user?.laboratorista_name || user?.full_name,
        fotos: (formData.fotos || []).map(f => (typeof f === 'string' ? f : (f?.url || ''))).filter(Boolean),
      };

      if (editingChecklist) {
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
        await atualizarChecklist('ChecklistAplicacao', editingChecklist.id, updateData);
        alert(msg);
      } else {
        await criarChecklist('ChecklistAplicacao', dataToSave);
        alert(saveStatus === 'rascunho' ? "Progresso salvo com sucesso!" : "Checklist criado com sucesso!");
      }
      clearSavedData();
      navigate(createPageUrl('MeusEnsaios'));
    } catch (error) {
      console.error("[ChecklistAplicacao] Erro ao salvar checklist:", error?.message || error);
      alert("Erro ao salvar checklist.");
    } finally {
      setSaving(false);
    }
  }, [formData, editingChecklist, user, setSaving, clearSavedData, navigate]);

  return {
    handleInputChange,
    handleNestedChange,
    handleDeepChange,
    handlePhotoUpload,
    handleRemovePhoto,
    handleSubmit,
  };
}