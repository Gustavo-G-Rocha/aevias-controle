import { useState, useMemo } from "react";

export const useProjectsFilters = (projects) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState("all");

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTipo =
        tipoFilter === "all" ||
        (project.tipo_projeto || "CAUQ") === tipoFilter;
      return matchesSearch && matchesTipo;
    });
  }, [projects, searchTerm, tipoFilter]);

  return {
    searchTerm,
    setSearchTerm,
    tipoFilter,
    setTipoFilter,
    filteredProjects,
  };
};