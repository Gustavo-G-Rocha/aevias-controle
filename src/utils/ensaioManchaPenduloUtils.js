/**
 * Funções puras para cálculos e classificações de Ensaio Mancha Pêndulo
 */

export const getLimitesOrgao = (orgao) => {
  const limites = {
    'DER/PR': { hs_min: 0.6, hs_max: 1.2, vrd_min: 50 },
    'DNIT': { hs_min: 0.6, hs_max: 1.2, vrd_min: 55 },
    'ECO-RODOVIAS': { hs_min: 0.6, hs_max: 1.2, vrd_min: 47 }
  };
  return limites[orgao] || limites['ECO-RODOVIAS'];
};

export const getClassificacaoHS = (mediaHS) => {
  if (!mediaHS && mediaHS !== 0) return '';
  if (mediaHS < 0.2) return 'Muito Fina';
  if (mediaHS < 0.4) return 'Fina';
  if (mediaHS < 0.8) return 'Média';
  if (mediaHS < 1.2) return 'Grossa';
  return 'Muito Grossa';
};

export const getClassificacaoVRD = (mediaVRD) => {
  if (!mediaVRD && mediaVRD !== 0) return '';
  if (mediaVRD < 25) return 'Perigosa';
  if (mediaVRD <= 31) return 'Muito Lisa';
  if (mediaVRD <= 39) return 'Lisa';
  if (mediaVRD <= 46) return 'Insuf. Rugosa';
  if (mediaVRD <= 54) return 'Median. Rugosa';
  if (mediaVRD <= 75) return 'Rugosa';
  return 'Muito Rugosa';
};

export const avaliarConformidade = (ensaios_mancha, ensaios_pendulo, orgao) => {
  const limites = getLimitesOrgao(orgao);
  
  const manchaValidos = (ensaios_mancha || []).filter(e => e.hs_mm != null);
  const penduloValidos = (ensaios_pendulo || []).filter(e => e.vrd != null);
  
  if (manchaValidos.length === 0 || penduloValidos.length === 0) {
    return '';
  }
  
  const mediaHS = manchaValidos.reduce((sum, e) => sum + e.hs_mm, 0) / manchaValidos.length;
  const mediaVRD = penduloValidos.reduce((sum, e) => sum + e.vrd, 0) / penduloValidos.length;
  
  const manchaConforme = mediaHS >= limites.hs_min && mediaHS <= limites.hs_max;
  const penduloConforme = mediaVRD >= limites.vrd_min;
  
  return (manchaConforme && penduloConforme) ? 'CONFORME' : 'NÃO CONFORME';
};

export const calcularManchaValores = (ensaio) => {
  const { d1, d2, d3, d4, volume_areia = 25000 } = ensaio;
  
  if (!d1 || !d2 || !d3 || !d4) return ensaio;

  const d_media = (d1 + d2 + d3 + d4) / 4;
  const area = (Math.PI * Math.pow(d_media / 10, 2)) / 4;
  const hs_mm = (4 * volume_areia) / (Math.PI * Math.pow(d_media, 2));
  const hs_cm = hs_mm / 10;

  let tipo_superficie = '';
  if (hs_mm < 0.2) tipo_superficie = 'Muito Fina';
  else if (hs_mm < 0.4) tipo_superficie = 'Fina';
  else if (hs_mm < 0.8) tipo_superficie = 'Média';
  else if (hs_mm < 1.2) tipo_superficie = 'Grossa';
  else tipo_superficie = 'Muito Grossa';

  return {
    ...ensaio,
    d_media: parseFloat(d_media.toFixed(1)),
    area: parseFloat(area.toFixed(2)),
    hs_cm: parseFloat(hs_cm.toFixed(2)),
    hs_mm: parseFloat(hs_mm.toFixed(2)),
    tipo_superficie
  };
};

export const calcularPenduloValores = (ensaio) => {
  const { leitura_1, leitura_2, leitura_3, leitura_4, leitura_5, temp_pavimento } = ensaio;
  let leituras = [leitura_1, leitura_2, leitura_3, leitura_4, leitura_5].filter(l => l != null && l !== '');

  if (leituras.length === 0) return ensaio;

  // Aplicar correção de temperatura se temp < 20°C
  if (temp_pavimento != null && temp_pavimento < 20) {
    const a = -0.005;
    const b = 0.45;
    const c = -7;
    const correcao = (a * Math.pow(temp_pavimento, 2)) + (b * temp_pavimento) + c;
    leituras = leituras.map(l => l + correcao);
  }

  const maxima = Math.max(...leituras);
  const minima = Math.min(...leituras);
  const soma = leituras.reduce((sum, l) => sum + l, 0);
  const vrd = (soma - maxima - minima) / 3;

  let classe = '';
  if (vrd >= 47) classe = 'I';
  else classe = 'II';

  return {
    ...ensaio,
    maxima: parseFloat(maxima.toFixed(1)),
    minima: parseFloat(minima.toFixed(1)),
    vrd: parseFloat(vrd.toFixed(1)),
    classe
  };
};

export const prepareDadosParaSalvar = (formData) => {
  const ensaiosManchaComData = formData.ensaios_mancha.map(e => {
    if (e && (e.d1 || e.d2 || e.d3 || e.d4 || e.estaca)) {
      return { ...e, data_aplicacao: formData.data_aplicacao };
    }
    return e;
  });

  const ensaiosPenduloComData = formData.ensaios_pendulo.map(e => {
    if (e && (e.leitura_1 || e.leitura_2 || e.leitura_3 || e.leitura_4 || e.leitura_5 || e.estaca)) {
      return { ...e, data_aplicacao: formData.data_aplicacao };
    }
    return e;
  });

  // Calcular médias e classificações para resumos
  const manchaValidos = ensaiosManchaComData.filter(e => e && e.hs_mm != null);
  const penduloValidos = ensaiosPenduloComData.filter(e => e && e.vrd != null);
  
  let media_hs = null;
  let classificacao_media_hs = '';
  let media_vrd = null;
  let classificacao_media_vrd = '';
  
  if (manchaValidos.length > 0) {
    media_hs = manchaValidos.reduce((sum, e) => sum + e.hs_mm, 0) / manchaValidos.length;
    classificacao_media_hs = getClassificacaoHS(media_hs);
  }
  
  if (penduloValidos.length > 0) {
    media_vrd = penduloValidos.reduce((sum, e) => sum + e.vrd, 0) / penduloValidos.length;
    classificacao_media_vrd = getClassificacaoVRD(media_vrd);
  }

  return {
    ensaiosManchaComData,
    ensaiosPenduloComData,
    media_hs,
    classificacao_media_hs,
    media_vrd,
    classificacao_media_vrd
  };
};

export const getInitialFormData = () => ({
  obra_id: '',
  data_ensaio: new Date().toISOString().split('T')[0],
  data_aplicacao: new Date().toISOString().split('T')[0],
  laboratorista_name: '',
  rodovia: '',
  trecho: '',
  empreiteira: '',
  camada: '',
  pista: '',
  orgao: 'ECO-RODOVIAS',
  ensaios_mancha: [],
  ensaios_pendulo: [],
  limites_mancha: '0,6mm ≤ HS ≤ 1,2mm',
  limites_pendulo: 'VRD ≥ 47',
  condicao_conformidade: '',
  observacoes: '',
  status: 'rascunho'
});

export const filterObrasPorAcesso = (obras, user, regionais, isAdmin, userAccessLevel) => {
  let obrasDisponiveis = obras.filter(o => 
    o.tipo_obra === 'conservacao' || 
    o.tipo_obra === 'supervisao' || 
    o.tipo_obra === 'implantacao'
  );

  if (!isAdmin && userAccessLevel === 'user') {
    const emailLower = (user.email || '').toLowerCase();
    const regionaisIds = regionais
      .filter(r =>
        (r.laboratoristas_responsaveis || []).some(e => e.toLowerCase() === emailLower) ||
        (r.salas_tecnicas_responsaveis || []).some(e => e.toLowerCase() === emailLower)
      )
      .map(r => r.id);

    if (regionaisIds.length > 0) {
      const regionaisSet = new Set(regionaisIds);
      obrasDisponiveis = obrasDisponiveis.filter(obra => regionaisSet.has(obra.regional_id));
    } else {
      obrasDisponiveis = [];
    }
  }

  return obrasDisponiveis;
};