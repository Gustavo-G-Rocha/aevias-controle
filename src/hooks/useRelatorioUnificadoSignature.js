/**
 * Hook de assinatura eletrônica para o Relatório Unificado consolidado.
 *
 * Gerencia:
 * - Carregamento de assinatura existente (busca em AssinaturaEletronica)
 * - Assinatura direta via sessão ativa (sem reentrada de senha)
 *
 * O compositeId identifica unicamente um relatório (obra + período + tipos),
 * permitindo que o mesmo relatório seja assinado apenas uma vez.
 */
import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { assinarEletronicamente } from '@/functions/assinarEletronicamente';
import { getUserAccessLevel } from '@/lib/layoutConstants';
import { logger } from '@/utils/logger';
import { useToast } from '@/components/ui/use-toast';

const APPROVER_LEVELS = ['admin', 'sala_tecnica_afirmaevias', 'gestor_contrato', 'cliente_supervisor'];

export function useRelatorioUnificadoSignature({ filters, recordCount, user }) {
  const { toast } = useToast();
  const [signature, setSignature] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signing, setSigning] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);

  const compositeId = filters?.obra_id && filters?.data_inicio && filters?.data_fim
    ? `${filters.obra_id}_${filters.data_inicio}_${filters.data_fim}_${(filters.tipos || []).join('-')}`
    : null;

  const userAccessLevel = getUserAccessLevel(user);
  const canSign = APPROVER_LEVELS.includes(userAccessLevel) && !!compositeId;

  // Carregar assinatura existente
  useEffect(() => {
    if (!compositeId) return;
    const load = async () => {
      try {
        setLoading(true);
        const existing = await base44.entities.AssinaturaEletronica.filter(
          { entity_name: 'RelatorioUnificado', entity_id: compositeId, status_assinatura: 'assinado' },
          '-signed_at',
          1
        );
        setSignature(existing && existing.length > 0 ? existing[0] : null);
      } catch (err) {
        logger.warn('[RelatorioUnificado] Erro ao carregar assinatura:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [compositeId]);

  const handleSign = useCallback(async () => {
    if (!user?.email) {
      toast({
        title: 'Erro ao assinar',
        description: 'Usuário não carregado. Tente novamente.',
        variant: 'destructive',
      });
      return;
    }

    setSigning(true);
    try {
      // Assinatura via sessão ativa — sem reentrada de senha.
      // A autenticação do login (com senha/2FA) é suficiente.
      const reportData = {
        obra_id: filters.obra_id,
        data_inicio: filters.data_inicio,
        data_fim: filters.data_fim,
        tipos: filters.tipos || [],
        recordCount,
      };

      const response = await assinarEletronicamente({
        entityName: 'RelatorioUnificado',
        recordId: compositeId,
        signatureType: 'approve',
        reportData,
      });

      if (response?.data?.error) {
        throw { response: { data: response.data } };
      }
      if (response?.error) {
        throw { response: { data: response } };
      }

      if (response?.data?.signature) {
        setSignature(response.data.signature);
        toast({
          title: 'Relatório assinado',
          description: 'Assinatura eletrônica registrada com sucesso.',
        });
      }
    } catch (err) {
      logger.error('[RelatorioUnificado] Erro ao assinar:', err);
      const errorMsg = err?.response?.data?.error || err?.data?.error || err?.error || err?.message || 'Erro ao assinar. Tente novamente.';
      toast({
        title: 'Erro ao assinar',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setSigning(false);
    }
  }, [user, compositeId, filters, recordCount, toast]);

  const handleOpenModal = useCallback(async () => {
    if (!compositeId) return;
    setCheckingAccess(true);
    try {
      // Pre-check: verificar acessibilidade do backend antes de assinar.
      await base44.entities.AssinaturaEletronica.filter(
        { entity_name: 'RelatorioUnificado', entity_id: compositeId, status_assinatura: 'assinado' },
        '-signed_at',
        1
      );
    } catch (err) {
      logger.error('[RelatorioUnificado] Pre-check de acesso ao backend falhou:', err);
      const msg = 'Falha temporária ao acessar o registro. Tente novamente.';
      toast({
        title: 'Não foi possível iniciar a assinatura',
        description: msg,
        variant: 'destructive',
      });
      setCheckingAccess(false);
      return;
    }
    setCheckingAccess(false);
    // Assina diretamente — sem modal de reentrada de senha.
    await handleSign();
  }, [compositeId, toast, handleSign]);

  return {
    signature,
    loading,
    signing,
    canSign,
    checkingAccess,
    compositeId,
    handleSign,
    handleOpenModal,
  };
}