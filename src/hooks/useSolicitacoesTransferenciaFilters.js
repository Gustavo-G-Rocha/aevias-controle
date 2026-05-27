import { useState, useMemo } from 'react';
import { getUserAccessLevel, getRegionalAtual } from '@/utils/solicitacoesTransferenciaUtils';

export function useSolicitacoesTransferenciaFilters(solicitacoes, user, regionais) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const userAccessLevel = useMemo(() => 
    getUserAccessLevel(user),
    [user]
  );

  const canManage = useMemo(() => 
    userAccessLevel === 'admin' || 
    userAccessLevel === 'sala_tecnica_afirmaevias' || 
    userAccessLevel === 'gestor_contrato',
    [userAccessLevel]
  );

  const isLaboratorista = useMemo(() => 
    userAccessLevel === 'user',
    [userAccessLevel]
  );

  const regionalAtual = useMemo(() => 
    getRegionalAtual(user, regionais),
    [user, regionais]
  );

  const solicitacoesPendentes = useMemo(() => 
    solicitacoes.filter(s => s.status === 'pendente'),
    [solicitacoes]
  );

  const solicitacoesAprovadas = useMemo(() => 
    solicitacoes.filter(s => s.status === 'aprovada'),
    [solicitacoes]
  );

  const solicitacoesRejeitadas = useMemo(() => 
    solicitacoes.filter(s => s.status === 'rejeitada'),
    [solicitacoes]
  );

  return {
    isDialogOpen,
    setIsDialogOpen,
    userAccessLevel,
    canManage,
    isLaboratorista,
    regionalAtual,
    solicitacoesPendentes,
    solicitacoesAprovadas,
    solicitacoesRejeitadas
  };
}