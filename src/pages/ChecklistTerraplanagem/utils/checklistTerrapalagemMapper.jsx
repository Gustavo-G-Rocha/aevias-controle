// Utilitários de transformação de dados para o payload da API

const toResultadosArray = (resultados) => {
  if (Array.isArray(resultados)) return resultados;
  if (typeof resultados === 'string' && resultados.trim() !== '')
    return resultados.split('|').map(s => s.trim());
  return [];
};

const serializeResultados = (resultados) =>
  Array.isArray(resultados)
    ? resultados.filter(r => r !== null && r !== '').join(' | ')
    : (resultados ?? '');

const serializeEnsaio = (ensaio) => ({
  ...ensaio,
  quantidade: parseInt(ensaio.quantidade) || 0,
  resultados: serializeResultados(ensaio.resultados),
});

export const buildDataToSave = (formData, saveStatus) => {
  const vuQtde = parseInt(formData.ensaios_empreiteira.variacao_umidade_quantidade) || 0;
  const gcQtde = parseInt(formData.ensaios_empreiteira.grau_compactacao_quantidade) || 0;

  const uOtimaArr = toResultadosArray(formData.umidade_otima_resultados);
  const uisArr = toResultadosArray(formData.umidade_in_situ_resultados);
  const proctorArr = toResultadosArray(formData.ensaios_empreiteira.compactacao_proctor?.resultados);
  const inSituArr = toResultadosArray(formData.ensaios_empreiteira.massa_especifica_in_situ?.resultados);

  const variacaoUmidadeResultados = Array.from({ length: vuQtde }).map((_, idx) => {
    const uOtima = parseFloat(uOtimaArr[idx]);
    const uInSitu = parseFloat(uisArr[idx]);
    if (isNaN(uOtima) || isNaN(uInSitu)) return null;
    return (uInSitu - uOtima).toFixed(2);
  }).filter(r => r !== null).join(' | ');

  const grauCompactacaoResultados = Array.from({ length: gcQtde }).map((_, idx) => {
    const proctor = parseFloat(proctorArr[idx]);
    const inSitu = parseFloat(inSituArr[idx]);
    if (isNaN(proctor) || isNaN(inSitu) || proctor === 0) return null;
    return ((inSitu / proctor) * 100).toFixed(2);
  }).filter(r => r !== null).join(' | ');

  return {
    ...formData,
    status: saveStatus,
    umidade_otima_proctor: formData.umidade_otima_proctor ? parseFloat(formData.umidade_otima_proctor) : null,
    umidade_otima_quantidade: parseInt(formData.umidade_otima_quantidade) || 0,
    umidade_otima_resultados: serializeResultados(formData.umidade_otima_resultados),
    umidade_in_situ: formData.umidade_in_situ ? parseFloat(formData.umidade_in_situ) : null,
    umidade_in_situ_quantidade: parseInt(formData.umidade_in_situ_quantidade) || 0,
    umidade_in_situ_resultados: serializeResultados(formData.umidade_in_situ_resultados),
    periodos_clima: formData.periodos_clima.map(p => ({
      ...p,
      temperatura_ambiente: p.temperatura_ambiente ? parseFloat(p.temperatura_ambiente) : null,
    })),
    fotos: (formData.fotos || []).map(f => (typeof f === 'string' ? f : (f?.url || ''))).filter(Boolean),
    ensaios_empreiteira: {
      ...formData.ensaios_empreiteira,
      compactacao_proctor: serializeEnsaio(formData.ensaios_empreiteira.compactacao_proctor),
      isc: serializeEnsaio(formData.ensaios_empreiteira.isc),
      umidade_frigideira: serializeEnsaio(formData.ensaios_empreiteira.umidade_frigideira),
      massa_especifica_in_situ: serializeEnsaio(formData.ensaios_empreiteira.massa_especifica_in_situ),
      granulometria: serializeEnsaio(formData.ensaios_empreiteira.granulometria),
      variacao_umidade_quantidade: vuQtde,
      variacao_umidade_resultados: variacaoUmidadeResultados,
      grau_compactacao_quantidade: gcQtde,
      grau_compactacao_resultados: grauCompactacaoResultados,
    },
  };
};

export const validateForm = (formData, saveStatus) => {
  if (!formData.obra_id) return "Por favor, selecione uma obra.";
  if (saveStatus !== 'finalizado') return null;

  if (!formData.rodovia?.trim()) return "Por favor, selecione a Rodovia.";
  if (!formData.empreiteira?.trim()) return "Por favor, selecione a Empreiteira.";
  if (!formData.estaca?.trim()) return "Por favor, preencha o campo Estaca.";
  if (!formData.camada?.trim()) return "Por favor, preencha o campo Camada.";
  if (!formData.material?.trim()) return "Por favor, preencha o campo Material.";
  if (!formData.jornada?.horario_inicio?.trim()) return "Por favor, preencha o Horário de Início.";
  if (!formData.jornada?.horario_fim?.trim()) return "Por favor, preencha o Horário Fim.";

  if (formData.acoes_corretivas_realizado === true && !formData.acoes_corretivas_descricao?.trim())
    return "Por favor, descreva as ações corretivas realizadas.";

  return null;
};

export const toResultadosArray_ = toResultadosArray;