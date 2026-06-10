/**
 * Hook de submissão do formulário de EnsaioDensidadeInSitu.
 * Responsável por validar, salvar (create/update) e redirecionar.
 */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export function useEnsaioDensidadeActions(formData, user, editingEnsaio) {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Refs para evitar closures stale
  const formDataRef = useRef(formData);
  const userRef = useRef(user);
  const editingEnsaioRef = useRef(editingEnsaio);

  useEffect(() => { formDataRef.current = formData; }, [formData]);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { editingEnsaioRef.current = editingEnsaio; }, [editingEnsaio]);

  const save = async (saveStatus = "finalizado") => {
    const fd = formDataRef.current;
    const u = userRef.current;
    const ee = editingEnsaioRef.current;

    if (!fd.obra_id || !fd.data_ensaio) {
      alert("Preencha todos os campos obrigatórios (Obra, Data).");
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...fd,
        status: saveStatus,
        laboratorista_name: u?.laboratorista_name || u?.full_name,
      };

      if (ee) {
        const updateData = { ...dataToSave };
        let successMessage = saveStatus === "rascunho" ? "Progresso salvo!" : "Ensaio atualizado com sucesso!";

        if (ee.approved === false && saveStatus === "finalizado") {
          updateData.approved = null;
          updateData.rejection_reason = null;
          updateData.approved_by = null;
          updateData.approved_date = null;
          successMessage = "Ensaio atualizado com sucesso! O registro voltará para análise do administrador.";
        }

        await base44.entities.EnsaioDensidadeInSitu.update(ee.id, updateData);
      } else {
        await base44.entities.EnsaioDensidadeInSitu.create(dataToSave);
      }

      if (saveStatus === "rascunho") {
        toast.success("Progresso salvo! O ensaio está em execução.");
      } else {
        toast.success("Ensaio finalizado com sucesso!");
      }
      navigate(createPageUrl('MeusEnsaios'));
    } catch (error) {
      console.error("Erro ao salvar ensaio:", error);
      alert(`Erro ao salvar ensaio: ${error.message || 'Erro desconhecido'}`);
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

  return { saving, handleSubmit, handleSaveProgress };
}