import React from "react";
import {
  HeaderSkeleton,
  FilterBarSkeleton,
  StatCardsSkeleton,
  ChartCardSkeleton,
  TableSkeleton,
  CardsGridSkeleton,
} from "@/components/skeletons/SkeletonBlocks";

/** Wrapper acessível: anuncia o carregamento para leitores de tela */
function SkeletonPage({ label, children }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={label}
      className="p-6 space-y-6 bg-transparent min-h-screen"
    >
      <div className="max-w-7xl mx-auto space-y-6">{children}</div>
    </div>
  );
}

/** Página com tabela (Usuários, Ensaios) */
export function TablePageSkeleton({ withHeader = true }) {
  return (
    <SkeletonPage label="Carregando registros">
      {withHeader && <HeaderSkeleton />}
      <FilterBarSkeleton />
      <TableSkeleton />
    </SkeletonPage>
  );
}

/** Página com grid de cards (Projetos, Regionais, Gestão de NCs) */
export function CardsPageSkeleton({ withStats = false }) {
  return (
    <SkeletonPage label="Carregando conteúdo">
      <HeaderSkeleton />
      <FilterBarSkeleton />
      {withStats && <StatCardsSkeleton />}
      <CardsGridSkeleton />
    </SkeletonPage>
  );
}

/** Dashboard: KPIs + gráficos */
export function DashboardSkeleton() {
  return (
    <SkeletonPage label="Carregando painel">
      <HeaderSkeleton />
      <StatCardsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    </SkeletonPage>
  );
}