import React from 'react';
import MonthlyChart from './MonthlyChart';
import StatusPieChart from './StatusPieChart';
import RecordsByObraChart from './RecordsByObraChart';
import RecordsByTypeChart from './RecordsByTypeChart';

/**
 * Grid de gráficos principais e adicionais
 */
function DashboardChartsGrid({
  charts,
  filters,
  isClienteUser,
  isEngenheiroUser: _isEngenheiroUser,
  onSliceClick,
  showObraChart,
  showTypeChartSeparate,
}) {
  return (
    <>
      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <MonthlyChart data={charts.monthly} isClienteUser={isClienteUser} />
        <StatusPieChart
          data={charts.status}
          activeStatus={filters.status}
          isClienteUser={isClienteUser}
          onSliceClick={(data) => onSliceClick(data, 'status')}
        />
      </div>

      {/* Gráficos adicionais para Admin e Cliente */}
      {showObraChart && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RecordsByObraChart
            data={charts.porObra}
            activeObraId={filters.obraId}
            onSliceClick={(data) => onSliceClick(data, 'obra')}
          />
          <RecordsByTypeChart
            data={charts.porTipo}
            activeTipoRegistro={filters.tipoRegistro}
            onSliceClick={(data) => onSliceClick(data, 'type')}
          />
        </div>
      )}

      {/* Gráfico de tipos para Gestores, Sala Técnica e Cliente (quando não mostrado acima) */}
      {!showObraChart && showTypeChartSeparate && (
        <div className="grid grid-cols-1 gap-6 mb-8">
          <RecordsByTypeChart
            data={charts.porTipo}
            activeTipoRegistro={filters.tipoRegistro}
            onSliceClick={(data) => onSliceClick(data, 'type')}
          />
        </div>
      )}
    </>
  );
}

export default React.memo(DashboardChartsGrid);