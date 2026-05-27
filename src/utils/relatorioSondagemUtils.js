/**
 * Formata data no padrão pt-BR
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

/**
 * Formata data/hora no padrão Brasília (pt-BR)
 */
export function formatDateBrasilia(dateString) {
  if (!dateString) return 'N/A';
  let normalizedDate = dateString;
  if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
    normalizedDate = dateString + 'Z';
  }
  return new Date(normalizedDate).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'medium'
  });
}

/**
 * Extrai corpos de prova válidos (com dados)
 */
export function extrairCpsValidos(levantamentos) {
  return (levantamentos || []).filter(cp => cp.peso_ao_ar || cp.densidade || cp.leitura);
}

/**
 * Calcula limites de GC baseado no serviço
 */
export function calcularLimitesGC(servico) {
  if (servico === 'Capa/Reperfilagem') {
    return { min: 97, max: 101 };
  } else if (servico === 'Remendos') {
    return { min: 95, max: 101 };
  }
  return { min: 0, max: 0 };
}

/**
 * Verifica se GC está fora dos limites (projeto)
 */
export function isForaLimitesGCProjeto(valor, servico) {
  const { min: limiteMin, max: limiteMax } = calcularLimitesGC(servico);
  if (!limiteMin || !valor) return false;
  const val = parseFloat(valor);
  return val < limiteMin || val > limiteMax;
}

/**
 * Verifica se GC está fora dos limites (RICE - mínimo 92%)
 */
export function isForaLimitesGCRice(valor) {
  if (!valor) return false;
  const val = parseFloat(valor);
  return val < 92;
}

/**
 * Prepara dados para gráfico de GC
 */
export function prepararDadosGrafico(ensaio, cpsValidos) {
  const gcDensProjeto = cpsValidos.filter(cp => cp.gc_dens_projeto).map(cp => parseFloat(cp.gc_dens_projeto));
  const gcDensRice = cpsValidos.filter(cp => cp.gc_dens_rice_dia).map(cp => parseFloat(cp.gc_dens_rice_dia));
  const espessuras = cpsValidos.filter(cp => cp.media_espessura).map(cp => parseFloat(cp.media_espessura));

  const { min: limiteMin, max: limiteMax } = calcularLimitesGC(ensaio.servico);

  // Incluir limites no cálculo da escala
  const todosValoresGC = [...gcDensProjeto, ...gcDensRice, limiteMin || 100, limiteMax || 100];
  const minGC = Math.min(...todosValoresGC);
  const maxGC = Math.max(...todosValoresGC);
  const rangeGC = maxGC - minGC;

  // Ajustar escala para mostrar claramente o menor resultado
  const minGCChart = Math.max(0, minGC - rangeGC * 0.3);
  const maxGCChart = maxGC + rangeGC * 0.3;

  const minEsp = Math.min(...espessuras, parseFloat(ensaio.espessura_projeto || 0));
  const maxEsp = Math.max(...espessuras, parseFloat(ensaio.espessura_projeto || 0));

  return {
    gcDensProjeto,
    gcDensRice,
    espessuras,
    minGCChart,
    maxGCChart,
    minEsp,
    maxEsp,
    limiteMin,
    limiteMax
  };
}

/**
 * Formata valor de densidade
 */
export function formatarDensidade(valor) {
  if (!valor) return '-';
  return parseFloat(valor).toFixed(3);
}

/**
 * Formata valor de GC
 */
export function formatarGC(valor) {
  if (!valor) return '-';
  return parseFloat(valor).toFixed(1);
}