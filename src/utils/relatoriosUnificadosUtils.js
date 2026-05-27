import { base44 } from "@/api/base44Client";
import { getDataEnsaio } from "@/components/ensaios/ensaioMappers";

export const ENTITY_KEYS = [
  "DiarioObra",
  "EnsaioCAUQ",
  "EnsaioMRAF",
  "EnsaioDensidade",
  "EnsaioDensidadeInSitu",
  "EnsaioTaxaPinturaImprimacao",
  "ChecklistUsina",
  "ChecklistAplicacao",
  "ChecklistMRAF",
  "ChecklistConcretagem",
  "ChecklistTerraplanagem",
  "ChecklistReciclagem",
  "EnsaioSondagem",
  "EnsaioGranulometriaIndividual",
  "AcompanhamentoUsinagem",
  "AcompanhamentoCarga",
  "EnsaioManchaPendulo",
  "EnsaioVigaBenkelman",
  "EnsaioTaxaMRAF",
  "BoletimSondagem",
  "BoletimSondagemTrado",
  "EnsaioProctor",
  "EnsaioRompimentoConcreto",
  "GranuMistura",
];

/**
 * Get entity instance by key
 */
export const getEntityInstance = (key) => {
  const map = {
    DiarioObra: base44.entities.DiarioObra,
    EnsaioCAUQ: base44.entities.EnsaioCAUQ,
    EnsaioMRAF: base44.entities.EnsaioMRAF,
    EnsaioDensidade: base44.entities.EnsaioDensidade,
    EnsaioDensidadeInSitu: base44.entities.EnsaioDensidadeInSitu,
    EnsaioTaxaPinturaImprimacao:
      base44.entities.EnsaioTaxaPinturaImprimacao,
    ChecklistUsina: base44.entities.ChecklistUsina,
    ChecklistAplicacao: base44.entities.ChecklistAplicacao,
    ChecklistMRAF: base44.entities.ChecklistMRAF,
    ChecklistConcretagem: base44.entities.ChecklistConcretagem,
    ChecklistTerraplanagem: base44.entities.ChecklistTerraplanagem,
    ChecklistReciclagem: base44.entities.ChecklistReciclagem,
    EnsaioSondagem: base44.entities.EnsaioSondagem,
    EnsaioGranulometriaIndividual:
      base44.entities.EnsaioGranulometriaIndividual,
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
  };
  return map[key];
};

/**
 * Filter obras by user access level
 */
export const filterObrasByUserAccess = (
  obras,
  regionais,
  user,
  userAccessLevel
) => {
  if (userAccessLevel === "gestor_contrato" || userAccessLevel === "sala_tecnica_afirmaevias") {
    const regionaisDoUsuario = regionais.filter(
      (r) =>
        r.gestor_contrato_responsavel?.toLowerCase() ===
          user.email?.toLowerCase() ||
        (r.gestores_contrato_responsaveis || []).some(
          (e) => e.toLowerCase() === user.email?.toLowerCase()
        ) ||
        (r.salas_tecnicas_responsaveis || []).some(
          (e) => e.toLowerCase() === user.email?.toLowerCase()
        )
    );
    const regionaisIds = regionaisDoUsuario.map((r) => r.id);
    const obrasVinculadas = obras.filter((o) =>
      regionaisIds.includes(o.regional_id)
    );
    return obrasVinculadas.length > 0 ? obrasVinculadas : obras;
  }
  return obras;
};

/**
 * Filter records by date range
 */
export const filterRecordsByDateRange = (records, dataInicio, dataFim) => {
  const startDate = new Date(dataInicio);
  const endDate = new Date(dataFim);
  endDate.setHours(23, 59, 59);

  return records.filter((r) => {
    const d = getDataEnsaio(r);
    if (!d) return false;
    const date = new Date(d);
    return date >= startDate && date <= endDate;
  });
};

/**
 * Extract laboratoristas from filtered records
 */
export const extractLaboratoristas = (filtered) => {
  const labSet = new Set();
  filtered.forEach((r) => {
    const name = r.laboratorista_name || r.created_by;
    if (name) labSet.add(name);
  });
  return Array.from(labSet).sort();
};

/**
 * Build URLSearchParams for report
 */
export const buildReportParams = (
  obraSelecionada,
  dataInicio,
  dataFim,
  tipoRegistro,
  laboratoristasChecked,
  rodoviaSelecionada,
  empreiteiraSelecionada,
  usinaSelecionada
) => {
  return new URLSearchParams({
    obra_id: obraSelecionada,
    data_inicio: dataInicio,
    data_fim: dataFim,
    tipo: tipoRegistro,
    laboratoristas: laboratoristasChecked.join(","),
    rodovia: rodoviaSelecionada || "",
    empreiteira: empreiteiraSelecionada || "",
    usina: usinaSelecionada || "",
  });
};

/**
 * Validate form
 */
export const isFormValid = (
  dataInicio,
  dataFim,
  obraSelecionada,
  laboratoristasChecked,
  tipoRegistro
) => {
  return (
    dataInicio &&
    dataFim &&
    obraSelecionada &&
    laboratoristasChecked.length > 0 &&
    tipoRegistro
  );
};