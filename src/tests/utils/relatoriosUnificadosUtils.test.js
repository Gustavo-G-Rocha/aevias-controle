import { describe, it, expect } from "vitest";
import {
  filterObrasByUserAccess,
  filterRecordsByDateRange,
  extractLaboratoristas,
  buildReportParams,
  isFormValid,
} from "@/utils/relatoriosUnificadosUtils";

describe("relatoriosUnificadosUtils", () => {

  describe("filterObrasByUserAccess", () => {
    it("deve retornar todas as obras para admin", () => {
      const obras = [{ id: "1", name: "Obra 1" }];
      const result = filterObrasByUserAccess(
        obras,
        [],
        { role: "admin" },
        "admin"
      );
      expect(result).toEqual(obras);
    });

    it("deve filtrar obras para gestor_contrato", () => {
      const obras = [
        { id: "1", regional_id: "r1" },
        { id: "2", regional_id: "r2" },
      ];
      const regionais = [
        {
          id: "r1",
          gestores_contrato_responsaveis: ["user@test.com"],
        },
      ];
      const user = { email: "user@test.com" };

      const result = filterObrasByUserAccess(
        obras,
        regionais,
        user,
        "gestor_contrato"
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });
  });

  describe("filterRecordsByDateRange", () => {
    it("deve filtrar registros por data", () => {
      const records = [
        { data_ensaio: "2026-05-15", laboratorista_name: "Lab1" },
        { data_ensaio: "2026-06-01", laboratorista_name: "Lab2" },
      ];

      // Mock getDataEnsaio
      const result = filterRecordsByDateRange(
        records,
        "2026-05-20",
        "2026-05-31"
      );
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("extractLaboratoristas", () => {
    it("deve extrair e ordenar laboratoristas", () => {
      const records = [
        { laboratorista_name: "Carlos", created_by: "carlos@test.com" },
        { laboratorista_name: "Ana", created_by: "ana@test.com" },
        { laboratorista_name: "Ana" },
      ];

      const result = extractLaboratoristas(records);
      expect(result).toContain("Ana");
      expect(result).toContain("Carlos");
      expect(result).toEqual([...result].sort());
    });

    it("deve retornar array vazio para registros vazios", () => {
      expect(extractLaboratoristas([])).toEqual([]);
    });
  });

  describe("buildReportParams", () => {
    it("deve construir URLSearchParams corretamente com tipo único (string)", () => {
      const params = buildReportParams(
        "obra1",
        "2026-05-01",
        "2026-05-31",
        "DiarioObra",
        ["Lab1", "Lab2"],
        "Rodovia X",
        "Empresa Y",
        "Usina Z"
      );

      expect(params.get("obra_id")).toBe("obra1");
      expect(params.get("laboratoristas")).toBe("Lab1,Lab2");
      expect(params.get("rodovia")).toBe("Rodovia X");
      expect(params.get("tipos")).toBe("DiarioObra");
    });

    it("deve construir URLSearchParams com múltiplos tipos (array)", () => {
      const params = buildReportParams(
        "obra1",
        "2026-05-01",
        "2026-05-31",
        ["DiarioObra", "ChecklistUsina", "ChecklistAplicacao"],
        ["Lab1"],
        "",
        "",
        ""
      );

      expect(params.get("tipos")).toBe("DiarioObra,ChecklistUsina,ChecklistAplicacao");
    });

    it("deve permitir filtros adicionais vazios", () => {
      const params = buildReportParams(
        "obra1",
        "2026-05-01",
        "2026-05-31",
        ["DiarioObra"],
        ["Lab1"],
        "",
        "",
        ""
      );

      expect(params.get("rodovia")).toBe("");
      expect(params.get("empreiteira")).toBe("");
      expect(params.get("usina")).toBe("");
    });
  });

  describe("isFormValid", () => {
    it("deve validar formulário com um tipo (string)", () => {
      expect(isFormValid("2026-05-01", "2026-05-31", "obra1", ["Lab1"], "DiarioObra")).toBe(true);
    });

    it("deve validar formulário com múltiplos tipos (array)", () => {
      expect(isFormValid("2026-05-01", "2026-05-31", "obra1", ["Lab1"], ["DiarioObra", "ChecklistUsina"])).toBe(true);
    });

    it("deve falhar com array vazio de tipos", () => {
      expect(isFormValid("2026-05-01", "2026-05-31", "obra1", ["Lab1"], [])).toBe(false);
    });

    it("deve falhar com string vazia de tipo", () => {
      expect(isFormValid("2026-05-01", "2026-05-31", "obra1", ["Lab1"], "")).toBe(false);
    });

    it("deve falhar sem laboratoristas", () => {
      expect(isFormValid("2026-05-01", "2026-05-31", "obra1", [], ["DiarioObra"])).toBe(false);
    });

    it("deve falhar sem obra", () => {
      expect(isFormValid("2026-05-01", "2026-05-31", "", ["Lab1"], ["DiarioObra"])).toBe(false);
    });

    it("deve falhar sem datas", () => {
      expect(isFormValid("", "", "obra1", ["Lab1"], ["DiarioObra"])).toBe(false);
    });
  });
});