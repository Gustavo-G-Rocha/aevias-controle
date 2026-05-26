/**
 * Hook de submissão do EnsaioRompimentoConcreto.
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export function useEnsaioRompimentoConcretoActions(formData, editId) {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSave = useCallback(async (asFinal = false) => {
    if (!formData.obra_id) { alert('Selecione uma obra'); return; }
    setSaving(true);
    try {
      const dataToSave = { ...formData, status: asFinal ? 'finalizado' : 'rascunho' };
      if (editId) {
        await base44.entities.EnsaioRompimentoConcreto.update(editId, dataToSave);
        alert('Ensaio atualizado com sucesso!');
      } else {
        await base44.entities.EnsaioRompimentoConcreto.create(dataToSave);
        alert('Ensaio criado com sucesso!');
      }
      navigate(createPageUrl('MeusEnsaios'));
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar ensaio');
    } finally {
      setSaving(false);
    }
  }, [formData, editId, navigate]);

  return { saving, handleSave };
}