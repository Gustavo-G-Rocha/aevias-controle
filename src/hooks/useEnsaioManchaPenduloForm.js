import { useCallback } from 'react';
import {
  getLimitesOrgao,
  avaliarConformidade,
  calcularManchaValores,
  calcularPenduloValores
} from '@/utils/ensaioManchaPenduloUtils';

const CAMPOS_MANCHA_PERMITIDOS = ['estaca', 'faixa_pista', 'bordo', 'd1', 'd2', 'd3', 'd4', 'volume_areia'];
const CAMPOS_PENDULO_PERMITIDOS = ['estaca', 'faixa_pista', 'bordo', 'temp_pavimento', 'leitura_1', 'leitura_2', 'leitura_3', 'leitura_4', 'leitura_5'];

export const useEnsaioManchaPenduloForm = (formData, setFormData) => {
  const handleInputChange = useCallback((field, value) => {
    if (field === 'orgao') {
      const limites = getLimitesOrgao(value);
      const limites_mancha = '0,6mm ≤ HS ≤ 1,2mm';
      const limites_pendulo = `VRD ≥ ${limites.vrd_min}`;
      const novaConformidade = avaliarConformidade(formData.ensaios_mancha, formData.ensaios_pendulo, value);
      
      setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        limites_mancha,
        limites_pendulo,
        condicao_conformidade: novaConformidade
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  }, [formData.ensaios_mancha, formData.ensaios_pendulo, setFormData]);

  const handleObraChange = useCallback((obraId) => {
    setFormData(prev => ({
      ...prev,
      obra_id: obraId,
      rodovia: '',
      trecho: '',
      pista: '',
      empreiteira: ''
    }));
  }, [setFormData]);

  const handleManchaChange = useCallback((index, field, value) => {
    if (!CAMPOS_MANCHA_PERMITIDOS.includes(field)) return;
    const newEnsaios = [...formData.ensaios_mancha];
    if (!newEnsaios[index]) {
      newEnsaios[index] = { numero: index + 1, volume_areia: 25000 };
    }
    newEnsaios[index] = { ...newEnsaios[index], [field]: value };
    newEnsaios[index] = calcularManchaValores(newEnsaios[index]);
    
    const novaConformidade = avaliarConformidade(newEnsaios, formData.ensaios_pendulo, formData.orgao);
    setFormData(prev => ({ 
      ...prev, 
      ensaios_mancha: newEnsaios,
      condicao_conformidade: novaConformidade
    }));
  }, [formData.ensaios_pendulo, formData.orgao, setFormData]);

  const handlePenduloChange = useCallback((index, field, value) => {
    if (!CAMPOS_PENDULO_PERMITIDOS.includes(field)) return;
    const newEnsaios = [...formData.ensaios_pendulo];
    if (!newEnsaios[index]) {
      newEnsaios[index] = { numero: index + 1 };
    }
    newEnsaios[index] = { ...newEnsaios[index], [field]: value };
    newEnsaios[index] = calcularPenduloValores(newEnsaios[index]);
    
    const novaConformidade = avaliarConformidade(formData.ensaios_mancha, newEnsaios, formData.orgao);
    setFormData(prev => ({ 
      ...prev, 
      ensaios_pendulo: newEnsaios,
      condicao_conformidade: novaConformidade
    }));
  }, [formData.ensaios_mancha, formData.orgao, setFormData]);

  return {
    handleInputChange,
    handleObraChange,
    handleManchaChange,
    handlePenduloChange
  };
};