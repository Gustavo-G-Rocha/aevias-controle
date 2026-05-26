/**
 * Funções puras para RelatorioCAUQ.
 * Sem side effects, sem chamadas de API.
 * Referência: DNIT 412/2025 (Granulometria), DNIT 428/22 (Marshall), ABNT NBR 16208/2013 (Extração)
 */

export const PENEIRAS_CONFIG = [
  { label: 'Nº 3"',   abertura: '75,0',  key: 'peneira_75_0mm'  },
  { label: 'Nº 2½"',  abertura: '63,0',  key: 'peneira_63_0mm'  },
  { label: 'Nº 2"',   abertura: '50,0',  key: 'peneira_50_0mm'  },
  { label: 'Nº 1½"',  abertura: '37,5',  key: 'peneira_37_5mm'  },
  { label: 'Nº 1"',   abertura: '25,0',  key: 'peneira_25_0mm'  },
  { label: 'Nº ¾"',   abertura: '19,0',  key: 'peneira_19_0mm'  },
  { label: 'Nº ⅝"',   abertura: '16,0',  key: 'peneira_16_0mm'  },
  { label: 'Nº ½"',   abertura: '12,5',  key: 'peneira_12_5mm'  },
  { label: 'Nº ⅜"',   abertura: '9,5',   key: 'peneira_9_5mm'   },
  { label: '1/4"',    abertura: '6,3',   key: 'peneira_6_3mm'   },
  { label: 'Nº 4',    abertura: '4,75',  key: 'peneira_4_75mm'  },
  { label: 'Nº 8',    abertura: '2,36',  key: 'peneira_2_36mm'  },
  { label: 'Nº 10',   abertura: '2,0',   key: 'peneira_2_0mm'   },
  { label: 'Nº 16',   abertura: '1,18',  key: 'peneira_1_18mm'  },
  { label: 'Nº 30',   abertura: '0,6',   key: 'peneira_0_6mm'   },
  { label: 'Nº 40',   abertura: '0,42',  key: 'peneira_0_42mm'  },
  { label: 'Nº 50',   abertura: '0,3',   key: 'peneira_0_3mm'   },
  { label: 'Nº 80',   abertura: '0,18',  key: 'peneira_0_18mm'  },
  { label: 'Nº 100',  abertura: '0,15',  key: 'peneira_0_15mm'  },
  { label: 'Nº 200',  abertura: '0,075', key: 'peneira_0_075mm' },
];

// ── Formatação de datas ───────────────────────────────────────────────────────

/**
 * Formata data ISO para dd/mm/yyyy no fuso UTC.
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

/**
 * Formata datetime para exibição no fuso de Brasília.
 */
export function formatDateBrasilia(dateString) {
  if (!dateString) return 'N/A';
  let normalizedDate = dateString;
  if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
    normalizedDate = dateString + 'Z';
  }
  return new Date(normalizedDate).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'medium',
  });
}

// ── Granulometria ─────────────────────────────────────────────────────────────

/**
 * Compara abertura de peneira (string com vírgula ou mm) com abertura da config (string com vírgula).
 */
function aberturaMatch(aberturaFaixaRaw, aberturaConfig) {
  const a = aberturaFaixaRaw.toString().replace(/mm/gi, '').replace(',', '.').trim();
  const b = aberturaConfig.replace(',', '.').trim();
  return parseFloat(a) === parseFloat(b);
}

/**
 * Calcula os dados de granulometria para exibição na tabela e no gráfico.
 * @param {object} ensaio - registro EnsaioCAUQ
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
      faixaTrabalho    = project.faixa_trabalho?.[peneira.key]     || '';
      faixaTrabalhoMin = project.faixa_trabalho_min?.[peneira.key] || '';
      faixaTrabalhoMax = project.faixa_trabalho_max?.[peneira.key] || '';
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

// ── Média de corpos de prova ──────────────────────────────────────────────────

/**
 * Calcula a média de um campo numérico nos corpos de prova válidos.
 * @param {Array} cpsValidos - até 6 corpos de prova
 * @param {string} campo - nome do campo
 * @returns {string} valor formatado ou '-'
 */
export function calcularMedia(cpsValidos, campo) {
  const valores = cpsValidos.map(cp => parseFloat(cp[campo])).filter(v => !isNaN(v));
  if (valores.length === 0) return '-';
  const media = valores.reduce((a, b) => a + b, 0) / valores.length;
  if (campo === 'densidade_aparente') return media.toFixed(3);
  if (campo === 'volume_vazios')      return media.toFixed(1);
  return media.toFixed(2);
}

// ── Altura dinâmica de linhas da tabela ───────────────────────────────────────

/**
 * Retorna a classe CSS de altura da linha da tabela de granulometria
 * baseado no número de peneiras e se tem Marshall.
 */
export function getHeightClass(numPeneiras, realizarMarshall) {
  if (realizarMarshall) {
    if (numPeneiras <= 5)  return 'h-8';
    if (numPeneiras <= 7)  return 'h-6';
    if (numPeneiras <= 10) return 'h-5';
    if (numPeneiras <= 13) return 'h-4';
    return 'h-3';
  }
  if (numPeneiras <= 5)  return 'h-12';
  if (numPeneiras <= 7)  return 'h-10';
  if (numPeneiras <= 10) return 'h-8';
  if (numPeneiras <= 13) return 'h-7';
  return 'h-6';
}

// ── Escala logarítmica para o gráfico ────────────────────────────────────────

/**
 * Converte abertura (mm) para posição X no gráfico SVG usando escala logarítmica.
 * Maior abertura fica à esquerda.
 * @param {number} aberturaMm
 * @param {number} minAbertura
 * @param {number} maxAbertura
 * @returns {number} posição X (30–620)
 */
export function getXLog(aberturaMm, minAbertura, maxAbertura) {
  const logMin   = Math.log10(minAbertura);
  const logMax   = Math.log10(maxAbertura);
  const logValue = Math.log10(aberturaMm);
  return 30 + (590 * (logMax - logValue) / (logMax - logMin));
}

/**
 * Converte percentual passante para posição Y no gráfico SVG.
 * @param {number|string} percentual
 * @param {number} alturaTotal - 190 (com marshall) | 390 (sem)
 * @param {number} alturaGrafico - 185 (com marshall) | 385 (sem)
 * @returns {number} posição Y
 */
export function getYGraph(percentual, alturaTotal, alturaGrafico) {
  return alturaTotal - ((parseFloat(percentual) - 0) / 100 * alturaGrafico);
}