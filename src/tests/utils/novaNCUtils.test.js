import { describe, it, expect } from "vitest";
import {
  validateNovaNC,
  mapChecklistToForm,
  mapObraToForm,
  getChecklistDisplayLabel,
  findChecklistById,
  isChecklistFound,
  filterChecklistsByObra,
  initializeFormWithUser,
  prepareNCPayload,
  TIPOS_CHECKLIST,
  INITIAL_FORM_DATA
} from "@/utils/novaNCUtils";

describe("novaNCUtils", () => {
  describe("Constants", () => {
    it("TIPOS_CHECKLIST deve ter 7 tipos", () => {
      expect(TIPOS_CHECKLIST).toHaveLength(7);
      expect(TIPOS_CHECKLIST[0]).toEqual({ value: "DiarioObra", label: "Diário de Obra" });
    });

    it("INITIAL_FORM_DATA deve ter todos os campos", () => {
      expect(INITIAL_FORM_DATA).toHaveProperty("numero_rnc");
      expect(INITIAL_FORM_DATA.numero_rnc).toBe("");
      expect(INITIAL_FORM_DATA).toHaveProperty("descricao_nc");
      expect(INITIAL_FORM_DATA).toHaveProperty("data_nc");
    });
  });

  describe("validateNovaNC", () => {
    it("deve retornar erros quando obra vazia", () => {
      const errors = validateNovaNC("", { descricao_nc: "test", data_nc: "2024-01-01" });
      expect(errors).toContain("Obra é obrigatória");
    });

    it("deve retornar erros quando descrição vazia", () => {
      const errors = validateNovaNC("obra-1", { descricao_nc: "", data_nc: "2024-01-01" });
      expect(errors).toContain("Descrição da NC é obrigatória");
    });

    it("deve retornar erros quando data vazia", () => {
      const errors = validateNovaNC("obra-1", { descricao_nc: "test", data_nc: "" });
      expect(errors).toContain("Data da NC é obrigatória");
    });

    it("deve aceitar form válido", () => {
      const errors = validateNovaNC("obra-1", { descricao_nc: "test", data_nc: "2024-01-01" });
      expect(errors).toHaveLength(0);
    });
  });

  describe("mapChecklistToForm", () => {
    it("deve mapear checklist para form", () => {
      const checklist = {
        id: "cl-1",
        rodovia: "BR-116",
        trecho: "km 0-10",
        laboratorista_name: "João",
        data: "2024-01-01"
      };
      const form = { rodovia: "", trecho: "", campo: "", data_nc: "" };
      const result = mapChecklistToForm(checklist, form);
      expect(result.rodovia).toBe("BR-116");
      expect(result.trecho).toBe("km 0-10");
      expect(result.campo).toBe("João");
      expect(result.data_nc).toBe("2024-01-01");
    });

    it("deve retornar form original se checklist null", () => {
      const form = { rodovia: "BR-101" };
      const result = mapChecklistToForm(null, form);
      expect(result).toEqual(form);
    });
  });

  describe("mapObraToForm", () => {
    it("deve mapear obra para form", () => {
      const obra = {
        id: "obra-1",
        code: "OB-001",
        empreiteiras: ["Empresa A"],
        rodovias: ["BR-116"]
      };
      const regional = { cliente: "Cliente X" };
      const result = mapObraToForm(obra, regional, {});
      expect(result.cliente).toBe("Cliente X");
      expect(result.contrato).toBe("OB-001");
      expect(result.executora).toBe("Empresa A");
      expect(result.rodovia).toBe("BR-116");
    });

    it("deve retornar form original se obra null", () => {
      const form = { cliente: "test" };
      const result = mapObraToForm(null, {}, form);
      expect(result).toEqual(form);
    });
  });

  describe("getChecklistDisplayLabel", () => {
    it("deve gerar label com data rodovia trecho", () => {
      const checklist = { data: "2024-01-01", rodovia: "BR-116", trecho: "km 0-10" };
      const label = getChecklistDisplayLabel(checklist);
      expect(label).toContain("2024-01-01");
      expect(label).toContain("BR-116");
      expect(label).toContain("km 0-10");
    });

    it("deve retornar apenas data se outros campos faltam", () => {
      const checklist = { data: "2024-01-01", rodovia: "", trecho: "" };
      expect(getChecklistDisplayLabel(checklist)).toBe("2024-01-01");
    });
  });

  describe("findChecklistById", () => {
    it("deve encontrar checklist pelo id", () => {
      const checklists = [
        { id: "cl-1", data: "2024-01-01" },
        { id: "cl-2", data: "2024-01-02" }
      ];
      const result = findChecklistById(checklists, "cl-1");
      expect(result?.id).toBe("cl-1");
    });

    it("deve retornar undefined se não encontrar", () => {
      const result = findChecklistById([{ id: "cl-1" }], "cl-999");
      expect(result).toBeUndefined();
    });
  });

  describe("isChecklistFound", () => {
    it("deve retornar true se encontra", () => {
      expect(isChecklistFound([{ id: "cl-1" }], "cl-1")).toBe(true);
    });

    it("deve retornar false se não encontra", () => {
      expect(isChecklistFound([{ id: "cl-1" }], "cl-999")).toBe(false);
    });
  });

  describe("filterChecklistsByObra", () => {
    it("deve filtrar checklists pela obra", () => {
      const checklists = [
        { id: "cl-1", obra_id: "obra-1" },
        { id: "cl-2", obra_id: "obra-2" },
        { id: "cl-3", obra_id: "obra-1" }
      ];
      const result = filterChecklistsByObra(checklists, "obra-1");
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("cl-1");
    });

    it("deve retornar vazio se obraId vazio", () => {
      expect(filterChecklistsByObra([{ id: "cl-1", obra_id: "obra-1" }], "")).toEqual([]);
    });
  });

  describe("initializeFormWithUser", () => {
    it("deve inicializar com laboratorista_name", () => {
      const user = { laboratorista_name: "João" };
      const result = initializeFormWithUser(user);
      expect(result.relatorio_criador).toBe("João");
    });

    it("deve usar full_name se laboratorista_name não existe", () => {
      const user = { full_name: "Maria" };
      const result = initializeFormWithUser(user);
      expect(result.relatorio_criador).toBe("Maria");
    });

    it("deve retornar vazio se sem user", () => {
      const result = initializeFormWithUser({});
      expect(result.relatorio_criador).toBe("");
    });
  });

  describe("prepareNCPayload", () => {
    it("deve preparar payload para salvar", () => {
      const form = { descricao_nc: "Test" };
      const user = { email: "test@example.com", full_name: "Test User", crea_number: "123" };
      const obras = [{ id: "obra-1", name: "Obra 1" }];
      const payload = prepareNCPayload(form, "obra-1", obras, "DiarioObra", "cl-1", user, ["foto1.jpg"], []);

      expect(payload.obra_id).toBe("obra-1");
      expect(payload.obra_nome).toBe("Obra 1");
      expect(payload.status).toBe("aberta");
      expect(payload.pendente_aprovacao_cliente).toBe(true);
      expect(payload.manager_signature.signed_by).toBe("test@example.com");
    });
  });
});