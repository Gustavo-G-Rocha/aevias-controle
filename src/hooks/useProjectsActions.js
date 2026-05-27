import { useState, useCallback } from "react";
import { Project } from "@/entities/Project";
import { Regional } from "@/entities/Regional";
import {
  updateProjectRegional,
  addProjectToRegional,
} from "@/utils/projectsUtils";

export const useProjectsActions = (regionais, loadData) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleSaveProject = useCallback(
    async (projectData) => {
      try {
        let savedProject;
        if (editingProject) {
          await Project.update(editingProject.id, projectData);
          savedProject = { ...editingProject, ...projectData };

          if (editingProject.regional_id !== projectData.regional_id) {
            await updateProjectRegional(
              editingProject.id,
              editingProject.regional_id,
              projectData.regional_id,
              regionais
            );
          }
        } else {
          savedProject = await Project.create(projectData);

          if (projectData.regional_id) {
            await addProjectToRegional(
              savedProject.id,
              projectData.regional_id,
              regionais
            );
          }
        }

        setIsFormOpen(false);
        setEditingProject(null);
        loadData();
      } catch (error) {
        alert(`Erro ao salvar: ${error.message || "Erro desconhecido"}`);
      }
    },
    [editingProject, loadData, regionais]
  );

  const handleEdit = useCallback((project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (project) => {
      if (window.confirm("Tem certeza que deseja excluir este projeto?")) {
        try {
          await Project.delete(project.id);
          loadData();
        } catch {
          // Error handled silently
        }
      }
    },
    [loadData]
  );

  return {
    isFormOpen,
    setIsFormOpen,
    editingProject,
    setEditingProject,
    selectedProject,
    setSelectedProject,
    handleSaveProject,
    handleEdit,
    handleDelete,
  };
};