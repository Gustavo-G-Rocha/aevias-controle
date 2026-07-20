/**
 * Stub do cliente Base44 (`@/api/base44Client`) para o ambiente de testes.
 *
 * Em runtime, o cliente real do SDK é criado com parâmetros vindos da URL
 * do browser e faz chamadas de rede na inicialização — em Node/vitest isso
 * gera "Invalid URL" e trava a suíte com timeouts.
 *
 * Este stub expõe um proxy recursivo: qualquer caminho acessado
 * (base44.entities.X.list(), base44.auth.me(), base44.integrations.Core.*)
 * é uma função async que resolve para null. Testes que precisam de
 * comportamento específico devem usar vi.mock('@/api/base44Client').
 */
const makeProxy = () => {
  const fn = async () => null;
  return new Proxy(fn, {
    get(_target, prop) {
      if (prop === 'then') return undefined; // não parecer thenable
      return makeProxy();
    },
    apply() {
      return Promise.resolve(null);
    },
  });
};

export const base44 = makeProxy();