import { buildSheet, buildFileName, fmtDate, val, boolText, obraMeta } from '../excelCore';

/** Densidade in situ (frasco de areia) — dados gerais e furos. */
export default function buildEnsaioDensidadeInSituExport(ensaio) {
  const proctor = ensaio.dados_proctor || {};
  const furos = ensaio.furos || [];
  const sheets = [];

  sheets.push(
    buildSheet({
      name: 'Dados Gerais',
      title: 'Densidade In Situ — Dados Gerais',
      meta: [
        ...obraMeta(ensaio),
        ['Data do Ensaio', fmtDate(ensaio.data_ensaio)],
        ['Horário', val(ensaio.horario)],
        ['Engenheiro Responsável', val(ensaio.engenheiro_responsavel)],
        ['Rodovia', val(ensaio.rodovia)],
        ['Trecho', val(ensaio.trecho)],
        ['Sub-trecho', val(ensaio.sub_trecho)],
        ['Camada', val(ensaio.camada)],
        ['Material', val(ensaio.material)],
        ['Procedência', val(ensaio.procedencia)],
        ['Substituição Retido 3/4"', boolText(ensaio.substituicao_retido_3_4)],
        ['Densidade Real Retida 3/4" (g/cm³)', val(ensaio.densidade_real_retida_3_4)],
        ['Densidade da Areia (g/cm³)', val(ensaio.densidade_areia)],
        ['Peso da Areia no Funil (g)', val(ensaio.peso_areia_funil)],
        ['Densidade Seca Máx. Proctor (g/cm³)', val(proctor.densidade_seca_max)],
        ['Umidade Ótima Proctor (%)', val(proctor.umidade_otima)],
      ],
      cols: [34, 30],
    })
  );

  sheets.push(
    buildSheet({
      name: 'Furos',
      title: 'Resultados por Furo',
      header: [
        'Furo',
        'Estaca',
        'Pista',
        'Prof. (cm)',
        'Areia+Garrafa Antes (g)',
        'Areia+Garrafa Após (g)',
        'Material Úmido no Furo (g)',
        'Tara Frigideira (g)',
        'Úmido + Frigideira (g)',
        'Seco + Frigideira (g)',
        'Dens. Úmida (g/cm³)',
        'Dens. Seca (g/cm³)',
        'Umidade (%)',
        'Desvio de Umidade (%)',
        'Grau de Compactação (%)',
      ],
      rows: furos.map((f, i) => [
        val(f.numero ?? i + 1),
        val(f.estaca),
        val(f.pista),
        val(f.profundidade_furo),
        val(f.peso_areia_garrafa_antes),
        val(f.peso_areia_garrafa_apos),
        val(f.peso_material_umido_furo),
        val(f.tara_frigideira),
        val(f.material_umido_frigideira),
        val(f.material_seco_frigideira),
        val(f.densidade_umida_furo),
        val(f.densidade_seca_solo),
        val(f.umidade),
        val(f.desvio_umidade),
        val(f.grau_compactacao),
      ]),
      cols: [8, 14, 12, 12, 22, 22, 24, 18, 20, 20, 18, 18, 12, 20, 22],
    })
  );

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('densidade_in_situ', ensaio.data_ensaio), sheets };
}