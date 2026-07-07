/**
 * Hook de submissão do formulário de EnsaioDensidadeInSitu.
 * Responsável por validar, salvar (create/update) e redirecionar.
 *
 * Migrado para usar useEnsaioActionsBase — lógica comum centralizada.
 * Comportamento preservado: validação de obra_id + data_ensaio,
 * laboratorista_name, toasts e navegação idênticos ao original.
 */
import { useEnsaioActionsBase } from "@/hooks/useEnsaioActionsBase";
import { toast } from "@/components/ui/use-toast";

export function useEnsaioDensidadeActions(formData, user, editingEnsaio) {
  const validate = (fd) => {
    if (!fd.obra_id || !fd.data_ensaio) {
      toast({ title: "Preencha todos os campos obrigatórios (Obra, Data).", variant: "destructive" });
      return false;
    }
    return true;
  };

  const prepareData = (fd, saveStatus) => ({
    ...fd,
    status: saveStatus,
    laboratorista_name: user?.laboratorista_name || user?.full_name,
  });

  return useEnsaioActionsBase({
    entityName: "EnsaioDensidadeInSitu",
    formData,
    editingEnsaio,
    validate,
    prepareData,
    successMessageRascunho: "Progresso salvo! O ensaio está em execução.",
  });
}