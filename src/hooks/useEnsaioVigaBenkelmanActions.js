/**
 * Hook de submissão do formulário de EnsaioVigaBenkelman.
 * Responsável por validar, serializar, salvar (create/update) e redirecionar.
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarEnsaio, atualizarEnsaio } from '@/services/ensaiosService';
import { serializarFaixas } from '@/utils/ensaioVigaBenkelmanUtils';
import { createPageUrl } from '@/utils';

import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';
export function useEnsaioVigaBenkelmanActions(formData, editId) {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSave = useCallback(async (asFinal = false) => {
    if (!formData.obra_id) {
      toast({ title: 'Selecione uma obra', variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { levantamentos, temDeflexaoExcessiva } = serializarFaixas(
        formData.faixas,
        formData.def_admissivel
      );

      const dataToSave = {
        obra_id:               formData.obra_id,
        project_id:            formData.project_id,
        data_ensaio:           formData.data_ensaio,
        data_realizacao:       formData.data_realizacao,
        laboratorista_name:    formData.laboratorista_name,
        rodovia:               formData.rodovia,
        trecho:                formData.trecho,
        material:              formData.material,
        procedencia:           formData.procedencia,
        camada:                formData.camada,
        cte_viga:              parseFloat(formData.cte_viga) || 0,
        def_admissivel:        parseInt(formData.def_admissivel) || 0,
        leitura_inicial_global: parseFloat(formData.leitura_inicial_global) || 0,
        levantamentos,
        observacoes:           formData.observacoes,
        tem_deflexao_excessiva: temDeflexaoExcessiva,
        status:                asFinal ? 'finalizado' : 'rascunho',
        ...(asFinal ? { approved: null } : {}),
      };

      if (editId) {
        await atualizarEnsaio('EnsaioVigaBenkelman', editId, dataToSave);
        toast({ title: 'Ensaio atualizado com sucesso!' });
      } else {
        await criarEnsaio('EnsaioVigaBenkelman', dataToSave);
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