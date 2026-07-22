import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarEnsaio, atualizarEnsaio } from '@/services/ensaiosService';
import { createPageUrl } from '@/utils';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';

export function useEnsaioTaxaInsumosActions(formData, editingEnsaio, user) {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e, saveStatus = 'finalizado') => {
    e.preventDefault();

    if (!formData.obra_id || !formData.data_ensaio || !formData.tipo_insumo) {
      toast({ title: 'Preencha todos os campos obrigatórios (Obra, Data, Tipo de Insumo).', variant: "destructive" });
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
          updateData.approved = null;
          updateData.rejection_reason = null;
          updateData.approved_by = null;
          updateData.approved_date = null;
          successMessage = 'Ensaio atualizado com sucesso! O registro voltará para análise.';
        }
        await atualizarEnsaio('EnsaioTaxaInsumos', editingEnsaio.id, updateData);
        toast({ title: successMessage });
      } else {
        await criarEnsaio('EnsaioTaxaInsumos', dataToSave);
        toast({ title: 'Ensaio criado com sucesso!' });
      }
      navigate(createPageUrl('MeusEnsaios'));
    } catch (err) {
      logger.error('Erro ao salvar ensaio:', err);
      toast({ title: `Erro ao salvar: ${err.message || 'Erro desconhecido'}.`, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [formData, editingEnsaio, user, navigate]);

  return { saving, handleSubmit };
}