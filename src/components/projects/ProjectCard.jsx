import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import {
  TIPO_PROJETO_COLORS,
  TIPO_PROJETO_LABELS,
  STATUS_COLORS,
} from "@/utils/projectsUtils";

export default function ProjectCard({
  project,
  faixa,
  regionalNome,
  isAdmin,
  canManage,
  onView,
  onEdit,
  onDelete,
}) {
  const tipoLabel =
    TIPO_PROJETO_LABELS[project.tipo_projeto] ||
    project.tipo_projeto ||
    "CAUQ";

  return (
    <Card className="hover:border-primary/30 hover:shadow-md transition-all">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground line-clamp-1">
              {project.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge
                className={
                  TIPO_PROJETO_COLORS[project.tipo_projeto || "CAUQ"]
                }
              >
                {tipoLabel}
              </Badge>
              {regionalNome && (
                <Badge
                  variant="outline"
                  className="text-xs"
                >
                  {regionalNome}
                </Badge>
              )}
            </div>
          </div>
          <Badge
            className={
              STATUS_COLORS[project.status] || STATUS_COLORS.ativo
            }
          >
            {project.status || "ativo"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Cliente</p>
            <p className="text-sm text-foreground">{project.client}</p>
          </div>
          {project.tipo_projeto !== "CARTA_TRACO_CONCRETO" && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Faixa Granulométrica
              </p>
              <p className="text-sm text-foreground">
                {faixa ? faixa.nome : "Não definida"}
              </p>
            </div>
          )}
          {project.tipo_projeto === "CARTA_TRACO_CONCRETO" && project.fck && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">FCK</p>
              <p className="text-sm text-foreground">{project.fck} MPa</p>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(project)}
              className="text-foreground hover:bg-[#566E3D]/10"
            >
              <Eye className="w-4 h-4 mr-1 text-[#566E3D]" />
              Ver
            </Button>
            {canManage && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(project)}
                  className="text-foreground hover:bg-amber-500/10"
                >
                  <Edit className="w-4 h-4 mr-1 text-amber-600" />
                  Editar
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(project)}
                    className="text-red-600 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}