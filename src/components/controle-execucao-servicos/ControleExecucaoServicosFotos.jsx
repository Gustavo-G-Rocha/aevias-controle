import React, { useState } from "react";
import UploadGallery from "@/components/forms/UploadGallery";
import { uploadImagem } from "@/services/uploadService";
import { toast } from "@/components/ui/use-toast";
import { logger } from "@/utils/logger";
import { useControleExecucaoServicosCtx } from "./ControleExecucaoServicosContext";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

export default function ControleExecucaoServicosFotos() {
  const { formData, setFormData, canEdit } = useControleExecucaoServicosCtx();
  const [uploading, setUploading] = useState(false);
  const [fileNames, setFileNames] = useState("Nenhum ficheiro selecionado");

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) { setFileNames("Nenhum ficheiro selecionado"); return; }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) { toast({ title: `Tipo de arquivo não suportado: ${file.type}`, variant: "destructive" }); e.target.value = ''; return; }
      if (file.size > 10 * 1024 * 1024) { toast({ title: `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB`, variant: "destructive" }); e.target.value = ''; return; }
    }

    setUploading(true);
    setFileNames(files.length === 1 ? files[0].name : `${files.length} ficheiros selecionados`);

    try {
      const results = await Promise.allSettled(files.map(file => uploadImagem(file)));
      const uploadedUrls = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value.file_url);
      if (uploadedUrls.length > 0) {
        setFormData(prev => ({ ...prev, fotos: [...(prev.fotos || []), ...uploadedUrls] }));
      }
      if (uploadedUrls.length < files.length) {
        toast({ title: `${files.length - uploadedUrls.length} imagem(ns) falharam ao enviar. ${uploadedUrls.length} enviada(s) com sucesso.`, variant: "destructive" });
      }
    } catch (error) {
      logger.error("Erro ao fazer upload das fotos:", error);
      toast({ title: "Erro ao fazer upload das fotos.", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index) => {
    setFormData(prev => ({ ...prev, fotos: (prev.fotos || []).filter((_, i) => i !== index) }));
  };

  const handleLegendChange = (index, legenda) => {
    setFormData(prev => {
      const fotos = [...(prev.fotos || [])];
      const foto = fotos[index];
      fotos[index] = typeof foto === 'string' ? { url: foto, legenda } : { ...foto, legenda };
      return { ...prev, fotos };
    });
  };

  return (
    <UploadGallery
      fotos={formData.fotos || []}
      onFileChange={handleFileChange}
      onRemove={handleRemovePhoto}
      onLegendChange={handleLegendChange}
      loading={uploading}
      progress={[]}
      isEditable={canEdit}
      isApproved={false}
      fileNames={fileNames}
      inputId="fotos-controle-execucao"
      label="Registro Fotográfico"
    />
  );
}