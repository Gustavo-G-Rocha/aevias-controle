/**
 * Registro central dos exportadores de Excel por tipo de registro.
 *
 * Adicionar um novo tipo = criar o exportador em ./exporters e registrar aqui.
 * Os módulos são carregados sob demanda para não pesarem no bundle inicial.
 */
import { base44 } from '@/api/base44Client';

const EXPORTERS = {
  EnsaioVigaBenkelman: () => import('./exporters/vigaBenkelman'),
  AcompanhamentoCarga: () => import('./exporters/acompanhamentoCarga'),
  RegistroFresagemCBUQ: () => import('./exporters/registroFresagemCBUQ'),
  ControleExecucaoServicos: () => import('./exporters/controleExecucaoServicos'),
  EnsaioTaxaInsumos: () => import('./exporters/ensaioTaxaInsumos'),
  BoletimSondagem: () => import('./exporters/boletimSondagem'),
  BoletimSondagemTrado: () => import('./exporters/boletimSondagemTrado'),
  DiarioObra: () => import('./exporters/diarioObra'),
  EnsaioCAUQ: () => import('./exporters/ensaioCAUQ'),
  AcompanhamentoUsinagem: () => import('./exporters/acompanhamentoUsinagem'),
  EnsaioTaxaPinturaImprimacao: () => import('./exporters/ensaioTaxaPinturaImprimacao'),
  EnsaioSondagem: () => import('./exporters/ensaioSondagem'),
  EnsaioGranulometriaIndividual: () => import('./exporters/ensaioGranulometriaIndividual'),
  EnsaioMRAF: () => import('./exporters/ensaioMRAF'),
  EnsaioDensidade: () => import('./exporters/ensaioDensidade'),
  EnsaioDensidadeInSitu: () => import('./exporters/ensaioDensidadeInSitu'),
  EnsaioManchaPendulo: () => import('./exporters/ensaioManchaPendulo'),
  EnsaioTaxaMRAF: () => import('./exporters/ensaioTaxaMRAF'),
  EnsaioProctor: () => import('./exporters/ensaioProctor'),
  EnsaioRompimentoConcreto: () => import('./exporters/ensaioRompimentoConcreto'),
  GranuMistura: () => import('./exporters/granuMistura'),
  ChecklistUsina: () => import('./exporters/checklistUsina'),
  ChecklistAplicacao: () => import('./exporters/checklistAplicacao'),
  ChecklistMRAF: () => import('./exporters/checklistMRAF'),
  ChecklistConcretagem: () => import('./exporters/checklistConcretagem'),
  ChecklistTerraplanagem: () => import('./exporters/checklistTerraplanagem'),
  ChecklistReciclagem: () => import('./exporters/checklistReciclagem'),
  CertificacaoUsina: () => import('./exporters/certificacaoUsina'),
};

/** Indica se o tipo já possui exportador sob medida. */
export const hasExcelExporter = (entityType) => Boolean(EXPORTERS[entityType]);

/**
 * Completa nome e código da obra quando o registro não os guarda
 * desnormalizados (a maioria só armazena obra_id).
 */
async function withObraInfo(record) {
  if ((record.obra_name && record.obra_code) || !record.obra_id) return record;
  try {
    const obra = await base44.entities.Obra.get(record.obra_id);
    return {
      ...record,
      obra_name: record.obra_name || obra?.name,
      obra_code: record.obra_code || obra?.code,
    };
  } catch {
    return record;
  }
}

/** Gera e baixa o Excel do registro. */
export async function exportRecordToExcel(record) {
  const load = EXPORTERS[record?.entityType];
  if (!load) {
    throw new Error('Exportação para Excel ainda não disponível para este tipo de registro.');
  }
  const [{ default: buildExport }, core, full] = await Promise.all([
    load(),
    import('./excelCore'),
    withObraInfo(record),
  ]);
  const built = buildExport(full);
  // Rodapé de aprovação/assinaturas, como no PDF de cada registro.
  built.sheets.push(core.assinaturasSheet(full));
  core.downloadExcel(built);
}

/**
 * Exporta vários registros em uma única planilha — cada registro em sua
 * própria aba. Registros sem exportador disponível são ignorados.
 */
export async function exportRecordsToExcel(records, filename = 'registros.xlsx') {
  const exportaveis = (records || []).filter((r) => EXPORTERS[r?.entityType]);
  if (!exportaveis.length) {
    throw new Error('Nenhum dos registros selecionados possui exportação para Excel.');
  }
  const { downloadExcelWorkbook, assinaturasSheet } = await import('./excelCore');
  const tabs = [];
  for (const record of exportaveis) {
    const [{ default: buildExport }, full] = await Promise.all([
      EXPORTERS[record.entityType](),
      withObraInfo(record),
    ]);
    const built = buildExport(full);
    // Rodapé de aprovação/assinaturas, como no PDF de cada registro.
    built.sheets.push(assinaturasSheet(full));
    tabs.push({ name: built.filename.replace(/\.xlsx$/i, ''), sheets: built.sheets });
  }
  downloadExcelWorkbook({ filename, tabs });
}