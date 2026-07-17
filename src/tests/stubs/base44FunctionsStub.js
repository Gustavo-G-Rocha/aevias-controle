/**
 * Stub dos módulos virtuais `@/functions/*` (backend functions do Base44).
 *
 * Em runtime, o vite-plugin do Base44 gera esses módulos; no ambiente de
 * testes (vitest/node) eles não existem. Este stub exporta todas as funções
 * usadas no código como mocks async, permitindo que os módulos que as
 * importam sejam carregados. Testes que precisam de comportamento específico
 * devem usar vi.mock('@/functions/<nome>') no próprio arquivo de teste.
 */
import { vi } from 'vitest';

const makeStub = () => vi.fn(async () => ({ data: {}, status: 200 }));

export const assinarEletronicamente = makeStub();
export const carregarRegistrosSupervisor = makeStub();
export const excluirMinhaConta = makeStub();
export const gerenciarAprovacao = makeStub();
export const validarESalvarRegistro = makeStub();
export const validarUploadArquivo = makeStub();
export const verificarAssinatura = makeStub();