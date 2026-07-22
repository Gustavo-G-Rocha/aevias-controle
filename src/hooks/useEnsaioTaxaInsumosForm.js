import { useCallback } from 'react';
import { calcularAreaBandeja, calcularEnsaio, getEnsaioInicial } from '@/utils/ensaioTaxaInsumosUtils';
import { toast } from '@/components/ui/use-toast';

export function useEnsaioTaxaInsumosForm(setFormData) {

  const handleDimensoesChange = useCallback((field, value) => {
    setFormData(prev => {
      const novas = { ...prev.dimensoes_bandeja, [field]: value };
      if (field === 'lado_1' || field === 'lado_2') {
        novas.area = calcularAreaBandeja(novas.lado_1, novas.lado_2);
      }
      const novosEnsaios = prev.ensaios.map(e => calcularEnsaio(e, novas.area));
      return { ...prev, dimensoes_bandeja: novas, ensaios: novosEnsaios };
    });
  }, [setFormData]);

  const handleEnsaioChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const novos = [...prev.ensaios];
      novos[index] = { ...novos[index], [field]: value };
      novos[index] = calcularEnsaio(novos[index], prev.dimensoes_bandeja.area);
      return { ...prev, ensaios: novos };
    });
  }, [setFormData]);

  const adicionarEnsaio = useCallback(() => {
    setFormData(prev => {
      if (prev.ensaios.length >= 4) {
        toast({ title: 'Máximo de 4 ensaios permitidos.', variant: 'destructive' });
        return prev;
      }
      return { ...prev, ensaios: [...prev.ensaios, getEnsaioInicial(prev.ensaios.length + 1)] };
    });
  }, [setFormData]);

  const removerEnsaio = useCallback((index, totalEnsaios) => {
    if (totalEnsaios <= 1) return;
    setFormData(prev => ({
      ...prev,
      ensaios: prev.ensaios.filter((_, i) => i !== index).map((e, i) => ({ ...e, numero: i + 1 })),
    }));
  }, [setFormData]);

  const handleObraChange = useCallback((obraId) => {
    setFormData(prev => ({ ...prev, obra_id: obraId }));
  }, [setFormData]);

  return { handleDimensoesChange, handleEnsaioChange, adicionarEnsaio, removerEnsaio, handleObraChange };
}