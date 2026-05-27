import { describe, it, expect } from "vitest";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  getUserAccessLevel,
  isUserGestor,
  isUserAdmin,
  isUserCliente,
  canUserChangeStatus,
  countNCsByStatus,
  formatDatePtBR,
  getObraName,
} from "@/utils/gestaoNCUtils";

describe("gestaoNCUtils", () => {
  describe("STATUS_COLORS and STATUS_LABELS", () => {
    it("deve ter cores para todos os status", () => {
      const statuses = ["aberta", "em_tratativa", "encerrada", "cancelada"];
      statuses.forEach((s) => {
        expect(STATUS_COLORS[s]).toBeDefined();
        expect(STATUS_LABELS[s]).toBeDefined();
      });
    });
  });

  describe("getUserAccessLevel", () => {
    it("deve retornar 'user' para usuário null", () => {
      expect(getUserAccessLevel(null)).toBe("user");
    });

    it("deve retornar access_level se definido", () => {
      const user = { access_level: "gestor_contrato" };
      expect(getUserAccessLevel(user)).toBe("gestor_contrato");
    });

    it("deve retornar 'admin' se role é admin", () => {
      const user = { role: "admin" };
      expect(getUserAccessLevel(user)).toBe("admin");
    });

    it("deve retornar 'user' como padrão", () => {
      const user = { role: "user" };
      expect(getUserAccessLevel(user)).toBe("user");
    });
  });

  describe("isUserGestor", () => {
    it("deve retornar true para gestor", () => {
      const user = { access_level: "gestor_contrato" };
      expect(isUserGestor(user)).toBe(true);
    });

    it("deve retornar false para não-gestor", () => {
      const user = { access_level: "admin" };
      expect(isUserGestor(user)).toBe(false);
    });
  });

  describe("isUserAdmin", () => {
    it("deve retornar true para admin via access_level", () => {
      const user = { access_level: "admin" };
      expect(isUserAdmin(user)).toBe(true);
    });

    it("deve retornar true para admin via role", () => {
      const user = { role: "admin" };
      expect(isUserAdmin(user)).toBe(true);
    });

    it("deve retornar false para não-admin", () => {
      const user = { access_level: "gestor_contrato" };
      expect(isUserAdmin(user)).toBe(false);
    });
  });

  describe("isUserCliente", () => {
    it("deve retornar true para cliente", () => {
      const user = { access_level: "cliente" };
      expect(isUserCliente(user)).toBe(true);
    });

    it("deve retornar false para não-cliente", () => {
      const user = { access_level: "admin" };
      expect(isUserCliente(user)).toBe(false);
    });
  });

  describe("canUserChangeStatus", () => {
    it("deve retornar true para gestor", () => {
      const user = { access_level: "gestor_contrato" };
      expect(canUserChangeStatus(user)).toBe(true);
    });

    it("deve retornar true para admin", () => {
      const user = { access_level: "admin" };
      expect(canUserChangeStatus(user)).toBe(true);
    });

    it("deve retornar true para cliente", () => {
      const user = { access_level: "cliente" };
      expect(canUserChangeStatus(user)).toBe(true);
    });

    it("deve retornar false para user comum", () => {
      const user = { access_level: "user" };
      expect(canUserChangeStatus(user)).toBe(false);
    });
  });

  describe("countNCsByStatus", () => {
    it("deve contar NCs por status corretamente", () => {
      const ncs = [
        { id: 1, status: "aberta" },
        { id: 2, status: "aberta" },
        { id: 3, status: "encerrada" },
      ];
      expect(countNCsByStatus(ncs, "aberta")).toBe(2);
      expect(countNCsByStatus(ncs, "encerrada")).toBe(1);
      expect(countNCsByStatus(ncs, "cancelada")).toBe(0);
    });
  });

  describe("formatDatePtBR", () => {
    it("deve formatar data para pt-BR", () => {
      const result = formatDatePtBR("2026-05-27");
      expect(result).toMatch(/27\/0?5\/2026/);
    });

    it("deve retornar '—' para null", () => {
      expect(formatDatePtBR(null)).toBe("—");
      expect(formatDatePtBR(undefined)).toBe("—");
    });
  });

  describe("getObraName", () => {
    it("deve retornar nome da obra", () => {
      const nc = { obra_id: "1", obra_nome: "Fallback" };
      const obras = [{ id: "1", name: "Obra 1" }];
      expect(getObraName(nc, obras)).toBe("Obra 1");
    });

    it("deve retornar obra_nome como fallback", () => {
      const nc = { obra_id: "2", obra_nome: "Fallback" };
      const obras = [{ id: "1", name: "Obra 1" }];
      expect(getObraName(nc, obras)).toBe("Fallback");
    });

    it("deve retornar '—' se não encontrar", () => {
      const nc = { obra_id: "3" };
      const obras = [{ id: "1", name: "Obra 1" }];
      expect(getObraName(nc, obras)).toBe("—");
    });
  });
});