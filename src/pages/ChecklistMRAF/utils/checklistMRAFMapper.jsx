export const validateForm = (formData, saveStatus) => {
  if (!formData.obra_id) return "Por favor, selecione uma obra.";
  if (saveStatus !== 'finalizado') return null;

  const required = [
    [formData.project_id, "Projeto Vinculado"],
    [formData.rodovia, "Rodovia"],
    [formData.trecho, "Trecho"],
    [formData.empreiteira, "Empreiteira"],
    [formData.pedreira, "Pedreira"],
    [formData.ligante, "Ligante"],
    [formData.ensaio_realizado_por, "Ensaio realizado por"],
  ];

  for (const [val, label] of required) {
    if (!val?.trim?.() && !val) return `Por favor, preencha o campo: ${label}.`;
  }

  return null;
};

export const buildDataToSave = (formData, saveStatus, user) => {
  const acomp = { ...formData.acompanhamento_aplicacao };

  if (acomp.taxa_aplicacao.realizado && acomp.taxa_aplicacao.resultado !== null)
    acomp.taxa_aplicacao.conforme = acomp.taxa_aplicacao.resultado >= 8 && acomp.taxa_aplicacao.resultado <= 16;

  if (acomp.residuo_emulsao.realizado && acomp.residuo_emulsao.resultado !== null)
    acomp.residuo_emulsao.conforme = acomp.residuo_emulsao.resultado >= 6.5 && acomp.residuo_emulsao.resultado <= 12.0;

  if (acomp.espessura_camada.realizado && acomp.espessura_camada.resultado !== null)
    acomp.espessura_camada.conforme = acomp.espessura_camada.resultado >= 6 && acomp.espessura_camada.resultado <= 20;

  return {
    ...formData,
    acompanhamento_aplicacao: acomp,
    status: saveStatus,
    laboratorista_name: user?.laboratorista_name || user?.full_name,
  };
};