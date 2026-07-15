import { useCallback } from 'react';
import {
  criarSolicitacaoTransferenciaRegional,
  atualizarSolicitacaoTransferenciaRegional,
} from '@/services/solicitacoesService';
import { atualizarRegional } from '@/services/regionaisService';

import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';
export function useSolicitacoesTransferenciaActions(user, regionais, loadData) {
  const handleNovaSolicitacao = useCallback(async (formData, regionalAtual) => {
    if (!user || !regionalAtual) {
      toast({ title: 'Você precisa estar alocado em uma regional para solicitar transferência.' });
      return;
    }

    const regionalDestino = regionais.find(r => r.id === formData.regional_destino_id);

    try {
      await criarSolicitacaoTransferenciaRegional({
        laboratorista_email: user.email,
        laboratorista_name: user.laboratorista_name || user.full_name,
        regional_atual_id: regionalAtual.id,
        regional_atual_nome: regionalAtual.nome,
        regional_destino_id: formData.regional_destino_id,
        regional_destino_nome: regionalDestino.nome,
        motivo: formData.motivo,
        status: 'pendente'
      });

      toast({ title: 'Solicitação enviada com sucesso!' });
      loadData();
      return true;
    } catch (error) {
      logger.error("Erro ao criar solicitação:", error);
      toast({ title: 'Erro ao enviar solicitação.', variant: "destructive" });
      return false;
    }
  }, [user, regionais, loadData]);

  const handleApprove = useCallback(async (solicitacao) => {
    if (!user?.email) {
      toast({ title: 'Usuário não carregado. Tente novamente.', variant: "destructive" });
      return false;
    }

    let solicitacaoAprovada = false;

    try {
      // 1. Atualizar a solicitação
      await atualizarSolicitacaoTransferenciaRegional(solicitacao.id, {
        status: 'aprovada',
        aprovado_por: user.email,
        aprovado_em: new Date().toISOString()
      });
      solicitacaoAprovada = true;

      // 2. Remover laboratorista da regional atual
      const regionalAtualData = regionais.find(r => r.id === solicitacao.regional_atual_id);
      if (regionalAtualData) {
        const novosLaboratoristas = (regionalAtualData.laboratoristas_responsaveis || [])
          .filter(email => email.toLowerCase() !== solicitacao.laboratorista_email.toLowerCase());
        await atualizarRegional(solicitacao.regional_atual_id, {
          laboratoristas_responsaveis: novosLaboratoristas
        });
      }

      // 3. Adicionar laboratorista na regional de destino
      const regionalDestinoData = regionais.find(r => r.id === solicitacao.regional_destino_id);
      if (regionalDestinoData) {
        const novosLaboratoristas = [
          ...(regionalDestinoData.laboratoristas_responsaveis || []),
          solicitacao.laboratorista_email
        ];
        await atualizarRegional(solicitacao.regional_destino_id, {
          laboratoristas_responsaveis: novosLaboratoristas
        });
      }

      toast({ title: 'Solicitação aprovada com sucesso! O laboratorista foi transferido de regional.' });
      loadData();
      return true;
    } catch (error) {
      logger.error("Erro ao aprovar solicitação:", error?.message || error);

      // Rollback: se a solicitação foi marcada como aprovada mas a transferência falhou,
      // reverter para pendente para evitar inconsistência de dados.
      if (solicitacaoAprovada) {
        try {
          await atualizarSolicitacaoTransferenciaRegional(solicitacao.id, {
            status: 'pendente',
            aprovado_por: null,
            aprovado_em: null
          });
          toast({ title: 'Falha ao transferir laboratorista. Solicitação revertida para pendente.', variant: "destructive" });
        } catch (rollbackError) {
          logger.error("Erro ao reverter solicitação:", rollbackError?.message || rollbackError);
          toast({ title: 'Falha ao aprovar e ao reverter. Verifique os dados manualmente.', variant: "destructive" });
        }
      } else {
        toast({ title: 'Erro ao aprovar solicitação.', variant: "destructive" });
      }
      loadData();
      return false;
    }
  }, [user, regionais, loadData]);

  const handleReject = useCallback(async (solicitacao, motivoRejeicao) => {
    if (!user?.email) {
      toast({ title: 'Usuário não carregado. Tente novamente.', variant: "destructive" });
      return false;
    }

    try {
      await atualizarSolicitacaoTransferenciaRegional(solicitacao.id, {
        status: 'rejeitada',
        aprovado_por: user.email,
        aprovado_em: new Date().toISOString(),
        motivo_rejeicao: motivoRejeicao
      });

      toast({ title: 'Solicitação rejeitada.' });
      loadData();
      return true;
    } catch (error) {
      logger.error("Erro ao rejeitar solicitação:", error);
      toast({ title: 'Erro ao rejeitar solicitação.', variant: "destructive" });
      return false;
    }
  }, [user, loadData]);

  return {
    handleNovaSolicitacao,
    handleApprove,
    handleReject
  };
}