/**
 * Hook de assinatura eletrônica para o Relatório Unificado consolidado.
 *
 * Gerencia:
 * - Carregamento de assinatura existente (busca em AssinaturaEletronica)
 * - Abertura/fechamento do modal de reautenticação por senha
 * - Verificação da senha (re-login) e chamada ao backend assinarEletronicamente
 *
 * O compositeId identifica unicamente um relatório (obra + período + tipos),
 * permitindo que o mesmo relatório seja assinado apenas uma vez.
 */
import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { assinarEletronicamente } from '@/functions/assinarEletronicamente';
import { getUserAccessLevel } from '@/lib/layoutConstants';
import { logger } from '@/utils/logger';

const APPROVER_LEVELS = ['admin', 'sala_tecnica_afirmaevias', 'gestor_contrato', 'cliente_supervisor'];

export function useRelatorioUnificadoSignature({ filters, recordCount, user }) {
  const [signature, setSignature] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signing, setSigning] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [signError, setSignError] = useState('');

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

  const handleSign = useCallback(async (password, totpCode) => {
    if (!user?.email) {
      setSignError('Usuário não carregado. Tente novamente.');
      return;
    }
    if (!password?.trim()) {
      setSignError('Senha é obrigatória.');
      return;
    }

    setSignError('');
    setSigning(true);
    try {
      // 1. Verificar senha reautenticando (Lei 14.063/2020 — intenção deliberada)
      try {
        await base44.auth.loginViaEmailPassword(user.email, password);
      } catch {
        setSignError('Senha incorreta. Tente novamente.');
        setSigning(false);
        return;
      }

      // 2. Chamar backend para registrar assinatura
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
        reauthFactor: 'password',
        ...(totpCode ? { totpCode } : {}),
      });

      if (response?.data?.signature) {
        setSignature(response.data.signature);
        setModalOpen(false);
      }
    } catch (err) {
      logger.error('[RelatorioUnificado] Erro ao assinar:', err);
      const errorMsg = err?.response?.data?.error || err?.data?.error || err?.error || err?.message || 'Erro ao assinar. Tente novamente.';
      setSignError(errorMsg);
    } finally {
      setSigning(false);
    }
  }, [user, compositeId, filters, recordCount]);

  const handleOpenModal = useCallback(() => {
    setSignError('');
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSignError('');
  }, []);

  return {
    signature,
    loading,
    signing,
    modalOpen,
    signError,
    canSign,
    compositeId,
    handleSign,
    handleOpenModal,
    handleCloseModal,
  };
}