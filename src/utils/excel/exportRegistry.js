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
  const [{ default: buildExport }, { downloadExcel }, full] = await Promise.all([
    load(),
    import('./excelCore'),
    withObraInfo(record),
  ]);
  downloadExcel(buildExport(full));
}