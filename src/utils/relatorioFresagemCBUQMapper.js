/**
 * Mapper para RelatorioFresagemCBUQ.
 * Transforma Data Models (entidade bruta + dados relacionados) em
 * Presentation Model (formato pronto para exibição no JSX).
 */

import { formatDate, buildSignatureProps } from './relatorioUtils';
import { normalizarSentidos } from './registroFresagemCBUQUtils';

const display = (value, fallback = 'N/A') =>
  value === null || value === undefined || value === '' ? fallback : value;

const SENTIDO_LABELS = { norte: 'Norte', sul: 'Sul', leste: 'Leste', oeste: 'Oeste' };
const TEMPO_LABELS = { bom: 'Bom', chuva: 'Chuva', instavel: 'Instável' };

export const mapLinhaToRow = (linha) => ({
  localizacao_inicial: display(linha?.localizacao_inicial, ''),
  localizacao_final: display(linha?.localizacao_final, ''),
  faixa: display(linha?.faixa, ''),
  largura_m: display(linha?.largura_m, ''),
  extensao_m: display(linha?.extensao_m, ''),
  espessura_m: display(linha?.espessura_m, ''),
  pintura_bd_be_mts: display(linha?.pintura_bd_be_mts, ''),
  pintura_4x12_qtde: display(linha?.pintura_4x12_qtde, ''),
  pintura_2x2_qtde: display(linha?.pintura_2x2_qtde, ''),
  pintura_zebrado_mts: display(linha?.pintura_zebrado_mts, ''),
  tacha_bd_be_unid: display(linha?.tacha_bd_be_unid, ''),
  tacha_4x12_unid: display(linha?.tacha_4x12_unid, ''),
  tacha_2x2_unid: display(linha?.tacha_2x2_unid, ''),
  tacha_zebrado_unid: display(linha?.tacha_zebrado_unid, ''),
  dreno_m: display(linha?.dreno_m, ''),
});

/**
 * @param {Object} params - { registro, obra, regional, projeto }
 */
export const mapFresagemToPresentation = ({ registro, obra, regional, projeto }) => {
  if (!registro) return null;

  const tempo = registro.condicoes_tempo || {};

  return {
    cliente: display(regional?.cliente),
    obra_nome: display(obra?.name),
    contratada: display(registro.contratada),
    numero_contrato: display(registro.numero_contrato),
    especificacao_granulometrica: display(registro.especificacao_granulometrica),
    projeto: display(projeto?.name),
    material: display(registro.material),
    camada: display(registro.camada),
    rodovia: display(registro.rodovia),
    sentido_pista: display(
      normalizarSentidos(registro.sentido_pista).map(s => SENTIDO_LABELS[s] || s).join(' / '),
      'N/A'
    ),
    inspetor: display(registro.laboratorista_name),

    data_inicio: formatDate(registro.data),
    data_fim: registro.data_fim ? formatDate(registro.data_fim) : 'N/A',

    condicoes_tempo: {
      manha: display(TEMPO_LABELS[tempo.manha], '—'),
      tarde: display(TEMPO_LABELS[tempo.tarde], '—'),
      noite: display(TEMPO_LABELS[tempo.noite], '—'),
    },

    tipo_localizacao: registro.tipo_localizacao === 'estaca' ? 'ESTACA' : 'KM',
    registros: (registro.registros || []).map(mapLinhaToRow),

    observacoes: display(registro.observacoes, '—'),

    fotos: registro.fotos || [],

    logo_url: regional?.logo_url ||
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png',

    signatureProps: buildSignatureProps(registro, 'Inspetor'),
  };
};