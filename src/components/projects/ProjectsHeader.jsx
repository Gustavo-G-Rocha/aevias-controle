import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ProjectsHeader({ canManage, onNewProject }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Projetos</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie os projetos de pavimentação
        </p>
      </div>
      {canManage && (
        <Button
          onClick={onNewProject}
          className="bg-muted text-[#F2F1EF] hover:bg-muted/90"
        >
          <Plus className="w-4 h-4 mr-2 text-[#BFCF99]" />
          Novo Projeto
        </Button>
      )}
    </div>
  );
}