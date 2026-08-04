import React, { useCallback } from 'react';
import { Plus } from 'lucide-react';
import { DashboardSkeleton } from '@/components/skeletons/PageSkeletons';
import { getUserAccessLevel, canSeeFilters, isAdmin, isSalaTecnica, isLaboratorista, isClienteSupervisor } from '@/utils/accessControl';
import { useCreateEnsaioDialog } from '@/components/layout/CreateEnsaioDialogContext';
import { getChartVisibility } from '@/utils/dashboardUtils';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardFilters from '@/components/dashboard/DashboardFilters';
import DashboardStats from '@/components/dashboard/DashboardStats';
import DashboardChartsGrid from '@/components/dashboard/DashboardChartsGrid';
import DashboardPage from '@/components/dashboard/DashboardPage';

export default function Dashboard() {
  const { loading, user, filters, setFilters, clearFilters, hasActiveFilters, stats, charts, approvalPercentage, obras, regionais, isClienteUser, isEngenheiroUser } = useDashboardData();
  const { openCreateEnsaio } = useCreateEnsaioDialog();

  const handleSliceClick = useCallback((data, chartType) => {
    setFilters(prev => {
      if (chartType === 'status') {
        const statusMap = {
          'Aprovados': 'approved', 'Pendentes': 'pending', 'Reprovados': 'rejected',
          'Assinados': 'approved', 'Aguardando': 'pending',
        };
        const next = statusMap[data.name];
        return { ...prev, status: prev.status === next ? null : next };
      }
      if (chartType === 'obra') {
        return { ...prev, obraId: prev.obraId === data.obraId ? null : data.obraId };
      }
      if (chartType === 'type') {
        return { ...prev, tipoRegistro: prev.tipoRegistro === data.entityType ? null : data.entityType };
      }
      return prev;
    });
  }, [setFilters]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const userAccessLevel = getUserAccessLevel(user);
  const { showObraChart, showTypeChartSeparate } = getChartVisibility(userAccessLevel, charts);
  const canCreate = isAdmin(user) || isSalaTecnica(user) || isLaboratorista(user) || isClienteSupervisor(user);

  return (
    <DashboardPage>
      {/* FAB mobile para criar novo registro (mesmo painel do "Ensaios Realizados") */}
      {canCreate && (
        <button
          type="button"
          onClick={openCreateEnsaio}
          aria-haspopup="dialog"
          className="lg:hidden fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: 'var(--color-primary)' }}
          aria-label="Novo Registro"
        >
          <Plus className="w-7 h-7 text-white" />
        </button>
      )}
      <DashboardHeader user={user} isClienteUser={isClienteUser} />

      {canSeeFilters(user) && (
        <DashboardFilters
          filters={filters}
          setFilters={setFilters}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          obras={obras}
          regionais={regionais}
        />
      )}

      <DashboardStats
        stats={stats}
        isClienteUser={isClienteUser}
        isEngenheiroUser={isEngenheiroUser}
        approvalPercentage={approvalPercentage}
      />

      <DashboardChartsGrid
        charts={charts}
        filters={filters}
        isClienteUser={isClienteUser}
        isEngenheiroUser={isEngenheiroUser}
        onSliceClick={handleSliceClick}
        showObraChart={showObraChart}
        showTypeChartSeparate={showTypeChartSeparate}
      />
    </DashboardPage>
  );
}