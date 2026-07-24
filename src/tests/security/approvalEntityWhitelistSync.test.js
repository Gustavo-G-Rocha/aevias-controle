/**
 * tests/security/approvalEntityWhitelistSync.test.js
 *
 * Guarda contra a regressão que bloqueou a aprovação de EnsaioTaxaInsumos:
 * a entidade existia no sistema (ALL_RECORD_ENTITIES) mas não estava na
 * whitelist do backend de assinatura (assinarEletronicamente), então o
 * fluxo "approve" — que delega para esse adapter — falhava com
 * "Entidade não suportada".
 *
 * Regra: toda entidade de registro carregável pelo frontend DEVE estar na
 * whitelist de ambas as backend functions (gerenciarAprovacao e
 * assinarEletronicamente). Além disso, as duas whitelists devem ser iguais
 * entre si — a ação `approve` delega de uma para a outra, então qualquer
 * divergência vira um ponto cego de aprovação.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ALL_RECORD_ENTITIES } from '@/services/recordsService';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');

// Extrai os nomes de entidade (strings entre aspas simples) que aparecem
// dentro do bloco `const ALLOWED_ENTITIES = [ ... ];` de um arquivo .ts.
function extractWhitelist(fileContent) {
  const match = fileContent.match(/const\s+ALLOWED_ENTITIES\s*=\s*\[([\s\S]*?)\];/);
  if (!match) return [];
  const tokens = match[1].match(/'([A-Za-z0-9_]+)'/g) || [];
  return tokens.map((t) => t.replace(/'/g, ''));
}

const gerenciarPath = 'base44/functions/gerenciarAprovacao/entry.ts';
const assinarPath = 'base44/functions/assinarEletronicamente/entry.ts';

describe('sincronia das whitelists de aprovação/assinatura', () => {
  const gerenciarWhitelist = extractWhitelist(read(gerenciarPath));
  const assinarWhitelist = extractWhitelist(read(assinarPath));

  it('assinarEletronicamente aceita toda entidade que gerenciarAprovacao pode rotear', () => {
    // A ação `approve` em gerenciarAprovacao delega para assinarEletronicamente.
    // Logo, toda entidade da whitelist de gerenciar DEVE também estar na de
    // assinar — senão a aprovação quebra para essa entidade (o bug original).
    const assinarSet = new Set(assinarWhitelist);
    const roteadasSemAssinatura = gerenciarWhitelist.filter((e) => !assinarSet.has(e));
    expect(roteadasSemAssinatura).toEqual([]);
  });

  it('EnsaioTaxaInsumos está em ambas as whitelists (regressão do bug)', () => {
    expect(gerenciarWhitelist).toContain('EnsaioTaxaInsumos');
    expect(assinarWhitelist).toContain('EnsaioTaxaInsumos');
  });

  it('toda entidade de registro do frontend está nas whitelists do backend', () => {
    // ALL_RECORD_ENTITIES cobre ensaios, checklists, diário e afins.
    // Cada uma precisa poder ser aprovada/assinada — senão o fluxo quebra
    // exatamente como quebrou para EnsaioTaxaInsumos.
    const missingGerenciar = ALL_RECORD_ENTITIES.filter((e) => !gerenciarWhitelist.includes(e));
    const missingAssinar = ALL_RECORD_ENTITIES.filter((e) => !assinarWhitelist.includes(e));
    expect({ missingGerenciar, missingAssinar }).toEqual({
      missingGerenciar: [],
      missingAssinar: [],
    });
  });
});