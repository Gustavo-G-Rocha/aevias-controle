/**
 * Hook de submissão do formulário de EnsaioTaxaPinturaImprimacao.
 * Responsável por validar, salvar (create/update) e redirecionar.
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarEnsaio, atualizarEnsaio } from '@/services/ensaiosService';
import { createPageUrl } from '@/utils';

import { toast } from "@/components/ui/use-toast";
export function useEnsaioTaxaPinturaImprimacaoActions(formData, editingEnsaio, user) {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e, saveStatus = 'finalizado') => {
    e.preventDefault();

    if (!formData.obra_id || !formData.data_ensaio) {
      toast({ title: 'Preencha todos os campos obrigatórios (Obra, Data).', variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        laboratorista_name: user?.laboratorista_name || user?.full_name,
        status: saveStatus,
      };

      if (editingEnsaio) {
        const updateData = { ...dataToSave };
        let successMessage = 'Ensaio atualizado com sucesso!';
        if (editingEnsaio.approved === false) {
          updateData.approved         = null;
          updateData.rejection_reason = null;
          updateData.approved_by      = null;
          updateData.approved_date    = null;
          successMessage = 'Ensaio atualizado com sucesso! O registro voltará para análise do administrador.';
        }
        await atualizarEnsaio('EnsaioTaxaPinturaImprimacao', editingEnsaio.id, updateData);
        toast({ title: successMessage });
      } else {
        await criarEnsaio('EnsaioTaxaPinturaImprimacao', dataToSave);
        toast({ title: 'Ensaio criado com sucesso!' });
      }
      navigate(createPageUrl('MeusEnsaios'));
    } catch (err) {
      console.error('Erro ao salvar ensaio:', err);
      toast({ title: `Erro ao salvar ensaio: ${err.message || 'Erro desconhecido'}.`, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [formData, editingEnsaio, user, navigate]);

  return { saving, handleSubmit };
}