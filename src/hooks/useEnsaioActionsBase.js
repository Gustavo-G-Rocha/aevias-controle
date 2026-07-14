/**
 * Hook base compartilhado para os hooks de actions de ensaio.
 *
 * Encapsula a lógica comum repetida em ~12 hooks useEnsaio*Actions:
 *   - estado `saving`
 *   - navegação para MeusEnsaios após salvar
 *   - fluxo save: validar → preparar dados → create/update → toast → navigate
 *   - padrão de reset de aprovação quando registro reprovado é re-finalizado
 *
 * Cada hook específico fornece: entityName, validate (opcional),
 * prepareData (opcional), setEditingEnsaio (opcional) e opções de comportamento.
 *
 * Migração incremental: hooks específicos são migrados um de cada vez.
 */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { criarEnsaio, atualizarEnsaio } from "@/services/ensaiosService";
import { toast } from "@/components/ui/use-toast";
import { logger } from "@/utils/logger";

export function useEnsaioActionsBase({
  entityName,
  formData,
  editingEnsaio,
  validate,
  prepareData,
  setEditingEnsaio,
  setWasRejectedOnReset = false,
  navigateOnRascunho = true,
  successMessageFinalizar,
  successMessageRascunho,
}) {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Refs para evitar closures stale (mesmo padrão dos hooks originais)
  const formDataRef = useRef(formData);
  const editingEnsaioRef = useRef(editingEnsaio);

  useEffect(() => { formDataRef.current = formData; }, [formData]);
  useEffect(() => { editingEnsaioRef.current = editingEnsaio; }, [editingEnsaio]);

  const save = async (saveStatus = "finalizado") => {
    const fd = formDataRef.current;
    const ee = editingEnsaioRef.current;

    if (validate && !validate(fd, saveStatus)) return;

    setSaving(true);
    try {
      let dataToSave = prepareData
        ? prepareData(fd, saveStatus)
        : { ...fd, status: saveStatus };

      let savedRecord;
      if (ee) {
        const updateData = { ...dataToSave };
        if (ee.approved === false && saveStatus === "finalizado") {
          updateData.approved = null;
          updateData.rejection_reason = null;
          updateData.approved_by = null;
          updateData.approved_date = null;
          if (setWasRejectedOnReset) updateData.was_rejected = true;
        }
        savedRecord = await atualizarEnsaio(entityName, ee.id, updateData);
      } else {
        savedRecord = await criarEnsaio(entityName, dataToSave);
        if (setEditingEnsaio) setEditingEnsaio(savedRecord);
      }

      // Feedback offline-aware (modelo WhatsApp)
      if (savedRecord?._offline) {
        toast({
          title: saveStatus === "finalizado"
            ? "Registro salvo offline — será enviado quando houver conexão."
            : "Rascunho salvo offline — será enviado quando houver conexão.",
        });
      } else if (saveStatus === "rascunho") {
        toast({ title: successMessageRascunho || "Progresso salvo!" });
      } else {
        toast({ title: successMessageFinalizar || "Ensaio finalizado com sucesso!" });
      }

      if (saveStatus === "finalizado" || navigateOnRascunho) {
        navigate(createPageUrl("MeusEnsaios"));
      }
    } catch (error) {
      logger.error(`[${entityName}] Erro ao salvar ensaio:`, error);
      toast({
        title: `Erro ao salvar ensaio: ${error.message || "Erro desconhecido"}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    save("finalizado");
  };

  const handleSaveProgress = (e) => {
    if (e) e.preventDefault();
    save("rascunho");
  };

  return { saving, save, handleSubmit, handleSaveProgress };
}