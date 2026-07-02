/**
 * Funções puras extraídas dos componentes de NC para permitir testes unitários.
 * Sem dependências de React ou Base44.
 */
import { TIPOS_CHECKLIST, OUTROS_TIPOS_REGISTRO, RNC_PAGE } from "./naoConformidadesUtils";

/**
 * Calcula os valores dos 4 KPIs da página de NCs.
 * @param {Array} rncsVisiveis - RNCs filtrados visíveis
 * @param {Array} cncsVisiveis - CNCs filtrados visíveis
 * @returns {Array} Array de objetos { label, value, color }
 */
export function buildKpiItems(rncsVisiveis, cncsVisiveis) {
  return [
    { label: "Total de RNCs", value: rncsVisiveis.length, color: "text-foreground" },
    { label: "RNCs Abertas", value: rncsVisiveis.filter(r => r.status === 'aberta').length, color: "text-destructive" },
    { label: "Em Tratativa", value: rncsVisiveis.filter(r => r.status === 'em_tratativa').length, color: "text-amber-600" },
    { label: "NCs em Registros", value: cncsVisiveis.length, color: "text-blue-600" },
  ];
}

/**
 * Converte um RNC visível para a linha normalizada usada na tabela de ocorrências.
 */
export function mapRncToRow(rnc) {
  return {
    _kind: 'rnc',
    id: rnc.id,
    tipo: 'RNC',
    tipoLabel: 'Relatório NC',
    criador: rnc.relatorio_criador || rnc.fiscal || '',
    data: rnc.data_nc || '',
    parametro: rnc.parametro_nc || rnc.categoria_nc || '',
    rodovia: rnc.rodovia || '',
    usina: '',
    empreiteira: rnc.executora || '',
    page: RNC_PAGE,
  };
}

/**
 * Converte uma CNC visível para a linha normalizada usada na tabela de ocorrências.
 */
export function mapCncToRow(nc) {
  const t = [...TIPOS_CHECKLIST, ...OUTROS_TIPOS_REGISTRO].find(t => t.value === nc.tipo);
  return {
    _kind: 'checklist',
    id: nc.id,
    tipo: nc.tipo,
    tipoLabel: t?.label || nc.tipo,
    criador: nc.laboratorista_name || '',
    data: nc.data || '',
    parametro: nc.parametro || '',
    rodovia: nc.rodovia || '',
    usina: nc.usina || '',
    empreiteira: nc.empreiteira || '',
    page: nc._page || t?.page || '',
  };
}

/**
 * Filtra as linhas da tabela de ocorrências por tipo e busca textual.
 * @param {Array} rows - Linhas normalizadas (resultado de mapRncToRow/mapCncToRow)
 * @param {string} tipo - Valor do filtro de tipo ('_all' = sem filtro)
 * @param {string} busca - Texto de busca livre
 * @returns {Array} Linhas filtradas
 */
export function filterTableRows(rows, tipo, busca) {
  const b = busca.toLowerCase().trim();
  let result = rows;
  if (tipo !== '_all') result = result.filter(r => r.tipoLabel === tipo);
  if (b) result = result.filter(r =>
    r.tipoLabel.toLowerCase().includes(b) ||
    r.criador.toLowerCase().includes(b) ||
    r.parametro.toLowerCase().includes(b) ||
    r.rodovia.toLowerCase().includes(b) ||
    r.usina.toLowerCase().includes(b) ||
    r.empreiteira.toLowerCase().includes(b)
  );
  return result;
}

/**
 * Formata uma string de data ISO (YYYY-MM-DD) para exibição em pt-BR.
 * Retorna '—' para datas inválidas ou ausentes.
 */
export function formatDateBR(dateStr) {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr + 'T12:00:00');
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
  } catch {
    return '—';
  }
}