import { describe, it, expect } from "vitest";
import {
  filterProjectsByUserAccess,
  getRegionalNome,
  getUserAccessLevel,
  canManageProjects,
  removeProjectFromRegional,
  addProjectIdToRegional,
  STATUS_COLORS,
  TIPO_PROJETO_COLORS,
  TIPO_PROJETO_LABELS,
} from "@/utils/projectsUtils";

describe("projectsUtils", () => {
  describe("filterProjectsByUserAccess", () => {
    it("deve retornar todos os projetos para admin", () => {
      const projects = [{ id: "1", name: "P1" }, { id: "2", name: "P2" }];
      const result = filterProjectsByUserAccess(
        projects,
        [],
        { role: "admin" },
        "admin"
      );
      expect(result).toEqual(projects);
    });

    it("deve filtrar projetos para laboratorista", () => {
      const projects = [
        { id: "1", regional_id: "r1" },
        { id: "2", regional_id: "r2" },
      ];
      const regionais = [
        {
          id: "r1",
          laboratoristas_responsaveis: ["lab@test.com"],
        },
      ];
      const user = { email: "lab@test.com" };

      const result = filterProjectsByUserAccess(
        projects,
        regionais,
        user,
        "user"
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it("deve incluir projetos vinculados à regional do usuário", () => {
      const projects = [{ id: "1", regional_id: "r1" }];
      const regionais = [
        {
          id: "r1",
          laboratoristas_responsaveis: ["lab@test.com"],
          project_ids: ["1"],
        },
      ];
      const user = { email: "lab@test.com" };

      const result = filterProjectsByUserAccess(
        projects,
        regionais,
        user,
        "user"
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });
  });

  describe("getRegionalNome", () => {
    it("deve retornar nome da regional", () => {
      const regionais = [{ id: "r1", nome: "Regional Norte" }];
      expect(getRegionalNome("r1", regionais)).toBe("Regional Norte");
    });

    it("deve retornar null para ID inválido", () => {
      expect(getRegionalNome("invalid", [])).toBeNull();
    });

    it("deve retornar null para ID vazio", () => {
      expect(getRegionalNome(null, [])).toBeNull();
    });
  });

  describe("getUserAccessLevel", () => {
    it("deve retornar 'admin' para admin", () => {
      const user = { role: "admin" };
      expect(getUserAccessLevel(user)).toBe("admin");
    });

    it("deve usar access_level quando disponível", () => {
      const user = { access_level: "gestor_contrato", role: "user" };
      expect(getUserAccessLevel(user)).toBe("gestor_contrato");
    });

    it("deve retornar 'user' para null", () => {
      expect(getUserAccessLevel(null)).toBe("user");
    });
  });

  describe("canManageProjects", () => {
    it("deve retornar true para admin", () => {
      expect(canManageProjects("admin")).toBe(true);
    });

    it("deve retornar true para sala_tecnica", () => {
      expect(canManageProjects("sala_tecnica_afirmaevias")).toBe(true);
    });

    it("deve retornar true para gestor_contrato", () => {
      expect(canManageProjects("gestor_contrato")).toBe(true);
    });

    it("deve retornar false para user", () => {
      expect(canManageProjects("user")).toBe(false);
    });
  });

  describe("removeProjectFromRegional", () => {
    it("deve remover projeto da lista", () => {
      const projectIds = ["p1", "p2", "p3"];
      const result = removeProjectFromRegional(projectIds, "p2");
      expect(result).toEqual(["p1", "p3"]);
    });

    it("deve retornar lista vazia se único projeto", () => {
      const result = removeProjectFromRegional(["p1"], "p1");
      expect(result).toEqual([]);
    });

    it("deve não modificar se projeto não existe", () => {
      const projectIds = ["p1", "p2"];
      const result = removeProjectFromRegional(projectIds, "p3");
      expect(result).toEqual(["p1", "p2"]);
    });
  });

  describe("addProjectIdToRegional", () => {
    it("deve adicionar projeto se não existe", () => {
      const projectIds = ["p1", "p2"];
      const result = addProjectIdToRegional(projectIds, "p3");
      expect(result).toEqual(["p1", "p2", "p3"]);
    });

    it("deve não duplicar se já existe", () => {
      const projectIds = ["p1", "p2"];
      const result = addProjectIdToRegional(projectIds, "p2");
      expect(result).toEqual(["p1", "p2"]);
    });

    it("deve criar lista com primeiro projeto", () => {
      const result = addProjectIdToRegional([], "p1");
      expect(result).toEqual(["p1"]);
    });
  });

  describe("Color mappings", () => {
    it("deve ter STATUS_COLORS definido", () => {
      expect(STATUS_COLORS.ativo).toBe("bg-[#566E3D]/30 text-[#00233B]");
      expect(STATUS_COLORS.inativo).toBe("bg-red-400/20 text-red-800");
    });

    it("deve ter TIPO_PROJETO_COLORS definido", () => {
      expect(TIPO_PROJETO_COLORS.CAUQ).toBe("bg-[#00233B] text-white");
      expect(TIPO_PROJETO_COLORS.MRAF).toBe("bg-[#566E3D] text-white");
    });

    it("deve ter TIPO_PROJETO_LABELS definido", () => {
      expect(TIPO_PROJETO_LABELS.CAUQ).toBe("CAUQ");
      expect(TIPO_PROJETO_LABELS.CARTA_TRACO_CONCRETO).toBe("CARTA TRAÇO");
    });
  });
});