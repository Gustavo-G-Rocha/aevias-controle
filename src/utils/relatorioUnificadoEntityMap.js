/**
 * Mapeamento de entidades base44 para RelatorioUnificado.
 * Separado de relatorioUnificadoUtils para evitar importação
 * do base44Client em testes unitários.
 */
import { base44 } from '@/api/base44Client';

export const getEntityInstance = (key) => {
  const map = {
    DiarioObra: base44.entities.DiarioObra,
    EnsaioCAUQ: base44.entities.EnsaioCAUQ,
    EnsaioMRAF: base44.entities.EnsaioMRAF,
    EnsaioDensidade: base44.entities.EnsaioDensidade,
    EnsaioDensidadeInSitu: base44.entities.EnsaioDensidadeInSitu,
    EnsaioTaxaPinturaImprimacao: base44.entities.EnsaioTaxaPinturaImprimacao,
    ChecklistUsina: base44.entities.ChecklistUsina,
    ChecklistAplicacao: base44.entities.ChecklistAplicacao,
    ChecklistMRAF: base44.entities.ChecklistMRAF,
    ChecklistConcretagem: base44.entities.ChecklistConcretagem,
    ChecklistTerraplanagem: base44.entities.ChecklistTerraplanagem,
    ChecklistReciclagem: base44.entities.ChecklistReciclagem,
    EnsaioSondagem: base44.entities.EnsaioSondagem,
    EnsaioGranulometriaIndividual: base44.entities.EnsaioGranulometriaIndividual,
    AcompanhamentoUsinagem: base44.entities.AcompanhamentoUsinagem,
    AcompanhamentoCarga: base44.entities.AcompanhamentoCarga,
    EnsaioManchaPendulo: base44.entities.EnsaioManchaPendulo,
    EnsaioVigaBenkelman: base44.entities.EnsaioVigaBenkelman,
    EnsaioTaxaMRAF: base44.entities.EnsaioTaxaMRAF,
    BoletimSondagem: base44.entities.BoletimSondagem,
    BoletimSondagemTrado: base44.entities.BoletimSondagemTrado,
    EnsaioProctor: base44.entities.EnsaioProctor,
    EnsaioRompimentoConcreto: base44.entities.EnsaioRompimentoConcreto,
    GranuMistura: base44.entities.GranuMistura,
    CertificacaoUsina: base44.entities.CertificacaoUsina,
  };
  return map[key];
};