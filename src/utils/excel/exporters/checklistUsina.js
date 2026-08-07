import { buildSheet, buildFileName, val, boolText, autoRows } from '../excelCore';
import { checklistMeta, ncSheet, obsSheet, compact } from './checklistShared';

/** Checklist de Usina — agregados, ligante, CAUQ e medição de cargas. */
export default function buildChecklistUsinaExport(reg) {
  const lig = reg.controle_ligante || {};
  const cauq = reg.controle_cauq || {};
  const med = reg.medicoes_usina || {};
  const cargas = med.cargas || [];
  const agregados = reg.controle_agregados || [];

  const itensCauq = Object.entries(cauq).filter(([, v]) => v && typeof v === 'object');

  const sheets = [
    buildSheet({
      name: 'Dados Gerais',
      title: 'Checklist de Usina — Dados Gerais',
      meta: checklistMeta(reg, [
        ['Usina', val(reg.usina)],
        ['Projeto Utilizado', val(reg.projeto_utilizado)],
        ['Faixa Especificada', val(reg.faixa_especificada)],
        ['Ligante', val(reg.ligante)],
        ['Pedreira', val(reg.pedreira)],
        ['Inspetor de Campo', val(reg.inspetor_campo)],
        ['Equivalente de Areia', val(reg.equivalente_areia_status)],
        ['Observações dos Agregados', val(reg.observacoes_agregados)],
      ]),
      cols: [30, 42],
    }),

    agregados.length
      ? buildSheet({ name: 'Agregados', title: 'Controle de Agregados', ...autoRows(agregados) })
      : null,

    itensCauq.length
      ? buildSheet({
          name: 'Controle CAUQ',
          title: 'Controle de CAUQ',
          header: ['Item', 'Resultado', 'Conforme'],
          rows: itensCauq.map(([chave, v]) => [
            chave.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()),
            val(v.resultado ?? v.valor),
            boolText(v.conforme),
          ]),
          cols: [34, 20, 14],
        })
      : null,

    reg.controle_ligante_ativo
      ? buildSheet({
          name: 'Controle de Ligante',
          title: 'Controle de Ligante',
          meta: [
            ['Nota Fiscal', val(lig.nota_fiscal)],
            ['Fornecedor', val(lig.fornecedor)],
            ['Placa da Carreta', val(lig.placa_carreta)],
            ['Quantidade (t)', val(lig.quantidade_toneladas)],
            ['Recuperação Elástica (%)', val(lig.recuperacao_elastica_resultado)],
            ['Penetração', val(lig.penetracao_resultado)],
            ['Ponto de Amolecimento (°C)', val(lig.ponto_amolecimento_resultado)],
            ['Ponto de Fulgor (°C)', val(lig.ponto_fulgor_resultado)],
            ['Observações', val(lig.observacoes)],
          ],
          header: ['Viscosidade', 'Temperatura', 'SP', 'RPM', 'Resultado', 'Limite', 'Conforme'],
          rows: [1, 2, 3].map((n) => [
            `Leitura ${n}`,
            val(lig[`viscosidade_${n}_temp`]),
            val(lig[`viscosidade_${n}_sp`]),
            val(lig[`viscosidade_${n}_rpm`]),
            val(lig[`viscosidade_${n}_resultado`]),
            val(lig[`viscosidade_${n}_limite`]),
            boolText(lig[`viscosidade_${n}_conforme`]),
          ]),
          cols: [16, 16, 10, 10, 14, 16, 14],
        })
      : null,

    cargas.length
      ? buildSheet({
          name: 'Medição de Cargas',
          title: 'Medição de Cargas da Usina',
          meta: [
            ['Sub-trecho', val(med.sub_trecho)],
            ['Serviço', val(med.servico)],
            ['Empreiteira', val(med.empreiteira)],
          ],
          header: ['Ticket', 'Placa', 'Toneladas', 'Volume (m³)', 'Temperatura (°C)', 'Rodovia de Destino', 'Equipe', 'Observações'],
          rows: cargas.map((c) => [
            val(c.numero_ticket),
            val(c.placa),
            val(c.quantidade_toneladas),
            val(c.volume_m3),
            val(c.temperatura),
            val(c.rodovia_destino),
            val(c.equipe),
            val(c.observacoes),
          ]),
          cols: [16, 14, 14, 14, 18, 24, 16, 34],
        })
      : null,

    ncSheet(reg),
    obsSheet(reg),
  ];

  return { filename: buildFileName('checklist_usina', reg.data), sheets: compact(sheets) };
}