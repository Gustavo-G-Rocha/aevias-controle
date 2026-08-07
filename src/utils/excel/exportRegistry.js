/**
 * Registro central dos exportadores de Excel por tipo de registro.
 *
 * Adicionar um novo tipo = criar o exportador em ./exporters e registrar aqui.
 * Os módulos são carregados sob demanda para não pesarem no bundle inicial.
 */
const EXPORTERS = {
  EnsaioVigaBenkelman: () => import('./exporters/vigaBenkelman'),
  AcompanhamentoCarga: () => import('./exporters/acompanhamentoCarga'),
  RegistroFresagemCBUQ: () => import('./exporters/registroFresagemCBUQ'),
  ControleExecucaoServicos: () => import('./exporters/controleExecucaoServicos'),
  EnsaioTaxaInsumos: () => import('./exporters/ensaioTaxaInsumos'),
  BoletimSondagem: () => import('./exporters/boletimSondagem'),
  BoletimSondagemTrado: () => import('./exporters/boletimSondagemTrado'),
  DiarioObra: () => import('./exporters/diarioObra'),
};

/** Indica se o tipo já possui exportador sob medida. */
export const hasExcelExporter = (entityType) => Boolean(EXPORTERS[entityType]);

/** Gera e baixa o Excel do registro. */
export async function exportRecordToExcel(record) {
  const load = EXPORTERS[record?.entityType];
  if (!load) {
    throw new Error('Exportação para Excel ainda não disponível para este tipo de registro.');
  }
  const [{ default: buildExport }, { downloadExcel }] = await Promise.all([
    load(),
    import('./excelCore'),
  ]);
  downloadExcel(buildExport(record));
}