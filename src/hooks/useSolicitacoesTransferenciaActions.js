import { useCallback } from 'react';
import {
  criarSolicitacaoTransferenciaRegional,
  atualizarSolicitacaoTransferenciaRegional,
} from '@/services/solicitacoesService';
import { atualizarRegional } from '@/services/regionaisService';

import { toast } from "@/components/ui/use-toast";
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
      console.error("Erro ao criar solicitação:", error);
      toast({ title: 'Erro ao enviar solicitação.', variant: "destructive" });
      return false;
    }
  }, [user, regionais, loadData]);

  const handleApprove = useCallback(async (solicitacao) => {
    if (!window.confirm('Deseja aprovar esta solicitação de transferência?')) return false;

    try {
      // Atualizar a solicitação
      await atualizarSolicitacaoTransferenciaRegional(solicitacao.id, {
        status: 'aprovada',
        aprovado_por: user.email,
        aprovado_em: new Date().toISOString()
      });

      // Remover laboratorista da regional atual
      const regionalAtualData = regionais.find(r => r.id === solicitacao.regional_atual_id);
      if (regionalAtualData) {
        const novosLaboratoristas = (regionalAtualData.laboratoristas_responsaveis || [])
          .filter(email => email.toLowerCase() !== solicitacao.laboratorista_email.toLowerCase());
        await atualizarRegional(solicitacao.regional_atual_id, {
          laboratoristas_responsaveis: novosLaboratoristas
        });
      }

      // Adicionar laboratorista na regional de destino
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
      console.error("Erro ao aprovar solicitação:", error);
      toast({ title: 'Erro ao aprovar solicitação.', variant: "destructive" });
      return false;
    }
  }, [user, regionais, loadData]);

  const handleReject = useCallback(async (solicitacao, motivoRejeicao) => {
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
      console.error("Erro ao rejeitar solicitação:", error);
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