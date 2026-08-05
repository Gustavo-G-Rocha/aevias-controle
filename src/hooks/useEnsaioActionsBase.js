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
import { useRecordCacheUpdate } from "@/hooks/useQueryData";
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
  const { addRecord, updateRecord, removeRecord, snapshotRecords, restoreRecords } = useRecordCacheUpdate();

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

    let dataToSave = prepareData ? prepareData(fd, saveStatus) : { ...fd, status: saveStatus };

    // ── UPDATE: snapshot para rollback + update otimista imediato ──
    if (ee) {
      const snapshot = snapshotRecords();
      const optimisticRecord = {
        ...dataToSave,
        id: ee.id,
        entityType: entityName,
        _syncing: true,
      };
      updateRecord(optimisticRecord);

      // Redireciona IMEDIATAMENTE — a UI já reflete a mudança
      if (saveStatus === "finalizado" || navigateOnRascunho) {
        navigate(createPageUrl("MeusEnsaios"));
      }
      toast({ title: "Sincronizando alterações..." });

      // Sincroniza com o servidor em background
      try {
        const updateData = { ...dataToSave };
        if (ee.approved === false && saveStatus === "finalizado") {
          updateData.approved = null;
          updateData.rejection_reason = null;
          updateData.approved_by = null;
          updateData.approved_date = null;
          if (setWasRejectedOnReset) updateData.was_rejected = true;
        }
        const savedRecord = await atualizarEnsaio(entityName, ee.id, updateData);

        if (savedRecord?._offline) {
          toast({ title: "Registro salvo offline — será enviado quando houver conexão." });
        } else if (saveStatus === "rascunho") {
          toast({ title: successMessageRascunho || "Progresso salvo!" });
        } else {
          toast({ title: successMessageFinalizar || "Ensaio finalizado com sucesso!" });
        }

        // Substitui o registro otimista pelo real (remove flag _syncing)
        if (savedRecord?.id) {
          updateRecord({ ...savedRecord, entityType: entityName, _syncing: false });
        }
      } catch (error) {
        restoreRecords(snapshot);
        logger.error(`[${entityName}] Erro ao salvar ensaio:`, error);
        toast({
          title: `Erro ao salvar ensaio: ${error.message || "Erro desconhecido"}`,
          variant: "destructive",
        });
      }
    } else {
      // ── CREATE: insere registro otimista com temp ID + redirect imediato ──
      const tempId = `optimistic-${crypto.randomUUID()}`;
      const optimisticRecord = {
        ...dataToSave,
        id: tempId,
        entityType: entityName,
        _syncing: true,
        created_date: new Date().toISOString(),
        status: saveStatus,
      };
      addRecord(optimisticRecord);

      // Redireciona IMEDIATAMENTE — o registro já aparece na lista com badge "Sincronizando"
      if (saveStatus === "finalizado" || navigateOnRascunho) {
        navigate(createPageUrl("MeusEnsaios"));
      }
      toast({ title: "Sincronizando registro..." });

      // Cria no servidor em background
      try {
        const savedRecord = await criarEnsaio(entityName, dataToSave);

        if (savedRecord?._offline) {
          // Offline: o registro offline substitui o otimista (mantém flag _offline)
          removeRecord(tempId);
          addRecord({ ...savedRecord, entityType: entityName });
          if (setEditingEnsaio) setEditingEnsaio(savedRecord);
          toast({ title: "Registro salvo offline — será enviado quando houver conexão." });
        } else if (saveStatus === "rascunho") {
          toast({ title: successMessageRascunho || "Progresso salvo!" });
        } else {
          toast({ title: successMessageFinalizar || "Ensaio finalizado com sucesso!" });
        }

        // Substitui o registro otimista (temp ID) pelo real (server ID)
        if (savedRecord?.id && savedRecord.id !== tempId) {
          removeRecord(tempId);
          addRecord({ ...savedRecord, entityType: entityName, _syncing: false });
          if (setEditingEnsaio) setEditingEnsaio(savedRecord);
        }
      } catch (error) {
        // Remove o registro otimista — a criação falhou
        removeRecord(tempId);
        logger.error(`[${entityName}] Erro ao salvar ensaio:`, error);
        toast({
          title: `Erro ao salvar ensaio: ${error.message || "Erro desconhecido"}`,
          variant: "destructive",
        });
      }
    }

    setSaving(false);
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