import { useState, useMemo } from "react";

export const useGestaoNCFilters = (ncs) => {
  const [filtroObra, setFiltroObra] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");

  const filtradas = useMemo(() => {
    return ncs.filter((nc) => {
      if (filtroObra && nc.obra_id !== filtroObra) return false;
      if (filtroStatus && nc.status !== filtroStatus) return false;
      if (filtroTexto) {
        const termo = filtroTexto.toLowerCase();
        if (
          !nc.numero_rnc?.toLowerCase().includes(termo) &&
          !nc.rodovia?.toLowerCase().includes(termo) &&
          !nc.trecho?.toLowerCase().includes(termo) &&
          !nc.descricao_nc?.toLowerCase().includes(termo) &&
          !nc.executora?.toLowerCase().includes(termo)
        )
          return false;
      }
      return true;
    });
  }, [ncs, filtroObra, filtroStatus, filtroTexto]);

  return {
    filtroObra,
    setFiltroObra,
    filtroStatus,
    setFiltroStatus,
    filtroTexto,
    setFiltroTexto,
    filtradas,
  };
};