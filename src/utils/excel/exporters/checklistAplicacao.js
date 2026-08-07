import { buildSheet, buildFileName, val, boolText } from '../excelCore';
import { checklistMeta, climaSheet, ncSheet, obsSheet, compact } from './checklistShared';

/** Checklist de Aplicação — pintura de ligação e medições geométricas. */
export default function buildChecklistAplicacaoExport(reg) {
  const pl = reg.pintura_ligacao || {};
  const geo = reg.medicoes_geometricas || {};
  const medicoes = geo.medicoes || [];

  const sheets = [
    buildSheet({
      name: 'Dados Gerais',
      title: 'Checklist de Aplicação — Dados Gerais',
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
      name: 'Pintura de Ligação',
      title: 'Pintura de Ligação',
      header: ['Item', 'Realizado', 'Resultado', 'Conforme'],
      rows: [
        ['Pintura com barra espargidora', boolText(pl.pintura_barra_espargidora?.realizado), val(pl.pintura_barra_espargidora?.resultado), '-'],
        ['Tempo de rompimento / cura', boolText(pl.tempo_rompimento_cura?.realizado), val(pl.tempo_rompimento_cura?.resultado), '-'],
        ['Taxa de pintura', boolText(pl.taxa_pintura?.realizado), val(pl.taxa_pintura?.resultado), boolText(pl.taxa_pintura?.conforme)],
        ['Resíduo da emulsão', boolText(pl.residuo_emulsao?.realizado), val(pl.residuo_emulsao?.resultado), '-'],
        ['Taxa de pintura residual', boolText(pl.taxa_pintura_residual?.realizado), val(pl.taxa_pintura_residual?.resultado), boolText(pl.taxa_pintura_residual?.conforme)],
      ],
      cols: [34, 14, 18, 14],
    }),

    medicoes.length
      ? buildSheet({
          name: 'Medições Geométricas',
          title: 'Medições Geométricas',
          meta: [
            ['Sub-trecho', val(geo.subtrecho)],
            ['Serviço', val(geo.servico)],
          ],
          header: [
            'Estaca Inicial',
            'Estaca Final',
            'Lado',
            'Faixa',
            'Comprimento (m)',
            'Largura (m)',
            'Altura (cm)',
            'Placa',
            'Quantidade',
            'Temperatura (°C)',
            'Observações',
          ],
          rows: medicoes.map((m) => [
            val(m.estaca_inicial),
            val(m.estaca_final),
            val(m.lado),
            val(m.faixa),
            val(m.comprimento),
            val(m.largura),
            val(m.altura),
            val(m.placa),
            val(m.quantidade),
            val(m.temperatura),
            val(m.observacoes),
          ]),
          cols: [16, 16, 12, 12, 18, 14, 14, 14, 14, 18, 40],
        })
      : null,

    ncSheet(reg),
    obsSheet(reg),
  ];

  return { filename: buildFileName('checklist_aplicacao', reg.data), sheets: compact(sheets) };
}