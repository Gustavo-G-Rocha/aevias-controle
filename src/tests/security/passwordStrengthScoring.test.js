/**
 * Segurança — Score de força de senha (passwordPolicy.js)
 *
 * O score (0-4) alimenta indicadores visuais. Cobertura profunda dos
 * limiares de pontuação garante que uma senha "média" não apareça como
 * "forte" (falsa sensação de segurança) nem que uma forte apareça fraca.
 *
 * Regras de score (getPasswordStrength):
 *   +1 se length >= 8
 *   +1 se length >= 12
 *   +1 se tem maiúscula E minúscula
 *   +1 se tem número E caractere especial
 *   cap em 4
 */
import { describe, it, expect } from 'vitest';
import {
  getPasswordStrength,
  getPasswordCriteria,
  validatePasswordComplexity,
  PASSWORD_RULES,
} from '../../utils/passwordPolicy.js';

describe('getPasswordStrength — limiares de pontuação', () => {
  it('0 para string vazia', () => {
    expect(getPasswordStrength('')).toBe(0);
  });
  it('0 para null/undefined (não quebra)', () => {
    expect(getPasswordStrength(null)).toBe(0);
    expect(getPasswordStrength(undefined)).toBe(0);
  });
  it('1 para senha com 8+ chars mas só um tipo de caractere', () => {
    // "aaaaaaaa" → length>=8 (+1), <12, sem mix case, sem número+especial
    expect(getPasswordStrength('aaaaaaaa')).toBe(1);
  });
  it('2 para senha com 12+ chars mas sem mix/num+esp', () => {
    // "aaaaaaaaaaaa" → length>=8 (+1) e >=12 (+1)
    expect(getPasswordStrength('aaaaaaaaaaaa')).toBe(2);
  });
  it('2 para length>=8 + mix case (sem num+esp, sem 12)', () => {
    // "Aaaaaaaaaa" → length>=8 (+1), <12, mix case (+1) = 2
    expect(getPasswordStrength('Aaaaaaaaaa')).toBe(2);
  });
  it('3 para length>=12 + mix case', () => {
    // "Aaaaaaaaaaaa" → length>=8(+1), >=12(+1), mix(+1) = 3
    expect(getPasswordStrength('Aaaaaaaaaaaa')).toBe(3);
  });
  it('3 para length>=8 + mix + num+esp (sem 12)', () => {
    // "Aa1!aaaa" → length>=8(+1), <12, mix(+1), num+esp(+1) = 3
    expect(getPasswordStrength('Aa1!aaaa')).toBe(3);
  });
  it('4 para senha forte (length>=12 + mix + num + esp)', () => {
    expect(getPasswordStrength('SenhaForte@123')).toBe(4);
  });
  it('cap em 4 mesmo com características extras', () => {
    expect(getPasswordStrength('SenhaMuitoForte@123456789!')).toBe(4);
  });
  it('número sem especial não pontua o 4º critério', () => {
    // "Aa1aaaaaaa" → length>=8(+1), mix(+1), mas sem especial → não ganha num+esp
    expect(getPasswordStrength('Aa1aaaaaaa')).toBe(2);
  });
  it('especial sem número não pontua o 4º critério', () => {
    // "Aa!aaaaaaa" → length>=8(+1), mix(+1), mas sem número → 2
    expect(getPasswordStrength('Aa!aaaaaaa')).toBe(2);
  });
});

describe('getPasswordCriteria — cada critério individual', () => {
  const allKeys = ['length', 'uppercase', 'lowercase', 'number', 'special', 'notEmail', 'maxLength'];

  it('retorna exatamente os 7 critérios esperados', () => {
    const criteria = getPasswordCriteria('Aa1!aaaa', 'user@test.com');
    expect(criteria.map((c) => c.key).sort()).toEqual([...allKeys].sort());
  });

  it('length atendido em >= 8, não atendido em < 8', () => {
    expect(getPasswordCriteria('Aa1!aaa').find((c) => c.key === 'length').met).toBe(false);
    expect(getPasswordCriteria('Aa1!aaaa').find((c) => c.key === 'length').met).toBe(true);
  });

  it('maxLength atendido em <= 128, não atendido em > 128', () => {
    const ok = 'A'.repeat(128);
    const over = 'A'.repeat(129);
    expect(getPasswordCriteria(ok).find((c) => c.key === 'maxLength').met).toBe(true);
    expect(getPasswordCriteria(over).find((c) => c.key === 'maxLength').met).toBe(false);
  });

  it('notEmail é case-insensitive e trim-aware', () => {
    const email = 'Usuario@Teste.com';
    // senha igual ao email (apenas case) → não atendido
    const crit = getPasswordCriteria('usuario@teste.com', email);
    expect(crit.find((c) => c.key === 'notEmail').met).toBe(false);
    // senha diferente → atendido
    const crit2 = getPasswordCriteria('OutraSenha@1', email);
    expect(crit2.find((c) => c.key === 'notEmail').met).toBe(true);
  });

  it('notEmail atendido quando email vazio e senha não-vazia', () => {
    const crit = getPasswordCriteria('Senha@123', '');
    expect(crit.find((c) => c.key === 'notEmail').met).toBe(true);
  });

  it('notEmail NÃO atendido quando senha é só espaços (trim vazio)', () => {
    const crit = getPasswordCriteria('   ', 'user@test.com');
    expect(crit.find((c) => c.key === 'notEmail').met).toBe(false);
  });
});

describe('validatePasswordComplexity — edge cases de segurança', () => {
  it('DoS protection: senha de 129 chars rejeitada por máximo', () => {
    const longPwd = 'Aa1!' + 'a'.repeat(125);
    expect(longPwd.length).toBe(129);
    const result = validatePasswordComplexity(longPwd);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('máximo'))).toBe(true);
  });

  it('senha exatamente no limite (128) é aceita se cumpre demais regras', () => {
    const pwd = 'Aa1!' + 'a'.repeat(124);
    expect(pwd.length).toBe(128);
    const result = validatePasswordComplexity(pwd);
    expect(result.valid).toBe(true);
  });

  it('senha exatamente no mínimo (8) é aceita se cumpre demais regras', () => {
    expect(validatePasswordComplexity('Aa1!aaaa').valid).toBe(true);
  });

  it('senha só com espaços produz erro específico de espaços', () => {
    const result = validatePasswordComplexity('        ');
    expect(result.errors.some((e) => e.includes('espaços'))).toBe(true);
  });

  it('email-identical é case-insensitive', () => {
    const email = 'USER@TEST.COM';
    const result = validatePasswordComplexity('user@test.com', email);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('e-mail'))).toBe(true);
  });

  it('erros acumulam (senha curta E sem tudo)', () => {
    const result = validatePasswordComplexity('ab');
    // curta + sem maiúscula + sem minúscula(falsa: tem 'a') + sem número + sem especial
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
    expect(result.valid).toBe(false);
  });

  it('PASSWORD_RULES constantes estão consistentes', () => {
    expect(PASSWORD_RULES.minLength).toBe(8);
    expect(PASSWORD_RULES.maxLength).toBe(128);
    expect(PASSWORD_RULES.requireUppercase).toBe(true);
    expect(PASSWORD_RULES.requireLowercase).toBe(true);
    expect(PASSWORD_RULES.requireNumber).toBe(true);
    expect(PASSWORD_RULES.requireSpecial).toBe(true);
  });
});