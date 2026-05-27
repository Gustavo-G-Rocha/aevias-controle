import { formatDate } from '@/utils/relatorioUtils';

/**
 * Formata data para relatório, retorna string vazia se inválida
 */
export function formatDateTerra(dateString) {
  const formatted = formatDate(dateString);
  return formatted === 'N/A' ? '' : formatted;
}

/**
 * Retorna emoji para condição climática
 */
export function getClimaEmojiTerra(condicao) {
  const emojiMap = {
    bom: '☀️',
    instavel: '⛅',
    chuva: '🌧️',
  };
  return emojiMap[condicao] || '';
}

/**
 * Retorna texto formatado para condição climática
 */
export function getClimaTextoTerra(condicao) {
  const textoMap = {
    bom: 'Bom',
    instável: 'Instável',
    chuva: 'Chuva',
  };
  return textoMap[condicao] || '-';
}

/**
 * Calcula variação de umidade
 */
export function calcularVariacaoUmidade(uOtima, uInSitu) {
  const umidadeOtima = parseFloat(uOtima);
  const umidadeInSitu = parseFloat(uInSitu);
  if (isNaN(umidadeOtima) || isNaN(umidadeInSitu)) return null;
  return (umidadeInSitu - umidadeOtima).toFixed(2);
}

/**
 * Calcula grau de compactação
 */
export function calcularGrauCompactacao(densidadeInSituStr, densidadeProctorStr) {
  const densInSitu = parseFloat(densidadeInSituStr);
  const densProctor = parseFloat(densidadeProctorStr);
  if (isNaN(densInSitu) || isNaN(densProctor) || densProctor === 0) return null;
  return ((densInSitu / densProctor) * 100).toFixed(2);
}

/**
 * Divide array em chunks de tamanho específico
 */
export function chunkArray(arr, size) {
  const chunks = [];
  if (!arr) return chunks;
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Verifica se há ações corretivas
 */
export function temAcoesCorretivas(checklist) {
  return checklist.acoes_corretivas_realizado === true && checklist.acoes_corretivas_descricao;
}

/**
 * Formata texto de resultado dividido por pipes
 */
export function formatarResultados(resultados) {
  if (!resultados) return '-';
  return resultados.split(' | ').join(' | ');
}

/**
 * Constrói props para SignatureFooter
 */
export function buildFooterProps(checklist, creatorUser) {
  return {
    labName: checklist.inspetor_fiscal || checklist.laboratorista_name,
    labEmail: checklist.created_by,
    labCreatedDate: checklist.created_date,
    labPosition: creatorUser?.position || 'Laboratorista',
    approverName: checklist.approver_details?.name,
    approverEmail: checklist.approved_by,
    approverPosition: checklist.approver_details?.position,
    approverCREA: checklist.approver_details?.crea_number,
    approverDate: checklist.approved_date,
    clientName: checklist.client_signature?.engineer_name,
    clientEmail: checklist.client_signature?.signed_by,
    clientPosition: checklist.client_signature?.position,
    clientCREA: checklist.client_signature?.crea_number,
    clientDate: checklist.client_signature?.signed_date,
  };
}

/**
 * Formata jornada de trabalho
 */
export function formatarJornada(jornada) {
  if (!jornada?.horario_inicio || !jornada?.horario_fim) return 'N/A';
  return `${jornada.horario_inicio} - ${jornada.horario_fim}`;
}