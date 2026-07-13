/**
 * Mapper para RelatorioAcompanhamentoCarga.
 * Transforma Data Models (entidade bruta + dados relacionados) em
 * Presentation Model (formato pronto para exibição no JSX).
 *
 * Centraliza toda a lógica de extração/transformação que antes estava
 * misturada no componente de visualização, permitindo reutilização
 * em outros contextos (ex.: relatório unificado, exportação).
 */

import { formatDate, formatDateBrasilia, buildSignatureProps } from './relatorioUtils';

const SERVICO_LABELS = {
  remendos: 'Remendos',
  capa_reperfilagem: 'Capa/Reperfilagem',
};

/**
 * Normaliza um valor para exibição, substituindo nulos/vazios por fallback.
 * @param {*} value - Valor bruto do campo
 * @param {string} fallback - Texto exibido quando o valor é inválido (default: 'N/A')
 * @returns {string}
 */
const display = (value, fallback = 'N/A') =>
  value === null || value === undefined || value === '' ? fallback : value;

/**
 * Mapeia o código de serviço para label de exibição.
 * @param {string} servico - Código do serviço ('remendos' | 'capa_reperfilagem')
 * @returns {string} Label formatado
 */
export const getServicoLabel = (servico) =>
  SERVICO_LABELS[servico] || display(servico);

/**
 * Transforma uma carga bruta em row de apresentação da tabela.
 * Garante que todos os campos tenham string vazia como fallback
 * (na tabela, vazio é preferível a 'N/A' para não poluir visual).
 *
 * @param {Object} carga - Carga bruta da entidade
 * @param {number} index - Índice da carga (0-based)
 * @returns {Object} Row normalizada { numero, placa, hora_saida, ... }
 */
export const mapCargaToRow = (carga, index) => ({
  numero: index + 1,
  numero_ticket_nf: display(carga?.numero_ticket_nf, ''),
  placa: display(carga?.placa, ''),
  hora_saida: display(carga?.hora_saida, ''),
  peso_toneladas: display(carga?.peso_toneladas, ''),
  hora_chegada: display(carga?.hora_chegada, ''),
  temp_chegada: display(carga?.temp_chegada, ''),
  hora_aplicacao: display(carga?.hora_aplicacao, ''),
  temp_espalhamento: display(carga?.temp_espalhamento, ''),
  temp_compactacao: display(carga?.temp_compactacao, ''),
  pista: display(carga?.pista, ''),
  espessura_cm: display(carga?.espessura_cm, ''),
  estaca_inicial: display(carga?.estaca_inicial, ''),
  estaca_final: display(carga?.estaca_final, ''),
  observacoes: display(carga?.observacoes, ''),
});

/**
 * Transforma os dados brutos (acompanhamento + entidades relacionadas) em
 * Presentation Model pronto para o componente de relatório consumir.
 *
 * @param {Object} params - { acompanhamento, obra, regional, projeto, faixaGranulometrica }
 * @returns {Object|null} Presentation Model ou null se acompanhamento ausente
 */
export const mapAcompanhamentoToPresentation = ({
  acompanhamento,
  obra,
  regional,
  projeto,
  faixaGranulometrica,
}) => {
  if (!acompanhamento) return null;

  return {
    // Dados da obra (formatados para exibição)
    cliente: display(regional?.cliente),
    rodovia: display(acompanhamento.rodovia),
    sub_trecho: display(acompanhamento.sub_trecho),
    projeto_nome: display(projeto?.name),
    servico_label: getServicoLabel(acompanhamento.servico),
    obra_nome: display(obra?.name),
    trecho: display(acompanhamento.trecho),
    usina_fornecedora: display(acompanhamento.usina_fornecedora),
    faixa_especificada: display(faixaGranulometrica?.nome),
    laboratorista: display(acompanhamento.laboratorista_name),

    // Data do acompanhamento (formatada dd/mm/yyyy UTC)
    data: formatDate(acompanhamento.data),

    // Cargas normalizadas para a tabela
    cargas: (acompanhamento.cargas || []).map(mapCargaToRow),

    // Observações gerais
    observacoes_gerais: display(acompanhamento.observacoes_gerais, '—'),

    // Logo da regional (para o header)
    logo_url: regional?.logo_url ||
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png',

    // Props prontas para SignatureFooter
    signatureProps: buildSignatureProps(acompanhamento, 'Laboratorista'),
  };
};