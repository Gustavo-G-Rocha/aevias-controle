/**
 * Política de senha — validação centralizada e reutilizável.
 *
 * Regras:
 *  - Mínimo de 8 caracteres
 *  - Ao menos 1 letra maiúscula (A-Z)
 *  - Ao menos 1 letra minúscula (a-z)
 *  - Ao menos 1 número (0-9)
 *  - Ao menos 1 caractere especial (! @ # $ % ^ & * ( ) - _ + = ?)
 *  - Não pode ser idêntica ao e-mail do usuário
 *  - Máximo de 128 caracteres (proteção contra DoS em hashing)
 *  - Não pode conter apenas espaços ou caracteres repetidos
 */

export const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
};

const SPECIAL_CHAR_REGEX = /[!@#$%^&*()\-_=+?]/;
const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const NUMBER_REGEX = /[0-9]/;

/**
 * Retorna a lista de critérios individuais com status (atendido/não atendido).
 * Útil para exibir feedback visual em tempo real.
 */
export function getPasswordCriteria(password, email = "") {
  const pwd = password || "";
  const emailLower = (email || "").toLowerCase().trim();
  const pwdTrimmed = pwd.trim();

  return [
    {
      key: "length",
      label: `Mínimo de ${PASSWORD_RULES.minLength} caracteres`,
      met: pwd.length >= PASSWORD_RULES.minLength,
    },
    {
      key: "uppercase",
      label: "Ao menos 1 letra maiúscula (A-Z)",
      met: UPPERCASE_REGEX.test(pwd),
    },
    {
      key: "lowercase",
      label: "Ao menos 1 letra minúscula (a-z)",
      met: LOWERCASE_REGEX.test(pwd),
    },
    {
      key: "number",
      label: "Ao menos 1 número (0-9)",
      met: NUMBER_REGEX.test(pwd),
    },
    {
      key: "special",
      label: "Ao menos 1 caractere especial (! @ # $ % …)",
      met: SPECIAL_CHAR_REGEX.test(pwd),
    },
    {
      key: "notEmail",
      label: "Diferente do e-mail cadastrado",
      met: pwdTrimmed.length > 0 && pwdTrimmed.toLowerCase() !== emailLower,
    },
    {
      key: "maxLength",
      label: `Máximo de ${PASSWORD_RULES.maxLength} caracteres`,
      met: pwd.length <= PASSWORD_RULES.maxLength,
    },
  ];
}

/**
 * Valida a senha e retorna { valid, errors }.
 * errors é um array de mensagens específicas (vazio se válida).
 */
export function validatePasswordComplexity(password, email = "") {
  const pwd = password || "";
  const errors = [];

  if (pwd.length < PASSWORD_RULES.minLength) {
    errors.push(`A senha deve ter no mínimo ${PASSWORD_RULES.minLength} caracteres.`);
  }
  if (pwd.length > PASSWORD_RULES.maxLength) {
    errors.push(`A senha deve ter no máximo ${PASSWORD_RULES.maxLength} caracteres.`);
  }
  if (!UPPERCASE_REGEX.test(pwd)) {
    errors.push("A senha deve conter ao menos 1 letra maiúscula.");
  }
  if (!LOWERCASE_REGEX.test(pwd)) {
    errors.push("A senha deve conter ao menos 1 letra minúscula.");
  }
  if (!NUMBER_REGEX.test(pwd)) {
    errors.push("A senha deve conter ao menos 1 número.");
  }
  if (!SPECIAL_CHAR_REGEX.test(pwd)) {
    errors.push("A senha deve conter ao menos 1 caractere especial (! @ # $ % ^ & * ( ) - _ + = ?).");
  }
  if (pwd.trim().length === 0 && pwd.length > 0) {
    errors.push("A senha não pode conter apenas espaços.");
  }
  const emailLower = (email || "").toLowerCase().trim();
  if (emailLower && pwd.trim().toLowerCase() === emailLower) {
    errors.push("A senha não pode ser idêntica ao e-mail cadastrado.");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Calcula um score de força (0-4) para indicadores visuais.
 * 0 = muito fraca, 4 = muito forte
 */
export function getPasswordStrength(password) {
  const pwd = password || "";
  if (pwd.length === 0) return 0;

  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd) && /[!@#$%^&*()\-_=+?]/.test(pwd)) score++;
  return Math.min(score, 4);
}