/**
 * Funções puras para Ensaio de Densidade In Situ.
 * Sem side effects, sem chamadas de API.
 * Método Frasco de Areia - DNIT 458/25
 */

import { filtrarObrasPorAcessoRegional } from '@/utils/regionalFilter';
import { todayISO } from "@/utils/formInitialData";

/**
 * Retorna um furo inicial com todos os campos em branco.
 */
export function getFuroInicial(numero) {
  return {
    numero,
    estaca: "",
    pista: "",
    profundidade_furo: null,
    peso_areia_garrafa_antes: null,
    peso_areia_garrafa_apos: null,
    peso_material_umido_furo: null,
    peso_solo_retido_3_4_umido: null,
    tara_frigideira: null,
    material_umido_frigideira: null,
    material_seco_frigideira: null,
    densidade_umida_furo: null,
    densidade_seca_solo: null,
    umidade: null,
    desvio_umidade: null,
    grau_compactacao: null,
  };
}

/**
 * Retorna o estado inicial do formulário.
 */
export function getInitialFormData() {
  return {
    obra_id: "",
    project_id: "",
    data_ensaio: todayISO(),
    horario: "",
    rodovia: "",
    trecho: "",
    sub_trecho: "",
    camada: "",
    material: "",
    procedencia: "",
    substituicao_retido_3_4: false,
    densidade_real_retida_3_4: null,
    densidade_areia: null,
    peso_areia_funil: null,
    dados_proctor: {
      densidade_seca_max: null,
      umidade_otima: null,
    },
    furos: [getFuroInicial(1)],
    observacoes: "",
    fotos: [],
  };
}

/**
 * Calcula as grandezas derivadas de um furo (densidade úmida, seca, umidade).
 * Não calcula desvio_umidade nem grau_compactacao — esses dependem do Proctor.
 *
 * @param {object} furo
 * @param {number|null} densidadeAreia - g/cm³
 * @param {number|null} pesoAreiaFunil - g
 * @param {boolean} substituicao_retido_3_4
 * @param {number|null} densidade_real_retida_3_4 - g/cm³
 * @returns {object} novo objeto furo com campos calculados
 */
export function calcularFuro(furo, densidadeAreia, pesoAreiaFunil, substituicao_retido_3_4, densidade_real_retida_3_4) {
  const novoFuro = { ...furo };

  // Volume TOTAL do furo (cm³) = (Peso areia antes - Peso areia após - Peso areia funil) / Densidade areia
  const pesoAreiaNofuro =
    (furo.peso_areia_garrafa_antes || 0) -
    (furo.peso_areia_garrafa_apos || 0) -
    (pesoAreiaFunil || 0);
  const volumeTotal = densidadeAreia ? pesoAreiaNofuro / densidadeAreia : null;

  // Se há substituição na 3/4", calcular volume do material retido e subtrair do volume total
  let volumeFuro = volumeTotal;
  let pesoMaterialUmidoCorrigido = furo.peso_material_umido_furo || 0;

  if (substituicao_retido_3_4 && densidade_real_retida_3_4 && furo.peso_solo_retido_3_4_umido) {
    const volumeRetido3_4 = furo.peso_solo_retido_3_4_umido / densidade_real_retida_3_4;
    volumeFuro = volumeTotal - volumeRetido3_4;
    pesoMaterialUmidoCorrigido =
      (furo.peso_material_umido_furo || 0) - (furo.peso_solo_retido_3_4_umido || 0);
  }

  // Densidade úmida = Peso material úmido corrigido / Volume furo efetivo
  if (volumeFuro && pesoMaterialUmidoCorrigido) {
    novoFuro.densidade_umida_furo = parseFloat(
      (pesoMaterialUmidoCorrigido / volumeFuro).toFixed(3)
    );
  }

  // Umidade (%) = ((Material úmido - Material seco) / Material seco) × 100
  const materialUmido =
    (furo.material_umido_frigideira || 0) - (furo.tara_frigideira || 0);
  const materialSeco =
    (furo.material_seco_frigideira || 0) - (furo.tara_frigideira || 0);

  if (materialSeco > 0) {
    novoFuro.umidade = parseFloat(
      (((materialUmido - materialSeco) / materialSeco) * 100).toFixed(2)
    );
  }

  // Densidade seca = Densidade úmida / (1 + (Umidade / 100))
  if (novoFuro.densidade_umida_furo && novoFuro.umidade !== null) {
    novoFuro.densidade_seca_solo = parseFloat(
      (novoFuro.densidade_umida_furo / (1 + novoFuro.umidade / 100)).toFixed(3)
    );
  }

  return novoFuro;
}

/**
 * Calcula um furo incluindo desvio_umidade e grau_compactacao com base no Proctor.
 *
 * @param {object} furo
 * @param {object} dadosProctor - { densidade_seca_max, umidade_otima }
 * @param {number|null} densidadeAreia
 * @param {number|null} pesoAreiaFunil
 * @param {boolean} substituicao_retido_3_4
 * @param {number|null} densidade_real_retida_3_4
 * @returns {object} furo com todos os campos calculados
 */
export function calcularFuroComProctor(
  furo,
  dadosProctor,
  densidadeAreia,
  pesoAreiaFunil,
  substituicao_retido_3_4,
  densidade_real_retida_3_4
) {
  const novoFuro = calcularFuro(
    furo,
    densidadeAreia,
    pesoAreiaFunil,
    substituicao_retido_3_4,
    densidade_real_retida_3_4
  );

  // Desvio de umidade = Umidade - Umidade ótima
  if (novoFuro.umidade !== null && dadosProctor.umidade_otima) {
    novoFuro.desvio_umidade = parseFloat(
      (novoFuro.umidade - dadosProctor.umidade_otima).toFixed(2)
    );
  }

  // Grau de compactação = (Densidade seca / Densidade seca máx Proctor) × 100
  if (novoFuro.densidade_seca_solo && dadosProctor.densidade_seca_max) {
    novoFuro.grau_compactacao = parseFloat(
      ((novoFuro.densidade_seca_solo / dadosProctor.densidade_seca_max) * 100).toFixed(2)
    );
  }

  return novoFuro;
}

/**
 * Filtra obras disponíveis para o usuário conforme seu nível de acesso.
 *
 * @param {Array} obrasData - todas as obras
 * @param {Array} regionaisData
 * @param {object} currentUser - { email, access_level, role }
 * @returns {Array}
 */
export function filtrarObrasDisponiveis(obrasData, regionaisData, currentUser) {
  const accessLevel =
    currentUser.access_level || (currentUser.role === 'admin' ? 'admin' : 'user');
  const exigeEmAndamento = accessLevel === 'user' || accessLevel === 'funcionarios_cliente';
  const porAcesso = filtrarObrasPorAcessoRegional(obrasData, regionaisData, currentUser);
  return porAcesso.filter(
    obra => !exigeEmAndamento || obra.status === 'em_andamento'
  );
}