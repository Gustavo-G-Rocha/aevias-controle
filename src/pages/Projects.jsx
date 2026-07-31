import React from "react";
import { CardsPageSkeleton } from "@/components/skeletons/PageSkeletons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProjectsData } from "@/hooks/useProjectsData";
import { useProjectsFilters } from "@/hooks/useProjectsFilters";
import { useProjectsActions } from "@/hooks/useProjectsActions";
import {
  getUserAccessLevel,
  canManageProjects,
} from "@/utils/projectsUtils";
import ProjectsHeader from "@/components/projects/ProjectsHeader";
import ProjectsFiltersBar from "@/components/projects/ProjectsFiltersBar";
import ProjectsGrid from "@/components/projects/ProjectsGrid";
import ProjectForm from "@/components/projects/ProjectForm";
import ProjectDetails from "@/components/projects/ProjectDetails";

export default function Projects() {
  const { projects, faixas, regionais, user, loading, loadData } =
    useProjectsData();
  const {
    searchTerm,
    setSearchTerm,
    tipoFilter,
    setTipoFilter,
    filteredProjects,
  } = useProjectsFilters(projects);
  const {
    isFormOpen,
    setIsFormOpen,
    editingProject,
    setEditingProject,
    selectedProject,
    setSelectedProject,
    handleSaveProject,
    handleEdit,
    handleDelete,
  } = useProjectsActions(regionais, loadData);

  const userAccessLevel = getUserAccessLevel(user);
  const isAdmin = userAccessLevel === "admin";
  const canManage = canManageProjects(userAccessLevel);

  if (loading) {
    return <CardsPageSkeleton />;
  }

  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        <ProjectsHeader
          canManage={canManage}
          onNewProject={() => {
            setEditingProject(null);
            setIsFormOpen(true);
          }}
        />

        <ProjectsFiltersBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          tipoFilter={tipoFilter}
          onTipoChange={setTipoFilter}
        />

        <ProjectsGrid
          filteredProjects={filteredProjects}
          faixas={faixas}
          regionais={regionais}
          isAdmin={isAdmin}
          canManage={canManage}
          searchTerm={searchTerm}
          onView={(project) => setSelectedProject(project)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Form Dialog */}
        <Dialog
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setEditingProject(null);
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingProject ? "Editar Projeto" : "Novo Projeto"}
              </DialogTitle>
            </DialogHeader>
            <ProjectForm
              key={editingProject?.id || "new"}
              project={editingProject}
              faixas={faixas}
              regionais={regionais}
              user={user}
              onSave={handleSaveProject}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingProject(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <Dialog
          open={!!selectedProject}
          onOpenChange={() => setSelectedProject(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Detalhes do Projeto
              </DialogTitle>
            </DialogHeader>
            {selectedProject && (
              <ProjectDetails
                project={selectedProject}
                faixas={faixas}
                onClose={() => setSelectedProject(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}