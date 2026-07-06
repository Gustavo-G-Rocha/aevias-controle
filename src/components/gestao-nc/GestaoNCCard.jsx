import React from "react";
import { useNavigate } from "react-router-dom";
import { Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createPageUrl } from "@/utils";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_ICONS,
  isUserGestor,
  isUserAdmin,
  isUserCliente,
  canUserChangeStatus,
  formatDatePtBR,
  getObraName,
} from "@/utils/gestaoNCUtils";

const GestaoNCCard = React.memo(function GestaoNCCard({
  nc,
  obras,
  user,
  onUpdateStatus,
  onApproval,
  onSolicitarAprovacao,
}) {
  const navigate = useNavigate();
  const isGestor = isUserGestor(user);
  const isAdmin = isUserAdmin(user);
  const isCliente = isUserCliente(user);
  const canChangeStatus = canUserChangeStatus(user);
  const obraName = getObraName(nc, obras);
  const StatusIcon = STATUS_ICONS[nc.status];

  return (
    <Card className="bg-transparent hover:border-primary/30 transition-colors">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left Section - NC Details */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              {nc.numero_rnc && (
                <span className="text-sm font-bold text-foreground bg-secondary/20/30 px-2 py-0.5 rounded">
                  {nc.numero_rnc}
                </span>
              )}
              <Badge className={`${STATUS_COLORS[nc.status] || "bg-gray-100 text-gray-700"} gap-1`}>
                {StatusIcon && <StatusIcon className="w-3 h-3" />}
                {STATUS_LABELS[nc.status] || nc.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDatePtBR(nc.data_nc)}
              </span>
            </div>
            <p className="font-semibold text-foreground">{obraName}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {nc.rodovia && (
                <span>
                  Rodovia: <span className="font-medium text-foreground">{nc.rodovia}</span>
                </span>
              )}
              {nc.trecho && (
                <span>
                  Trecho: <span className="font-medium text-foreground">{nc.trecho}</span>
                </span>
              )}
              {nc.executora && (
                <span>
                  Executora: <span className="font-medium text-foreground">{nc.executora}</span>
                </span>
              )}
              {nc.relatorio_criador && (
                <span>
                  Criado por: <span className="font-medium text-foreground">{nc.relatorio_criador}</span>
                </span>
              )}
            </div>
            {nc.descricao_nc && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{nc.descricao_nc}</p>
            )}
          </div>

          {/* Right Section - Actions */}
          <div className="flex flex-col gap-2 shrink-0">
            {/* Pending Client Approval */}
            {nc.pendente_aprovacao_cliente ? (
              <div className="flex flex-col gap-2">
                <Badge className="bg-orange-100 text-orange-700 text-center gap-1">
                  <Clock className="w-3 h-3" />
                  Aguardando Aprovação do Cliente
                </Badge>
                {isCliente && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => onApproval(nc, "approve")}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white h-7 px-2"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onApproval(nc, "reject")}
                      className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground h-7 px-2"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Reprovar
                    </Button>
                  </div>
                )}
              </div>
            ) : nc.cliente_aprovacao === "aprovada" ? (
              <div className="flex flex-col gap-1">
                {canChangeStatus ? (
                  <>
                    <select
                      value={nc.status || "aberta"}
                      onChange={(e) => onUpdateStatus(nc.id, e.target.value, false)}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground cursor-pointer"
                    >
                      <option value="aberta">Aberta</option>
                      <option value="em_tratativa">Em Tratativa</option>
                      <option value="encerrada">Finalizada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                    <Badge className="bg-green-100 text-green-700 text-center text-xs gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Aprovada pelo Cliente
                    </Badge>
                  </>
                ) : (
                  <>
                    <Badge className={`${STATUS_COLORS[nc.status] || "bg-gray-100 text-gray-700"} gap-1`}>
                      {StatusIcon && <StatusIcon className="w-3 h-3" />}
                      {STATUS_LABELS[nc.status] || nc.status}
                    </Badge>
                    <Badge className="bg-green-100 text-green-700 text-center text-xs gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Aprovada pelo Cliente
                    </Badge>
                  </>
                )}
              </div>
            ) : nc.cliente_aprovacao === "reprovada" ? (
              <div className="flex flex-col gap-1">
                <Badge className="bg-red-100 text-destructive text-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Reprovada - Editar e Reenviar
                </Badge>
                {(isGestor || isAdmin) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(createPageUrl(`EditarNC?id=${nc.id}`))}
                    className="h-7 text-xs text-foreground hover:bg-muted"
                  >
                    Editar NC
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <Badge className={`${STATUS_COLORS[nc.status] || "bg-gray-100 text-gray-700"} gap-1`}>
                  {StatusIcon && <StatusIcon className="w-3 h-3" />}
                  {STATUS_LABELS[nc.status] || nc.status}
                </Badge>
                {(isGestor || isAdmin) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSolicitarAprovacao(nc)}
                    className="h-7 text-xs text-foreground hover:bg-muted"
                  >
                    Solicitar Aprovação
                  </Button>
                )}
              </div>
            )}

            {/* Rejection Reason */}
            {nc.cliente_aprovacao === "reprovada" && nc.cliente_reprovacao_motivo && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-xs">
                <p className="font-semibold text-destructive mb-1">Motivo da Reprovação:</p>
                <p className="text-destructive">{nc.cliente_reprovacao_motivo}</p>
              </div>
            )}

            {/* View Report Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(createPageUrl(`RelatorioNC?id=${nc.id}`), "_blank")}
              className="text-foreground hover:bg-muted"
            >
              <Eye className="w-4 h-4 mr-1" />
              Relatório
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

GestaoNCCard.displayName = 'GestaoNCCard';
export default GestaoNCCard;