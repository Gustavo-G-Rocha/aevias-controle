import { useState, useCallback } from "react";
import { calcularEnsaio, calcularMedias, calcularAreaBandeja, getEnsaioInicial } from "@/utils/ensaioTaxaMRAFUtils";

/**
 * Hook para gerenciamento de estado do formulário
 * - Dados da obra, dimensões da bandeja, ensaios
 * - Cálculos automáticos ao alterar valores
 * - Adição/remoção de ensaios
 */
export const useEnsaioTaxaMRAFForm = (editingEnsaio) => {
  const [formData, setFormData] = useState(() => {
    if (editingEnsaio) {
      return {
        ...editingEnsaio,
        ensaios: editingEnsaio.ensaios?.length > 0 ? editingEnsaio.ensaios : [getEnsaioInicial(1)],
        data_ensaio: editingEnsaio.data_ensaio || new Date().toISOString().split('T')[0]
      };
    }

    return {
      obra_id: "",
      data_ensaio: new Date().toISOString().split('T')[0],
      laboratorista_name: "",
      rodovia: "",
      trecho: "",
      placa_caminhao: "",
      material: "",
      numero_projeto: "",
      empreiteira: "",
      usina: "",
      faixa_especificada: "",
      ligante: "",
      ensaio_realizado_por: "",
      taxa_minima_projeto: null,
      dimensoes_bandeja: { lado_1: null, lado_2: null, area: null },
      ensaios: [getEnsaioInicial(1)],
      observacoes: "",
      status: "rascunho",
      media_taxa_emulsao: null,
      media_taxa_agregado: null,
      media_taxa_mraf: null
    };
  });

  // Atualizar campo simples do formulário
  const updateFormField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Atualizar dimensões da bandeja (com recálculo automático)
  const handleDimensoesChange = useCallback((field, value) => {
    setFormData(prev => {
      const novas = { ...prev.dimensoes_bandeja, [field]: value };
      if (novas.lado_1 && novas.lado_2) {
        novas.area = calcularAreaBandeja(novas.lado_1, novas.lado_2);
      }
      // Recalcular ensaios com nova área
      const novosEnsaios = prev.ensaios.map(e => calcularEnsaio(e, novas.area));
      const medias = calcularMedias(novosEnsaios);
      return { ...prev, dimensoes_bandeja: novas, ensaios: novosEnsaios, ...medias };
    });
  }, []);

  // Atualizar campo de ensaio (com recálculo automático)
  const handleEnsaioChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const novos = [...prev.ensaios];
      novos[index] = calcularEnsaio({ ...novos[index], [field]: value }, prev.dimensoes_bandeja.area);
      const medias = calcularMedias(novos);
      return { ...prev, ensaios: novos, ...medias };
    });
  }, []);

  // Adicionar novo ensaio
  const adicionarEnsaio = useCallback(() => {
    setFormData(prev => {
      if (prev.ensaios.length >= 3) return prev;
      return { ...prev, ensaios: [...prev.ensaios, getEnsaioInicial(prev.ensaios.length + 1)] };
    });
  }, []);

  // Remover ensaio
  const removerEnsaio = useCallback((index) => {
    setFormData(prev => {
      if (prev.ensaios.length <= 1) return prev;
      const novos = prev.ensaios
        .filter((_, i) => i !== index)
        .map((e, i) => ({ ...e, numero: i + 1 }));
      const medias = calcularMedias(novos);
      return { ...prev, ensaios: novos, ...medias };
    });
  }, []);

  return {
    formData,
    updateFormField,
    handleDimensoesChange,
    handleEnsaioChange,
    adicionarEnsaio,
    removerEnsaio
  };
};