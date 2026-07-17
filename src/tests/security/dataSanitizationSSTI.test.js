/**
 * Segurança — Sanitização: SSTI, caracteres de controle, DoS de tamanho
 * (dataSanitization.js)
 *
 * Cobre vetores além do XSS armazenado:
 *   - SSTI (Server-Side Template Injection): {{ }} e <% %> neutralizados
 *   - Caracteres de controle (bypass via encoding alternativo)
 *   - DoS por payload excessivo (maxLength)
 *   - Sanitização recursiva de objetos aninhados
 *   - Protocolos perigosos (javascript:, vbscript:, data:text/html)
 *   - sanitizeNumber (null/NaN safety)
 */
import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  sanitizeTextFields,
  sanitizeNumber,
  sanitizeNestedNumbers,
} from '../../utils/dataSanitization.js';

describe('sanitizeText — SSTI (Server-Side Template Injection)', () => {
  it('neutraliza {{ }} (mustache/handlebars)', () => {
    const result = sanitizeText('{{constructor.constructor("return process")()}}');
    expect(result).not.toContain('{{');
    expect(result).not.toContain('}}');
    expect(result).toContain('{ {');
  });

  it('neutraliza <% %> (ERB/EJS)', () => {
    const result = sanitizeText('<%= system("rm -rf /") %>');
    expect(result).not.toContain('<%');
    expect(result).not.toContain('%>');
    expect(result).toContain('< %');
  });

  it('neutraliza template injection aninhado {{ {{ }} }}', () => {
    const result = sanitizeText('{{foo {{bar}} baz}}');
    expect(result).not.toMatch(/\{\{/);
  });
});

describe('sanitizeText — caracteres de controle', () => {
  it('remove caracteres de controle (exceto \\t \\n \\r)', () => {
    const input = 'texto\x00com\x07controle\x1F\x7F';
    const result = sanitizeText(input);
    expect(result).not.toContain('\x00');
    expect(result).not.toContain('\x07');
    expect(result).not.toContain('\x1F');
    expect(result).not.toContain('\x7F');
  });

  it('preserva tab, newline e carriage return', () => {
    const input = 'linha1\tcampo\nlinha2\rlinha3';
    const result = sanitizeText(input);
    expect(result).toContain('\t');
    expect(result).toContain('\n');
    expect(result).toContain('\r');
  });
});

describe('sanitizeText — DoS por tamanho de payload', () => {
  it('trunca para maxLength padrão (10000)', () => {
    const huge = 'a'.repeat(50000);
    const result = sanitizeText(huge);
    expect(result.length).toBe(10000);
  });

  it('respeita maxLength customizado', () => {
    const result = sanitizeText('a'.repeat(1000), { maxLength: 50 });
    expect(result.length).toBe(50);
  });

  it('não trunca strings abaixo do limite', () => {
    const result = sanitizeText('texto curto', { maxLength: 100 });
    expect(result).toBe('texto curto');
  });
});

describe('sanitizeText — protocolos perigosos', () => {
  it('remove javascript: protocol', () => {
    const result = sanitizeText('href="javascript:alert(1)"');
    expect(result.toLowerCase()).not.toContain('javascript:');
  });

  it('remove vbscript: protocol', () => {
    const result = sanitizeText('href="vbscript:msgbox(1)"');
    expect(result.toLowerCase()).not.toContain('vbscript:');
  });

  it('remove data:text/html', () => {
    const result = sanitizeText('data:text/html,<script>alert(1)</script>');
    expect(result.toLowerCase()).not.toContain('data:text/html');
  });
});

describe('sanitizeText — atributos de evento', () => {
  it('remove onerror (aspas duplas)', () => {
    const result = sanitizeText('<img src=x onerror="alert(1)">');
    expect(result.toLowerCase()).not.toContain('onerror');
    expect(result.toLowerCase()).not.toContain('alert');
  });

  it('remove onclick (aspas simples)', () => {
    const result = sanitizeText("<div onclick='steal()'>x</div>");
    expect(result.toLowerCase()).not.toContain('onclick');
    expect(result.toLowerCase()).not.toContain('steal');
  });

  it('remove onload sem aspas', () => {
    const result = sanitizeText('<body onload=alert(1)>');
    expect(result.toLowerCase()).not.toContain('onload');
  });
});

describe('sanitizeTextFields — sanitização recursiva', () => {
  it('não modifica o objeto original (imutabilidade)', () => {
    const obj = { a: '<script>x</script>', b: { c: '{{evil}}' } };
    const original = JSON.stringify(obj);
    sanitizeTextFields(obj);
    expect(JSON.stringify(obj)).toBe(original);
  });

  it('sanitiza strings em objetos aninhados', () => {
    const obj = { nivel1: { nivel2: '<script>alert(1)</script>' } };
    const result = sanitizeTextFields(obj);
    expect(result.nivel1.nivel2).not.toContain('<script>');
  });

  it('sanitiza strings dentro de arrays', () => {
    const arr = ['<script>1</script>', 'texto limpo', '<iframe src=evil></iframe>'];
    const result = sanitizeTextFields(arr);
    expect(result[0]).not.toContain('<script>');
    expect(result[1]).toBe('texto limpo');
    expect(result[2]).not.toContain('<iframe');
  });

  it('preserva números e booleanos no objeto', () => {
    const obj = { num: 42, bool: true, str: '<script>x</script>', nil: null };
    const result = sanitizeTextFields(obj);
    expect(result.num).toBe(42);
    expect(result.bool).toBe(true);
    expect(result.nil).toBeNull();
    expect(result.str).not.toContain('<script>');
  });

  it('retorna null/undefined/primitivos inalterados', () => {
    expect(sanitizeTextFields(null)).toBeNull();
    expect(sanitizeTextFields(undefined)).toBeUndefined();
    expect(sanitizeTextFields(42)).toBe(42);
  });
});

describe('sanitizeNumber — null/NaN safety', () => {
  it('retorna null para string vazia', () => {
    expect(sanitizeNumber('')).toBeNull();
  });
  it('retorna null para null/undefined', () => {
    expect(sanitizeNumber(null)).toBeNull();
    expect(sanitizeNumber(undefined)).toBeNull();
  });
  it('parseia número válido', () => {
    expect(sanitizeNumber('42.5')).toBe(42.5);
    expect(sanitizeNumber(10)).toBe(10);
  });
  it('retorna null para NaN (não propaga NaN para o banco)', () => {
    expect(sanitizeNumber('abc')).toBeNull();
    expect(sanitizeNumber('NaN')).toBeNull();
  });
});

describe('sanitizeNestedNumbers — recursivo', () => {
  it('converte strings numéricas aninhadas', () => {
    const obj = { a: '1.5', b: { c: '2', d: 'abc' } };
    const result = sanitizeNestedNumbers(obj);
    expect(result.a).toBe(1.5);
    expect(result.b.c).toBe(2);
    expect(result.b.d).toBeNull(); // 'abc' → null
  });
  it('não processa arrays (retorna inalterado)', () => {
    const arr = ['1', '2'];
    expect(sanitizeNestedNumbers(arr)).toBe(arr);
  });
  it('retorna null/undefined inalterados', () => {
    expect(sanitizeNestedNumbers(null)).toBeNull();
    expect(sanitizeNestedNumbers(undefined)).toBeUndefined();
  });
});