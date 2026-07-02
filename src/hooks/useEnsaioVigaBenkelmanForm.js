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

  const handleCteVigaChange = useCallback((value) => {
    setFormData(prev => {
      const novaCte = parseFloat(value) || 0;
      return {
        ...prev,
        cte_viga: value,
        faixas: prev.faixas.map(faixa => ({
          ...faixa,
          levantamentos: faixa.levantamentos.map(lev => {
            const recalcularDeflexao = (lado) => ({
              ...lado,
              deflexao: lado.diferenca * novaCte,
            });
            return {
              ...lev,
              bordo_esquerdo: recalcularDeflexao(lev.bordo_esquerdo),
              eixo:           recalcularDeflexao(lev.eixo),
              bordo_direito:  recalcularDeflexao(lev.bordo_direito),
            };
          }),
        })),
      };
    });
  }, [setFormData]);

  const handleObraChange = useCallback((obraId, obras) => {
    setFormData(prev => ({ ...prev, obra_id: obraId, rodovia: '', empreiteira: '' }));
  }, [setFormData]);

  const handleLeituraInicialChange = useCallback((value) => {
    setFormData(prev => ({
      ...prev,
      leitura_inicial_global: value,
      faixas: value ? prev.faixas.map(faixa => ({
        ...faixa,
        levantamentos: faixa.levantamentos.map(lev => {
          const atualizarLado = (lado) => {
            const ini = parseFloat(value) || 0;
            const fim = parseFloat(lado.leitura_final) || 0;
            const dif = ini - fim;
            return {
              ...lado,
              leitura_inicial: value,
              diferenca: dif,
              deflexao: dif * (parseFloat(prev.cte_viga) || 0.01),
            };
          };
          return {
            ...lev,
            bordo_esquerdo: atualizarLado(lev.bordo_esquerdo),
            eixo:           atualizarLado(lev.eixo),
            bordo_direito:  atualizarLado(lev.bordo_direito),
          };
        }),
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
    handleCteVigaChange,
    handleObraChange,
    handleLeituraInicialChange,
    addFaixa,
    removeFaixa,
    updateFaixaNome,
    updateLevantamento,
  };
}