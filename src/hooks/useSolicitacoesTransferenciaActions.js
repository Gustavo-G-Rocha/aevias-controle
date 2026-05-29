import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export function useSolicitacoesTransferenciaActions(user, regionais, loadData) {
  const handleNovaSolicitacao = useCallback(async (formData, regionalAtual) => {
    if (!user || !regionalAtual) {
      alert('Você precisa estar alocado em uma regional para solicitar transferência.');
      return;
    }

    const regionalDestino = regionais.find(r => r.id === formData.regional_destino_id);

    try {
      await base44.entities.SolicitacaoTransferenciaRegional.create({
        laboratorista_email: user.email,
        laboratorista_name: user.laboratorista_name || user.full_name,
        regional_atual_id: regionalAtual.id,
        regional_atual_nome: regionalAtual.nome,
        regional_destino_id: formData.regional_destino_id,
        regional_destino_nome: regionalDestino.nome,
        motivo: formData.motivo,
        status: 'pendente'
      });

      alert('Solicitação enviada com sucesso!');
      loadData();
      return true;
    } catch (error) {
      console.error("Erro ao criar solicitação:", error);
      alert('Erro ao enviar solicitação.');
      return false;
    }
  }, [user, regionais, loadData]);

  const handleApprove = useCallback(async (solicitacao) => {
    if (!window.confirm('Deseja aprovar esta solicitação de transferência?')) return false;

    try {
      // Atualizar a solicitação
      await base44.entities.SolicitacaoTransferenciaRegional.update(solicitacao.id, {
        status: 'aprovada',
        aprovado_por: user.email,
        aprovado_em: new Date().toISOString()
      });

      // Remover laboratorista da regional atual
      const regionalAtualData = regionais.find(r => r.id === solicitacao.regional_atual_id);
      if (regionalAtualData) {
        const novosLaboratoristas = (regionalAtualData.laboratoristas_responsaveis || [])
          .filter(email => email.toLowerCase() !== solicitacao.laboratorista_email.toLowerCase());
        await base44.entities.Regional.update(solicitacao.regional_atual_id, {
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
        await base44.entities.Regional.update(solicitacao.regional_destino_id, {
          laboratoristas_responsaveis: novosLaboratoristas
        });
      }

      alert('Solicitação aprovada com sucesso! O laboratorista foi transferido de regional.');
      loadData();
      return true;
    } catch (error) {
      console.error("Erro ao aprovar solicitação:", error);
      alert('Erro ao aprovar solicitação.');
      return false;
    }
  }, [user, regionais, loadData]);

  const handleReject = useCallback(async (solicitacao, motivoRejeicao) => {
    try {
      await base44.entities.SolicitacaoTransferenciaRegional.update(solicitacao.id, {
        status: 'rejeitada',
        aprovado_por: user.email,
        aprovado_em: new Date().toISOString(),
        motivo_rejeicao: motivoRejeicao
      });

      alert('Solicitação rejeitada.');
      loadData();
      return true;
    } catch (error) {
      console.error("Erro ao rejeitar solicitação:", error);
      alert('Erro ao rejeitar solicitação.');
      return false;
    }
  }, [user, loadData]);

  return {
    handleNovaSolicitacao,
    handleApprove,
    handleReject
  };
}