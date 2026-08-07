import { buildSheet, buildFileName, val } from '../excelCore';
import {
  checklistMeta,
  climaSheet,
  acompanhamentoSheet,
  ensaiosEmpreiteiraSheet,
  ncSheet,
  obsSheet,
  compact,
} from './checklistShared';

/** Checklist de Terraplanagem. */
export default function buildChecklistTerraplanagemExport(reg) {
  const emp = reg.ensaios_empreiteira || {};

  const sheets = [
    buildSheet({
      name: 'Dados Gerais',
      title: 'Checklist de Terraplanagem — Dados Gerais',
      meta: checklistMeta(reg, [
        ['Estaca', val(reg.estaca)],
        ['Camada', val(reg.camada)],
        ['Material', val(reg.material)],
        ['Nome do Material', val(reg.nome_material)],
        ['Origem do Material', val(reg.origem_material)],
        ['Inspetor Fiscal', val(reg.inspetor_fiscal)],
        ['Ensaio Realizado Por', val(reg.ensaio_realizado_por)],
        ['Umidade Ótima Proctor (%)', val(reg.umidade_otima_proctor)],
        ['Umidade In Situ (%)', val(reg.umidade_in_situ)],
      ]),
      cols: [30, 42],
    }),
    climaSheet(reg),
    acompanhamentoSheet(reg),
    ensaiosEmpreiteiraSheet(reg),
    buildSheet({
      name: 'Controle de Compactação',
      title: 'Variação de Umidade e Grau de Compactação',
      meta: [
        ['Variação de Umidade — Quantidade', val(emp.variacao_umidade_quantidade)],
        ['Variação de Umidade — Resultados', val(emp.variacao_umidade_resultados)],
        ['Grau de Compactação — Quantidade', val(emp.grau_compactacao_quantidade)],
        ['Grau de Compactação — Resultados', val(emp.grau_compactacao_resultados)],
      ],
      cols: [36, 40],
    }),
    ncSheet(reg),
    obsSheet(reg),
  ];

  return { filename: buildFileName('checklist_terraplanagem', reg.data), sheets: compact(sheets) };
}