// Card de ensaio para a interface de laboratorista
import React, { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Edit, MessageSquare, MapPin, User as UserIconSmall, Building, RotateCcw, PenLine, CloudOff } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getEnsaioTypeInfo, getReportLink, getDataFormatted } from "@/components/ensaios/ensaioMappers";
import { getLaboratoristaInfo, getResponsavelInfo, getRodoviaInfo, getTrechoInfo, getNaoConformidades, getStatusInfo } from "@/components/ensaios/utils";
import { assinarEnsaio } from "@/services/ensaiosService";
import { QUERY_KEYS } from "@/hooks/useQueryData";
import { toast } from "@/components/ui/use-toast";
import { SIGN_DIALOG, buildSignDescription, OFFLINE_BADGE_LABEL } from "@/constants/ensaioUi";
import CriticalActionDialog from "@/components/ensaios/CriticalActionDialog";

const EnsaioCard = React.memo(({ ensaio, obra, user, allUsers }) => {
  const queryClient = useQueryClient();
  const status = getStatusInfo(ensaio);
  const { name, icon: TypeIcon } = getEnsaioTypeInfo(ensaio);
  const reportUrl = getReportLink(ensaio);
  const laboratorista = getLaboratoristaInfo(ensaio, allUsers);
  const dataFormatted = getDataFormatted(ensaio);

  const editLink = createPageUrl(`${ensaio.entityType}?editId=${ensaio.id}`);
  const isCliente = user?.access_level === 'cliente' || user?.access_level === 'cliente_supervisor';
  const podeVerPDF = ensaio.approved === true || ensaio.client_signature?.signed_by;
  const isOwner = (
    (user?.email && ensaio.created_by?.toLowerCase() === user.email.toLowerCase()) ||
    (user?.id && ensaio.created_by_id === user.id)
  );
  const podeEditar = isOwner && !isCliente && (ensaio.status === 'rascunho' || ensaio.approved === false) && !ensaio.client_signature?.signed_by;
  const podeAssinar = isCliente && ensaio.approved === true && !ensaio.client_signature?.signed_by;
  const jaAssinado = ensaio.client_signature?.signed_by === user?.email;

  const handleAssinar = useCallback(async () => {
    try {
      await assinarEnsaio(ensaio, user);
      toast({ title: 'Registro assinado com sucesso!' });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allRecords });
    } catch (error) {
      toast({ title: `Erro ao assinar registro: ${error?.message || 'Erro desconhecido'}.`, variant: "destructive" });
    }
  }, [user, ensaio, queryClient]);

  const renderNcBadge = () => {
    const naoConformidades = getNaoConformidades(ensaio);
    const temAcoesCorretivas = ensaio.acoes_corretivas_realizado === true;
    const temDeflexaoExcessiva = ensaio.tem_deflexao_excessiva === true;
    if (naoConformidades.length > 0) {
      const msg = temAcoesCorretivas
        ? `Não conformidades:\n${naoConformidades.join('\n')}\n\n✓ Ações corretivas foram realizadas`
        : `Não conformidades:\n${naoConformidades.join('\n')}`;
      return <span className="text-destructive cursor-help text-xl" title={msg}>⚠️</span>;
    }
    if (temDeflexaoExcessiva) return <span className="cursor-help text-xl" title="Pontos com deflexão acima do limite admissível">🟡</span>;
    if (temAcoesCorretivas) return <span className="text-orange-500 cursor-help text-xl" title="Ações corretivas realizadas">⚠️</span>;
    return null;
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 bg-card border border-border text-card-foreground">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2 mb-1">
                <TypeIcon className="w-5 h-5 text-secondary" /> {name}
                {renderNcBadge()}
              </h3>
              <p className="text-sm text-muted-foreground">{dataFormatted}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={`${status.className} gap-1.5`}>
                <status.icon className="w-3 h-3" />
                {status.text}
              </Badge>
              {ensaio._offline && (
                <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300/50 text-xs gap-1" data-testid="offline-pending-badge">
                  <CloudOff className="w-3 h-3" /> {OFFLINE_BADGE_LABEL}
                </Badge>
              )}
              {status.wasRejected && <Badge className="bg-orange-100/80 text-orange-800 border border-border/50 text-xs gap-1"><RotateCcw className="w-3 h-3" /> Editado após reprovação</Badge>}
              {jaAssinado && <Badge className="bg-muted/50 border border-border text-xs gap-1"><PenLine className="w-3 h-3" /> Assinado por você</Badge>}
            </div>
          </div>

          <div className="border-t border-border pt-4 pb-2 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5" title="Obra">
                <Building className="w-4 h-4 text-secondary shrink-0" />
                <span className="font-medium ">{obra?.name || ensaio.obra_name || 'N/A'}</span>
                <span className="text-xs">({obra?.code || ensaio.obra_code || 'N/A'})</span>
              </div>
              <div className="flex items-center gap-1.5" title="Laboratorista">
                <UserIconSmall className="w-4 h-4 text-secondary shrink-0" />
                <span>{laboratorista}</span>
              </div>
              {getRodoviaInfo(ensaio) && (
                <div className="flex items-center gap-1.5" title="Rodovia">
                  <MapPin className="w-4 h-4 text-secondary shrink-0" />
                  <span className="font-medium">{getRodoviaInfo(ensaio)}</span>
                </div>
              )}
              {getTrechoInfo(ensaio) && (
                <div className="flex items-center gap-1.5" title="Trecho">
                  <MapPin className="w-4 h-4 text-secondary shrink-0" />
                  <span className="text-xs">Trecho: {getTrechoInfo(ensaio)}</span>
                </div>
              )}
              {getResponsavelInfo(ensaio) && (
                <div className="flex items-center gap-1.5" title="Responsável">
                  <Building className="w-4 h-4 text-secondary shrink-0" />
                  <span className="font-medium">{getResponsavelInfo(ensaio)}</span>
                </div>
              )}
            </div>

            {ensaio.sample_id && (
              <div className="text-sm">
                <span className="font-medium ">Amostra/ID: </span>
                <span className="text-foreground">{ensaio.sample_id}</span>
              </div>
            )}

            {ensaio.client_signature?.signed_by && (
              <div className="text-sm bg-muted/50 p-2 rounded border border-border">
                <span className="font-medium ">Assinado por: </span>
                <span className="text-muted-foreground">{ensaio.client_signature.engineer_name}</span>
                {ensaio.client_signature.crea_number && (
                  <><br /><span className="font-medium ">CREA: </span><span className="text-muted-foreground">{ensaio.client_signature.crea_number}</span></>
                )}
                <br />
                <span className="text-xs text-muted-foreground">{new Date(ensaio.client_signature.signed_date).toLocaleString('pt-BR')}</span>
              </div>
            )}

            {ensaio.rejection_reason && (
              <div className="text-sm bg-destructive/10 p-2 rounded border border-destructive/20">
                <span className="font-medium text-destructive">Motivo da Reprovação: </span>
                <span className="text-destructive/80">{ensaio.rejection_reason}</span>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-3 flex items-center gap-2 flex-wrap min-h-[38px]">
            {podeVerPDF && (
              <Button asChild variant="outline" size="sm" >
                <Link to={reportUrl} target="_blank">
                  <FileText className="w-4 h-4 mr-1 text-secondary" /> Ver PDF
                </Link>
              </Button>
            )}
            {podeAssinar && (
              <CriticalActionDialog
                title={SIGN_DIALOG.title}
                description={buildSignDescription(ensaio)}
                confirmLabel={SIGN_DIALOG.confirmLabel}
                onConfirm={handleAssinar}
              >
                <Button size="sm" className="hover:opacity-90">
                  <MessageSquare className="w-4 h-4 mr-1" /> Assinar Registro
                </Button>
              </CriticalActionDialog>
            )}
            {podeEditar && (
              <Button asChild size="sm">
                <Link to={editLink}>
                  <Edit className="w-4 h-4 mr-1 text-secondary" /> Editar
                </Link>
              </Button>
            )}
            {ensaio.status === 'finalizado' && ensaio.approved === null && !isCliente && (
              <p className="text-sm text-muted-foreground italic">Aguardando aprovação do administrador.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

EnsaioCard.displayName = 'EnsaioCard';
export default EnsaioCard;