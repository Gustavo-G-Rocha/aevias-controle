/**
 * Hook de mutações do formulário de EnsaioDensidadeInSitu.
 * Gerencia handlers de furos, dados globais, Proctor e fotos.
 */
import { useState, useCallback } from "react";
import { uploadArquivo } from "@/services/uploadService";
import { calcularFuroComProctor, getFuroInicial } from "@/utils/ensaioDensidadeUtils";
import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';

export function useEnsaioDensidadeForm(formData, setFormData) {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // ── Furos ─────────────────────────────────────────────────────────────────

  const handleFuroChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const novosFuros = [...prev.furos];
      novosFuros[index] = { ...novosFuros[index], [field]: value };
      novosFuros[index] = calcularFuroComProctor(
        novosFuros[index],
        prev.dados_proctor,
        prev.densidade_areia,
        prev.peso_areia_funil,
        prev.substituicao_retido_3_4,
        prev.densidade_real_retida_3_4
      );
      return { ...prev, furos: novosFuros };
    });
  }, [setFormData]);

  const handleProctorChange = useCallback((field, value) => {
    setFormData(prev => {
      const novosDadosProctor = { ...prev.dados_proctor, [field]: value };
      const novosFuros = prev.furos.map(furo =>
        calcularFuroComProctor(
          furo,
          novosDadosProctor,
          prev.densidade_areia,
          prev.peso_areia_funil,
          prev.substituicao_retido_3_4,
          prev.densidade_real_retida_3_4
        )
      );
      return { ...prev, dados_proctor: novosDadosProctor, furos: novosFuros };
    });
  }, [setFormData]);

  const handleGlobalDataChange = useCallback((field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      const novosFuros = prev.furos.map(furo =>
        calcularFuroComProctor(
          furo,
          prev.dados_proctor,
          field === 'densidade_areia' ? value : prev.densidade_areia,
          field === 'peso_areia_funil' ? value : prev.peso_areia_funil,
          field === 'substituicao_retido_3_4' ? value : prev.substituicao_retido_3_4,
          field === 'densidade_real_retida_3_4' ? value : prev.densidade_real_retida_3_4
        )
      );
      return { ...newData, furos: novosFuros };
    });
  }, [setFormData]);

  const adicionarFuro = useCallback(() => {
    setFormData(prev => {
      if (prev.furos.length >= 5) {
        toast({ title: "Máximo de 5 furos permitidos.", variant: "destructive" });
        return prev;
      }
      return { ...prev, furos: [...prev.furos, getFuroInicial(prev.furos.length + 1)] };
    });
  }, [setFormData]);

  const removerFuro = useCallback((index) => {
    setFormData(prev => {
      if (prev.furos.length <= 1) return prev;
      return {
        ...prev,
        furos: prev.furos
          .filter((_, i) => i !== index)
          .map((f, i) => ({ ...f, numero: i + 1 })),
      };
    });
  }, [setFormData]);

  // ── Fotos ─────────────────────────────────────────────────────────────────

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingPhoto(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await uploadArquivo(file);
        uploadedUrls.push(file_url);
      }
      setFormData(prev => ({ ...prev, fotos: [...(prev.fotos || []), ...uploadedUrls] }));
      e.target.value = '';
    } catch (error) {
      logger.error("Erro ao fazer upload da foto:", error);
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
    handleFuroChange,
    handleProctorChange,
    handleGlobalDataChange,
    adicionarFuro,
    removerFuro,
    handlePhotoUpload,
    handleRemovePhoto,
  };
}