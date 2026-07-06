import { useState, useEffect } from "react";
import { obterRegistro } from "@/services/recordsService";
import { carregarObraRegional } from "@/services/relatorioContextService";
import { logger } from '@/utils/logger';

export const useRelatorioBoletimSondagemData = () => {
  const [boletim, setBoletim] = useState(null);
  const [obra, setObra] = useState(null);
  const [regional, setRegional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        if (!id) { setError("ID não fornecido"); return; }

        const data = await obterRegistro('BoletimSondagem', id);
        setBoletim(data);

        const { obra: obraData, regional: regionalData } = await carregarObraRegional(data.obra_id);
        setObra(obraData);
        setRegional(regionalData);
      } catch (err) {
        logger.error(err);
        setError("Erro ao carregar dados do relatório");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return { boletim, obra, regional, loading, error };
};