import { describe, it, expect } from "vitest";
import {
  normalizeText,
  emailLocalPart,
  nameToEmailSlug,
  emailMatchesName,
  matchDuplicateUsers,
  resolveUserIdentity,
} from "@/utils/userIdentityResolver";

describe("normalizeText", () => {
  it("remove acentos, caixa e espaços extras", () => {
    expect(normalizeText("  Mário   Paredes  ")).toBe("mario paredes");
  });
  it("trata valores inválidos", () => {
    expect(normalizeText(null)).toBe("");
    expect(normalizeText(undefined)).toBe("");
    expect(normalizeText(123)).toBe("");
  });
});

describe("emailLocalPart / nameToEmailSlug", () => {
  it("extrai parte local do email", () => {
    expect(emailLocalPart("mario.paredes@afirmaevias.com.br")).toBe("mario.paredes");
  });
  it("retorna vazio para não-email", () => {
    expect(emailLocalPart("Mario Paredes")).toBe("");
  });
  it("deriva slug do nome", () => {
    expect(nameToEmailSlug("Mario Paredes")).toBe("mario.paredes");
    expect(nameToEmailSlug("João da Silva")).toBe("joao.da.silva");
  });
});

describe("emailMatchesName", () => {
  it("casa nome com email padrão nome.sobrenome", () => {
    expect(emailMatchesName("Mario Paredes", "mario.paredes@dominio.com")).toBe(true);
  });
  it("aceita separadores _ e - na parte local", () => {
    expect(emailMatchesName("Mario Paredes", "mario_paredes@x.com")).toBe(true);
    expect(emailMatchesName("Mario Paredes", "mario-paredes@x.com")).toBe(true);
  });
  it("não casa quando a parte local difere do nome", () => {
    expect(emailMatchesName("Mario Paredes", "outro.nome@x.com")).toBe(false);
  });
});

describe("matchDuplicateUsers", () => {
  it("nome preenchido + registro com nome nulo (só email compatível) = mesma pessoa", () => {
    const a = { name: "Mario Paredes", email: "mario.paredes@dominio.com" };
    const b = { name: null, email: "mario.paredes@dominio2.com" };
    expect(matchDuplicateUsers(a, b)).toBe(true);
  });

  it("email com variação de domínio (mesma parte local) = mesma pessoa", () => {
    const a = { name: null, email: "mario.paredes@dominio.com" };
    const b = { name: null, email: "mario.paredes@outro.com.br" };
    expect(matchDuplicateUsers(a, b)).toBe(true);
  });

  it("mesmo email exato = mesma pessoa", () => {
    const a = { name: null, email: "x.y@z.com" };
    const b = { name: null, email: "x.y@z.com" };
    expect(matchDuplicateUsers(a, b)).toBe(true);
  });

  it("nomes iguais SEM email não são unidos apenas quando há email divergente", () => {
    // homônimos com emails de origens diferentes que NÃO derivam do nome
    const a = { name: "Ana Souza", email: "ana.souza@x.com" };
    const b = { name: "Ana Souza", email: "asouza99@x.com" };
    // b.email não deriva de "ana.souza" -> não deve unir por segurança
    expect(matchDuplicateUsers(a, b)).toBe(false);
  });

  it("nomes iguais ambos sem email são tratados como o mesmo item (comportamento legado)", () => {
    const a = { name: "Ana Souza", email: null };
    const b = { name: "Ana Souza", email: null };
    expect(matchDuplicateUsers(a, b)).toBe(true);
  });

  it("pessoas realmente distintas não são unidas", () => {
    const a = { name: "Mario Paredes", email: "mario.paredes@x.com" };
    const b = { name: "Carlos Lima", email: "carlos.lima@x.com" };
    expect(matchDuplicateUsers(a, b)).toBe(false);
  });

  it("email que não segue padrão nome.sobrenome não casa com nome", () => {
    const a = { name: "Mario Paredes", email: "mario.paredes@x.com" };
    const b = { name: null, email: "mp2024@x.com" };
    expect(matchDuplicateUsers(a, b)).toBe(false);
  });

  it("retorna false para entradas nulas", () => {
    expect(matchDuplicateUsers(null, { name: "x" })).toBe(false);
    expect(matchDuplicateUsers({ name: "x" }, null)).toBe(false);
  });
});

describe("resolveUserIdentity", () => {
  it("agrupa nome + email nulo da mesma pessoa em um único item com múltiplos ids", () => {
    const raw = ["Mario Paredes", "mario.paredes@afirmaevias.com.br"];
    const resolved = resolveUserIdentity(raw);
    expect(resolved).toHaveLength(1);
    expect(resolved[0].displayName).toBe("Mario Paredes");
    expect(resolved[0].identifiers.sort()).toEqual(
      ["Mario Paredes", "mario.paredes@afirmaevias.com.br"].sort()
    );
  });

  it("mantém pessoas distintas separadas", () => {
    const raw = ["Mario Paredes", "carlos.lima@x.com"];
    const resolved = resolveUserIdentity(raw);
    expect(resolved).toHaveLength(2);
  });

  it("caso de borda: mais de 2 registros duplicados da mesma pessoa", () => {
    const raw = [
      "Mario Paredes",
      "mario.paredes@dominio.com",
      "mario.paredes@dominio2.com.br",
    ];
    const resolved = resolveUserIdentity(raw);
    expect(resolved).toHaveLength(1);
    expect(resolved[0].identifiers).toHaveLength(3);
  });

  it("caso de borda: emails fora do padrão nome.sobrenome ficam separados", () => {
    const raw = ["Mario Paredes", "mp_lab@x.com"];
    const resolved = resolveUserIdentity(raw);
    expect(resolved).toHaveLength(2);
  });

  it("caso de borda: homônimos com emails distintos permanecem separados", () => {
    const raw = ["ana.souza@x.com", "ana.souza.silva@y.com"];
    const resolved = resolveUserIdentity(raw);
    // partes locais diferentes (ana.souza vs ana.souza.silva) -> distintos
    expect(resolved).toHaveLength(2);
  });

  it("ignora valores nulos/vazios e deduplica", () => {
    const raw = ["Mario Paredes", "", null, "Mario Paredes"];
    const resolved = resolveUserIdentity(raw);
    expect(resolved).toHaveLength(1);
  });

  it("ordena por displayName", () => {
    const raw = ["Zeca", "Ana"];
    const resolved = resolveUserIdentity(raw);
    expect(resolved.map((r) => r.displayName)).toEqual(["Ana", "Zeca"]);
  });
});