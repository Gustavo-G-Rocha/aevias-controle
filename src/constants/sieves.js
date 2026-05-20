/**
 * Configuração centralizada de peneiras ASTM/DNIT
 * Usado em EnsaioCAUQ, EnsaioMRAF, EnsaioGranulometriaIndividual, etc.
 */

export const PENEIRAS_CONFIG = [
  { key: "peneira_75_0mm",   label: '3"',      abertura: "75,0" },
  { key: "peneira_63_0mm",   label: '2.1/2"',  abertura: "63,0" },
  { key: "peneira_50_0mm",   label: '2"',       abertura: "50,0" },
  { key: "peneira_37_5mm",   label: '1.1/2"',  abertura: "37,5" },
  { key: "peneira_25_0mm",   label: '1"',       abertura: "25,0" },
  { key: "peneira_19_0mm",   label: '3/4"',     abertura: "19,0" },
  { key: "peneira_16_0mm",   label: '5/8"',     abertura: "16,0" },
  { key: "peneira_12_5mm",   label: '1/2"',     abertura: "12,5" },
  { key: "peneira_9_5mm",    label: '3/8"',     abertura: "9,5"  },
  { key: "peneira_6_3mm",    label: '1/4"',     abertura: "6,3"  },
  { key: "peneira_4_75mm",   label: 'Nº 4',     abertura: "4,75" },
  { key: "peneira_2_36mm",   label: 'Nº 8',     abertura: "2,36" },
  { key: "peneira_2_0mm",    label: 'Nº 10',    abertura: "2,0"  },
  { key: "peneira_1_18mm",   label: 'Nº 16',    abertura: "1,18" },
  { key: "peneira_0_6mm",    label: 'Nº 30',    abertura: "0,6"  },
  { key: "peneira_0_42mm",   label: 'Nº 40',    abertura: "0,42" },
  { key: "peneira_0_3mm",    label: 'Nº 50',    abertura: "0,3"  },
  { key: "peneira_0_18mm",   label: 'Nº 80',    abertura: "0,18" },
  { key: "peneira_0_15mm",   label: 'Nº 100',   abertura: "0,15" },
  { key: "peneira_0_075mm",  label: 'Nº 200',   abertura: "0,075" },
];

/** Map key → { astm, mm } para GranulometriaIndividual */
export const PENEIRAS_MAP = Object.fromEntries(
  PENEIRAS_CONFIG.map(p => [p.key, { astm: p.label, mm: p.abertura }])
);

/**
 * Filtra peneiras de acordo com a faixa granulométrica do projeto.
 * Se não houver faixa definida, retorna todas as peneiras.
 */
export function filtrarPeneirasPorFaixa(faixa, config = PENEIRAS_CONFIG) {
  if (!faixa?.peneiras?.length) return config;
  return config.filter(peneira => {
    const aberturaConfig = parseFloat(peneira.abertura.replace(',', '.'));
    return faixa.peneiras.some(p => {
      const aberturaFaixa = parseFloat(p.abertura.toString().replace(/mm/gi, '').replace(',', '.').trim());
      return Math.abs(aberturaConfig - aberturaFaixa) < 0.001;
    });
  });
}