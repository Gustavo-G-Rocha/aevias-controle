/**
 * tests/security/backendSanitization.test.js
 *
 * Teste de contrato (source-based) para a sanitização server-side em
 * validarESalvarRegistro. Verifica que o backend aplica a mesma política
 * de sanitização XSS do front-end — defense-in-depth que não confia
 * apenas no client.
 *
 * Ambiente 'node' — validação via leitura do source do backend function.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendSrc = readFileSync(
  resolve(__dirname, '../../../base44/functions/validarESalvarRegistro/entry.ts'),
  'utf-8'
);

describe('Backend sanitization — validarESalvarRegistro', () => {
  it('define função sanitizeText server-side', () => {
    expect(backendSrc).toContain('sanitizeText');
  });

  it('remove caracteres de controle (bypass via encoding)', () => {
    expect(backendSrc).toContain('\\x00');
    expect(backendSrc).toContain('\\x1F');
  });

  it('remove blocos de tags perigosas com conteúdo', () => {
    expect(backendSrc).toContain('DANGEROUS_TAGS');
    expect(backendSrc).toMatch(/script.*iframe.*object.*embed.*style.*svg/s);
  });

  it('remove tags perigosas void (link, meta, base, form)', () => {
    expect(backendSrc).toContain('DANGEROUS_VOID_TAGS');
    expect(backendSrc).toContain('link');
    expect(backendSrc).toContain('meta');
    expect(backendSrc).toContain('base');
    expect(backendSrc).toContain('form');
  });

  it('remove event handlers (onerror=, onclick=, onload=)', () => {
    expect(backendSrc).toContain('on\\w+');
    expect(backendSrc).toContain('\\s*=');
  });

  it('remove protocolo javascript:', () => {
    expect(backendSrc).toContain('javascript:');
  });

  it('remove protocolo vbscript:', () => {
    expect(backendSrc).toContain('vbscript:');
  });

  it('neutraliza data:text/html', () => {
    expect(backendSrc).toContain('data:text');
    expect(backendSrc).toContain('html');
  });

  it('neutraliza sintaxe de template engine (SSTI)', () => {
    // Chaves duplas aparecem escapadas no regex: \{\{
    expect(backendSrc).toContain('{ {');
    expect(backendSrc).toContain('< %');
    expect(backendSrc).toContain('% >');
  });

  it('aplica limite de tamanho (10000 chars)', () => {
    expect(backendSrc).toContain('10000');
    expect(backendSrc).toContain('substring');
  });

  it('aplica sanitização recursiva via sanitizeTextFields', () => {
    expect(backendSrc).toContain('sanitizeTextFields');
    expect(backendSrc).toMatch(/Array\.isArray.*map.*sanitizeTextFields/);
  });

  it('sanitiza dados ANTES de persistir (create/update)', () => {
    // sanitizedData é usado nas chamadas de create e update
    expect(backendSrc).toContain('sanitizedData');
    expect(backendSrc).toMatch(/create\(sanitizedData\)/);
    expect(backendSrc).toMatch(/update\(recordId,\s*sanitizedData\)/);
  });
});

describe('Backend sanitization — gerenciarAprovacao (rejectionReason)', () => {
  const aprovSrc = readFileSync(
    resolve(__dirname, '../../../base44/functions/gerenciarAprovacao/entry.ts'),
    'utf-8'
  );

  it('extrai rejectionReason do body e sanitiza antes de usar', () => {
    expect(aprovSrc).toContain('rejectionReason');
    expect(aprovSrc).toContain('sanitizeTextR');
    expect(aprovSrc).toContain('rawRejectionReason');
  });

  it('aplica mesma política de sanitização do validarESalvarRegistro', () => {
    expect(aprovSrc).toContain('DANGEROUS_TAGS_R');
    expect(aprovSrc).toContain('\\x00');
    expect(aprovSrc).toContain('javascript:');
    expect(aprovSrc).toContain('vbscript:');
  });

  it('sanitiza rejectionReason antes de atribuir a updateData', () => {
    // A variável rejectionReason (sanitizada) é usada em updateData.rejection_reason
    // e updateData.cliente_reprovacao_motivo
    expect(aprovSrc).toContain('updateData.rejection_reason = rejectionReason');
    expect(aprovSrc).toContain('updateData.cliente_reprovacao_motivo = rejectionReason');
  });
});