import React from "react";
import {
  HeaderSkeleton,
  FilterBarSkeleton,
  StatCardsSkeleton,
  ChartCardSkeleton,
  TableSkeleton,
  CardsGridSkeleton,
} from "@/components/skeletons/SkeletonBlocks";

/** Página com tabela (Usuários, Ensaios) */
export function TablePageSkeleton({ withHeader = true }) {
  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {withHeader && <HeaderSkeleton />}
        <FilterBarSkeleton />
        <TableSkeleton />
      </div>
    </div>
  );
}

/** Página com grid de cards (Projetos, Regionais, Gestão de NCs) */
export function CardsPageSkeleton({ withStats = false }) {
  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <HeaderSkeleton />
        <FilterBarSkeleton />
        {withStats && <StatCardsSkeleton />}
        <CardsGridSkeleton />
      </div>
    </div>
  );
}

/** Dashboard: KPIs + gráficos */
export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <HeaderSkeleton />
        <StatCardsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCardSkeleton />
          <ChartCardSkeleton />
          <ChartCardSkeleton />
          <ChartCardSkeleton />
        </div>
      </div>
    </div>
  );
}