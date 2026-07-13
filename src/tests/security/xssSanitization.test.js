/**
 * tests/security/xssSanitization.test.js
 *
 * Suíte dedicada de testes XSS para o utilitário sanitizeText.
 * Cobertura dos payloads clássicos de Cross-Site Scripting (armazenado
 * e refletido) e Server-Side Template Injection (SSTI).
 *
 * Política: texto puro por padrão. Tags perigosas (script, iframe,
 * object, embed, etc.) são removidas com conteúdo. Event handlers,
 * protocolos perigosos e sintaxe de template são neutralizados.
 * Tags não-perigosas e texto literal são preservados — o React escapa
 * automaticamente na renderização via {}.
 */
import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeTextFields } from '@/utils/dataSanitization';

describe('XSS — Payloads clássicos', () => {
  it('<script>alert("xss")</script> — bloco removido inteiramente', () => {
    const result = sanitizeText('<script>alert("xss")</script>');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('</script');
    expect(result).not.toContain('alert');
    expect(result).not.toContain('xss');
  });

  it('<img src=x onerror=alert(1)> — event handler removido', () => {
    const result = sanitizeText('<img src=x onerror=alert(1)>');
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('alert');
  });

  it('<img src=x onerror="alert(1)"> — event handler com aspas duplas removido', () => {
    const result = sanitizeText('<img src=x onerror="alert(1)">');
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('alert');
  });

  it("<img src=x onerror='alert(1)'> — event handler com aspas simples removido", () => {
    const result = sanitizeText("<img src=x onerror='alert(1)'>");
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('alert');
  });

  it('<svg onload=alert(1)> — svg onload removido', () => {
    const result = sanitizeText('<svg onload=alert(1)>');
    expect(result).not.toContain('onload');
    expect(result).not.toContain('alert');
  });

  it('<iframe src="javascript:alert(1)"> — iframe removido', () => {
    const result = sanitizeText('<iframe src="javascript:alert(1)"></iframe>');
    expect(result).toBe('');
  });

  it('<a href="javascript:alert(1)">link</a> — protocolo javascript: removido', () => {
    const result = sanitizeText('<a href="javascript:alert(1)">link</a>');
    expect(result).not.toContain('javascript:');
    expect(result).not.toContain('alert');
  });

  it('javascript:alert(1) — protocolo isolado removido', () => {
    expect(sanitizeText('javascript:alert(1)')).toBe('alert(1)');
  });

  it('vbscript:alert(1) — protocolo vbscript removido', () => {
    expect(sanitizeText('vbscript:alert(1)')).toBe('alert(1)');
  });
});

describe('XSS — Preservação de texto legítimo', () => {
  it('Texto normal com "aspas" e <tags> soltas — preservado como texto visível', () => {
    const input = 'Texto normal com "aspas" e <tags> soltas';
    const result = sanitizeText(input);
    // O texto deve ser preservado — React escapa < > na renderização
    expect(result).toContain('Texto normal');
    expect(result).toContain('"aspas"');
    expect(result).toContain('tags');
    expect(result).toContain('soltas');
  });

  it('Texto com acentos e caracteres especiais — preservado', () => {
    const input = 'Descrição da atividade: escavação em 25m³ — conclusão 90%';
    expect(sanitizeText(input)).toBe(input);
  });

  it('Texto com quebras de linha — preservado', () => {
    const input = 'Linha 1\nLinha 2\nLinha 3';
    expect(sanitizeText(input)).toBe(input);
  });

  it('Texto com tabulação — preservado', () => {
    const input = 'Col1\tCol2\tCol3';
    expect(sanitizeText(input)).toBe(input);
  });

  it('Palavras contendo "on" não são afetadas', () => {
    expect(sanitizeText('direção= norte')).toBe('direção= norte');
    expect(sanitizeText('construção andamento')).toBe('construção andamento');
  });
});

describe('SSTI — Server-Side Template Injection', () => {
  it('{{7*7}} — sintaxe Jinja2/Mustache neutralizada', () => {
    const result = sanitizeText('{{7*7}}');
    expect(result).not.toContain('{{');
    expect(result).not.toContain('}}');
    expect(result).toContain('7*7');
  });

  it('<%= 7*7 %> — sintaxe EJS neutralizada', () => {
    const result = sanitizeText('<%= 7*7 %>');
    expect(result).not.toContain('<%');
    expect(result).not.toContain('%>');
    expect(result).toContain('7*7');
  });

  it('{{constructor.constructor("alert(1)")()}} — payload complexo neutralizado', () => {
    const result = sanitizeText('{{constructor.constructor("alert(1)")()}}');
    expect(result).not.toContain('{{');
    expect(result).not.toContain('}}');
    expect(result).not.toContain('alert');
  });

  it('Texto com chaves simples preservado', () => {
    expect(sanitizeText('Use {chave} para referência')).toBe('Use {chave} para referência');
  });
});

describe('XSS — Encoding bypass e edge cases', () => {
  it('JavaScript uppercase — JAVASCRIPT: removido', () => {
    expect(sanitizeText('JAVASCRIPT:alert(1)')).toBe('alert(1)');
  });

  it('JavaScript mixed case — JaVaScRiPt: removido', () => {
    expect(sanitizeText('JaVaScRiPt:alert(1)')).toBe('alert(1)');
  });

  it('Caracteres de controle removidos (null, bell, etc.)', () => {
    const input = 'texto\x00\x07\x1Fcom controle';
    const result = sanitizeText(input);
    expect(result).not.toContain('\x00');
    expect(result).not.toContain('\x07');
    expect(result).not.toContain('\x1F');
  });

  it('Tag script com atributos — bloco inteiro removido', () => {
    const result = sanitizeText('<script type="text/javascript">alert(1)</script>');
    expect(result).toBe('');
  });

  it('Múltiplas tags script — todas removidas', () => {
    const result = sanitizeText('a<script>x</script>b<script>y</script>c');
    expect(result).toBe('abc');
  });

  it('Tag style removida com conteúdo', () => {
    const result = sanitizeText('<style>body{background:url(javascript:alert(1))}</style>');
    expect(result).toBe('');
  });

  it('Tag object removida', () => {
    const result = sanitizeText('<object data="evil.swf"></object>');
    expect(result).toBe('');
  });

  it('Tag embed removida', () => {
    const result = sanitizeText('<embed src="evil.swf">');
    expect(result).toBe('');
  });

  it('data:text/html URI neutralizado', () => {
    const result = sanitizeText('data:text/html,<script>alert(1)</script>');
    expect(result).not.toContain('data:text/html');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
  });
});

describe('XSS — Limite de tamanho', () => {
  it('Payload excessivo truncado', () => {
    const long = '<b>' + 'a'.repeat(20000) + '</b>';
    const result = sanitizeText(long, { maxLength: 5000 });
    expect(result.length).toBe(5000);
  });

  it('Texto dentro do limite preservado', () => {
    const input = 'a'.repeat(5000);
    expect(sanitizeText(input, { maxLength: 10000 })).toBe(input);
  });
});

describe('XSS — sanitização recursiva de objetos', () => {
  it('Sanitiza campo descrição em objeto de NC', () => {
    const nc = {
      descricao_nc: '<script>alert("xss")</script>NC de execução',
      categoria_nc: 'Categoria normal',
      acoes: 'Corrigir <iframe src="evil"></iframe>operação',
    };
    const result = sanitizeTextFields(nc);
    expect(result.descricao_nc).toBe('NC de execução');
    expect(result.categoria_nc).toBe('Categoria normal');
    expect(result.acoes).toBe('Corrigir operação');
  });

  it('Sanitiza descrições de atividades em diário de obra', () => {
    const diario = {
      atividades_realizadas: 'Escavação <script>steal()</script>concluída',
      observacoes: 'Texto normal sem XSS',
      nao_conformidades: [
        { descricao: '<img src=x onerror=alert(1)>NC detectada' },
      ],
    };
    const result = sanitizeTextFields(diario);
    expect(result.atividades_realizadas).toBe('Escavação concluída');
    expect(result.observacoes).toBe('Texto normal sem XSS');
    expect(result.nao_conformidades[0].descricao).not.toContain('onerror');
    expect(result.nao_conformidades[0].descricao).not.toContain('alert');
    expect(result.nao_conformidades[0].descricao).toContain('NC detectada');
  });

  it('Sanitiza arrays de strings', () => {
    const input = ['<script>x</script>texto', 'normal', '<iframe>evil</iframe>limpo'];
    const result = sanitizeTextFields(input);
    expect(result[0]).toBe('texto');
    expect(result[1]).toBe('normal');
    expect(result[2]).toBe('limpo');
  });

  it('Preserva números e booleanos', () => {
    const input = { num: 42, bool: true, str: '<script>x</script>' };
    const result = sanitizeTextFields(input);
    expect(result.num).toBe(42);
    expect(result.bool).toBe(true);
    expect(result.str).toBe('');
  });
});

describe('XSS — Casos compostos do prompt', () => {
  it('Caso 1: <script>alert("xss")</script> não executado', () => {
    const result = sanitizeText('<script>alert("xss")</script>');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
    expect(result).toBe('');
  });

  it('Caso 2: <img src=x onerror=alert(1)> — tag/atributo neutralizado', () => {
    const result = sanitizeText('<img src=x onerror=alert(1)>');
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('alert');
  });

  it('Caso 3: Texto normal com "aspas" e <tags> soltas — preservado', () => {
    const input = 'Texto normal com "aspas" e <tags> soltas';
    const result = sanitizeText(input);
    expect(result).toContain('Texto normal');
    expect(result).toContain('"aspas"');
    expect(result).toContain('tags');
    expect(result).toContain('soltas');
  });

  it('Caso 4a: {{7*7}} — tratado como texto literal', () => {
    const result = sanitizeText('{{7*7}}');
    expect(result).not.toContain('{{');
    expect(result).not.toContain('}}');
    expect(result).toContain('7*7');
  });

  it('Caso 4b: <%= 7*7 %> — tratado como texto literal', () => {
    const result = sanitizeText('<%= 7*7 %>');
    expect(result).not.toContain('<%');
    expect(result).not.toContain('%>');
    expect(result).toContain('7*7');
  });
});