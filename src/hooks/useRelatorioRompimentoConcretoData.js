import { useState, useEffect } from "react";
import { obterRegistro } from "@/services/recordsService";
import { carregarObraRegional } from "@/services/relatorioContextService";

export const useRelatorioRompimentoConcretoData = () => {
  const [ensaio, setEnsaio] = useState(null);
  const [obra, setObra] = useState(null);
  const [regional, setRegional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const id = new URLSearchParams(window.location.search).get("id");
        if (!id) {
          setError("ID não fornecido");
          setLoading(false);
          return;
        }

        const data = await obterRegistro('EnsaioRompimentoConcreto', id);
        setEnsaio(data);

        const { obra: obraData, regional: regionalData } = await carregarObraRegional(data.obra_id);
        setObra(obraData);
        setRegional(regionalData);
      } catch (err) {
        setError("Erro ao carregar: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { ensaio, obra, regional, loading, error };
};