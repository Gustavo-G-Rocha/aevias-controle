/**
 * Formata data para exibição em pt-BR (UTC)
 */
export function formatDataChecklist(data) {
  if (!data) return '-';
  return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

/**
 * Formata valor de conformidade para texto Sim/Não/-
 */
export function formatConformidade(value) {
  if (value === true) return 'Sim';
  if (value === false) return 'Não';
  return '-';
}

/**
 * Formata valor numérico com casas decimais, retorna '-' se null/undefined
 */
export function formatNumerico(value, decimais = 2) {
  if (value === null || value === undefined) return '-';
  return Number(value).toFixed(decimais);
}

/**
 * Formata temperatura com sufixo °C
 */
export function formatTemperatura(value) {
  if (value === null || value === undefined) return '-';
  return `${Number(value).toFixed(1)}°C`;
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
 * Verifica se há ações corretivas registradas
 */
export function temAcoesCorretivas(checklist) {
  return checklist.acoes_corretivas_realizado === true && !!checklist.acoes_corretivas_descricao;
}

/**
 * Formata jornada de trabalho (início - fim)
 */
export function formatarJornada(jornada) {
  if (!jornada?.horario_inicio || !jornada?.horario_fim) return null;
  return `${jornada.horario_inicio} - ${jornada.horario_fim}`;
}

/**
 * Constrói props para SignatureFooter a partir do checklist
 */
export function buildFooterPropsAplicacao(checklist, creatorUser) {
  return {
    labName: checklist.laboratorista_name,
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
 * Retorna label de condição climática com emoji
 */
export function formatClimaLabel(condicao) {
  const map = {
    bom: '☀️ Bom',
    instavel: '⛅ Instável',
    chuva: '🌧️ Chuva',
  };
  return map[condicao] || null;
}