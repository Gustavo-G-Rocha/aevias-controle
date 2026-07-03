import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarEnsaio, atualizarEnsaio } from '@/services/ensaiosService';
import { createPageUrl } from '@/utils';
import { prepareDadosParaSalvar } from '@/utils/ensaioManchaPenduloUtils';

export const useEnsaioManchaPenduloActions = (isEditMode, editId, formData) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async (finalizar = false) => {
    setSaving(true);
    try {
      const {
        ensaiosManchaComData,
        ensaiosPenduloComData,
        media_hs,
        classificacao_media_hs,
        media_vrd,
        classificacao_media_vrd
      } = prepareDadosParaSalvar(formData);

      const dataToSave = {
        ...formData,
        ensaios_mancha: ensaiosManchaComData,
        ensaios_pendulo: ensaiosPenduloComData,
        media_hs,
        classificacao_media_hs,
        media_vrd,
        classificacao_media_vrd,
        status: finalizar ? 'finalizado' : 'rascunho'
      };

      if (isEditMode) {
        const updateData = { ...dataToSave };
        // Se estava reprovado e está sendo finalizado, resetar aprovação para pendente
        if (formData.approved === false && finalizar) {
          updateData.approved = null;
          updateData.rejection_reason = null;
          updateData.approved_by = null;
          updateData.approved_date = null;
          updateData.was_rejected = true;
        }
        await atualizarEnsaio('EnsaioManchaPendulo', editId, updateData);
      } else {
        await criarEnsaio('EnsaioManchaPendulo', dataToSave);
      }

      navigate(createPageUrl('MeusEnsaios'));
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar o ensaio.');
    } finally {
      setSaving(false);
    }
  }, [isEditMode, editId, formData, navigate]);

  return {
    saving,
    handleSave
  };
};