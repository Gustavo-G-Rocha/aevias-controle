import { buildSheet, buildFileName, fmtDate, val } from '../excelCore';
import { umidadeSheet, densidadesSheet } from './sondagemShared';

/** Boletim de sondagem a trado: camadas + ensaios de umidade e densidade. */
export default function buildBoletimSondagemTradoExport(boletim) {
  const sheets = [
    buildSheet({
      name: 'Camadas',
      meta: [
        ['Data', fmtDate(boletim.data)],
        ['Responsável', val(boletim.laboratorista_name)],
        ['Cliente', val(boletim.cliente)],
        ['Rodovia', val(boletim.rodovia)],
        ['Km', val(boletim.km)],
        ['Furo', val(boletim.furo)],
        ['Pista', val(boletim.pista)],
        ['Bordo', val(boletim.bordo)],
        ['Operador', val(boletim.operador)],
        ['Face', val(boletim.face_classificacao_1)],
      ],
      header: ['Nº', 'Prof. De (m)', 'Prof. Até (m)', 'Espessura (m)', 'N.A.', 'Classificação'],
      rows: (boletim.camadas || []).map((c, i) => [
        val(c.numero ?? i + 1),
        val(c.prof_de),
        val(c.prof_ate),
        val(c.espessura),
        val(c.na),
        val(c.classificacao_1),
      ]),
      cols: [8, 15, 15, 16, 10, 40],
    }),
  ];

  const umidades = [boletim.umidade_natural, boletim.umidade_natural_2].filter(Boolean);
  umidades.forEach((u, idx) => {
    const sheet = umidadeSheet(u, umidades.length > 1 ? `Umidade Natural ${idx + 1}` : 'Umidade Natural');
    if (sheet) sheets.push(sheet);
  });

  if (boletim.ensaio_insitu_realizado) {
    const dens = densidadesSheet(boletim.densidades_in_situ || []);
    if (dens) sheets.push(dens);
  }

  if (boletim.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', boletim.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('boletim_sondagem_trado', boletim.data), sheets };
}