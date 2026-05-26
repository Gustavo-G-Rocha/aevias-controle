/**
 * Hook de mutações do formulário de EnsaioVigaBenkelman.
 * Gerencia handlers de faixas, levantamentos e leitura inicial global.
 */
import { useState, useCallback } from 'react';
import { calcularLado, getFaixaInicial, LADOS_PERMITIDOS } from '@/utils/ensaioVigaBenkelmanUtils';

export function useEnsaioVigaBenkelmanForm(setFormData) {
  const [activeFaixaTab, setActiveFaixaTab] = useState('1');

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [setFormData]);

  const handleObraChange = useCallback((obraId, obras) => {
    setFormData(prev => ({ ...prev, obra_id: obraId, rodovia: '' }));
  }, [setFormData]);

  const handleLeituraInicialChange = useCallback((value) => {
    setFormData(prev => ({
      ...prev,
      leitura_inicial_global: value,
      faixas: value ? prev.faixas.map(faixa => ({
        ...faixa,
        levantamentos: faixa.levantamentos.map(lev => ({
          ...lev,
          bordo_esquerdo: { ...lev.bordo_esquerdo, leitura_inicial: value },
          eixo:           { ...lev.eixo,           leitura_inicial: value },
          bordo_direito:  { ...lev.bordo_direito,  leitura_inicial: value },
        })),
      })) : prev.faixas,
    }));
  }, [setFormData]);

  const addFaixa = useCallback(() => {
    setFormData(prev => {
      if (prev.faixas.length >= 4) {
        alert('Limite máximo de 4 faixas atingido.');
        return prev;
      }
      const newId = prev.nextFaixaId;
      setTimeout(() => setActiveFaixaTab(String(newId)), 0);
      return {
        ...prev,
        faixas: [...prev.faixas, getFaixaInicial(newId, prev.leitura_inicial_global || '')],
        nextFaixaId: newId + 1,
      };
    });
  }, [setFormData]);

  const removeFaixa = useCallback((faixaId) => {
    setFormData(prev => ({
      ...prev,
      faixas: prev.faixas.filter(f => f.id !== faixaId),
    }));
    if (activeFaixaTab === String(faixaId)) {
      setActiveFaixaTab('1');
    }
  }, [setFormData, activeFaixaTab]);

  const updateFaixaNome = useCallback((faixaId, nome) => {
    setFormData(prev => ({
      ...prev,
      faixas: prev.faixas.map(f => f.id === faixaId ? { ...f, nome } : f),
    }));
  }, [setFormData]);

  const updateLevantamento = useCallback((faixaId, levIndex, lado, field, value) => {
    setFormData(prev => ({
      ...prev,
      faixas: prev.faixas.map(faixa => {
        if (faixa.id !== faixaId) return faixa;
        return {
          ...faixa,
          levantamentos: faixa.levantamentos.map((lev, idx) => {
            if (idx !== levIndex) return lev;
            if (field === 'estaca_km') return { ...lev, estaca_km: value };
            if (!LADOS_PERMITIDOS.includes(lado)) return lev;
            return {
              ...lev,
              [lado]: calcularLado(lev[lado], field, parseFloat(value) || 0, prev.cte_viga),
            };
          }),
        };
      }),
    }));
  }, [setFormData]);

  return {
    activeFaixaTab,
    setActiveFaixaTab,
    handleInputChange,
    handleObraChange,
    handleLeituraInicialChange,
    addFaixa,
    removeFaixa,
    updateFaixaNome,
    updateLevantamento,
  };
}