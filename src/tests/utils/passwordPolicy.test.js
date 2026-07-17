import { describe, it, expect } from "vitest";
import {
  validatePasswordComplexity,
  getPasswordCriteria,
  getPasswordStrength,
} from "@/utils/passwordPolicy";

describe("validatePasswordComplexity", () => {
  it("aceita senha válida com todos os critérios", () => {
    const result = validatePasswordComplexity("Senha@123");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejeita senha curta (< 8 caracteres)", () => {
    const result = validatePasswordComplexity("Senha!");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("mínimo"))).toBe(true);
  });

  it("rejeita senha sem número", () => {
    const result = validatePasswordComplexity("Senhasenha!");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("número"))).toBe(true);
  });

  it("rejeita senha sem caractere especial", () => {
    const result = validatePasswordComplexity("Senha123");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("caractere especial"))).toBe(true);
  });

  it("rejeita senha sem maiúscula", () => {
    const result = validatePasswordComplexity("senha123!");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("maiúscula"))).toBe(true);
  });

  it("rejeita senha sem minúscula", () => {
    const result = validatePasswordComplexity("SENHA123!");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("minúscula"))).toBe(true);
  });

  it("rejeita senha idêntica ao e-mail", () => {
    const email = "usuario@teste.com";
    const result = validatePasswordComplexity(email, email);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("e-mail"))).toBe(true);
  });

  it("rejeita senha com apenas espaços", () => {
    const result = validatePasswordComplexity("        ");
    expect(result.valid).toBe(false);
  });

  it("rejeita senha que excede o comprimento máximo", () => {
    const longPwd = "Aa1!" + "a".repeat(125); // 129 chars
    const result = validatePasswordComplexity(longPwd);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("máximo"))).toBe(true);
  });

  it("aceita caracteres acentuados/unicode sem quebrar", () => {
    const result = validatePasswordComplexity("Sénha@123");
    expect(result.valid).toBe(true);
  });

  it("aceita todos os caracteres especiais do conjunto", () => {
    const specials = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_", "+", "=", "?"];
    for (const s of specials) {
      // "Senha01" (7 chars) + 1 especial = 8 chars (mínimo exigido)
      const result = validatePasswordComplexity(`Senha01${s}`);
      expect(result.valid).toBe(true);
    }
  });
});

describe("getPasswordCriteria", () => {
  it("retorna todos os critérios como atendidos para senha válida", () => {
    const criteria = getPasswordCriteria("Senha@123", "user@test.com");
    const allMet = criteria.every((c) => c.met);
    expect(allMet).toBe(true);
  });

  it("marca critério de e-mail como não atendido quando senha = e-mail", () => {
    const criteria = getPasswordCriteria("usuario@teste.com", "usuario@teste.com");
    const notEmailCriterion = criteria.find((c) => c.key === "notEmail");
    expect(notEmailCriterion.met).toBe(false);
  });
});

describe("getPasswordStrength", () => {
  it("retorna 0 para senha vazia", () => {
    expect(getPasswordStrength("")).toBe(0);
  });

  it("retorna score alto para senha forte", () => {
    expect(getPasswordStrength("SenhaForte@123")).toBe(4);
  });

  it("retorna score baixo para senha fraca", () => {
    expect(getPasswordStrength("abc")).toBeLessThanOrEqual(1);
  });
});