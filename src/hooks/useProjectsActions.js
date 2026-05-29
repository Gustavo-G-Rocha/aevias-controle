import { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  removeProjectFromRegional,
  addProjectIdToRegional,
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
          await base44.entities.Project.update(editingProject.id, projectData);
          savedProject = { ...editingProject, ...projectData };

          if (editingProject.regional_id !== projectData.regional_id) {
            // Remove from old regional
            if (editingProject.regional_id) {
              const regionalAntiga = regionais.find(
                (r) => r.id === editingProject.regional_id
              );
              if (regionalAntiga?.project_ids) {
                const novosProjectIds = removeProjectFromRegional(
                  regionalAntiga.project_ids,
                  editingProject.id
                );
                await base44.entities.Regional.update(regionalAntiga.id, {
                  project_ids: novosProjectIds,
                });
              }
            }

            // Add to new regional
            if (projectData.regional_id) {
              const regionalNova = regionais.find(
                (r) => r.id === projectData.regional_id
              );
              if (regionalNova) {
                const projectIds = addProjectIdToRegional(
                  regionalNova.project_ids || [],
                  editingProject.id
                );
                await base44.entities.Regional.update(regionalNova.id, {
                  project_ids: projectIds,
                });
              }
            }
          }
        } else {
          savedProject = await base44.entities.Project.create(projectData);

          if (projectData.regional_id) {
            const regional = regionais.find(
              (r) => r.id === projectData.regional_id
            );
            if (regional) {
              const projectIds = addProjectIdToRegional(
                regional.project_ids || [],
                savedProject.id
              );
              await base44.entities.Regional.update(regional.id, {
                project_ids: projectIds,
              });
            }
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
          await base44.entities.Project.delete(project.id);
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