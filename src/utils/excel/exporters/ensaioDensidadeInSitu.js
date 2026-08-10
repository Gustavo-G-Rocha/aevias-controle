import { buildSheet, buildFileName, fmtDate, val, boolText, obraMeta } from '../excelCore';
import { rawSheet, boldRowCells } from './transposedShared';
import { fmtN } from '@/utils/relatorioDensidadeInSituUtils';

/**
 * Seção transposta como no PDF: linhas = parâmetros, colunas = furos.
 * Cada grupo do PDF vira uma seção com faixa oliva própria.
 */
function furosSection({ name, title, linhas, N }) {
  const width = N + 1;
  const body = [];
  const labelCells = [];
  linhas.forEach(({ label, values, bold }) => {
    const r = body.length;
    body.push([label, ...values]);
    labelCells.push({ r, c: 0 });
    if (bold) labelCells.push(...boldRowCells(r, width));
  });
  return rawSheet({
    name,
    title,
    body,
    tables: [{ r: -1, rows: body.length, width }],
    labelCells,
    cols: [32, ...Array(N).fill(14)],
  });
}

/** Densidade in situ (frasco de areia) — clone da tabela transposta do PDF. */
export default function buildEnsaioDensidadeInSituExport(ensaio) {
  const proctor = ensaio.dados_proctor || {};
  const furos = ensaio.furos || [];
  const N = furos.length;
  const per = (fn) => furos.map(fn);
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
      ],
      cols: [34, 30],
    })
  );

  if (N) {
    // ── Estaca / Pista (topo da tabela do PDF) ──
    sheets.push(
      furosSection({
        name: 'Dados de Ensaio',
        title: 'Dados de Ensaio',
        N,
        linhas: [
          { label: 'ESTACA', values: per((f) => val(f.estaca)) },
          { label: 'PISTA', values: per((f) => val(f.pista)) },
        ],
      })
    );

    // ── Ensaio de densidade in situ ──
    const linhasDensidade = [
      { label: 'PESO AREIA NO FUNIL (g)', values: per(() => fmtN(ensaio.peso_areia_funil, 1)) },
      { label: 'DENSIDADE DA AREIA (g/cm³)', values: per(() => fmtN(ensaio.densidade_areia, 3)) },
    ];
    if (ensaio.substituicao_retido_3_4) {
      linhasDensidade.push({
        label: 'DENSIDADE REAL RETIDA 3/4" (g/cm³)',
        values: per(() => val(ensaio.densidade_real_retida_3_4)),
      });
    }
    linhasDensidade.push(
      { label: 'PROFUNDIDADE DO FURO (cm)', values: per((f) => val(f.profundidade_furo)) },
      { label: 'PESO AREIA+GARRAFA, ANTES (g)', values: per((f) => val(f.peso_areia_garrafa_antes)) },
      { label: 'PESO AREIA+GARRAFA, APÓS (g)', values: per((f) => val(f.peso_areia_garrafa_apos)) },
      { label: 'PESO MATERIAL ÚMIDO NO FURO (g)', values: per((f) => val(f.peso_material_umido_furo)) }
    );
    if (ensaio.substituicao_retido_3_4) {
      linhasDensidade.push({
        label: 'PESO SOLO RETIDO 3/4" ÚMIDO (g)',
        values: per((f) => val(f.peso_solo_retido_3_4_umido)),
      });
    }
    linhasDensidade.push(
      { label: 'DENSIDADE ÚMIDA DO FURO (g/cm³)', values: per((f) => fmtN(f.densidade_umida_furo, 3)), bold: true },
      { label: 'DENSIDADE SECA DO SOLO (g/cm³)', values: per((f) => fmtN(f.densidade_seca_solo, 3)), bold: true }
    );
    sheets.push(
      furosSection({
        name: 'Densidade In Situ',
        title: 'Ensaio de Densidade "In Situ" — DNIT 458/25',
        N,
        linhas: linhasDensidade,
      })
    );

    // ── Dados do Proctor ──
    sheets.push(
      furosSection({
        name: 'Dados do Proctor',
        title: 'Dados do Proctor',
        N,
        linhas: [
          { label: 'DENS. SECA MÁX. (g/cm³)', values: per(() => fmtN(proctor.densidade_seca_max, 3)) },
          { label: 'UMIDADE ÓTIMA (%)', values: per(() => val(proctor.umidade_otima)) },
        ],
      })
    );

    // ── Resultados ──
    sheets.push(
      furosSection({
        name: 'Resultados',
        title: 'Resultados',
        N,
        linhas: [
          { label: 'DESVIO DE UMIDADE (%)', values: per((f) => fmtN(f.desvio_umidade, 2)), bold: true },
          { label: 'GRAU DE COMPACTAÇÃO (%)', values: per((f) => fmtN(f.grau_compactacao, 2)), bold: true },
        ],
      })
    );

    // ── Ensaio de umidade ──
    sheets.push(
      furosSection({
        name: 'Ensaio de Umidade',
        title: 'Ensaio de Umidade "In Situ" (hₐ) — NBR 16097/2012',
        N,
        linhas: [
          { label: 'TARA DA FRIGIDEIRA (g)', values: per((f) => val(f.tara_frigideira)) },
          { label: 'MATERIAL ÚMIDO+FRIGIDEIRA (g)', values: per((f) => val(f.material_umido_frigideira)) },
          { label: 'MATERIAL SECO+FRIGIDEIRA (g)', values: per((f) => val(f.material_seco_frigideira)) },
          { label: 'UMIDADE (%)', values: per((f) => fmtN(f.umidade, 2)), bold: true },
        ],
      })
    );
  }

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('densidade_in_situ', ensaio.data_ensaio), sheets };
}