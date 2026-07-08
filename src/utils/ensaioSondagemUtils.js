/**
 * Funções puras do Ensaio de Sondagem.
 * Sem dependências de React, SDK ou estado.
 */

import { filtrarObrasPorAcessoRegional } from '@/utils/regionalFilter';
import { todayISO } from "@/utils/formInitialData";

/** Corpo de prova vazio inicial */
export const getCorpoProvaInicial = (numero) => ({
  numero,
  data_execucao: todayISO(),
  estaca: "",
  lado: "direito",
  medidas_espessura: ["", "", "", ""],
  media_espessura: "",
  peso_ao_ar: "",
  peso_imerso: "",
  peso_saturado: "",
  volume: "",
  densidade: "",
  gc_dens_projeto: "",
  dens_rice_do_dia: "",
  gc_dens_rice_dia: "",
  volume_vazios: "",
  leitura: "",
  rtcd_25c: "",
});

/** Estado inicial do formulário */
export const getInitialFormData = () => ({
  metodo_ensaio: "DNIT 428/2022",
  obra_id: "",
  project_id: "",
  data: todayISO(),
  usina_fornecedora: "",
  servico: "",
  rodovia: "",
  trecho: "",
  ensaio_realizado_por: "Afirma Evias",
  fator_correcao_prensa: 1.0000,
  dens_agua_25c: 0.9971,
  volume_vazios_projeto: "",
  dens_aparente_projeto: "",
  dens_rice_projeto: "",
  espessura_projeto: "",
  corpos_prova: [],
  observacoes: "",
  fotos: [],
  status: "rascunho",
});

/**
 * Calcula a média das 4 medidas de espessura (cm).
 * Retorna string vazia se menos de 4 medidas válidas.
 */
export const calcularMediaEspessura = (medidas) => {
  const validas = medidas.filter(v => v !== "" && !isNaN(parseFloat(v))).map(v => parseFloat(v));
  if (validas.length === 4) {
    return (validas.reduce((a, b) => a + b, 0) / 4).toFixed(2);
  }
  return "";
};

/**
 * Calcula o volume do corpo de prova conforme o método de ensaio.
 * DNIT 428/2022: volume = peso_saturado - peso_imerso
 * DNER 117/94:   volume = peso_ao_ar - peso_imerso
 */
export const calcularVolume = (cp, metodo) => {
  if (metodo === "DNER 117/94") {
    const ar = parseFloat(cp.peso_ao_ar) || 0;
    const im = parseFloat(cp.peso_imerso) || 0;
    return ar > 0 && im > 0 ? (ar - im).toFixed(2) : cp.volume;
  }
  const sat = parseFloat(cp.peso_saturado) || 0;
  const im = parseFloat(cp.peso_imerso) || 0;
  return sat > 0 && im > 0 ? (sat - im).toFixed(2) : cp.volume;
};

/**
 * Calcula a densidade aparente do CP conforme o método.
 * DNIT 428/2022: densidade = (peso_ao_ar / volume) × dens_agua_25c
 * DNER 117/94:   densidade = peso_ao_ar / volume
 */
export const calcularDensidade = (cp, metodo, densAgua) => {
  const ar = parseFloat(cp.peso_ao_ar) || 0;
  const vol = parseFloat(cp.volume) || 0;
  if (ar <= 0 || vol <= 0) return cp.densidade;
  if (metodo === "DNER 117/94") {
    return (ar / vol).toFixed(3);
  }
  return ((ar / vol) * (parseFloat(densAgua) || 0.9971)).toFixed(3);
};

/**
 * Calcula o Grau de Compactação em relação à densidade de projeto.
 * GC = (densidade / dens_aparente_projeto) × 100
 */
export const calcularGCProjeto = (densidade, densAparenteProjeto) => {
  const d = parseFloat(densidade) || 0;
  const dp = parseFloat(densAparenteProjeto) || 0;
  if (d > 0 && dp > 0) return ((d / dp) * 100).toFixed(1);
  return "";
};

/**
 * Calcula o Grau de Compactação em relação à densidade RICE do dia.
 * GC = (densidade / dens_rice_do_dia) × 100
 */
export const calcularGCRice = (densidade, densRiceDia) => {
  const d = parseFloat(densidade) || 0;
  const r = parseFloat(densRiceDia) || 0;
  if (d > 0 && r > 0) return ((d / r) * 100).toFixed(1);
  return "";
};

/**
 * Calcula o volume de vazios: 100 - GC_rice
 */
export const calcularVolumeVazios = (gcRice) => {
  const gc = parseFloat(gcRice) || 0;
  return gc > 0 ? (100 - gc).toFixed(1) : "";
};

/**
 * Calcula o RTCD 25°C (MPa).
 * σR (MPa) = (2 × F_N) / (π × D × H)
 * F = leitura (kgf) × fator × 9.80665 (N)
 * D = 100 mm (diâmetro padrão Marshall)
 * H = espessuraCm × 10 (mm)
 */
export const calcularRTCD = (leitura, mediaEspessura, fatorCorrecao) => {
  const l = parseFloat(leitura) || 0;
  const h_cm = parseFloat(mediaEspessura) || 0;
  const fator = parseFloat(fatorCorrecao) || 1;
  if (l <= 0 || h_cm <= 0) return "";
  const F_N = l * fator * 9.80665;
  const D_mm = 100;
  const H_mm = h_cm * 10;
  return ((2 * F_N) / (Math.PI * D_mm * H_mm)).toFixed(2);
};

/**
 * Recalcula todos os campos derivados de um corpo de prova
 * após a mudança de qualquer campo.
 */
export const recalcularCP = (cp, field, value, metodo, densAgua, densAparenteProjeto, fatorCorrecao) => {
  const updated = { ...cp, [field]: value };

  // Média de espessura
  if (field === 'medidas_espessura') {
    updated.media_espessura = calcularMediaEspessura(value);
  }

  // Volume
  if (['peso_ao_ar', 'peso_saturado', 'peso_imerso'].includes(field)) {
    updated.volume = calcularVolume(updated, metodo);
  }

  // Densidade (depende de volume, que pode ter sido recalculado acima)
  if (['peso_ao_ar', 'volume', 'peso_saturado', 'peso_imerso'].includes(field)) {
    updated.densidade = calcularDensidade(updated, metodo, densAgua);
  }

  // GC Projeto
  if (field === 'densidade' || densAparenteProjeto) {
    updated.gc_dens_projeto = calcularGCProjeto(updated.densidade, densAparenteProjeto);
  }

  // GC Rice
  if (['densidade', 'dens_rice_do_dia'].includes(field)) {
    updated.gc_dens_rice_dia = calcularGCRice(updated.densidade, updated.dens_rice_do_dia);
  }

  // Volume de Vazios
  if (field === 'gc_dens_rice_dia' || field === 'dens_rice_do_dia') {
    updated.volume_vazios = calcularVolumeVazios(updated.gc_dens_rice_dia);
  }

  // RTCD
  if (field === 'leitura' || field === 'media_espessura') {
    updated.rtcd_25c = calcularRTCD(updated.leitura, updated.media_espessura, fatorCorrecao);
  }

  return updated;
};

/**
 * Valida os corpos de prova antes da finalização.
 * Retorna array de números dos CPs incompletos.
 */
export const validarCPsParaFinalizar = (corposProva, metodo) => {
  return corposProva
    .filter(cp => {
      const temAlgumDado = cp.medidas_espessura.some(m => m !== "") ||
        cp.peso_ao_ar || cp.peso_imerso || cp.peso_saturado;
      if (!temAlgumDado) return false;
      const medidasPreenchidas = cp.medidas_espessura.filter(m => m !== "").length;
      return (
        (medidasPreenchidas > 0 && medidasPreenchidas < 4) ||
        !cp.peso_ao_ar ||
        !cp.peso_imerso ||
        (metodo === "DNIT 428/2022" && !cp.peso_saturado)
      );
    })
    .map(cp => cp.numero);
};

/**
 * Serializa os dados do formulário para salvar na entidade.
 * Converte strings numéricas para number e filtra nulos.
 */
export const serializarFormData = (formData, status) => ({
  ...formData,
  status,
  fotos: (formData.fotos || []).map(f => (typeof f === 'string' ? f : (f?.url || ''))).filter(Boolean),
  fator_correcao_prensa: parseFloat(formData.fator_correcao_prensa),
  dens_agua_25c: parseFloat(formData.dens_agua_25c),
  volume_vazios_projeto: formData.volume_vazios_projeto ? parseFloat(formData.volume_vazios_projeto) : null,
  dens_aparente_projeto: formData.dens_aparente_projeto ? parseFloat(formData.dens_aparente_projeto) : null,
  dens_rice_projeto: formData.dens_rice_projeto ? parseFloat(formData.dens_rice_projeto) : null,
  espessura_projeto: formData.espessura_projeto ? parseFloat(formData.espessura_projeto) : null,
  corpos_prova: formData.corpos_prova.map(cp => ({
    ...cp,
    numero: parseInt(cp.numero),
    medidas_espessura: cp.medidas_espessura.map(m => m ? parseFloat(m) : null).filter(m => m !== null),
    media_espessura: cp.media_espessura ? parseFloat(cp.media_espessura) : null,
    peso_ao_ar: cp.peso_ao_ar ? parseFloat(cp.peso_ao_ar) : null,
    peso_imerso: cp.peso_imerso ? parseFloat(cp.peso_imerso) : null,
    peso_saturado: cp.peso_saturado ? parseFloat(cp.peso_saturado) : null,
    volume: cp.volume ? parseFloat(cp.volume) : null,
    densidade: cp.densidade ? parseFloat(cp.densidade) : null,
    gc_dens_projeto: cp.gc_dens_projeto ? parseFloat(cp.gc_dens_projeto) : null,
    dens_rice_do_dia: cp.dens_rice_do_dia ? parseFloat(cp.dens_rice_do_dia) : null,
    gc_dens_rice_dia: cp.gc_dens_rice_dia ? parseFloat(cp.gc_dens_rice_dia) : null,
    volume_vazios: cp.volume_vazios ? parseFloat(cp.volume_vazios) : null,
    leitura: cp.leitura ? parseFloat(cp.leitura) : null,
    rtcd_25c: cp.rtcd_25c ? parseFloat(cp.rtcd_25c) : null,
  })),
});

/**
 * Valida um arquivo de foto (tipo e tamanho).
 * Lança Error se inválido.
 */
export const validarArquivoFoto = (file) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowed.includes(file.type)) throw new Error(`Tipo de arquivo não suportado: ${file.type}`);
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) throw new Error(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  return true;
};

/**
 * Filtra obras permitidas conforme o nível de acesso do usuário.
 */
export const filtrarObrasPorAcesso = (obrasData, regionaisData, userData) => {
  const accessLevel = userData?.access_level || (userData?.role === 'admin' ? 'admin' : 'user');
  const tiposValidos = accessLevel === 'user'
    ? ['implantacao', 'supervisao']
    : ['implantacao', 'conservacao', 'supervisao'];
  const tiposSet = new Set(tiposValidos);
  const exigeEmAndamento = accessLevel === 'user';
  const porAcesso = filtrarObrasPorAcessoRegional(obrasData, regionaisData, userData);
  return porAcesso.filter(o =>
    tiposSet.has(o.tipo_obra) && (!exigeEmAndamento || o.status === 'em_andamento')
  );
};

/**
 * Filtra projetos CAUQ disponíveis para uma obra/regional.
 */
export const filtrarProjetosPorObra = (allProjects, obraId, obrasData, regionaisData) => {
  const obra = obrasData.find(o => o.id === obraId);
  if (!obra?.regional_id) return [];
  const regional = regionaisData.find(r => r.id === obra.regional_id);
  if (!regional?.project_ids) return [];
  return allProjects.filter(p =>
    (regional.project_ids.includes(p.id) || p.regional_id === regional.id) &&
    p.tipo_projeto === 'CAUQ'
  );
};