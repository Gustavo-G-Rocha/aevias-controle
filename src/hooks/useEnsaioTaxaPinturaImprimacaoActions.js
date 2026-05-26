/**
 * Hook de submissão do formulário de EnsaioTaxaPinturaImprimacao.
 * Responsável por validar, salvar (create/update) e redirecionar.
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export function useEnsaioTaxaPinturaImprimacaoActions(formData, editingEnsaio, user) {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e, saveStatus = 'finalizado') => {
    e.preventDefault();

    if (!formData.obra_id || !formData.data_ensaio) {
      alert('Preencha todos os campos obrigatórios (Obra, Data).');
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
        await base44.entities.EnsaioTaxaPinturaImprimacao.update(editingEnsaio.id, updateData);
        alert(successMessage);
      } else {
        await base44.entities.EnsaioTaxaPinturaImprimacao.create(dataToSave);
        alert('Ensaio criado com sucesso!');
      }
      navigate(createPageUrl('MeusEnsaios'));
    } catch (err) {
      console.error('Erro ao salvar ensaio:', err);
      alert(`Erro ao salvar ensaio: ${err.message || 'Erro desconhecido'}.`);
    } finally {
      setSaving(false);
    }
  }, [formData, editingEnsaio, user, navigate]);

  return { saving, handleSubmit };
}