import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, MapPin, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getStatusInfo, ACTION_COLORS, validateMotivoRejeicao } from "@/utils/solicitacoesTransferenciaUtils";

const STATUS_ICONS = {
  CheckCircle,
  XCircle,
  Clock
};

export const SolicitacaoCard = React.memo(({ solicitacao, onApprove, onReject, canManage, regionais }) => {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const statusInfo = getStatusInfo(solicitacao.status);
  const StatusIcon = STATUS_ICONS[statusInfo.icon];

  const regionalAtual = useMemo(() => 
    regionais.find(r => r.id === solicitacao.regional_atual_id),
    [regionais, solicitacao.regional_atual_id]
  );

  const regionalDestino = useMemo(() => 
    regionais.find(r => r.id === solicitacao.regional_destino_id),
    [regionais, solicitacao.regional_destino_id]
  );

  const handleReject = useCallback(() => {
    const validation = validateMotivoRejeicao(motivoRejeicao);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }
    onReject(solicitacao, motivoRejeicao);
    setIsRejectDialogOpen(false);
    setMotivoRejeicao('');
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
                <MapPin className="w-4 h-4 text-[#800020]" />
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
            <div className="bg-[#566E3D]/10 border border-[#566E3D]/30 rounded p-2">
              <p className="text-sm text-foreground">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Aprovada por {solicitacao.aprovado_por} em {format(new Date(solicitacao.aprovado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          )}

          {solicitacao.status === 'rejeitada' && (
            <div className="bg-[#800020]/10 border border-[#800020]/30 rounded p-2">
              <p className="text-sm font-medium text-[#800020] mb-1">
                <XCircle className="w-4 h-4 inline mr-1" />
                Rejeitada em {format(new Date(solicitacao.aprovado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
              {solicitacao.motivo_rejeicao && (
                <p className="text-sm text-[#800020]">Motivo: {solicitacao.motivo_rejeicao}</p>
              )}
            </div>
          )}

          {canManage && solicitacao.status === 'pendente' && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                style={{ backgroundColor: ACTION_COLORS.approve }}
                className="text-white hover:opacity-90 flex-1"
                onClick={() => onApprove(solicitacao)}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Aprovar
              </Button>
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
                    <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancelar</Button>
                    <Button variant="destructive" onClick={handleReject}>Confirmar Rejeição</Button>
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