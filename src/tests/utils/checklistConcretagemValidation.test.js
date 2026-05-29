/**
 * Testes unitários para a lógica de validação do handleSubmit
 * do ChecklistConcretagem (useChecklistConcretagem.js).
 *
 * Verifica que campos climáticos NÃO são obrigatórios para salvar,
 * e que os demais campos obrigatórios continuam sendo validados.
 */
import { describe, it, expect } from 'vitest';

// Lógica extraída do handleSubmit de useChecklistConcretagem
// para permitir teste unitário sem dependência de React hooks.
function validateConcretagemFinalizado(formData) {
  if (!formData.obra_id) return "Por favor, selecione uma obra.";

  const requiredFields = [
    [!formData.project_id?.trim?.(), "selecione a Carta Traço de Concreto"],
    [!formData.concreteira?.trim?.(), "preencha o campo Concreteira"],
    [!formData.empreiteira?.trim?.(), "preencha o campo Empreiteira"],
    [!formData.rodovia?.trim?.(), "preencha o campo Rodovia"],
    [!formData.trecho?.trim?.(), "preencha o campo Trecho"],
    [!formData.volume, "preencha o campo Volume (m³)"],
    [!formData.fck, "preencha o campo Fck (MPa)"],
    [!formData.estrutura?.trim?.(), "preencha o campo Estrutura"],
    [!formData.inspetor_campo?.trim?.(), "preencha o campo Inspetor Campo"],
    [formData.acoes_corretivas_realizado === true && !formData.acoes_corretivas_descricao?.trim?.(), "descreva as ações corretivas"],
  ];
  for (const [cond, msg] of requiredFields) {
    if (cond) return `Por favor, ${msg}.`;
  }

  for (const c of formData.cargas_concreto || []) {
    if (c.moldado_fiscalizacao && (!c.corpos_prova || c.corpos_prova.length === 0)) {
      return `Configure ao menos 1 corpo de prova para a Carga ${c.numero_carga}.`;
    }
  }

  return null;
}

const baseFormData = {
  obra_id: 'obra-1',
  project_id: 'proj-1',
  concreteira: 'Concreteira X',
  empreiteira: 'Empresa Y',
  rodovia: 'BR-101',
  trecho: 'Trecho A',
  volume: 10,
  fck: 25,
  estrutura: 'Laje',
  inspetor_campo: 'João',
  acoes_corretivas_realizado: null,
  acoes_corretivas_descricao: '',
  periodos_clima: [
    { periodo: 'manha', temperatura_ambiente: null, condicoes_climaticas: 'bom' },
    { periodo: 'tarde', temperatura_ambiente: null, condicoes_climaticas: 'bom' },
    { periodo: 'noite', temperatura_ambiente: null, condicoes_climaticas: 'bom' },
  ],
  cargas_concreto: [],
};

describe('validateConcretagemFinalizado — clima não obrigatório', () => {
  it('válido com todos os campos obrigatórios e clima vazio', () => {
    expect(validateConcretagemFinalizado(baseFormData)).toBeNull();
  });

  it('válido com temperatura_ambiente string vazia em todos os períodos', () => {
    const data = {
      ...baseFormData,
      periodos_clima: [
        { periodo: 'manha', temperatura_ambiente: '', condicoes_climaticas: 'instavel' },
        { periodo: 'tarde', temperatura_ambiente: '', condicoes_climaticas: 'chuva' },
        { periodo: 'noite', temperatura_ambiente: '', condicoes_climaticas: 'bom' },
      ],
    };
    expect(validateConcretagemFinalizado(data)).toBeNull();
  });

  it('válido quando periodos_clima está vazio', () => {
    expect(validateConcretagemFinalizado({ ...baseFormData, periodos_clima: [] })).toBeNull();
  });

  it('válido com clima preenchido normalmente', () => {
    const data = {
      ...baseFormData,
      periodos_clima: [
        { periodo: 'manha', temperatura_ambiente: 22.5, condicoes_climaticas: 'bom' },
        { periodo: 'tarde', temperatura_ambiente: 30.0, condicoes_climaticas: 'instavel' },
        { periodo: 'noite', temperatura_ambiente: 18.0, condicoes_climaticas: 'bom' },
      ],
    };
    expect(validateConcretagemFinalizado(data)).toBeNull();
  });
});

describe('validateConcretagemFinalizado — campos obrigatórios', () => {
  it('inválido sem obra_id', () => {
    expect(validateConcretagemFinalizado({ ...baseFormData, obra_id: '' })).toBeTruthy();
  });

  it('inválido sem project_id', () => {
    expect(validateConcretagemFinalizado({ ...baseFormData, project_id: '' })).toBeTruthy();
  });

  it('inválido sem concreteira', () => {
    expect(validateConcretagemFinalizado({ ...baseFormData, concreteira: '' })).toBeTruthy();
  });

  it('inválido sem empreiteira', () => {
    expect(validateConcretagemFinalizado({ ...baseFormData, empreiteira: '' })).toBeTruthy();
  });

  it('inválido sem rodovia', () => {
    expect(validateConcretagemFinalizado({ ...baseFormData, rodovia: '' })).toBeTruthy();
  });

  it('inválido sem trecho', () => {
    expect(validateConcretagemFinalizado({ ...baseFormData, trecho: '' })).toBeTruthy();
  });

  it('inválido sem volume', () => {
    expect(validateConcretagemFinalizado({ ...baseFormData, volume: null })).toBeTruthy();
  });

  it('inválido sem fck', () => {
    expect(validateConcretagemFinalizado({ ...baseFormData, fck: null })).toBeTruthy();
  });

  it('inválido sem estrutura', () => {
    expect(validateConcretagemFinalizado({ ...baseFormData, estrutura: '' })).toBeTruthy();
  });

  it('inválido sem inspetor_campo', () => {
    expect(validateConcretagemFinalizado({ ...baseFormData, inspetor_campo: '' })).toBeTruthy();
  });

  it('inválido quando ações corretivas marcadas sem descrição', () => {
    const data = { ...baseFormData, acoes_corretivas_realizado: true, acoes_corretivas_descricao: '' };
    expect(validateConcretagemFinalizado(data)).toBeTruthy();
  });

  it('válido quando ações corretivas marcadas com descrição preenchida', () => {
    const data = { ...baseFormData, acoes_corretivas_realizado: true, acoes_corretivas_descricao: 'Retrabalho feito.' };
    expect(validateConcretagemFinalizado(data)).toBeNull();
  });

  it('inválido quando carga tem moldado=true mas sem corpos de prova', () => {
    const data = {
      ...baseFormData,
      cargas_concreto: [{ numero_carga: 1, moldado_fiscalizacao: true, corpos_prova: [] }],
    };
    expect(validateConcretagemFinalizado(data)).toBeTruthy();
  });

  it('válido quando carga tem moldado=false sem corpos de prova', () => {
    const data = {
      ...baseFormData,
      cargas_concreto: [{ numero_carga: 1, moldado_fiscalizacao: false, corpos_prova: [] }],
    };
    expect(validateConcretagemFinalizado(data)).toBeNull();
  });
});