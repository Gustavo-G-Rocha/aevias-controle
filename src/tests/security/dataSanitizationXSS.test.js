/**
 * Segurança — Defesa XSS/SSTI avançada (dataSanitization.js)
 *
 * Cenários de ataque mais sofisticados que o teste base não cobre:
 * - Tags aninhadas e encodadas
 * - SVG/MathML com scripts embarcados
 * - Polyglot vectors (HTML + JS + template)
 * - sanitizeTextFields com arrays de strings
 * - maxLength aplicado após sanitização
 * - Múltiplas injeções no mesmo payload
 */
import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  sanitizeTextFields,
} from '@/utils/dataSanitization';

describe('sanitizeText — vetores XSS avançados', () => {
  it('remove <script> com atributos e conteúdo complexo', () => {
    const payload = '<script type="text/javascript">var x = "evil"; fetch("/steal")</script>';
    expect(sanitizeText(payload)).toBe('');
  });

  it('remove <script> com espaços antes do nome da tag', () => {
    expect(sanitizeText('<  script>alert(1)</  script>')).toBe('');
  });

  it('remove <iframe> com atributos maliciosos', () => {
    const payload = '<iframe src="javascript:alert(1)" style="display:none">x</iframe>';
    expect(sanitizeText(payload)).toBe('');
  });

  it('remove <object> com conteúdo', () => {
    expect(sanitizeText('<object data="evil.swf">fallback</object>')).toBe('');
  });

  it('remove <embed> tag', () => {
    expect(sanitizeText('<embed src="evil.swf">')).toBe('');
  });

  it('remove <style> com CSS malicioso (CSS injection)', () => {
    expect(sanitizeText('<style>body{background:url(javascript:alert(1))}</style>')).toBe('');
  });

  it('remove <svg> com script embarcado', () => {
    const payload = '<svg><script>alert(1)</script></svg>';
    const result = sanitizeText(payload);
    expect(result).not.toContain('alert');
    expect(result).not.toContain('<script');
  });

  it('remove <math> tag (MathML XSS vector)', () => {
    const payload = '<math href="javascript:alert(1)">click</math>';
    const result = sanitizeText(payload);
    expect(result).not.toContain('javascript:');
  });

  it('remove <template> tag', () => {
    expect(sanitizeText('<template id="x">content</template>')).toBe('');
  });

  it('remove <noscript> tag', () => {
    expect(sanitizeText('<noscript>content</noscript>')).toBe('');
  });

  it('remove <link> tag (self-closing)', () => {
    const result = sanitizeText('<link rel="stylesheet" href="evil.css">');
    expect(result).not.toContain('<link');
  });

  it('remove <meta> tag (refresh redirect)', () => {
    const result = sanitizeText('<meta http-equiv="refresh" content="0;url=evil.com">');
    expect(result).not.toContain('<meta');
  });

  it('remove <base> tag (href hijack)', () => {
    const result = sanitizeText('<base href="https://evil.com/">');
    expect(result).not.toContain('<base');
  });

  it('remove <form> tag (form hijack)', () => {
    const result = sanitizeText('<form action="https://evil.com/steal"><button>Submit</button></form>');
    expect(result).not.toContain('<form');
  });
});

describe('sanitizeText — vetores poliglotas', () => {
  it('neutraliza polyglot HTML/JS/template', () => {
    const polyglot = '"><script>{{7*7}}</script>';
    const result = sanitizeText(polyglot);
    expect(result).not.toContain('<script');
    expect(result).not.toContain('{{');
  });

  it('neutraliza template injection com condição', () => {
    const payload = '{{constructor.constructor("return process")()}}';
    const result = sanitizeText(payload);
    expect(result).not.toContain('{{');
    expect(result).not.toContain('}}');
  });

  it('neutraliza mistura de HTML + template + JS', () => {
    const payload = '<script><%= evil() %>{{7*7}}</script>';
    const result = sanitizeText(payload);
    expect(result).toBe('');
  });

  it('preserva texto legítimo com símbolos matemáticos', () => {
    expect(sanitizeText('Equação: 2 + 2 = 4, resultado = 4')).toBe('Equação: 2 + 2 = 4, resultado = 4');
  });
});

describe('sanitizeText — múltiplas injeções no mesmo payload', () => {
  it('remove múltiplos blocos <script> no mesmo texto', () => {
    const payload = 'texto1<script>a()</script>texto2<script>b()</script>texto3';
    const result = sanitizeText(payload);
    expect(result).toBe('texto1texto2texto3');
  });

  it('remove script + iframe + event handler no mesmo payload', () => {
    const payload = '<script>x()</script><iframe src="evil"></iframe><img onerror=alert(1)>';
    const result = sanitizeText(payload);
    // script e iframe são removidos integralmente; onerror handler é removido
    // <img> não é tag perigosa — é preservada como texto (React escapa na renderização)
    expect(result).not.toContain('<script');
    expect(result).not.toContain('<iframe');
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('alert');
  });

  it('remove injeção mista preservando texto legítimo entre elas', () => {
    const payload = 'Observação<script>evil()</script> válida<iframe>x</iframe> do dia';
    const result = sanitizeText(payload);
    expect(result).toBe('Observação válida do dia');
  });
});

describe('sanitizeText — maxLength aplicado após sanitização', () => {
  it('maxLength corta texto após remover script', () => {
    const longPayload = 'a'.repeat(200) + '<script>evil()</script>' + 'b'.repeat(200);
    const result = sanitizeText(longPayload, { maxLength: 50 });
    expect(result.length).toBe(50);
    expect(result).not.toContain('script');
  });

  it('maxLength default é 10000', () => {
    const payload = 'a'.repeat(9000) + '<script>evil()</script>' + 'b'.repeat(2000);
    const result = sanitizeText(payload);
    expect(result.length).toBeLessThanOrEqual(10000);
    expect(result).not.toContain('script');
  });
});

describe('sanitizeTextFields — arrays e estruturas complexas', () => {
  it('sanitiza array de strings diretamente', () => {
    const input = ['<script>x</script>limpo', 'normal'];
    const result = sanitizeTextFields(input);
    expect(result[0]).toBe('limpo');
    expect(result[1]).toBe('normal');
  });

  it('sanitiza objeto com array de strings aninhado', () => {
    const input = {
      observacoes: '<iframe>evil</iframe>',
      anexos: ['<script>x</script>', 'texto normal'],
    };
    const result = sanitizeTextFields(input);
    expect(result.observacoes).toBe('');
    expect(result.anexos[0]).toBe('');
    expect(result.anexos[1]).toBe('texto normal');
  });

  it('sanitiza array de objetos com strings', () => {
    const input = [
      { descricao: '<script>alert(1)</script>texto' },
      { descricao: '<iframe src="x"></iframe>limpo' },
    ];
    const result = sanitizeTextFields(input);
    expect(result[0].descricao).toBe('texto');
    expect(result[1].descricao).toBe('limpo');
  });

  it('preserva números e booleans em estrutura mista', () => {
    const input = {
      texto: '<script>x</script>limpo',
      numero: 42,
      boolean: true,
      nulo: null,
    };
    const result = sanitizeTextFields(input);
    expect(result.texto).toBe('limpo');
    expect(result.numero).toBe(42);
    expect(result.boolean).toBe(true);
    expect(result.nulo).toBe(null);
  });

  it('não modifica objeto original (imutabilidade)', () => {
    const input = { texto: '<script>x</script>' };
    const result = sanitizeTextFields(input);
    expect(input.texto).toBe('<script>x</script>');
    expect(result.texto).toBe('');
    expect(result).not.toBe(input);
  });

  it('trata array vazio', () => {
    expect(sanitizeTextFields([])).toEqual([]);
  });

  it('trata objeto vazio', () => {
    expect(sanitizeTextFields({})).toEqual({});
  });
});