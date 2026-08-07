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

/** Checklist de Reciclagem. */
export default function buildChecklistReciclagemExport(reg) {
  const sheets = [
    buildSheet({
      name: 'Dados Gerais',
      title: 'Checklist de Reciclagem — Dados Gerais',
      meta: checklistMeta(reg, [
        ['Estaca', val(reg.estaca)],
        ['Faixa', val(reg.faixa)],
        ['Material', val(reg.material)],
        ['Inspetor Fiscal', val(reg.inspetor_fiscal)],
        ['Ensaio Realizado Por', val(reg.ensaio_realizado_por)],
        ['Espessura Reciclada', val(reg.acompanhamento_execucao?.espessura_reciclada)],
      ]),
      cols: [28, 42],
    }),
    climaSheet(reg),
    acompanhamentoSheet(reg),
    ensaiosEmpreiteiraSheet(reg),
    ncSheet(reg),
    obsSheet(reg),
  ];

  return { filename: buildFileName('checklist_reciclagem', reg.data), sheets: compact(sheets) };
}