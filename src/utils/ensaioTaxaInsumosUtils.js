import { filtrarObrasPorAcessoRegional } from '@/utils/regionalFilter';

// ── Estrutura inicial ─────────────────────────────────────────────────────────

export const getEnsaioInicial = (numero) => ({
  numero,
  hora: "",
  camada: "",
  estaca: "",
  no_bandeja: "",
  peso_bandeja_amostra: null,
  peso_bandeja: null,
  peso_amostra: null,
  taxa_aplicada: null,
});

export const getInitialForm = () => ({
  obra_id: "",
  tipo_insumo: "",
  data_ensaio: new Date().toISOString().split('T')[0],
  rodovia: "",
  trecho: "",
  material: "",
  servico: "",
  placa_caminhao: "",
  dimensoes_bandeja: { lado_1: null, lado_2: null, area: null },
  ensaios: [getEnsaioInicial(1)],
  observacoes: "",
});

// ── Cálculo da área da bandeja (cm → m²) ──────────────────────────────────────

export function calcularAreaBandeja(lado1, lado2) {
  if (lado1 && lado2) {
    return parseFloat((lado1 * lado2 / 10000).toFixed(4));
  }
  return null;
}

// ── Cálculo de um ensaio individual ──────────────────────────────────────────
// C = P1 - P2 (peso amostra, em g)
// Taxa = C / (1000 × A) (kg/m²)

export function calcularEnsaio(ensaio, areaBandeja) {
  const novo = { ...ensaio };

  if (ensaio.peso_bandeja_amostra != null && ensaio.peso_bandeja != null) {
    novo.peso_amostra = parseFloat((ensaio.peso_bandeja_amostra - ensaio.peso_bandeja).toFixed(2));
  } else {
    novo.peso_amostra = null;
  }

  if (novo.peso_amostra != null && areaBandeja) {
    novo.taxa_aplicada = parseFloat((novo.peso_amostra / (1000 * areaBandeja)).toFixed(4));
  } else {
    novo.taxa_aplicada = null;
  }

  return novo;
}

// ── Filtro de obras (implantação e conservação) ───────────────────────────────

const TIPOS_OBRA_VALIDOS = ['implantacao', 'conservacao'];

export function filtrarObrasDisponiveis(obrasData, regionaisData, userData) {
  const accessLevel = userData?.access_level || (userData?.role === 'admin' ? 'admin' : 'user');
  const tiposSet = new Set(TIPOS_OBRA_VALIDOS);
  const exigeEmAndamento = accessLevel === 'user' || accessLevel === 'funcionarios_cliente';
  const porAcesso = filtrarObrasPorAcessoRegional(obrasData, regionaisData, userData);
  return porAcesso.filter(o =>
    tiposSet.has(o.tipo_obra) && (!exigeEmAndamento || o.status === 'em_andamento')
  );
}