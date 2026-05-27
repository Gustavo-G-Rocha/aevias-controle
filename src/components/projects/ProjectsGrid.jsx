import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import ProjectCard from "./ProjectCard";

export default function ProjectsGrid({
  filteredProjects,
  faixas,
  regionais,
  isAdmin,
  canManage,
  searchTerm,
  onView,
  onEdit,
  onDelete,
}) {
  if (filteredProjects.length === 0) {
    return (
      <Card className="bg-white/20 backdrop-blur-lg border border-white/20 text-[#00233B]">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-[#BFCF99]" />
          </div>
          <h3 className="text-lg font-semibold text-[#00233B] mb-2">
            Nenhum projeto encontrado
          </h3>
          <p className="text-[#00233B]/80 text-center">
            {searchTerm
              ? "Tente ajustar seus filtros de pesquisa."
              : "Comece criando seu primeiro projeto."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProjects.map((project) => {
        const faixa = faixas.find((f) => f.id === project.faixa_granulometrica_id);
        const regional = regionais.find((r) => r.id === project.regional_id);

        return (
          <ProjectCard
            key={project.id}
            project={project}
            faixa={faixa}
            regionalNome={regional?.nome}
            isAdmin={isAdmin}
            canManage={canManage}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
}