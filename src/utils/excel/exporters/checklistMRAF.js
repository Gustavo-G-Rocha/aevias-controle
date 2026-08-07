import { buildSheet, buildFileName, val, boolText } from '../excelCore';
import { checklistMeta, climaSheet, ncSheet, obsSheet, compact } from './checklistShared';

/** Checklist de MRAF — insumos, superfície, aplicação e controle. */
export default function buildChecklistMRAFExport(reg) {
  const ins = reg.condicionamento_insumos || {};
  const sup = reg.preparacao_superficie || {};
  const ap = reg.acompanhamento_aplicacao || {};
  const ctrl = reg.controle_aplicacao || {};

  const sheets = [
    buildSheet({
      name: 'Dados Gerais',
      title: 'Checklist de MRAF — Dados Gerais',
      meta: checklistMeta(reg, [
        ['Usina', val(reg.usina)],
        ['Projeto Utilizado', val(reg.projeto_utilizado)],
        ['Faixa Especificada', val(reg.faixa_especificada)],
        ['Ligante', val(reg.ligante)],
        ['Pedreira', val(reg.pedreira)],
        ['Inspetor de Campo', val(reg.inspetor_campo)],
        ['Ensaio Realizado Por', val(reg.ensaio_realizado_por)],
      ]),
      cols: [28, 42],
    }),

    climaSheet(reg),

    buildSheet({
      name: 'Insumos e Superfície',
      title: 'Condicionamento de Insumos e Preparação da Superfície',
      meta: [
        ['Agregados Separados', boolText(ins.agregados_separados)],
        ['Agregados Cobertos', boolText(ins.agregados_cobertos)],
        ['Filler Utilizado', val(ins.filler_utilizado)],
        ['Utilização de Aditivos', boolText(ins.utilizacao_aditivos)],
        ['Água Contaminada', boolText(ins.agua_contaminada)],
        ['Observações (Insumos)', val(ins.observacoes)],
        ['Superfície Úmida', boolText(sup.superficie_umida)],
        ['Temperatura do Pavimento (°C)', val(sup.temperatura_pavimento)],
        ['Pavimento com Patologias', boolText(sup.pavimento_patologias)],
        ['Superfície Fresada', boolText(sup.superficie_fresada)],
        ['Superfície Limpa', boolText(sup.superficie_limpa)],
        ['Observações (Superfície)', val(sup.observacoes)],
      ],
      cols: [34, 40],
    }),

    buildSheet({
      name: 'Aplicação',
      title: 'Acompanhamento da Aplicação',
      meta: [
        ['Km/Estaca Inicial', `${val(ctrl.km_estaca_inicial)} (${val(ctrl.lado_inicial)})`],
        ['Km/Estaca Final', `${val(ctrl.km_estaca_final)} (${val(ctrl.lado_final)})`],
        ['Quantidade Aplicada (m²)', val(ctrl.quantidade_aplicada_m2)],
        ['Observações do Controle', val(ctrl.observacoes)],
      ],
      header: ['Item', 'Realizado', 'Resultado', 'Conforme'],
      rows: [
        ['Tempo de rompimento / cura', boolText(ap.tempo_rompimento_cura?.realizado), val(ap.tempo_rompimento_cura?.resultado), '-'],
        ['Taxa de aplicação', boolText(ap.taxa_aplicacao?.realizado), val(ap.taxa_aplicacao?.resultado), boolText(ap.taxa_aplicacao?.conforme)],
        ['Resíduo da emulsão', boolText(ap.residuo_emulsao?.realizado), val(ap.residuo_emulsao?.resultado), boolText(ap.residuo_emulsao?.conforme)],
        ['Espessura da camada', boolText(ap.espessura_camada?.realizado), val(ap.espessura_camada?.resultado), boolText(ap.espessura_camada?.conforme)],
      ],
      cols: [34, 14, 18, 14],
    }),

    ncSheet(reg),
    obsSheet(reg),
  ];

  return { filename: buildFileName('checklist_mraf', reg.data), sheets: compact(sheets) };
}