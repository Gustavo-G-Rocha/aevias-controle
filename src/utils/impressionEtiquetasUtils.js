/**
 * Processa dados do arquivo para etiquetas de coleta
 */
export function processarArquivoColeta(data) {
  return data.map((row) => ({
    furo: row.FURO || '',
    rodovia: row.RODOVIA || '',
    km: row.KM || '',
    pista: row.PISTA || '',
    amostra: row.AMOSTRA || '',
    profundidade: row['PROFUNDIDADE(M)'] || '',
    material: row.MATERIAL || '',
    ensaios: row.ENSAIOS
      ? row.ENSAIOS.split(';')
          .map(e => e.trim())
          .filter(e => e)
      : [],
  }));
}

/**
 * Processa dados do arquivo para etiquetas de umidade
 */
export function processarArquivoUmidade(data) {
  return data.map((row) => ({
    furo: row.FURO || '',
    rodovia: row.RODOVIA || '',
    km: row.KM || '',
    pista: row.PISTA || '',
    tipo_umidade: row['TIPO UMIDADE'] || row['TIPO_UMIDADE'] || '',
  }));
}

/**
 * Calcula número de páginas para etiquetas de coleta (6 por página)
 */
export function calcularPaginasColeta(totalEtiquetas) {
  return Math.ceil(totalEtiquetas / 6);
}

/**
 * Calcula número de páginas para etiquetas de umidade (21 por página - 3 colunas x 7 linhas)
 */
export function calcularPaginasUmidade(totalEtiquetas) {
  return Math.ceil(totalEtiquetas / 21);
}

/**
 * Obtém etiquetas de uma página específica (coleta: 6 por página)
 */
export function getEtiquetasPageColeta(etiquetas, pageIdx) {
  return etiquetas.slice(pageIdx * 6, (pageIdx + 1) * 6);
}

/**
 * Obtém etiquetas de uma página específica (umidade: 21 por página - 3 colunas x 7 linhas)
 */
export function getEtiquetasPageUmidade(etiquetas, pageIdx) {
  return etiquetas.slice(pageIdx * 21, (pageIdx + 1) * 21);
}

/**
 * Retorna descrição de colunas esperadas para tipo de etiqueta
 */
export function getDescricaoColunas(tipoEtiqueta) {
  if (tipoEtiqueta === 'coleta') {
    return 'Selecione um arquivo Excel com as colunas: FURO, RODOVIA, KM, PISTA, AMOSTRA, PROFUNDIDADE(M), MATERIAL, ENSAIOS (separados por ponto e vírgula)';
  }
  return 'Selecione um arquivo Excel com as colunas: FURO, RODOVIA, KM, PISTA, TIPO UMIDADE';
}