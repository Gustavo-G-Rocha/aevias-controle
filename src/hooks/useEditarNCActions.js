import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { uploadArquivo } from "@/services/uploadService";
import { atualizarRegistro } from "@/services/recordsService";
import { createPageUrl } from "@/utils";
import { validateNCForm, buildNCUpdatePayload } from "@/utils/editarNCUtils";

import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';
export const useEditarNCActions = (nc) => {
  const navigate = useNavigate();
  const [uploadingFotos, setUploadingFotos] = useState(false);
  const [uploadingPdfs, setUploadingPdfs] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUploadFotos = useCallback(async (files, currentFotos, setFotos) => {
    if (!files.length) return;
    setUploadingFotos(true);
    try {
      const urls = await Promise.all(
        files.map(async (file) => {
          const { file_url } = await uploadArquivo(file);
          return file_url;
        })
      );
      setFotos((prev) => [...prev, ...urls]);
    } finally {
      setUploadingFotos(false);
    }
  }, []);

  const handleUploadPdfs = useCallback(async (files, currentPdfs, setPdfs) => {
    if (!files.length) return;
    setUploadingPdfs(true);
    try {
      const results = await Promise.all(
        files.map(async (file) => {
          const { file_url } = await uploadArquivo(file);
          return { url: file_url, nome: file.name };
        })
      );
      setPdfs((prev) => [...prev, ...results]);
    } finally {
      setUploadingPdfs(false);
    }
  }, []);

  const handleSave = useCallback(
    async (form, fotos, pdfs) => {
      if (!validateNCForm(form)) {
        toast({ title: "Preencha os campos obrigatórios: Data da NC e Descrição.", variant: "destructive" });
        return;
      }

      setSaving(true);
      try {
        const payload = buildNCUpdatePayload(form, fotos, pdfs);
        await atualizarRegistro('RelatorioNC', nc.id, payload);
        navigate(createPageUrl("GestaoNC"));
      } catch (error) {
        logger.error("[EditarNC] Erro ao salvar NC:", error?.message || error);
        toast({ title: "Erro ao salvar a NC. Tente novamente.", variant: "destructive" });
      } finally {
        setSaving(false);
      }
    },
    [nc, navigate]
  );

  return {
    uploadingFotos,
    uploadingPdfs,
    saving,
    handleUploadFotos,
    handleUploadPdfs,
    handleSave,
  };
};