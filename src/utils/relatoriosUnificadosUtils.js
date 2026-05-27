import { getDataEnsaio } from "@/components/ensaios/ensaioMappers";

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
  return !!(
    dataInicio &&
    dataFim &&
    obraSelecionada &&
    laboratoristasChecked.length > 0 &&
    tipoRegistro
  );
};