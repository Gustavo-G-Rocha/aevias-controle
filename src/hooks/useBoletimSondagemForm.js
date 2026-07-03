/**
 * Hook com todos os handlers de mutação do formulário do Boletim de Sondagem.
 * Recebe setFormData e devolve handlers puros, sem lógica de negócio própria.
 */
import { useCallback } from "react";
import { uploadArquivo } from "@/services/uploadService";
import {
  getCamadaInicial,
  getDensidadeInicial,
  calcularUmidade,
  calcularDensidade,
  recalcularCamadas,
  removerCamadaDoArray,
} from "@/utils/boletimSondagemUtils";

export function useBoletimSondagemForm(setFormData) {
  const handleObraChange = useCallback((obraId, obras, regionais) => {
    const obra = obras.find(o => o.id === obraId);
    const regional = obra ? regionais.find(r => r.id === obra.regional_id) : null;
    setFormData(prev => ({
      ...prev,
      obra_id: obraId,
      rodovia: "",
      cliente: regional?.cliente || prev.cliente,
    }));
  }, [setFormData]);

  const handleCamadaChange = useCallback((index, field, value) => {
    setFormData(prev => ({
      ...prev,
      camadas: recalcularCamadas(prev.camadas, index, field, value),
    }));
  }, [setFormData]);

  const adicionarCamada = useCallback(() => {
    setFormData(prev => {
      if (prev.camadas.length >= 15) return prev;
      const ultima = prev.camadas[prev.camadas.length - 1];
      const novaCamada = { ...getCamadaInicial(prev.camadas.length + 1), prof_de: ultima?.prof_ate ?? null };
      return { ...prev, camadas: [...prev.camadas, novaCamada] };
    });
  }, [setFormData]);

  const removerCamada = useCallback((index) => {
    setFormData(prev => ({ ...prev, camadas: removerCamadaDoArray(prev.camadas, index) }));
  }, [setFormData]);

  const adicionarCamada2 = useCallback(() => {
    setFormData(prev => {
      const camadas2 = prev.camadas_2 || [];
      if (camadas2.length >= 15) return prev;
      const ultima = camadas2[camadas2.length - 1];
      const novaCamada = { numero: camadas2.length + 1, prof_de: ultima?.prof_ate ?? null, prof_ate: null, espessura: null, na: null, classificacao_2: "" };
      return { ...prev, camadas_2: [...camadas2, novaCamada] };
    });
  }, [setFormData]);

  const removerCamada2 = useCallback((index) => {
    setFormData(prev => {
      if (!prev.camadas_2 || prev.camadas_2.length <= 1) return prev;
      return { ...prev, camadas_2: removerCamadaDoArray(prev.camadas_2, index) };
    });
  }, [setFormData]);

  const handleUmidadeChange = useCallback((field, value) => {
    setFormData(prev => {
      const un = { ...prev.umidade_natural, [field]: value };
      for (const lado of [1, 2]) {
        const { agua, soloSeco, umidade } = calcularUmidade(un, lado);
        un[`massa_agua_${lado}`] = agua;
        un[`massa_solo_seco_${lado}`] = soloSeco;
        un[`umidade_${lado}`] = umidade;
      }
      return { ...prev, umidade_natural: un };
    });
  }, [setFormData]);

  const handleDensidadeChange = useCallback((idx, field, value) => {
    setFormData(prev => {
      const arr = [...(prev.densidades_in_situ || [getDensidadeInicial()])];
      const d = { ...arr[idx], [field]: value };
      arr[idx] = { ...d, ...calcularDensidade(d) };
      return { ...prev, densidades_in_situ: arr };
    });
  }, [setFormData]);

  const adicionarDensidade = useCallback(() => {
    setFormData(prev => {
      if ((prev.densidades_in_situ || []).length >= 3) return prev;
      return { ...prev, densidades_in_situ: [...(prev.densidades_in_situ || []), getDensidadeInicial()] };
    });
  }, [setFormData]);

  const removerDensidade = useCallback((idx) => {
    setFormData(prev => {
      const arr = (prev.densidades_in_situ || []).filter((_, i) => i !== idx);
      return { ...prev, densidades_in_situ: arr.length > 0 ? arr : [getDensidadeInicial()] };
    });
  }, [setFormData]);

  const handlePhotoUpload = useCallback(async (e, setUploadingPhoto) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploadingPhoto(true);
    try {
      const urls = [];
      for (const file of files) {
        const { file_url } = await uploadArquivo(file);
        urls.push(file_url);
      }
      setFormData(prev => ({ ...prev, fotos: [...(prev.fotos || []), ...urls] }));
      e.target.value = '';
    } catch {
      alert("Erro ao fazer upload da foto.");
    } finally {
      setUploadingPhoto(false);
    }
  }, [setFormData]);

  const handleRemovePhoto = useCallback((index) => {
    setFormData(prev => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== index) }));
  }, [setFormData]);

  return {
    handleObraChange,
    handleCamadaChange,
    adicionarCamada,
    removerCamada,
    adicionarCamada2,
    removerCamada2,
    handleUmidadeChange,
    handleDensidadeChange,
    adicionarDensidade,
    removerDensidade,
    handlePhotoUpload,
    handleRemovePhoto,
  };
}