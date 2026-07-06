/**
 * Hook de submissão do EnsaioRompimentoConcreto.
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarEnsaio, atualizarEnsaio } from '@/services/ensaiosService';
import { createPageUrl } from '@/utils';

import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';
export function useEnsaioRompimentoConcretoActions(formData, editId) {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSave = useCallback(async (asFinal = false) => {
    if (!formData.obra_id) { toast({ title: 'Selecione uma obra', variant: "destructive" }); return; }
    setSaving(true);
    try {
      const dataToSave = { ...formData, status: asFinal ? 'finalizado' : 'rascunho' };
      if (editId) {
        await atualizarEnsaio('EnsaioRompimentoConcreto', editId, dataToSave);
        toast({ title: 'Ensaio atualizado com sucesso!' });
      } else {
        await criarEnsaio('EnsaioRompimentoConcreto', dataToSave);
        toast({ title: 'Ensaio criado com sucesso!' });
      }
      navigate(createPageUrl('MeusEnsaios'));
    } catch (error) {
      logger.error('Erro ao salvar:', error);
      toast({ title: 'Erro ao salvar ensaio', variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [formData, editId, navigate]);

  return { saving, handleSave };
}