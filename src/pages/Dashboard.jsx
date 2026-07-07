import React, { useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { getUserAccessLevel, canSeeFilters } from '@/utils/accessControl';
import { getChartVisibility } from '@/utils/dashboardUtils';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardFilters from '@/components/dashboard/DashboardFilters';
import DashboardStats from '@/components/dashboard/DashboardStats';
import DashboardChartsGrid from '@/components/dashboard/DashboardChartsGrid';
import DashboardPage from '@/components/dashboard/DashboardPage';

export default function Dashboard() {
  const { loading, user, filters, setFilters, clearFilters, hasActiveFilters, stats, charts, approvalPercentage, obras, isClienteUser, isEngenheiroUser } = useDashboardData();

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
    return (
      <div className="flex justify-center items-center h-screen bg-transparent">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: 'var(--color-text-subtle)' }} />
          <p className="mt-2" style={{ color: 'var(--color-text-muted)' }}>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const userAccessLevel = getUserAccessLevel(user);
  const { showObraChart, showTypeChartSeparate } = getChartVisibility(userAccessLevel, charts);

  return (
    <DashboardPage>
      <DashboardHeader user={user} isClienteUser={isClienteUser} />

      {canSeeFilters(user) && (
        <DashboardFilters
          filters={filters}
          setFilters={setFilters}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          obras={obras}
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