export const validateForm = (formData, saveStatus) => {
  if (!formData.obra_id) return "Por favor, selecione uma obra.";
  if (saveStatus !== 'finalizado') return null;

  const required = [
    [formData.rodovia?.trim(), "Rodovia"],
    [formData.empreiteira?.trim(), "Empreiteira"],
    [formData.estaca?.trim(), "Estaca"],
    [formData.trecho?.trim(), "Trecho"],
    [formData.faixa?.trim(), "Faixa"],
    [formData.material?.trim(), "Material"],
    [formData.inspetor_fiscal?.trim(), "Inspetor de Campo"],
    [formData.jornada?.horario_inicio?.trim(), "Horário de Início"],
    [formData.jornada?.horario_fim?.trim(), "Horário Fim"],
  ];

  for (const [val, label] of required) {
    if (!val) return `Por favor, preencha o campo ${label}.`;
  }

  if (formData.acoes_corretivas_realizado === true && !formData.acoes_corretivas_descricao?.trim())
    return "Por favor, descreva as ações corretivas realizadas.";

  return null;
};

export const buildDataToSave = (formData, saveStatus, _user) => ({
  ...formData,
  status: saveStatus,
  fotos: (formData.fotos || []).map(f => (typeof f === 'string' ? f : (f?.url || ''))).filter(Boolean),
  periodos_clima: formData.periodos_clima.map(p => ({
    ...p,
    temperatura_ambiente: p.temperatura_ambiente ? parseFloat(p.temperatura_ambiente) : null,
  })),
  ensaios_empreiteira: Object.fromEntries(
    Object.entries(formData.ensaios_empreiteira).map(([key, value]) => [
      key,
      value && typeof value === 'object'
        ? { ...value, quantidade: value.quantidade ? parseInt(value.quantidade) : null }
        : value,
    ])
  ),
});