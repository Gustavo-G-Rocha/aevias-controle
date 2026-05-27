/**
 * Funções puras para RelatorioMRAF.
 * Sem side effects, sem chamadas de API.
 * Referência: DNIT 412/2025 (Granulometria), ABNT NBR 16208/2013 (Extração)
 */
import { PENEIRAS_CONFIG } from '@/constants/sieves';

/**
 * Compara abertura de peneira (string com vírgula ou mm) com abertura da config (string com vírgula).
 */
function aberturaMatch(aberturaFaixaRaw, aberturaConfig) {
  const a = parseFloat(aberturaFaixaRaw.toString().replace(/mm/gi, '').replace(',', '.').trim());
  const b = parseFloat(aberturaConfig.replace(',', '.').trim());
  return Math.abs(a - b) < 0.001;
}

/**
 * Calcula os dados de granulometria para exibição na tabela e no gráfico.
 * @param {object} ensaio - registro EnsaioMRAF
 * @param {object|null} faixa - registro FaixaGranulometrica
 * @param {object|null} project - registro Project
 * @returns {Array} dados por peneira
 */
export function calcularGranulometria(ensaio, faixa, project) {
  if (!ensaio?.granulometria?.peso_retido_peneiras) return [];

  const pesosRetidos = ensaio.granulometria.peso_retido_peneiras;
  const pesoInicial  = ensaio.extracao_ligante?.amostra_sem_ligante || 0;

  // Filtrar apenas peneiras que estão na faixa do projeto
  let peneirasRelevantes = PENEIRAS_CONFIG;
  if (faixa?.peneiras && faixa.peneiras.length > 0) {
    peneirasRelevantes = PENEIRAS_CONFIG.filter(peneira =>
      faixa.peneiras.some(p => aberturaMatch(p.abertura, peneira.abertura))
    );
  }

  let acumuladoRetido = 0;

  return peneirasRelevantes.map(peneira => {
    const pesoRetido = pesosRetidos[peneira.key] || 0;
    acumuladoRetido += pesoRetido;

    const percentualPassante = pesoInicial > 0
      ? ((pesoInicial - acumuladoRetido) / pesoInicial * 100).toFixed(1)
      : 0;

    let limiteMin = '', limiteMax = '';
    if (faixa?.peneiras) {
      const pf = faixa.peneiras.find(p => aberturaMatch(p.abertura, peneira.abertura));
      if (pf) {
        limiteMin = pf.min || '';
        limiteMax = pf.max || '';
      }
    }

    let faixaTrabalhoMin = '', faixaTrabalhoMax = '', faixaTrabalho = '';
    if (project) {
      const aberturaNum = parseFloat(peneira.abertura.replace(',', '.'));
      const findByAbertura = (obj) => {
        if (!obj) return '';
        if (obj[peneira.key] !== undefined && obj[peneira.key] !== null && obj[peneira.key] !== '') return obj[peneira.key];
        for (const [k, v] of Object.entries(obj)) {
          const parts = k.replace('peneira_', '').replace(/mm$/, '').split('_');
          const keyNum = parseFloat(parts.join('.'));
          if (!isNaN(keyNum) && Math.abs(keyNum - aberturaNum) < 0.001 && v !== undefined && v !== null && v !== '') return v;
        }
        return '';
      };
      faixaTrabalho    = findByAbertura(project.faixa_trabalho);
      faixaTrabalhoMin = findByAbertura(project.faixa_trabalho_min);
      faixaTrabalhoMax = findByAbertura(project.faixa_trabalho_max);
    }

    return {
      astm: peneira.label,
      abertura: peneira.abertura,
      retido: pesoRetido,
      passante: ((pesoInicial - acumuladoRetido) || 0).toFixed(1),
      percentualPassante,
      limiteMin,
      limiteMax,
      faixaTrabalhoMin,
      faixaTrabalho,
      faixaTrabalhoMax,
    };
  });
}

/**
 * Calcula altura dinâmica de linhas baseado no número de peneiras (sem Marshall no MRAF).
 */
export function getHeightClass(numPeneiras) {
  if (numPeneiras <= 5)  return 'h-10';
  if (numPeneiras <= 7)  return 'h-8';
  if (numPeneiras <= 10) return 'h-7';
  if (numPeneiras <= 13) return 'h-6';
  return 'h-5';
}

/**
 * Converte abertura (mm) para posição X no gráfico SVG usando escala logarítmica.
 * Maior abertura fica à esquerda.
 */
export function getXLog(aberturaMm, minAbertura, maxAbertura) {
  const logMin   = Math.log10(minAbertura);
  const logMax   = Math.log10(maxAbertura);
  const logValue = Math.log10(aberturaMm);
  return 30 + (590 * (logMax - logValue) / (logMax - logMin));
}

/**
 * Converte percentual passante para posição Y no gráfico SVG.
 */
export function getYGraph(percentual) {
  return 240 - ((parseFloat(percentual) - 0) / 100 * 235);
}

/**
 * Calcula percentual de emulsão a partir de teor de ligante e resíduo.
 */
export function calcularPercentualEmulsao(teorLigante, residuoEmulsao) {
  if (!teorLigante || !residuoEmulsao) return '';
  return ((teorLigante / residuoEmulsao) * 100).toFixed(2);
}