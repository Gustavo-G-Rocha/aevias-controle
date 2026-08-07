import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';
import { compact } from './checklistShared';

const titulo = (chave) => chave.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

/** Transforma um objeto de respostas (inclusive aninhado) em linhas Item/Resposta. */
function respostas(obj, prefixo = '') {
  const linhas = [];
  Object.entries(obj || {}).forEach(([chave, v]) => {
    const rotulo = prefixo ? `${prefixo} — ${titulo(chave)}` : titulo(chave);
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      linhas.push(...respostas(v, rotulo));
    } else {
      linhas.push([rotulo, val(v)]);
    }
  });
  return linhas;
}

const secao = (name, title, obj) => {
  const rows = respostas(obj);
  return rows.length
    ? buildSheet({ name, title, header: ['Item', 'Resposta'], rows, cols: [56, 24] })
    : null;
};

/** Certificação de Usina — vistoria completa por seções. */
export default function buildCertificacaoUsinaExport(reg) {
  const usina = reg.usina_asfalto || {};

  const sheets = [
    buildSheet({
      name: 'Dados Gerais',
      title: 'Certificação de Usina — Dados Gerais',
      meta: [
        ...obraMeta(reg),
        ['Razão Social', val(reg.razao_social)],
        ['CNPJ', val(reg.cnpj)],
        ['Interessado', val(reg.interessado)],
        ['Responsável Técnico', val(reg.responsavel_tecnico)],
        ['Telefone', val(reg.telefone)],
        ['E-mail', val(reg.email)],
        ['Data da Vistoria', fmtDate(reg.data_vistoria)],
        ['Validade', fmtDate(reg.validade)],
        ['Avaliador', val(reg.avaliador)],
        ['Localização', val(reg.localizacao)],
        ['Marca da Usina', val(reg.marca_usina)],
        ['Número de Série', val(reg.numero_serie)],
        ['Fornecimento de Agregado', val(reg.fornecimento_agregado)],
        ['Mineralogia', val(reg.mineralogia)],
        ['Classe da Usina', val(reg.classe_usina)],
        ['Tipo de Dosagem', val(reg.tipo_dosagem)],
        ['Tipo de Secagem', val(reg.tipo_secagem)],
        ['Resultado — Classe', val(reg.resultado_classe)],
        ['Observações do Resultado', val(reg.observacoes_resultado)],
      ],
      cols: [30, 44],
    }),

    secao('Aspectos Legais', 'Aspectos Legais', reg.aspectos_legais),
    secao('Saúde e Segurança', 'Aspectos de Saúde e Segurança', reg.saude_seguranca),
    secao('Meio Ambiente', 'Meio Ambiente', reg.meio_ambiente),
    secao('Laboratório', 'Laboratório', reg.laboratorio),
    secao('Aferição', 'Aferição, Repetibilidade e Reprodutibilidade', reg.afeicao),
    secao('Estrutura Física', 'Estrutura e Espaço Físico', reg.estrutura_fisica),
    secao('Usina de Asfalto', 'Usina de Asfalto', usina),
    secao('Ensaios de Validação', 'Ensaios para Validação', reg.ensaios_validacao),

    reg.observacoes_gerais
      ? buildSheet({ name: 'Observações', meta: [['Observações', reg.observacoes_gerais]], cols: [20, 90] })
      : null,
  ];

  return { filename: buildFileName('certificacao_usina', reg.data_vistoria), sheets: compact(sheets) };
}