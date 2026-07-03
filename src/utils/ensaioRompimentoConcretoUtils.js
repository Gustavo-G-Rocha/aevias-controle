/**
 * Funções puras para EnsaioRompimentoConcreto.
 * Sem side effects, sem chamadas de API.
 */

import { filtrarObrasPorAcessoRegional } from '@/utils/regionalFilter';

// ── Constantes ────────────────────────────────────────────────────────────────

export const DIMENSOES_CP = ['5x10', '15x30', '10x20'];
export const IDADES_CP = [3, 7, 28, 63];

export const FORM_INITIAL = {
  obra_id: '', project_id: '',
  data_ensaio: new Date().toISOString().split('T')[0],
  laboratorista_name: '', cliente: '', rodovia: '',
  volume_betonado: '', fornecedor: '', hora_moldagem: '',
  trecho: '', projeto_trac: '', numero_moldagem: '',
  estrutura: '', construtora: '', nota_fiscal: '',
  estaca_moldagem: '', slump_test: '', temperatura_ambiente: '',
  hora_saida_usina: '', hora_chegada_campo: '',
  compressao_axial: [], tracao_flexao: [], observacoes: '',
};

// ── Cálculos ──────────────────────────────────────────────────────────────────

/** Soma `dias` à data de moldagem e retorna string YYYY-MM-DD */
export function calcularDataRuptura(dataMoldagem, dias) {
  if (!dataMoldagem || !dias) return '';
  const d = new Date(dataMoldagem + 'T00:00:00');
  d.setDate(d.getDate() + parseInt(dias));
  return d.toISOString().split('T')[0];
}

/** Calcula área do CP em cm² baseado na dimensão (A = π·r²) */
export function calcularAreaCP(dimensao) {
  const diametroPorDimensao = { '5x10': 5, '15x30': 15, '10x20': 10 };
  const diametro = diametroPorDimensao[dimensao];
  if (!diametro) return '';
  return (Math.PI * (diametro / 2) ** 2).toFixed(2);
}

/** Calcula resistência em MPa: R = (carga / área) × 980,665 */
export function calcularResistencia(cargaRuptura, area) {
  const carga = parseFloat(cargaRuptura);
  const areaCM2 = parseFloat(area);
  if (!carga || !areaCM2 || carga <= 0 || areaCM2 <= 0) return '';
  return ((carga / areaCM2) * 980.665).toFixed(2);
}

/** Calcula resistência à tração na flexão em MPa */
export function calcularResistenciaFlexaoCp(cp, serie) {
  const carga = parseFloat(cp.carga_ruptura);
  const vao = parseFloat(serie.vao_central);
  const altura = parseFloat(serie.altura_cp);
  const largura = parseFloat(serie.largura_cp);
  if (!carga || !vao || !altura || !largura || largura <= 0 || altura <= 0) return '';
  if (cp.ponto_ruptura === 'No terço médio') {
    return ((carga * 9.80665 * vao) / (altura * largura ** 2)).toFixed(2);
  }
  if (cp.ponto_ruptura === 'Fora do terço médio') {
    return ((3 * carga * 9.80665 * vao) / (altura * largura ** 2)).toFixed(2);
  }
  return '';
}

// ── Filtro de obras ───────────────────────────────────────────────────────────

const TIPOS_OBRA_VALIDOS = ['implantacao', 'conservacao', 'supervisao'];

export function filtrarObras(obras, user, regionais) {
  const tiposSet = new Set(TIPOS_OBRA_VALIDOS);
  const porAcesso = filtrarObrasPorAcessoRegional(obras, regionais, user);
  return porAcesso.filter(o => tiposSet.has(o.tipo_obra));
}

// ── Factories de séries ───────────────────────────────────────────────────────

export function novaCpAxial() { return { numero_cp: '', carga_ruptura: '', resistencia: '' }; }
export function novaSerie() {
  return {
    idade: '', dimensao: '5x10', data_ruptura: '',
    area_cp: calcularAreaCP('5x10'),
    cps: [novaCpAxial(), novaCpAxial()],
  };
}

export function novaCpFlexao() { return { numero_cp: '', ponto_ruptura: '', carga_ruptura: '', resistencia: '' }; }
export function novaSerieFlexao() {
  return {
    idade: '', data_ruptura: '', vao_central: '', altura_cp: '', largura_cp: '',
    cps: [novaCpFlexao(), novaCpFlexao()],
  };
}

// ── Conversores série ↔ flat array (persistência) ─────────────────────────────

export function seriesToCompressaoAxial(series) {
  return series.flatMap(s =>
    s.cps.map(cp => ({
      numero_cp: cp.numero_cp, idade: s.idade, dimensao: s.dimensao,
      data_ruptura: s.data_ruptura, carga_ruptura: cp.carga_ruptura,
      area_cp: s.area_cp, resistencia: cp.resistencia,
    }))
  );
}

export function compressaoAxialToSeries(compressaoAxial) {
  const result = [];
  for (let i = 0; i < compressaoAxial.length; i += 2) {
    const cp1 = compressaoAxial[i] || {};
    const cp2 = compressaoAxial[i + 1] || {};
    result.push({
      idade: cp1.idade || '', dimensao: cp1.dimensao || '5x10',
      data_ruptura: cp1.data_ruptura || '',
      area_cp: cp1.area_cp || calcularAreaCP('5x10'),
      cps: [
        { numero_cp: cp1.numero_cp || '', carga_ruptura: cp1.carga_ruptura || '', resistencia: cp1.resistencia || '' },
        { numero_cp: cp2.numero_cp || '', carga_ruptura: cp2.carga_ruptura || '', resistencia: cp2.resistencia || '' },
      ],
    });
  }
  return result;
}

export function seriesToTracaoFlexao(series) {
  return series.flatMap(s =>
    s.cps.map(cp => ({
      numero_cp: cp.numero_cp, ponto_ruptura: cp.ponto_ruptura, idade: s.idade,
      data_ruptura: s.data_ruptura, vao_central: s.vao_central,
      altura_cp: s.altura_cp, largura_cp: s.largura_cp,
      carga_ruptura: cp.carga_ruptura, resistencia: cp.resistencia,
    }))
  );
}

export function tracaoFlexaoToSeries(tracaoFlexao) {
  const result = [];
  for (let i = 0; i < tracaoFlexao.length; i += 2) {
    const cp1 = tracaoFlexao[i] || {};
    const cp2 = tracaoFlexao[i + 1] || {};
    result.push({
      idade: cp1.idade || '', data_ruptura: cp1.data_ruptura || '',
      vao_central: cp1.vao_central || '', altura_cp: cp1.altura_cp || '', largura_cp: cp1.largura_cp || '',
      cps: [
        { numero_cp: cp1.numero_cp || '', ponto_ruptura: cp1.ponto_ruptura || '', carga_ruptura: cp1.carga_ruptura || '', resistencia: cp1.resistencia || '' },
        { numero_cp: cp2.numero_cp || '', ponto_ruptura: cp2.ponto_ruptura || '', carga_ruptura: cp2.carga_ruptura || '', resistencia: cp2.resistencia || '' },
      ],
    });
  }
  return result;
}