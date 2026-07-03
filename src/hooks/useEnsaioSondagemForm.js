/**
 * Hook com todos os handlers de mutação do formulário do Ensaio de Sondagem.
 */
import { useCallback } from "react";
import { uploadArquivo } from "@/services/uploadService";
import {
  getCorpoProvaInicial,
  recalcularCP,
  validarArquivoFoto,
} from "@/utils/ensaioSondagemUtils";
import { toast } from "@/components/ui/use-toast";

export function useEnsaioSondagemForm(formData, setFormData) {
  const addCorpoProva = useCallback(() => {
    if (formData.corpos_prova.length >= 10) {
      toast({ title: "Máximo de 10 corpos de prova permitido.", variant: "destructive" });
      return;
    }
    setFormData(prev => ({
      ...prev,
      corpos_prova: [...prev.corpos_prova, getCorpoProvaInicial(prev.corpos_prova.length + 1)],
    }));
  }, [formData.corpos_prova.length, setFormData]);

  const removeCorpoProva = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      corpos_prova: prev.corpos_prova
        .filter((_, i) => i !== index)
        .map((cp, idx) => ({ ...cp, numero: idx + 1 })),
    }));
  }, [setFormData]);

  const updateCorpoProva = useCallback((index, field, value) => {
    setFormData(prev => {
      const newCPs = [...prev.corpos_prova];
      newCPs[index] = recalcularCP(
        newCPs[index],
        field,
        value,
        prev.metodo_ensaio,
        prev.dens_agua_25c,
        prev.dens_aparente_projeto,
        prev.fator_correcao_prensa,
      );
      return { ...prev, corpos_prova: newCPs };
    });
  }, [setFormData]);

  const handleFileChange = useCallback(async (e, setUploadingPhotos, setSelectedFileNames) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) {
      setSelectedFileNames("Nenhum ficheiro selecionado");
      return;
    }
    try {
      files.forEach(f => validarArquivoFoto(f));
    } catch (error) {
      toast({ title: error.message, variant: "destructive" });
      e.target.value = '';
      return;
    }
    setUploadingPhotos(true);
    setSelectedFileNames(files.length === 1 ? files[0].name : `${files.length} ficheiros selecionados`);
    try {
      const results = await Promise.all(files.map(file => uploadArquivo(file)));
      setFormData(prev => ({ ...prev, fotos: [...prev.fotos, ...results.map(r => r.file_url)] }));
    } catch (error) {
      console.error("[EnsaioSondagem] Erro ao fazer upload das fotos:", error?.message || error);
      toast({ title: "Erro ao fazer upload das fotos.", variant: "destructive" });
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  }, [setFormData]);

  const handleRemovePhoto = useCallback((index) => {
    setFormData(prev => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== index) }));
  }, [setFormData]);

  return { addCorpoProva, removeCorpoProva, updateCorpoProva, handleFileChange, handleRemovePhoto };
}