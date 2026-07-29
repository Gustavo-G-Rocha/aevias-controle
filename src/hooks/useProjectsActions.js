import { useState, useCallback } from "react";
import {
  criarProject,
  atualizarProject,
  deletarProject,
} from "@/services/projectsService";
import { atualizarRegional } from "@/services/regionaisService";
import {
  removeProjectFromRegional,
  addProjectIdToRegional,
} from "@/utils/projectsUtils";
import { toast } from "@/components/ui/use-toast";

export const useProjectsActions = (regionais, loadData) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleSaveProject = useCallback(
    async (projectData) => {
      let savedProject;
      try {
        if (editingProject) {
          await atualizarProject(editingProject.id, projectData);
          savedProject = { ...editingProject, ...projectData };
        } else {
          savedProject = await criarProject(projectData);
        }
      } catch (error) {
        toast({ title: `Erro ao salvar: ${error.message || "Erro desconhecido"}`, variant: "destructive" });
        return;
      }

      // Sincronização do project_ids na regional é secundária: o projeto
      // já foi salvo com sucesso. Se a atualização da regional falhar, o
      // projeto continua acessível via campo regional_id do próprio Project.
      // Não bloqueia o fluxo nem mantém o diálogo aberto — apenas avisa.
      let regionalWarning = false;
      try {
        if (editingProject && editingProject.regional_id !== projectData.regional_id) {
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
              await atualizarRegional(regionalAntiga.id, {
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
              await atualizarRegional(regionalNova.id, {
                project_ids: projectIds,
              });
            }
          }
        } else if (!editingProject && projectData.regional_id && savedProject) {
          const regional = regionais.find(
            (r) => r.id === projectData.regional_id
          );
          if (regional) {
            const projectIds = addProjectIdToRegional(
              regional.project_ids || [],
              savedProject.id
            );
            await atualizarRegional(regional.id, {
              project_ids: projectIds,
            });
          }
        }
      } catch {
        regionalWarning = true;
      }

      setIsFormOpen(false);
      setEditingProject(null);
      loadData();

      if (regionalWarning) {
        toast({
          title: "Projeto salvo, mas houve um aviso",
          description: "A vinculação automática do projeto na regional falhou. O projeto foi criado, mas pode ser necessário verificar a associação regional manualmente.",
          variant: "warning",
        });
      }
    },
    [editingProject, loadData, regionais]
  );

  // Fecha o diálogo primeiro e só reabre no próximo tick para evitar
  // "Failed to execute 'removeChild' on 'Node'" quando o portal do Radix
  // ainda está em transição (fechando) e o conteúdo muda (ex.: CAUQ → BGS).
  const handleEdit = useCallback((project) => {
    setIsFormOpen(false);
    setTimeout(() => {
      setEditingProject(project);
      setIsFormOpen(true);
    }, 0);
  }, []);

  const handleDelete = useCallback(
    async (project) => {
      if (window.confirm("Tem certeza que deseja excluir este projeto?")) {
        try {
          await deletarProject(project.id);
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