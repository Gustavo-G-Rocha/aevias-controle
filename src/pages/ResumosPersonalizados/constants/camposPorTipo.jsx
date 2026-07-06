import { TIPOS_ENSAIO } from "./tiposEnsaio";
import { CAMPOS_ENSAIOS } from "./camposEnsaios";
import { CAMPOS_CHECKLISTS } from "./camposChecklists";

export { TIPOS_ENSAIO, CAMPOS_ENSAIOS, CAMPOS_CHECKLISTS };

export const CAMPOS_POR_TIPO = {
  ...CAMPOS_ENSAIOS,
  ...CAMPOS_CHECKLISTS,
};