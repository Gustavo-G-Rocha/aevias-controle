/** Rótulos das peneiras, na ordem da maior para a menor abertura. */
export const PENEIRAS = [
  ['peneira_75_0mm', '75,0 mm (3")'],
  ['peneira_63_0mm', '63,0 mm (2 1/2")'],
  ['peneira_50_0mm', '50,0 mm (2")'],
  ['peneira_38_1mm', '38,1 mm (1 1/2")'],
  ['peneira_37_5mm', '37,5 mm (1 1/2")'],
  ['peneira_25_0mm', '25,0 mm (1")'],
  ['peneira_19_0mm', '19,0 mm (3/4")'],
  ['peneira_16_0mm', '16,0 mm (5/8")'],
  ['peneira_12_5mm', '12,5 mm (1/2")'],
  ['peneira_9_5mm', '9,5 mm (3/8")'],
  ['peneira_6_3mm', '6,3 mm (1/4")'],
  ['peneira_4_75mm', '4,75 mm (Nº 4)'],
  ['peneira_2_36mm', '2,36 mm (Nº 8)'],
  ['peneira_2_0mm', '2,00 mm (Nº 10)'],
  ['peneira_1_18mm', '1,18 mm (Nº 16)'],
  ['peneira_0_6mm', '0,60 mm (Nº 30)'],
  ['peneira_0_42mm', '0,42 mm (Nº 40)'],
  ['peneira_0_3mm', '0,30 mm (Nº 50)'],
  ['peneira_0_18mm', '0,18 mm (Nº 80)'],
  ['peneira_0_15mm', '0,15 mm (Nº 100)'],
  ['peneira_0_075mm', '0,075 mm (Nº 200)'],
];

/** Peneiras que possuem algum dado preenchido em ao menos uma das fontes. */
export function peneirasPreenchidas(fontes, temValor) {
  return PENEIRAS.filter(([key]) => fontes.some((f) => temValor(f, key)));
}