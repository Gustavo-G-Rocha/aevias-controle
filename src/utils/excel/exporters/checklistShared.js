import { buildSheet, fmtDate, val, boolText, obraMeta, autoRows } from '../excelCore';

/** Identificação comum a todos os checklists. */
export function checklistMeta(reg, extras = []) {
  const j = reg.jornada || {};
  return [
    ...obraMeta(reg),
    ['Data', fmtDate(reg.data)],
    ['Jornada', `${val(j.horario_inicio)} às ${val(j.horario_fim)}`],
    ['Engenheiro Responsável', val(reg.engenheiro_responsavel)],
    ['Rodovia', val(reg.rodovia)],
    ['Trecho', val(reg.trecho)],
    ['Empreiteira', val(reg.empreiteira)],
    ...extras,
  ];
}

/** Aba de condições climáticas por período (formato livre entre checklists). */
export function climaSheet(reg) {
  const periodos = reg.periodos_clima || [];
  if (!periodos.length) return null;
  return buildSheet({
    name: 'Clima',
    title: 'Condições Climáticas',
    ...autoRows(periodos, {
      periodo: 'Período',
      temperatura_ambiente: 'Temperatura (°C)',
      condicoes_climaticas: 'Condições',
    }),
  });
}

/** Aba de não conformidades e ações corretivas. */
export function ncSheet(reg) {
  const ncs = reg.nao_conformidades || [];
  if (!ncs.length && reg.acoes_corretivas_realizado === null) return null;
  return buildSheet({
    name: 'Não Conformidades',
    title: 'Não Conformidades e Ações Corretivas',
    meta: [
      ['Ações Corretivas Realizadas', boolText(reg.acoes_corretivas_realizado)],
      ['Descrição das Ações', val(reg.acoes_corretivas_descricao)],
    ],
    header: ncs.length ? ['Local', 'Categoria', 'Parâmetro', 'Descrição'] : null,
    rows: ncs.map((nc) => [
      val(nc.local_nc),
      val(nc.categoria_nc),
      val(nc.parametro_nc),
      val(nc.descricao),
    ]),
    cols: [16, 24, 24, 60],
  });
}

/** Aba de observações (aceita os dois nomes de campo usados no sistema). */
export function obsSheet(reg) {
  const texto = reg.observacoes_gerais || reg.observacoes;
  if (!texto) return null;
  return buildSheet({ name: 'Observações', meta: [['Observações', texto]], cols: [20, 90] });
}

const titulo = (chave) =>
  chave.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

/** Aba dos ensaios executados pela empreiteira (mesma estrutura em vários checklists). */
export function ensaiosEmpreiteiraSheet(reg) {
  const ensaios = reg.ensaios_empreiteira || {};
  const linhas = Object.entries(ensaios).filter(([, v]) => v && typeof v === 'object');
  if (!linhas.length) return null;
  return buildSheet({
    name: 'Ensaios Empreiteira',
    title: 'Ensaios Realizados pela Empreiteira',
    header: ['Ensaio', 'Realizado', 'Quantidade', 'Conforme', 'Resultados', 'Observações'],
    rows: linhas.map(([chave, v]) => [
      titulo(chave),
      boolText(v.realizado),
      val(v.quantidade),
      boolText(v.conforme),
      val(v.resultados),
      val(v.observacoes),
    ]),
    cols: [30, 14, 14, 14, 30, 40],
  });
}

/** Aba de acompanhamento da execução (itens Sim/Não/N.A.). */
export function acompanhamentoSheet(reg) {
  const acomp = reg.acompanhamento_execucao || {};
  const linhas = Object.entries(acomp).filter(([, v]) => v && typeof v === 'object');
  if (!linhas.length) return null;
  return buildSheet({
    name: 'Acompanhamento',
    title: 'Acompanhamento da Execução',
    meta: [['Observações', val(acomp.observacoes)]],
    header: ['Item', 'Sim', 'Não', 'N.A.'],
    rows: linhas.map(([chave, v]) => [
      titulo(chave),
      boolText(v.sim),
      boolText(v.nao),
      boolText(v.na),
    ]),
    cols: [36, 10, 10, 10],
  });
}

/** Remove abas nulas. */
export const compact = (sheets) => sheets.filter(Boolean);