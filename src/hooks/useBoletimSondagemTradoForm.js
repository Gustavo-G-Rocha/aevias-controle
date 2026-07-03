/**
 * Hook de mutações do formulário de BoletimSondagemTrado.
 * Gerencia handlers de camadas, umidade, densidades e fotos.
 */
import { useState, useCallback } from "react";
import { uploadArquivo } from "@/services/uploadService";
import {
  calcularUmidade,
  calcularDensidade,
  getDensidadeInicial,
  getUmidadeNatural2Inicial,
} from "@/utils/boletimSondagemTradoUtils";
import { toast } from "@/components/ui/use-toast";

export function useBoletimSondagemTradoForm(setFormData) {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // ── Obra ──────────────────────────────────────────────────────────────────

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

  // ── Camadas ───────────────────────────────────────────────────────────────

  const handleCamadaChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newCamadas = prev.camadas.map(c => ({ ...c }));
      newCamadas[index] = { ...newCamadas[index], [field]: value };

      if (field === 'prof_de' && index === 0) {
        const { prof_de, prof_ate } = newCamadas[0];
        newCamadas[0].espessura =
          prof_de !== null && prof_ate !== null
            ? parseFloat((prof_ate - prof_de).toFixed(2))
            : null;
      }

      if (field === 'prof_ate') {
        const { prof_de, prof_ate } = newCamadas[index];
        newCamadas[index].espessura =
          prof_de !== null && prof_ate !== null
            ? parseFloat((prof_ate - prof_de).toFixed(2))
            : null;

        if (index + 1 < newCamadas.length) {
          newCamadas[index + 1].prof_de = prof_ate;
          const nextAte = newCamadas[index + 1].prof_ate;
          newCamadas[index + 1].espessura =
            prof_ate !== null && nextAte !== null
              ? parseFloat((nextAte - prof_ate).toFixed(2))
              : null;
        }
      }

      return { ...prev, camadas: newCamadas };
    });
  }, [setFormData]);

  const adicionarCamada = useCallback(() => {
    setFormData(prev => {
      if (prev.camadas.length >= 15) return prev;
      const ultima = prev.camadas[prev.camadas.length - 1];
      const novaDe = ultima?.prof_ate ?? null;
      const novaCamada = {
        numero: prev.camadas.length + 1,
        prof_de: novaDe,
        prof_ate: null,
        espessura: null,
        na: null,
        classificacao_1: "",
      };
      return { ...prev, camadas: [...prev.camadas, novaCamada] };
    });
  }, [setFormData]);

  const removerCamada = useCallback((index) => {
    setFormData(prev => {
      if (prev.camadas.length <= 1) return prev;
      const newCamadas = prev.camadas
        .filter((_, i) => i !== index)
        .map((c, i) => ({ ...c, numero: i + 1 }));
      for (let i = index; i < newCamadas.length; i++) {
        newCamadas[i].prof_de = i === 0 ? 0 : (newCamadas[i - 1].prof_ate ?? null);
        const { prof_de, prof_ate } = newCamadas[i];
        newCamadas[i].espessura =
          prof_de !== null && prof_ate !== null
            ? parseFloat((prof_ate - prof_de).toFixed(2))
            : null;
      }
      return { ...prev, camadas: newCamadas };
    });
  }, [setFormData]);

  // ── Umidade ───────────────────────────────────────────────────────────────

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

  const adicionarUmidade2 = useCallback(() => {
    setFormData(prev => ({ ...prev, umidade_natural_2: getUmidadeNatural2Inicial() }));
  }, [setFormData]);

  const removerUmidade2 = useCallback(() => {
    setFormData(prev => ({ ...prev, umidade_natural_2: null }));
  }, [setFormData]);

  const handleUmidade2Change = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      umidade_natural_2: { ...prev.umidade_natural_2, [field]: value },
    }));
  }, [setFormData]);

  // ── Densidade in situ ─────────────────────────────────────────────────────

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
      return {
        ...prev,
        densidades_in_situ: [...(prev.densidades_in_situ || []), getDensidadeInicial()],
      };
    });
  }, [setFormData]);

  const removerDensidade = useCallback((idx) => {
    setFormData(prev => {
      const arr = (prev.densidades_in_situ || []).filter((_, i) => i !== idx);
      return { ...prev, densidades_in_situ: arr.length > 0 ? arr : [getDensidadeInicial()] };
    });
  }, [setFormData]);

  // ── Fotos ─────────────────────────────────────────────────────────────────

  const handlePhotoUpload = async (e) => {
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
    } catch (error) {
      toast({ title: "Erro ao fazer upload da foto.", variant: "destructive" });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = useCallback((index) => {
    setFormData(prev => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== index) }));
  }, [setFormData]);

  return {
    uploadingPhoto,
    handleObraChange,
    handleCamadaChange,
    adicionarCamada,
    removerCamada,
    handleUmidadeChange,
    adicionarUmidade2,
    removerUmidade2,
    handleUmidade2Change,
    handleDensidadeChange,
    adicionarDensidade,
    removerDensidade,
    handlePhotoUpload,
    handleRemovePhoto,
  };
}