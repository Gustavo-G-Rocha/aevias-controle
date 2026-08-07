import { buildSheet, buildFileName, fmtDate, val, boolText, obraMeta } from '../excelCore';

/** Ensaio Proctor — compactação, umidades, densidades, CBR e expansão. */
export default function buildEnsaioProctorExport(ensaio) {
  const sheets = [];

  sheets.push(
    buildSheet({
      name: 'Dados Gerais',
      title: 'Ensaio Proctor — Dados Gerais',
      meta: [
        ...obraMeta(ensaio),
        ['Data do Ensaio', fmtDate(ensaio.data_ensaio)],
        ['Horário', val(ensaio.horario)],
        ['Cliente', val(ensaio.cliente)],
        ['Contrato', val(ensaio.contrato)],
        ['Rodovia', val(ensaio.rodovia)],
        ['Trecho', val(ensaio.trecho)],
        ['Local de Coleta', val(ensaio.local_coleta)],
        ['Camada', val(ensaio.camada)],
        ['Material', val(ensaio.material)],
        ['Procedência', val(ensaio.procedencia)],
        ['Disco Especial', val(ensaio.disco_especial)],
        ['Soquete', val(ensaio.soquete)],
        ['Número de Golpes', val(ensaio.num_golpes)],
        ['Energia de Compactação', val(ensaio.energia_compactacao)],
        ['Umidade Higroscópica (%)', val(ensaio.umidade_higroscopica)],
        ['Densidade Máxima Seca (g/cm³)', val(ensaio.densidade_maxima_seca)],
        ['Umidade Ótima (%)', val(ensaio.umidade_otima)],
        ['ISC/CBR (%)', val(ensaio.isc_cbr)],
        ['Expansão (%)', val(ensaio.expansao)],
        ['Realizou CBR/Expansão', boolText(ensaio.realizar_cbr_expansao)],
      ],
      cols: [32, 30],
    })
  );

  const umidades = ensaio.umidades || [];
  if (umidades.length) {
    sheets.push(
      buildSheet({
        name: 'Umidades',
        title: 'Determinação de Umidade',
        header: [
          'Ponto',
          'Cápsula 1',
          'Solo Úmido + Cáps. 1 (g)',
          'Solo Seco + Cáps. 1 (g)',
          'Peso Cápsula 1 (g)',
          'Umidade 1 (%)',
          'Cápsula 2',
          'Solo Úmido + Cáps. 2 (g)',
          'Solo Seco + Cáps. 2 (g)',
          'Peso Cápsula 2 (g)',
          'Umidade 2 (%)',
          'Umidade Média (%)',
        ],
        rows: umidades.map((u, i) => [
          i + 1,
          val(u.capsula_numero_1),
          val(u.capsula_solo_umido_1),
          val(u.capsula_solo_seco_1),
          val(u.peso_capsula_1),
          val(u.teor_umidade_1),
          val(u.capsula_numero_2),
          val(u.capsula_solo_umido_2),
          val(u.capsula_solo_seco_2),
          val(u.peso_capsula_2),
          val(u.teor_umidade_2),
          val(u.teor_umidade_media),
        ]),
        cols: [8, 12, 22, 22, 18, 14, 12, 22, 22, 18, 14, 18],
      })
    );
  }

  const densidades = ensaio.densidades || [];
  if (densidades.length) {
    sheets.push(
      buildSheet({
        name: 'Densidades',
        title: 'Determinação de Densidade',
        header: [
          'Ponto',
          'Cilindro',
          'Cilindro + Solo Úmido (g)',
          'Peso do Cilindro (g)',
          'Solo Úmido (g)',
          'Volume (cm³)',
          'Água Adicionada (ml)',
          'Umidade (%)',
          'Dens. Ap. Úmida (g/cm³)',
          'Dens. Ap. Seca (g/cm³)',
        ],
        rows: densidades.map((d, i) => [
          i + 1,
          val(d.cilindro_numero),
          val(d.cilindro_solo_umido),
          val(d.peso_cilindro),
          val(d.peso_solo_umido),
          val(d.volume_cilindro),
          val(d.agua_adicionada_ml),
          val(d.umidade_calculada),
          val(d.dens_ap_umida),
          val(d.dens_ap_seca),
        ]),
        cols: [8, 14, 24, 20, 16, 14, 20, 14, 22, 22],
      })
    );
  }

  const cbr = ensaio.cbr_cilindros || [];
  if (cbr.length) {
    sheets.push(
      buildSheet({
        name: 'CBR',
        title: 'CBR / ISC por Cilindro',
        meta: [['Fator do Anel (global)', val(ensaio.cbr_fator_anel)]],
        header: ['Cilindro', 'Fator do Anel', 'ISC 2,54mm (%)', 'ISC 5,08mm (%)', 'ISC Adotado (%)'],
        rows: cbr.map((c) => [
          val(c.cilindro_numero),
          val(c.fator_anel),
          val(c.isc254),
          val(c.isc508),
          val(c.isc),
        ]),
        cols: [14, 16, 18, 18, 18],
      })
    );
  }

  const exp = ensaio.expansao_cilindros || [];
  if (exp.length) {
    sheets.push(
      buildSheet({
        name: 'Expansão',
        title: 'Expansão por Cilindro',
        header: [
          'Cilindro',
          'Data',
          'Hora',
          'Altura Inicial (mm)',
          'Leitura 1º dia',
          'Leitura 2º dia',
          'Leitura 3º dia',
          'Leitura 4º dia',
          'Diferença',
          'Expansão (%)',
          'Massa Final do Solo (g)',
        ],
        rows: exp.map((e) => [
          val(e.cilindro_numero),
          fmtDate(e.data),
          val(e.hora),
          val(e.altura_inicial),
          val(e.leitura_1dia),
          val(e.leitura_2dia),
          val(e.leitura_3dia),
          val(e.leitura_4dia),
          val(e.diferenca),
          val(e.expansao_pct),
          val(e.massa_solo_final),
        ]),
        cols: [14, 14, 10, 18, 14, 14, 14, 14, 12, 14, 22],
      })
    );
  }

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('ensaio_proctor', ensaio.data_ensaio), sheets };
}