/** @file dashboardUtils — utilitários de configuração do Dashboard */

/**
 * Determina quais gráficos devem ser mostrados baseado no access level
 */
export const getChartVisibility = (userAccessLevel, charts) => {
  const showObraChart =
    userAccessLevel === 'admin' && charts.porObra.length > 0;

  const showTypeChartSeparate =
    ['gestor_contrato', 'sala_tecnica_afirmaevias', 'cliente'].includes(
      userAccessLevel
    ) && charts.porTipo.length > 0;

  return {
    showObraChart,
    showTypeChartSeparate,
    showBothCharts: showObraChart,
    showTypeChartOnly: !showObraChart && showTypeChartSeparate,
  };
};

/**
 * Retorna labels e chaves de filtros por tipo
 */
export const getFilterConfig = () => ({
  periodo: [
    { value: '1mes', label: 'Último mês' },
    { value: '3meses', label: 'Últimos 3 meses' },
    { value: '6meses', label: 'Últimos 6 meses' },
  ],
  status: [
    { value: 'approved', label: 'Aprovados' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'rejected', label: 'Reprovados' },
  ],
});

/**
 * Valida período de filtro
 */
export const isValidPeriod = (periodo) => {
  return ['1mes', '3meses', '6meses'].includes(periodo);
};

/**
 * Valida status de filtro
 */
export const isValidStatus = (status) => {
  return [null, 'approved', 'pending', 'rejected'].includes(status);
};

/**
 * Mapeia status label para valor interno
 */
export const mapStatusLabelToValue = (label) => {
  const statusMap = {
    'Aprovados': 'approved',
    'Pendentes': 'pending',
    'Reprovados': 'rejected',
    'Assinados': 'approved',
    'Aguardando': 'pending',
  };
  return statusMap[label] || null;
};