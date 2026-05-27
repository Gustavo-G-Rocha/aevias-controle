import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

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

        const data = await base44.entities.BoletimSondagem.get(id);
        setBoletim(data);

        if (data.obra_id) {
          const obraData = await base44.entities.Obra.get(data.obra_id);
          setObra(obraData);
          if (obraData.regional_id) {
            const regionalData = await base44.entities.Regional.get(obraData.regional_id);
            setRegional(regionalData);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar dados do relatório");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return { boletim, obra, regional, loading, error };
};