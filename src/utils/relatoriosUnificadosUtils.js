import { getDataEnsaio } from "@/components/ensaios/ensaioMappers";

/**
 * Filter obras by user access level.
 * Delega à função canônica `filtrarObrasPorAcessoRegional` em regionalFilter.js
 * para garantir regra de acesso única e consistente em todo o app.
 * O parâmetro `userAccessLevel` é mantido por compatibilidade de assinatura.
 */
import { filtrarObrasPorAcessoRegional } from "@/utils/regionalFilter";

export const filterObrasByUserAccess = (
  obras,
  regionais,
  user,
  userAccessLevel
) => {
  return filtrarObrasPorAcessoRegional(obras, regionais, user);
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
 * tipoRegistro aceita string ou string[] (multi-seleção)
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
  const tipos = Array.isArray(tipoRegistro) ? tipoRegistro : [tipoRegistro];
  return new URLSearchParams({
    obra_id: obraSelecionada,
    data_inicio: dataInicio,
    data_fim: dataFim,
    tipos: tipos.join(","),
    laboratoristas: laboratoristasChecked.join(","),
    rodovia: rodoviaSelecionada || "",
    empreiteira: empreiteiraSelecionada || "",
    usina: usinaSelecionada || "",
  });
};

/**
 * Validate form
 * tiposRegistro aceita string ou string[]
 */
export const isFormValid = (
  dataInicio,
  dataFim,
  obraSelecionada,
  laboratoristasChecked,
  tiposRegistro
) => {
  const hasType = Array.isArray(tiposRegistro)
    ? tiposRegistro.length > 0
    : !!tiposRegistro;
  return !!(
    dataInicio &&
    dataFim &&
    obraSelecionada &&
    laboratoristasChecked.length > 0 &&
    hasType
  );
};