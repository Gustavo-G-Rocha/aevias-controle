/**
 * Funções puras para RelatorioGranuMistura.
 * Utilitários para formatação, transformação e cálculo de dados.
 */

/**
 * Formata data ISO para padrão pt-BR.
 * @param {string|null} date - Data ISO
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '-';
  try {
    const d =
      date.length === 10 ? new Date(date + 'T00:00:00') : new Date(date);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
};

/**
 * Formata data/hora para pt-BR com timezone São Paulo.
 * @param {string|null} dateTime - Data/hora ISO
 * @returns {string}
 */
export const formatDateTime = (dateTime) => {
  if (!dateTime) return '-';
  try {
    const dt =
      !dateTime.endsWith('Z') && !dateTime.includes('+')
        ? dateTime + 'Z'
        : dateTime;
    return new Date(dt).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return '-';
  }
};

/**
 * Obtém logo regional com fallback padrão.
 * @param {Object|null} regional
 * @returns {string}
 */
export const getLogoUrl = (regional) =>
  regional?.logo_url ||
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png';

/**
 * Monta peneiras para exibição combinando faixa granulométrica com dados do registro.
 * @param {Object|null} faixa - Faixa granulométrica
 * @param {Array} peneirasDoRegistro - Peneiras do registro
 * @returns {Array}
 */
export const montarPeneirasParaMostrar = (faixa, peneirasDoRegistro) => {
  const peneirasExibir = faixa?.peneiras || [];

  if (peneirasExibir.length > 0) {
    return peneirasExibir
      .map((fp) => {
        const ab = parseFloat(fp.abertura);
        const peneiraDados = peneirasDoRegistro.find(
          (p) => Math.abs(p.abertura_mm - ab) < 0.01,
        );
        return peneiraDados
          ? { ...peneiraDados, especMin: fp.min, especMax: fp.max }
          : null;
      })
      .filter(Boolean);
  }

  return peneirasDoRegistro;
};

/**
 * Monta dados do gráfico a partir das peneiras.
 * @param {Array} peneirasParaMostrar
 * @returns {Array}
 */
export const montarChartData = (peneirasParaMostrar) => {
  return peneirasParaMostrar.map((p) => ({
    abertura: p.abertura_mm,
    passante: parseFloat(p.passante_pct) || 0,
    min: p.especMin ?? undefined,
    max: p.especMax ?? undefined,
  }));
};

/**
 * Valida se há especificações de limite no conjunto de peneiras.
 * @param {Array} peneirasParaMostrar
 * @returns {boolean}
 */
export const temEspecificacao = (peneirasParaMostrar) => {
  return peneirasParaMostrar.some((p) => p.especMin != null);
};

/**
 * Obtém nome do material tratando caso especial 'OUTRO'.
 * @param {Object} record
 * @returns {string}
 */
export const getNomeMaterial = (record) => {
  if (record.material === 'OUTRO') return record.material_outro || 'OUTRO';
  return record.material || '—';
};

/**
 * Obtém nome do projeto tratando caso especial 'OUTRO' em material.
 * @param {Object} record
 * @param {Object|null} project
 * @returns {string}
 */
export const getNomeProjetoExibir = (record, project) => {
  if (record.material === 'OUTRO') return 'N/A';
  return project?.name || '—';
};

/**
 * Obtém nome da faixa granulométrica.
 * @param {Object|null} faixa
 * @param {string|null} recordFaixa
 * @returns {string}
 */
export const getNomeFaixa = (faixa, recordFaixa) => {
  return faixa?.nome || recordFaixa || '—';
};