/**
 * Resolução de identidade de usuário (laboratoristas) para o Relatório Unificado.
 *
 * Contexto: a lista de laboratoristas é montada a partir dos registros. Como o
 * campo `laboratorista_name` pode estar nulo em registros antigos, a mesma
 * pessoa física pode aparecer como itens distintos — um pelo nome de exibição
 * (ex: "Mario Paredes") e outro pelo email (ex: "mario.paredes@dominio.com").
 *
 * Estas funções são PURAS e isoladas para serem testáveis, sem acoplamento ao
 * componente de seleção. Elas NÃO alteram registros no banco — apenas agrupam
 * identificadores na camada de apresentação/seleção.
 */

/**
 * Normaliza um texto para comparação: minúsculas, sem acentos, espaços colapsados.
 * @param {string} value
 * @returns {string}
 */
export const normalizeText = (value) => {
  if (!value || typeof value !== "string") return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
};

/**
 * Extrai a parte local de um email (antes do @), normalizada.
 * @param {string} email
 * @returns {string}
 */
export const emailLocalPart = (email) => {
  if (!email || typeof email !== "string" || !email.includes("@")) return "";
  return normalizeText(email.split("@")[0]);
};

/**
 * Deriva o "slug" esperado do email a partir de um nome de exibição.
 * Ex: "Mario Paredes" -> "mario.paredes"
 * @param {string} name
 * @returns {string}
 */
export const nameToEmailSlug = (name) => {
  const normalized = normalizeText(name);
  if (!normalized) return "";
  return normalized.split(" ").filter(Boolean).join(".");
};

/**
 * Verifica se a parte local de um email é compatível com um nome de exibição.
 * Aceita separadores '.', '_', '-' entre as partes do nome.
 * @param {string} name  Nome de exibição (ex: "Mario Paredes")
 * @param {string} email Email completo (ex: "mario.paredes@dominio.com")
 * @returns {boolean}
 */
export const emailMatchesName = (name, email) => {
  const local = emailLocalPart(email);
  const slug = nameToEmailSlug(name);
  if (!local || !slug) return false;
  // Normaliza separadores da parte local para comparar com o slug (base em '.').
  const localAsSlug = local.replace(/[_\-.]+/g, ".");
  return localAsSlug === slug;
};

/**
 * Decide se dois identificadores (cada um: nome de exibição OU email) pertencem
 * à mesma pessoa física, segundo o critério de negócio:
 *   - mesmo nome (ou um dos dois sem nome); E
 *   - email compatível com o padrão do nome (permitindo variação de domínio).
 *
 * Regras de segurança:
 *   - Dois nomes iguais SEM nenhum email de apoio NÃO são unificados
 *     (podem ser pessoas distintas com nome igual).
 *   - Dois emails de pessoas com nome derivável igual são unificados apenas se
 *     as partes locais forem equivalentes.
 *
 * @param {{name?: string|null, email?: string|null}} a
 * @param {{name?: string|null, email?: string|null}} b
 * @returns {boolean}
 */
export const matchDuplicateUsers = (a, b) => {
  if (!a || !b) return false;

  const nameA = normalizeText(a.name);
  const nameB = normalizeText(b.name);
  const emailA = normalizeText(a.email);
  const emailB = normalizeText(b.email);

  // Caso trivial: mesmo email exato -> mesma pessoa.
  if (emailA && emailB && emailA === emailB) return true;

  // Ambos têm nome preenchido e iguais (tem precedência sobre a regra nome+email,
  // pois é o caso mais sujeito a homônimos e exige checagem mais restritiva).
  if (nameA && nameB && nameA === nameB) {
    // Sem nenhum email: comportamento legado (Set por string) tratava nomes
    // iguais como o mesmo item -> unifica.
    if (!emailA && !emailB) return true;
    // Ambos com email: só é a mesma pessoa se AMBOS derivarem do nome (ou forem
    // iguais). Se um deles não deriva, são homônimos distintos.
    if (emailA && emailB) {
      return emailMatchesName(nameA, emailA) && emailMatchesName(nameB, emailB);
    }
    // Apenas um lado tem email: ele precisa derivar do nome para unificar.
    const soleEmail = emailA || emailB;
    return emailMatchesName(nameA, soleEmail);
  }

  // Nome + email: um lado tem nome, o outro tem email compatível com esse nome
  // (cobre o bug: registro com nome nulo casando com o nome de exibição).
  if (nameA && emailB && emailMatchesName(nameA, emailB)) return true;
  if (nameB && emailA && emailMatchesName(nameB, emailA)) return true;

  // Ambos são emails cujas partes locais derivam do mesmo nome (variação de domínio).
  if (emailA && emailB) {
    const localA = emailLocalPart(emailA).replace(/[_\-.]+/g, ".");
    const localB = emailLocalPart(emailB).replace(/[_\-.]+/g, ".");
    if (localA && localA === localB) return true;
  }

  return false;
};

/**
 * Interpreta um identificador cru (string vinda dos registros) como {name, email}.
 * Strings com '@' são tratadas como email; caso contrário, como nome de exibição.
 * @param {string} raw
 * @returns {{raw: string, name: string|null, email: string|null}}
 */
const parseIdentifier = (raw) => {
  const value = (raw ?? "").toString();
  const isEmail = value.includes("@");
  return {
    raw: value,
    name: isEmail ? null : value || null,
    email: isEmail ? value : null,
  };
};

/**
 * Recebe uma lista de identificadores crus (nomes e/ou emails, como hoje) e
 * retorna uma lista resolvida onde cada item agrupa todos os identificadores
 * pertencentes à mesma pessoa física.
 *
 * @param {string[]} rawIdentifiers
 * @returns {Array<{displayName: string, identifiers: string[]}>}
 */
export const resolveUserIdentity = (rawIdentifiers) => {
  const unique = Array.from(
    new Set((rawIdentifiers || []).filter((v) => v != null && v !== ""))
  );
  const parsed = unique.map(parseIdentifier);

  const groups = []; // { members: parsed[] }

  parsed.forEach((item) => {
    const group = groups.find((g) =>
      g.members.some((m) => matchDuplicateUsers(m, item))
    );
    if (group) {
      group.members.push(item);
    } else {
      groups.push({ members: [item] });
    }
  });

  return groups
    .map((g) => {
      // displayName: prefere um nome de exibição; senão, o primeiro identificador.
      const withName = g.members.find((m) => m.name);
      const displayName = withName ? withName.name : g.members[0].raw;
      const identifiers = g.members.map((m) => m.raw);
      return { displayName, identifiers };
    })
    .sort((a, b) =>
      a.displayName.localeCompare(b.displayName, "pt-BR", { sensitivity: "base" })
    );
};