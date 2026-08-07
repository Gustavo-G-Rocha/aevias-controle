import { buildSheet, buildFileName, val, boolText } from '../excelCore';
import { checklistMeta, climaSheet, ncSheet, obsSheet, compact } from './checklistShared';

/** Checklist de Concretagem — cargas de concreto e ensaios por carga. */
export default function buildChecklistConcretagemExport(reg) {
  const cargas = reg.cargas_concreto || [];

  const sheets = [
    buildSheet({
      name: 'Dados Gerais',
      title: 'Checklist de Concretagem — Dados Gerais',
      meta: checklistMeta(reg, [
        ['Concreteira', val(reg.concreteira)],
        ['Estrutura', val(reg.estrutura)],
        ['fck (MPa)', val(reg.fck)],
        ['Volume (m³)', val(reg.volume)],
        ['Inspetor de Campo', val(reg.inspetor_campo)],
        ['Ensaio Realizado Por', val(reg.ensaio_realizado_por)],
      ]),
      cols: [28, 42],
    }),

    climaSheet(reg),

    cargas.length
      ? buildSheet({
          name: 'Cargas de Concreto',
          title: 'Cargas de Concreto',
          header: [
            'Carga',
            'Nota Fiscal',
            'Placa da Betoneira',
            'Slump (mm)',
            'Slump Conforme',
            'Flow Test',
            'Flow Conforme',
            'Espessura (cm)',
            'Espessura Conforme',
            'Equipamento',
            'Superfície Tratada',
            'Adensamento',
            'Moldado p/ Fiscalização',
            'Corpos de Prova',
            'Observações',
          ],
          rows: cargas.map((c, i) => [
            val(c.numero_carga ?? i + 1),
            val(c.nota_fiscal),
            val(c.placa_betoneira),
            val(c.slump_test?.resultado),
            boolText(c.slump_test?.conforme),
            val(c.flow_test?.resultado),
            boolText(c.flow_test?.conforme),
            val(c.espessura_camada?.resultado),
            boolText(c.espessura_camada?.conforme),
            val(c.equipamento_lancamento),
            boolText(c.superficie_tratada_limpa),
            boolText(c.adensamento_realizado),
            boolText(c.moldado_fiscalizacao),
            (c.corpos_prova || [])
              .map((cp) => `${val(cp.dias_ruptura)}d ${val(cp.tipo_ruptura)}`)
              .join(' | ') || '-',
            val(c.observacoes_lancamento),
          ]),
          cols: [10, 16, 20, 14, 16, 14, 16, 16, 20, 16, 18, 14, 22, 34, 34],
        })
      : null,

    ncSheet(reg),
    obsSheet(reg),
  ];

  return { filename: buildFileName('checklist_concretagem', reg.data), sheets: compact(sheets) };
}