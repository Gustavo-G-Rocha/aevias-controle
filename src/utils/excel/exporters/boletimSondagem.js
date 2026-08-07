import { buildSheet, buildFileName, fmtDate, val } from '../excelCore';
import { umidadeSheet, densidadesSheet } from './sondagemShared';

/** Boletim de sondagem (PI): camadas das duas classificações + ensaios. */
export default function buildBoletimSondagemExport(boletim) {
  const meta = [
    ['Data', fmtDate(boletim.data)],
    ['Responsável', val(boletim.laboratorista_name)],
    ['Cliente', val(boletim.cliente)],
    ['Rodovia', val(boletim.rodovia)],
    ['Km', val(boletim.km)],
    ['Furo', val(boletim.furo)],
    ['Pista', val(boletim.pista)],
    ['Bordo', val(boletim.bordo)],
    ['Operador', val(boletim.operador)],
    ['Face Classificação 1', val(boletim.face_classificacao_1)],
    ['Face Classificação 2', val(boletim.face_classificacao_2)],
  ];

  const camadasHeader = ['Nº', 'Prof. De (m)', 'Prof. Até (m)', 'Espessura (m)', 'N.A.', 'Classificação'];
  const camadasCols = [8, 15, 15, 16, 10, 40];

  const sheets = [
    buildSheet({
      name: 'Camadas - Class. 1',
      meta,
      header: camadasHeader,
      rows: (boletim.camadas || []).map((c, i) => [
        val(c.numero ?? i + 1),
        val(c.prof_de),
        val(c.prof_ate),
        val(c.espessura),
        val(c.na),
        val(c.classificacao_1),
      ]),
      cols: camadasCols,
    }),
  ];

  const camadas2 = boletim.camadas_2 || [];
  if (camadas2.length) {
    sheets.push(
      buildSheet({
        name: 'Camadas - Class. 2',
        header: camadasHeader,
        rows: camadas2.map((c, i) => [
          val(c.numero ?? i + 1),
          val(c.prof_de),
          val(c.prof_ate),
          val(c.espessura),
          val(c.na),
          val(c.classificacao_2),
        ]),
        cols: camadasCols,
      })
    );
  }

  const umidades = [boletim.umidade_natural, boletim.umidade_natural_2].filter(Boolean);
  umidades.forEach((u, idx) => {
    const sheet = umidadeSheet(u, umidades.length > 1 ? `Umidade Natural ${idx + 1}` : 'Umidade Natural');
    if (sheet) sheets.push(sheet);
  });

  const densidades = boletim.densidades_in_situ?.length
    ? boletim.densidades_in_situ
    : [boletim.densidade_in_situ].filter(Boolean);
  const dens = densidadesSheet(densidades);
  if (dens) sheets.push(dens);

  if (boletim.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', boletim.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('boletim_sondagem', boletim.data), sheets };
}