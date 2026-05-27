/**
 * Funções puras para RelatorioNC.
 * Utilitários para formatação, mapeamento e transformação de dados.
 */

/**
 * Formata uma data para o padrão pt-BR.
 * @param {string|Date|null} date - Data a formatar
 * @returns {string} Data formatada ou '—'
 */
export const formatDate = (date) => {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  } catch {
    return '—';
  }
};

/**
 * Formata data e hora com timezone São Paulo.
 * @param {string|Date|null} date - Data a formatar
 * @returns {string} Data/hora formatada ou string vazia
 */
export const formatDateTimeSpBr = (date) => {
  if (!date) return '';
  try {
    return new Date(date).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '';
  }
};

/**
 * Mapa de tipos de relatórios vinculados.
 */
export const TIPO_LABELS = {
  DiarioObra: 'Diário de Obra',
  ChecklistUsina: 'Checklist de Usina',
  ChecklistAplicacao: 'Checklist de Aplicação',
  ChecklistMRAF: 'Checklist MRAF',
  ChecklistConcretagem: 'Checklist de Concretagem',
  ChecklistTerraplanagem: 'Checklist de Terraplanagem',
  ChecklistReciclagem: 'Checklist de Reciclagem',
};

/**
 * Obtém label de tipo ou retorna valor original.
 * @param {string} tipo - Tipo de registro
 * @returns {string}
 */
export const getTipoLabel = (tipo) => TIPO_LABELS[tipo] || tipo;

/**
 * Valida se NC possui dados de classificação.
 * @param {Object} nc - Registro de NC
 * @returns {boolean}
 */
export const hasClassificacao = (nc) =>
  !!(nc?.local_nc || nc?.categoria_nc || nc?.parametro_nc);

/**
 * Obtém logo regional com fallback padrão.
 * @param {Object|null} regional - Dados da regional
 * @returns {string} URL da logo
 */
export const getLogoUrl = (regional) =>
  regional?.logo_url ||
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png';

/**
 * Encontra obra associada ao NC.
 * @param {Object} nc - Registro de NC
 * @param {Array} obras - Lista de obras
 * @returns {Object|null}
 */
export const findObra = (nc, obras) =>
  obras?.find((o) => o.id === nc.obra_id) || null;

/**
 * Encontra regional associada à obra.
 * @param {Object} obra - Registro de obra
 * @param {Array} regionais - Lista de regionais
 * @returns {Object|null}
 */
export const findRegional = (obra, regionais) =>
  obra ? regionais?.find((r) => r.id === obra.regional_id) : null;

/**
 * Encontra projeto associado ao registro vinculado.
 * @param {Object} registro - Registro vinculado
 * @param {Array} projects - Lista de projetos
 * @returns {Object|null}
 */
export const findProject = (registro, projects) =>
  registro?.project_id
    ? projects?.find((p) => p.id === registro.project_id) || null
    : null;

/**
 * Encontra usuário criador do registro vinculado.
 * @param {Object} registro - Registro vinculado
 * @param {Array} users - Lista de usuários
 * @returns {Object|null}
 */
export const findCreatorUser = (registro, users) =>
  registro?.created_by
    ? users?.find(
        (u) =>
          u.email?.toLowerCase() === registro.created_by?.toLowerCase(),
      ) || null
    : null;