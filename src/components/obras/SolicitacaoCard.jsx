import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowRightLeft,
  User as UserIcon,
  MapPin,
  Loader2
} from "lucide-react";
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
import { listarUsuarios } from "@/services/usuariosService";
import { validarLaboratoristaTransferivel } from "@/utils/gerenciarSolicitacoesUtils";
import { toast } from "@/components/ui/use-toast";

const statusConfig = {
  pendente: { icon: Clock, color: "bg-yellow-100 text-yellow-800", label: "Pendente" },
  aprovada: { icon: CheckCircle, color: "bg-green-100 text-green-800", label: "Aprovada" },
  rejeitada: { icon: XCircle, color: "bg-red-100 text-destructive", label: "Rejeitada" }
};

export default function SolicitacaoCard({ solicitacao, onAprovar, onRejeitar, user: _user }) {
  const [rejeitando, setRejeitando] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [processando, setProcessando] = useState(false);

  const status = statusConfig[solicitacao.status];

  const handleAprovar = async () => {
    setProcessando(true);
    try {
      const allUsers = await listarUsuarios();
      const usuario = allUsers.find(u => u.email.toLowerCase() === solicitacao.laboratorista_email.toLowerCase());

      const validacao = validarLaboratoristaTransferivel(usuario);
      if (!validacao.valido) {
        toast({ title: `❌ Erro: ${validacao.mensagem}`, variant: "destructive" });
        return;
      }

      await onAprovar(solicitacao);
    } catch {
      toast({ title: "Erro ao processar aprovação.", variant: "destructive" });
    } finally {
      setProcessando(false);
    }
  };

  const handleRejeitar = async () => {
    if (!motivoRejeicao.trim()) {
      toast({ title: "Por favor, informe o motivo da rejeição.", variant: "destructive" });
      return;
    }

    setProcessando(true);
    try {
      await onRejeitar(solicitacao, motivoRejeicao);
      setRejeitando(false);
      setMotivoRejeicao("");
    } finally {
      setProcessando(false);
    }
  };

  return (
    <Card className="border-border">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <UserIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground text-sm sm:text-base truncate">{solicitacao.laboratorista_name}</p>
              <p className="text-xs sm:text-sm text-muted-foreground break-all">{solicitacao.laboratorista_email}</p>
            </div>
          </div>
          <Badge className={`${status.color} shrink-0 self-start sm:self-auto`}>
            <status.icon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-start gap-2 text-xs sm:text-sm">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="font-medium text-foreground">De:</span>
              <span className="text-foreground ml-1 break-words">{solicitacao.regional_atual_nome}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-6">
            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
          </div>

          <div className="flex items-start gap-2 text-xs sm:text-sm">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="font-medium text-foreground">Para:</span>
              <span className="text-blue-900 font-semibold ml-1 break-words">{solicitacao.regional_destino_nome}</span>
            </div>
          </div>

          <div className="mt-3 p-3 bg-muted/30 rounded-lg">
            <p className="text-xs sm:text-sm font-medium text-foreground mb-1">Motivo:</p>
            <p className="text-xs sm:text-sm text-muted-foreground break-words">{solicitacao.motivo}</p>
          </div>

          {solicitacao.status !== 'pendente' && (
            <div className="mt-3 p-3 bg-muted/30 rounded-lg">
              <p className="text-xs sm:text-sm font-medium text-foreground break-words">
                {solicitacao.status === 'aprovada' ? 'Aprovado' : 'Rejeitado'} por: {solicitacao.aprovado_por}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(solicitacao.aprovado_em).toLocaleString('pt-BR')}
              </p>
              {solicitacao.motivo_rejeicao && (
                <p className="text-xs sm:text-sm text-destructive mt-2 break-words">
                  Motivo da rejeição: {solicitacao.motivo_rejeicao}
                </p>
              )}
            </div>
          )}
        </div>

        {solicitacao.status === 'pendente' && !rejeitando && (
          <div className="flex flex-col sm:flex-row gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={processando}
                >
                  {processando ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                  Aprovar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Aprovar Transferência</AlertDialogTitle>
                  <AlertDialogDescription>
                    Confirma a aprovação da transferência de <strong>{solicitacao.laboratorista_name}</strong> para
                    {' '}{solicitacao.regional_destino_nome}?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={processando}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleAprovar}
                    disabled={processando}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {processando ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              onClick={() => setRejeitando(true)}
              disabled={processando}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Rejeitar
            </Button>
          </div>
        )}

        {rejeitando && (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`motivo-${solicitacao.id}`} className="text-sm">Motivo da Rejeição *</Label>
              <Textarea
                id={`motivo-${solicitacao.id}`}
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                placeholder="Explique o motivo da rejeição..."
                rows={3}
                className="text-sm resize-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setRejeitando(false);
                  setMotivoRejeicao("");
                }}
                disabled={processando}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                onClick={handleRejeitar}
                disabled={processando}
              >
                {processando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Rejeição"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}