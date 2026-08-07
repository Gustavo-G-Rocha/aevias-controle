import { buildSheet, buildFileName, fmtDate, val, boolText, obraMeta } from '../excelCore';

const CLIMA_LABEL = {
  ensolarado: 'Ensolarado',
  ceu_limpo: 'Céu limpo',
  nublado: 'Nublado',
  chuvoso: 'Chuvoso',
  garoa: 'Garoa',
  vento_forte: 'Vento forte',
  neblina: 'Neblina',
};

const humanize = (key) =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Aba de efetivo (máquinas ou colaboradores), ignorando quantidades zeradas. */
function efetivoSheet(name, efetivo, unidadeLabel) {
  const entradas = Object.entries(efetivo || {}).filter(([, qtd]) => Number(qtd) > 0);
  if (entradas.length === 0) return null;

  return buildSheet({
    name,
    header: [unidadeLabel, 'Quantidade'],
    rows: entradas.map(([key, qtd]) => [humanize(key), qtd]),
    cols: [36, 14],
  });
}

/** Diário de obra: atividades, não conformidades e efetivo. */
export default function buildDiarioObraExport(diario) {
  const jornada = diario.jornada || {};
  const local =
    diario.tipo_local === 'usina'
      ? [['Usina', val(diario.usina_selecionada)]]
      : [['Rodovia', val(diario.rodovia)], ['Trecho', val(diario.trecho)]];

  const sheets = [
    buildSheet({
      name: 'Diário',
      meta: [
        ...obraMeta(diario),
        ['Cliente', val(diario.cliente)],
        ['Data', fmtDate(diario.data)],
        ['Jornada', `${val(jornada.horario_inicio)} às ${val(jornada.horario_fim)}`],
        ['Tipo de Local', diario.tipo_local === 'usina' ? 'Usina' : 'Campo'],
        ...local,
        ['Empreiteira', val(diario.empreiteira)],
        ['Condições Climáticas', CLIMA_LABEL[diario.condicoes_climaticas] || val(diario.condicoes_climaticas)],
        ['Temperatura (°C)', val(diario.temperatura)],
        ['Atividades Realizadas', val(diario.atividades_realizadas)],
        ['Observações', val(diario.observacoes)],
        ['Ações Corretivas Realizadas', boolText(diario.acoes_corretivas_realizado)],
        ['Descrição das Ações Corretivas', val(diario.acoes_corretivas_descricao)],
      ],
      cols: [32, 80],
    }),
  ];

  const ncs = diario.nao_conformidades || [];
  if (ncs.length) {
    sheets.push(
      buildSheet({
        name: 'Não Conformidades',
        header: ['Local', 'Categoria', 'Parâmetro', 'Descrição'],
        rows: ncs.map((nc) => [
          val(nc.local_nc),
          val(nc.categoria_nc),
          val(nc.parametro_nc),
          val(nc.descricao),
        ]),
        cols: [14, 26, 26, 60],
      })
    );
  }

  if (diario.efetivo_obra_ativo) {
    const maquinas = efetivoSheet('Efetivo - Máquinas', diario.efetivo_maquinas, 'Equipamento');
    const colaboradores = efetivoSheet('Efetivo - Colaboradores', diario.efetivo_colaboradores, 'Função');
    if (maquinas) sheets.push(maquinas);
    if (colaboradores) sheets.push(colaboradores);
  }

  return { filename: buildFileName('diario_obra', diario.data), sheets };
}