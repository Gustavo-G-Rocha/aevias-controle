/**
 * Abas comuns aos dois boletins de sondagem (PI e a Trado), que compartilham
 * a mesma estrutura de ensaios de umidade natural e densidade in situ.
 */
import { buildSheet, val } from '../excelCore';

/** Umidade natural (DNER-ME 213/94): uma coluna por determinação. */
export function umidadeSheet(umidade, name = 'Umidade Natural') {
  if (!umidade) return null;

  const linhas = [
    ['Camada Ensaiada', 'camada_ensaiada'],
    ['Nº da Cápsula', 'no_capsula'],
    ['Massa da Cápsula (g)', 'massa_capsula'],
    ['Massa Cáp. + Solo Úmido (g)', 'massa_cap_solo_umido'],
    ['Massa Cáp. + Solo Seco (g)', 'massa_cap_solo_seco'],
    ['Massa de Água (g)', 'massa_agua'],
    ['Massa de Solo Seco (g)', 'massa_solo_seco'],
    ['Umidade (%)', 'umidade'],
  ];

  return buildSheet({
    name,
    header: ['Determinação', '1', '2'],
    rows: linhas.map(([label, key]) => [
      label,
      val(umidade[`${key}_1`]),
      val(umidade[`${key}_2`]),
    ]),
    cols: [32, 18, 18],
  });
}

/** Densidade in situ (DNER-ME 092/94): uma coluna por ensaio realizado. */
export function densidadesSheet(densidades = []) {
  const lista = (densidades || []).filter(Boolean);
  if (lista.length === 0) return null;

  const linhas = [
    ['Camada Ensaiada', 'camada_ensaiada'],
    ['Peso do Frasco Antes (g)', 'peso_frasco_antes'],
    ['Peso do Frasco Depois (g)', 'peso_frasco_depois'],
    ['Peso da Areia Deslocada (g)', 'peso_areia_deslocada'],
    ['Peso Areia Funil + Placa (g)', 'peso_areia_funil_placa'],
    ['Peso da Areia na Cavidade (g)', 'peso_areia_cavidade'],
    ['Massa Esp. Aparente da Areia (g/cm³)', 'massa_esp_aparente_areia'],
    ['Volume do Buraco (cm³)', 'volume_buraco'],
    ['Peso Solo + Recipiente (g)', 'peso_solo_recipiente'],
    ['Peso do Recipiente (g)', 'peso_recipiente'],
    ['Peso do Solo (g)', 'peso_solo'],
    ['Dens. Aparente Solo Úmido (g/cm³)', 'densidade_aparente_solo_umido'],
    ['Peso do Solo Úmido (g)', 'peso_solo_umido'],
    ['Peso do Solo Seco (g)', 'peso_solo_seco'],
    ['Peso de Água (g)', 'peso_agua'],
    ['Teor de Umidade (%)', 'teor_umidade'],
    ['Dens. Aparente Solo Seco (g/cm³)', 'densidade_aparente_solo_seco'],
  ];

  return buildSheet({
    name: 'Densidade In Situ',
    header: ['Determinação', ...lista.map((_, i) => `Ensaio ${i + 1}`)],
    rows: linhas.map(([label, key]) => [label, ...lista.map((d) => val(d[key]))]),
    cols: [38, ...lista.map(() => 16)],
  });
}