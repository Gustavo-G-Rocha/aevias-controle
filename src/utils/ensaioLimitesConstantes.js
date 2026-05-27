/**
 * Constantes para EnsaioLimites.
 */

export const PENEIRAS_GROSSAS = [
  { label: '3"', mm: 76.2 },
  { label: '2"', mm: 50.8 },
  { label: '1"', mm: 25.4 },
  { label: '3/8"', mm: 9.52 },
  { label: '4°', mm: 4.76 },
  { label: '10°', mm: 2.0 },
];

export const PENEIRAS_FINAS = [
  { label: '40', mm: 0.42 },
  { label: '200', mm: 0.075 },
];

export function defaultLimites() {
  return {
    higro_solo_umido_capsula_1: '',
    higro_solo_umido_capsula_2: '',
    higro_solo_seco_capsula_1: '',
    higro_solo_seco_capsula_2: '',
    higro_peso_capsula_1: '',
    higro_peso_capsula_2: '',
    peneiras_grossas: PENEIRAS_GROSSAS.map(p => ({ ...p, retido: '' })),
    amostra_total_umida: '',
    amostra_total_seca: '',
    amostra_parcial_umida: '',
    amostra_parcial_seca: '',
    peneiras_finas: PENEIRAS_FINAS.map(p => ({ ...p, retido: '' })),
    ll_rows: Array(5).fill(null).map(() => ({
      numero_capsula: '',
      solo_umido_capsula: '',
      solo_seco_capsula: '',
      peso_capsula: '',
      num_golpes: '',
    })),
    lp_rows: Array(5).fill(null).map(() => ({
      numero_capsula: '',
      solo_umido_capsula: '',
      solo_seco_capsula: '',
      peso_capsula: '',
    })),
  };
}