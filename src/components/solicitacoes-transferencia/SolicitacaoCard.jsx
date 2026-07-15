import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, Clock, MapPin, User as UserIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getStatusInfo, ACTION_COLORS, validateMotivoRejeicao } from "@/utils/solicitacoesTransferenciaUtils";
import { toast } from "@/components/ui/use-toast";

const STATUS_ICONS = {
  CheckCircle,
  XCircle,
  Clock
};

export const SolicitacaoCard = React.memo(({ solicitacao, onApprove, onReject, canManage, regionais }) => {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const statusInfo = getStatusInfo(solicitacao.status);
  const StatusIcon = STATUS_ICONS[statusInfo.icon];

  const handleApproveClick = useCallback(async () => {
    setIsApproving(true);
    try {
      await onApprove(solicitacao);
    } finally {
      setIsApproving(false);
    }
  }, [solicitacao, onApprove]);

  const regionalAtual = useMemo(() => 
    regionais.find(r => r.id === solicitacao.regional_atual_id),
    [regionais, solicitacao.regional_atual_id]
  );

  const regionalDestino = useMemo(() => 
    regionais.find(r => r.id === solicitacao.regional_destino_id),
    [regionais, solicitacao.regional_destino_id]
  );

  const [isRejecting, setIsRejecting] = useState(false);

  const handleReject = useCallback(async () => {
    const validation = validateMotivoRejeicao(motivoRejeicao);
    if (!validation.valid) {
      toast({ title: validation.message });
      return;
    }
    setIsRejecting(true);
    try {
      const success = await onReject(solicitacao, motivoRejeicao);
      if (success) {
        setIsRejectDialogOpen(false);
        setMotivoRejeicao('');
      }
    } finally {
      setIsRejecting(false);
    }
  }, [solicitacao, motivoRejeicao, onReject]);

  return (
    <Card className="hover:shadow-md transition-shadow bg-card/20 backdrop-blur-lg border border-white/20">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <UserIcon className="w-4 h-4 text-secondary" />
                <span className="font-semibold text-foreground">{solicitacao.laboratorista_name}</span>
              </div>
              <p className="text-sm text-foreground/70">{solicitacao.laboratorista_email}</p>
            </div>
            <Badge className={`${statusInfo.className} gap-1`}>
              <StatusIcon className="w-3 h-3" />
              {statusInfo.text}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-black/5 rounded-lg">
            <div>
              <p className="text-xs font-medium text-foreground/70 mb-1">Regional Atual</p>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-destructive" />
                <span className="font-medium text-foreground">{regionalAtual?.nome || solicitacao.regional_atual_nome}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground/70 mb-1">Regional Destino</p>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                <span className="font-medium text-foreground">{regionalDestino?.nome || solicitacao.regional_destino_nome}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-foreground/70 mb-1">Motivo da Solicitação</p>
            <p className="text-sm text-foreground bg-card/30 p-2 rounded">{solicitacao.motivo}</p>
          </div>

          <div className="text-xs text-foreground/60">
            Solicitado em {format(new Date(solicitacao.created_date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </div>

          {solicitacao.status === 'aprovada' && solicitacao.aprovado_em && (
            <div className="bg-green-100 border border-green-300 rounded p-2">
              <p className="text-sm text-foreground">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Aprovada por {solicitacao.aprovado_por} em {format(new Date(solicitacao.aprovado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          )}

          {solicitacao.status === 'rejeitada' && (
            <div className="bg-red-100 border border-red-300 rounded p-2">
              <p className="text-sm font-medium text-destructive mb-1">
                <XCircle className="w-4 h-4 inline mr-1" />
                Rejeitada em {format(new Date(solicitacao.aprovado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
              {solicitacao.motivo_rejeicao && (
                <p className="text-sm text-destructive">Motivo: {solicitacao.motivo_rejeicao}</p>
              )}
            </div>
          )}

          {canManage && solicitacao.status === 'pendente' && (
            <div className="flex gap-2 pt-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    style={{ backgroundColor: ACTION_COLORS.approve }}
                    className="text-white hover:opacity-90 flex-1"
                    disabled={isApproving}
                  >
                    {isApproving ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    )}
                    {isApproving ? 'Aprovando...' : 'Aprovar'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Aprovar Solicitação de Transferência</AlertDialogTitle>
                    <AlertDialogDescription>
                      Deseja aprovar a transferência de <strong>{solicitacao.laboratorista_name}</strong> de
                      {' '}{regionalAtual?.nome || solicitacao.regional_atual_nome} para
                      {' '}{regionalDestino?.nome || solicitacao.regional_destino_nome}?
                      {'\n\n'}Esta ação moverá o laboratorista para a nova regional.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isApproving}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleApproveClick}
                      disabled={isApproving}
                      style={{ backgroundColor: ACTION_COLORS.approve }}
                    >
                      {isApproving ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      )}
                      Confirmar Aprovação
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    style={{ backgroundColor: ACTION_COLORS.reject }}
                    className="text-white hover:opacity-90 flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Rejeitar
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card/80 backdrop-blur-lg border-white/20">
                  <DialogHeader>
                    <DialogTitle>Rejeitar Solicitação</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="motivo_rejeicao">Motivo da Rejeição *</Label>
                      <Textarea
                        id="motivo_rejeicao"
                        value={motivoRejeicao}
                        onChange={(e) => setMotivoRejeicao(e.target.value)}
                        placeholder="Descreva o motivo da rejeição..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={isRejecting}>Cancelar</Button>
                    <Button variant="destructive" onClick={handleReject} disabled={isRejecting}>
                      {isRejecting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                      Confirmar Rejeição
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

SolicitacaoCard.displayName = 'SolicitacaoCard';