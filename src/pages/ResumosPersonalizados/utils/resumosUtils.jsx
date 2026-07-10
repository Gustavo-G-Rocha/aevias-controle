// ─── Helpers puros (sem side effects) ────────────────────────────────────────

export const getLabelTipo = (tipo, TIPOS_ENSAIO) =>
  TIPOS_ENSAIO.find(t => t.value === tipo)?.label ?? tipo;

export const obrasDeRegionais = (regionais, obras) => {
  const ids = new Set(
    regionais.flatMap(r => obras.filter(o => o.regional_id === r.id).map(o => o.id))
  );
  return obras.filter(o => ids.has(o.id));
};

export const filtrarObrasPorAcesso = (obras, regionais, accessLevel, email) => {
  const emailLow = email.toLowerCase();

  if (accessLevel === 'cliente' || accessLevel === 'cliente_supervisor') {
    const regionaisDoUsuario = regionais.filter(r =>
      (r.clientes_responsaveis || []).some(e => e.toLowerCase() === emailLow)
    );
    return obrasDeRegionais(regionaisDoUsuario, obras);
  }

  if (accessLevel === 'sala_tecnica_afirmaevias') {
    const regionaisDoUsuario = regionais.filter(r =>
      (r.salas_tecnicas_responsaveis || []).some(e => e.toLowerCase() === emailLow)
    );
    return obrasDeRegionais(regionaisDoUsuario, obras);
  }

  if (accessLevel === 'gestor_contrato') {
    const regionaisDoUsuario = regionais.filter(r =>
      r.gestor_contrato_responsavel?.toLowerCase() === emailLow ||
      (r.gestores_contrato_responsaveis || []).some(e => e.toLowerCase() === emailLow)
    );
    return obrasDeRegionais(regionaisDoUsuario, obras);
  }

  return obras;
};

export const getNestedValue = (obj, path) => {
  const keys = path.split('.');
  return keys.reduce((current, key) => {
    if (current === null || current === undefined || typeof current !== 'object') return null;
    return key in current ? current[key] : null;
  }, obj);
};

export const calcularMediaArray = (array, campo) => {
  if (!array || array.length === 0) return null;
  const valores = array.map(item => parseFloat(getNestedValue(item, campo))).filter(v => !isNaN(v));
  if (valores.length === 0) return null;
  const media = valores.reduce((a, b) => a + b, 0) / valores.length;
  return media.toFixed(2);
};

export const formatValue = (value, campo) => {
  if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
    if ('sim' in value && 'nao' in value && 'na' in value) {
      if (value.sim === true) return 'Sim';
      if (value.nao === true) return 'Não';
      if (value.na === true) return 'N/A';
      return '-';
    }
    return '-';
  }

  if (campo && (campo.includes('approved') || campo.includes('conforme'))) {
    if (value === true) return 'Sim';
    if (value === false) return 'Não';
    if (value === null || value === undefined) return 'N/A';
    return 'Pendente';
  }

  if (value === null || value === undefined) return '-';

  if (campo.toLowerCase().includes('data') || campo.toLowerCase().includes('date')) {
    try {
      return new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    } catch {
      return value;
    }
  }

  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';

  if (typeof value === 'number') {
    if (campo.includes('quantidade')) return Math.round(value).toString();
    if (campo.includes('densidade') || campo.includes('dens_')) return value.toFixed(3);
    if (campo.includes('gc_') || campo.includes('grau_compactacao')) return value.toFixed(2);
    return value.toFixed(2);
  }

  return value;
};

export const calcularGranulometriaPassante = (ensaio, peneira) => {
  if (!ensaio?.granulometria?.peso_retido_peneiras) return null;

  const PENEIRAS = [
    'peneira_75_0mm', 'peneira_63_0mm', 'peneira_50_0mm', 'peneira_37_5mm',
    'peneira_25_0mm', 'peneira_19_0mm', 'peneira_16_0mm', 'peneira_12_5mm',
    'peneira_9_5mm', 'peneira_4_75mm', 'peneira_2_36mm', 'peneira_2_0mm',
    'peneira_1_18mm', 'peneira_0_6mm', 'peneira_0_42mm', 'peneira_0_3mm',
    'peneira_0_18mm', 'peneira_0_15mm', 'peneira_0_075mm'
  ];

  const pesos = ensaio.granulometria.peso_retido_peneiras;
  const pesoInicial = ensaio.extracao_ligante?.amostra_sem_ligante || 0;
  if (pesoInicial === 0) return null;

  const indice = PENEIRAS.indexOf(peneira);
  if (indice === -1) return null;

  let temDados = false;
  for (let i = 0; i < PENEIRAS.length; i++) {
    if (parseFloat(pesos[PENEIRAS[i]]) > 0) { temDados = true; break; }
  }
  if (!temDados) return null;

  let pesoRetidoAcumulado = 0;
  for (let i = 0; i <= indice; i++) {
    pesoRetidoAcumulado += parseFloat(pesos[PENEIRAS[i]]) || 0;
  }

  return (((pesoInicial - pesoRetidoAcumulado) / pesoInicial) * 100).toFixed(2);
};

export const processarSubfieldControleCauq = (subfield, controleCauq) => {
  const extracaoRotarex = controleCauq.extracao_ligante_rotarex;
  const extracaoSoxhlet = controleCauq.extracao_ligante_soxhlet;

  if (subfield.key.startsWith('teor_ligante.rotarex_')) {
    const idx = parseInt(subfield.key.split('_').pop()) - 1;
    return extracaoRotarex?.resultados?.[idx] ?? undefined;
  }
  if (subfield.key.startsWith('teor_ligante.soxhlet_')) {
    const idx = parseInt(subfield.key.split('_').pop()) - 1;
    return extracaoSoxhlet?.resultados?.[idx] ?? undefined;
  }
  if (subfield.key === 'teor_ligante.quantidade') {
    return (extracaoRotarex?.quantidade || 0) + (extracaoSoxhlet?.quantidade || 0);
  }
  if (subfield.key === 'teor_ligante.conforme') {
    const cr = extracaoRotarex?.conforme;
    const cs = extracaoSoxhlet?.conforme;
    if (cr === null && cs === null) return null;
    if (cr === false || cs === false) return false;
    if (cr === true || cs === true) return true;
    return undefined;
  }
  if (subfield.key.startsWith('vam.')) {
    const vam = controleCauq.vam_marshall;
    if (subfield.key === 'vam.resultados') return vam?.resultados?.join(', ');
    if (subfield.key === 'vam.quantidade') return vam?.quantidade;
    if (subfield.key === 'vam.conforme') return vam?.conforme;
  }
  if (subfield.key === 'rtcd_25c.resultados') return controleCauq.rtcd_25c?.resultados?.join(', ');
  if (subfield.key === 'rtcd_25c.quantidade') return controleCauq.rtcd_25c?.quantidade;
  if (subfield.key === 'rtcd_25c.conforme') return controleCauq.rtcd_25c?.conforme;
  return getNestedValue(controleCauq, subfield.key);
};

export const normalizarTexto = (texto) => {
  if (typeof texto !== 'string') return texto;
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '');
};

export const enriquecerManchaPendulo = (ensaio) => {
  const manchaValidos = (ensaio.ensaios_mancha || []).filter(e => e && e.hs_mm != null);
  const penduloValidos = (ensaio.ensaios_pendulo || []).filter(e => e && e.vrd != null);

  if (!ensaio.media_hs && manchaValidos.length > 0)
    ensaio.media_hs = manchaValidos.reduce((sum, e) => sum + e.hs_mm, 0) / manchaValidos.length;
  if (!ensaio.media_vrd && penduloValidos.length > 0)
    ensaio.media_vrd = penduloValidos.reduce((sum, e) => sum + e.vrd, 0) / penduloValidos.length;
  if (!ensaio.classificacao_media_hs && ensaio.media_hs != null) {
    const v = ensaio.media_hs;
    ensaio.classificacao_media_hs = v < 0.2 ? 'Muito Fina' : v < 0.4 ? 'Fina' : v < 0.8 ? 'Média' : v < 1.2 ? 'Grossa' : 'Muito Grossa';
  }
  if (!ensaio.classificacao_media_vrd && ensaio.media_vrd != null) {
    const v = ensaio.media_vrd;
    ensaio.classificacao_media_vrd = v < 25 ? 'Perigosa' : v <= 31 ? 'Muito Lisa' : v <= 39 ? 'Lisa' : v <= 46 ? 'Insuf. Rugosa' : v <= 54 ? 'Median. Rugosa' : v <= 75 ? 'Rugosa' : 'Muito Rugosa';
  }
  if (!ensaio.condicao_conformidade && ensaio.media_hs != null && ensaio.media_vrd != null) {
    const limites = { 'DER/PR': 50, 'DNIT': 55, 'ECO-RODOVIAS': 47 };
    const vrdMin = limites[ensaio.orgao] || 47;
    ensaio.condicao_conformidade = (ensaio.media_hs >= 0.6 && ensaio.media_hs <= 1.2 && ensaio.media_vrd >= vrdMin)
      ? 'CONFORME' : 'NÃO CONFORME';
  }
};