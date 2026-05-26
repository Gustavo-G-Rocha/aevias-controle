/**
 * Hook que gerencia os estados de filtro da página de Regionais
 * e retorna a lista filtrada de regionais.
 */
import { useState, useMemo } from "react";
import { filtrarRegionaisPorBusca } from "@/utils/regionaisUtils";

export function useRegionaisFilters(regionais) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredRegionais = useMemo(
    () => filtrarRegionaisPorBusca(regionais, searchTerm),
    [regionais, searchTerm]
  );

  return {
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    filteredRegionais,
  };
}