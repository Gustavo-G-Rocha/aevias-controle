import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRightLeft,
  Loader2,
  AlertCircle
} from "lucide-react";
import { obterRegionalById, atualizarRegional } from "@/services/regionaisService";
import {
  listarSolicitacoesTransferenciaRegional,
  atualizarSolicitacaoTransferenciaRegional,
} from "@/services/solicitacoesService";
import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';
import SolicitacaoCard from "@/components/obras/SolicitacaoCard";

export default function GerenciarSolicitacoesModal({ isOpen, onClose, user, onUpdate }) {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("pendente");

  const loadSolicitacoes = async () => {
    setLoading(true);
    try {
      const todasSolicitacoes = await listarSolicitacoesTransferenciaRegional();
      setSolicitacoes(todasSolicitacoes);
    } catch (error) {
      logger.error("Erro ao carregar solicitações:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSolicitacoesCallback = useCallback(() => {
    if (isOpen) loadSolicitacoes();
  // loadSolicitacoes is defined in this component without changing deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    loadSolicitacoesCallback();
  }, [loadSolicitacoesCallback]);

  const handleAprovar = async (solicitacao) => {
    try {
      // 1. Atualizar status da solicitação
      await atualizarSolicitacaoTransferenciaRegional(solicitacao.id, {
        status: "aprovada",
        aprovado_por: user.email,
        aprovado_em: new Date().toISOString()
      });

      // 2. Remover laboratorista da regional atual
      const regionalAtual = await obterRegionalById(solicitacao.regional_atual_id);
      const laboratoristasAtuais = regionalAtual.laboratoristas_responsaveis || [];
      const novosLaboratoristasAtual = laboratoristasAtuais.filter(
        email => email.toLowerCase() !== solicitacao.laboratorista_email.toLowerCase()
      );
      await atualizarRegional(solicitacao.regional_atual_id, {
        laboratoristas_responsaveis: novosLaboratoristasAtual
      });

      // 3. Adicionar laboratorista na regional destino
      const regionalDestino = await obterRegionalById(solicitacao.regional_destino_id);
      const laboratoristasDestino = regionalDestino.laboratoristas_responsaveis || [];
      // Ensure the laboratorista is not duplicated if they somehow already exist
      if (!laboratoristasDestino.some(email => email.toLowerCase() === solicitacao.laboratorista_email.toLowerCase())) {
        await atualizarRegional(solicitacao.regional_destino_id, {
          laboratoristas_responsaveis: [...laboratoristasDestino, solicitacao.laboratorista_email]
        });
      }

      toast({ title: `Transferência aprovada! ${solicitacao.laboratorista_name} foi movido para ${solicitacao.regional_destino_nome}.` });
      await loadSolicitacoes();
      onUpdate();
    } catch (error) {
      logger.error("Erro ao aprovar solicitação:", error);
      toast({ title: "Erro ao aprovar solicitação. Tente novamente.", variant: "destructive" });
    }
  };

  const handleRejeitar = async (solicitacao, motivoRejeicao) => {
    try {
      await atualizarSolicitacaoTransferenciaRegional(solicitacao.id, {
        status: "rejeitada",
        aprovado_por: user.email,
        aprovado_em: new Date().toISOString(),
        motivo_rejeicao: motivoRejeicao
      });

      toast({ title: "Solicitação rejeitada." });
      await loadSolicitacoes();
    } catch (error) {
      logger.error("Erro ao rejeitar solicitação:", error);
      toast({ title: "Erro ao rejeitar solicitação. Tente novamente.", variant: "destructive" });
    }
  };

  const solicitacoesFiltradas = solicitacoes.filter(s => 
    filtro === "todas" ? true : s.status === filtro
  );

  const countPendentes = solicitacoes.filter(s => s.status === "pendente").length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-600 shrink-0" />
              <span className="text-base sm:text-lg">Gerenciar Solicitações de Transferência</span>
            </div>
            {countPendentes > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800 self-start sm:self-auto">
                {countPendentes} pendente{countPendentes > 1 ? 's' : ''}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            size="sm"
            variant={filtro === "pendente" ? "default" : "outline"}
            onClick={() => setFiltro("pendente")}
            className="text-xs sm:text-sm"
          >
            Pendentes ({solicitacoes.filter(s => s.status === "pendente").length})
          </Button>
          <Button
            size="sm"
            variant={filtro === "aprovada" ? "default" : "outline"}
            onClick={() => setFiltro("aprovada")}
            className="text-xs sm:text-sm"
          >
            Aprovadas ({solicitacoes.filter(s => s.status === "aprovada").length})
          </Button>
          <Button
            size="sm"
            variant={filtro === "rejeitada" ? "default" : "outline"}
            onClick={() => setFiltro("rejeitada")}
            className="text-xs sm:text-sm"
          >
            Rejeitadas ({solicitacoes.filter(s => s.status === "rejeitada").length})
          </Button>
          <Button
            size="sm"
            variant={filtro === "todas" ? "default" : "outline"}
            onClick={() => setFiltro("todas")}
            className="text-xs sm:text-sm"
          >
            Todas ({solicitacoes.length})
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : solicitacoesFiltradas.length > 0 ? (
          <div className="space-y-4">
            {solicitacoesFiltradas.map(solicitacao => (
              <SolicitacaoCard
                key={solicitacao.id}
                solicitacao={solicitacao}
                onAprovar={handleAprovar}
                onRejeitar={handleRejeitar}
                user={user}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
              Nenhuma solicitação {filtro !== "todas" ? filtro : ""}
            </h3>
            <p className="text-sm text-muted-foreground">
              {filtro === "pendente" 
                ? "Não há solicitações pendentes de aprovação no momento."
                : "Não há solicitações nesta categoria."}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}