/**
 * Mapeamento de entidades suportadas pelo RelatorioUnificado.
 * Acesso aos dados é feito via recordsService (filtrarRegistros),
 * mantendo este módulo livre de dependências do base44Client
 * (testável em Node sem browser).
 */
export const UNIFIED_ENTITY_TYPES = [
  'DiarioObra',
  'EnsaioCAUQ',
  'EnsaioMRAF',
  'EnsaioDensidade',
  'EnsaioDensidadeInSitu',
  'EnsaioTaxaPinturaImprimacao',
  'ChecklistUsina',
  'ChecklistAplicacao',
  'ChecklistMRAF',
  'ChecklistConcretagem',
  'ChecklistTerraplanagem',
  'ChecklistReciclagem',
  'EnsaioSondagem',
  'EnsaioGranulometriaIndividual',
  'AcompanhamentoUsinagem',
  'AcompanhamentoCarga',
  'EnsaioManchaPendulo',
  'EnsaioVigaBenkelman',
  'EnsaioTaxaMRAF',
  'BoletimSondagem',
  'BoletimSondagemTrado',
  'EnsaioProctor',
  'EnsaioRompimentoConcreto',
  'GranuMistura',
  'CertificacaoUsina',
  'ControleExecucaoServicos',
  'RegistroFresagemCBUQ',
  'EnsaioTaxaInsumos',
];

const UNIFIED_ENTITY_SET = new Set(UNIFIED_ENTITY_TYPES);

export const isTipoSuportado = (tipo) => UNIFIED_ENTITY_SET.has(tipo);