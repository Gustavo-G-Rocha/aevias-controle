/**
 * tests/utils/formValidationSchemas.test.js
 *
 * Testes para os schemas zod de validação base de formulários.
 * Cobre validateEnsaioForm e validateChecklistForm.
 */
import { describe, it, expect } from 'vitest';
import {
  validateEnsaioForm,
  validateChecklistForm,
  validateChecklistTerraplanagemForm,
} from '@/utils/formValidationSchemas';

describe('validateEnsaioForm', () => {
  it('retorna válido quando obra_id está preenchido (rascunho)', () => {
    const result = validateEnsaioForm({ obra_id: 'obra-1' }, 'rascunho');
    expect(result.valid).toBe(true);
  });

  it('retorna inválido quando obra_id está vazio', () => {
    const result = validateEnsaioForm({ obra_id: '' }, 'rascunho');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('obra');
  });

  it('exige data_ensaio ao finalizar', () => {
    const result = validateEnsaioForm({ obra_id: 'obra-1' }, 'finalizado');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('data');
  });

  it('passa ao finalizar com obra_id e data_ensaio', () => {
    const result = validateEnsaioForm({ obra_id: 'obra-1', data_ensaio: '2025-01-01' }, 'finalizado');
    expect(result.valid).toBe(true);
  });
});

describe('validateChecklistForm', () => {
  it('retorna válido quando obra_id está preenchido (rascunho)', () => {
    const result = validateChecklistForm({ obra_id: 'obra-1' }, 'rascunho');
    expect(result.valid).toBe(true);
  });

  it('retorna inválido quando obra_id está vazio', () => {
    const result = validateChecklistForm({ obra_id: '' }, 'rascunho');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('obra');
  });

  it('exige data ao finalizar', () => {
    const result = validateChecklistForm({ obra_id: 'obra-1' }, 'finalizado');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('data');
  });

  it('passa ao finalizar com obra_id e data', () => {
    const result = validateChecklistForm({ obra_id: 'obra-1', data: '2025-01-01' }, 'finalizado');
    expect(result.valid).toBe(true);
  });
});

// ── Paridade: validateChecklistTerraplanagemForm vs validateForm manual ──
// Os casos abaixo espelham checklistTerrapalagemValidation.test.js para
// garantir que o schema zod reproduz o comportamento da validação manual.
describe('validateChecklistTerraplanagemForm', () => {
  const baseFormData = {
    obra_id: 'obra-1',
    rodovia: 'BR-101',
    empreiteira: 'Empresa X',
    estaca: '100+00',
    camada: 'Sub-base',
    material: 'Solo',
    jornada: { horario_inicio: '08:00', horario_fim: '17:00' },
    periodos_clima: [
      { periodo: 'manha', temperatura_ambiente: null, condicoes_climaticas: 'bom' },
      { periodo: 'tarde', temperatura_ambiente: null, condicoes_climaticas: 'bom' },
    ],
    acoes_corretivas_realizado: null,
    acoes_corretivas_descricao: '',
    origem_material: '',
    nome_material: '',
    ensaios_empreiteira: {
      compactacao_proctor: { realizado: false, quantidade: null, conforme: null, resultados: '', observacoes: '' },
      isc: { realizado: false, quantidade: null, conforme: null, resultados: '', observacoes: '' },
      umidade_frigideira: { realizado: false, quantidade: null, conforme: null, resultados: '', observacoes: '' },
      massa_especifica_in_situ: { realizado: false, quantidade: null, conforme: null, resultados: '', observacoes: '' },
      granulometria: { realizado: false, quantidade: null, conforme: null, resultados: '', observacoes: '' },
    },
  };

  describe('rascunho', () => {
    it('retorna null quando obra_id está preenchido', () => {
      expect(validateChecklistTerraplanagemForm({ obra_id: 'obra-1' }, 'rascunho')).toBeNull();
    });

    it('retorna erro quando obra_id está ausente', () => {
      expect(validateChecklistTerraplanagemForm({}, 'rascunho')).toBeTruthy();
    });

    it('retorna erro quando obra_id está vazio', () => {
      expect(validateChecklistTerraplanagemForm({ obra_id: '' }, 'rascunho')).toBeTruthy();
    });
  });

  describe('finalizado — campos obrigatórios', () => {
    it('válido com todos os campos preenchidos', () => {
      expect(validateChecklistTerraplanagemForm(baseFormData, 'finalizado')).toBeNull();
    });

    it('inválido sem rodovia', () => {
      expect(validateChecklistTerraplanagemForm({ ...baseFormData, rodovia: '' }, 'finalizado')).toBeTruthy();
    });

    it('inválido sem empreiteira', () => {
      expect(validateChecklistTerraplanagemForm({ ...baseFormData, empreiteira: '' }, 'finalizado')).toBeTruthy();
    });

    it('inválido sem estaca', () => {
      expect(validateChecklistTerraplanagemForm({ ...baseFormData, estaca: '' }, 'finalizado')).toBeTruthy();
    });

    it('inválido sem camada', () => {
      expect(validateChecklistTerraplanagemForm({ ...baseFormData, camada: '' }, 'finalizado')).toBeTruthy();
    });

    it('inválido sem material', () => {
      expect(validateChecklistTerraplanagemForm({ ...baseFormData, material: '' }, 'finalizado')).toBeTruthy();
    });

    it('inválido sem horario_inicio', () => {
      expect(validateChecklistTerraplanagemForm({ ...baseFormData, jornada: { horario_inicio: '', horario_fim: '17:00' } }, 'finalizado')).toBeTruthy();
    });

    it('inválido sem horario_fim', () => {
      expect(validateChecklistTerraplanagemForm({ ...baseFormData, jornada: { horario_inicio: '08:00', horario_fim: '' } }, 'finalizado')).toBeTruthy();
    });
  });

  describe('condição climática — NÃO obrigatória', () => {
    it('válido com temperatura_ambiente null em todos os períodos', () => {
      const data = {
        ...baseFormData,
        periodos_clima: [
          { periodo: 'manha', temperatura_ambiente: null, condicoes_climaticas: 'bom' },
          { periodo: 'tarde', temperatura_ambiente: null, condicoes_climaticas: 'bom' },
        ],
      };
      expect(validateChecklistTerraplanagemForm(data, 'finalizado')).toBeNull();
    });

    it('válido com temperatura_ambiente string vazia', () => {
      const data = {
        ...baseFormData,
        periodos_clima: [
          { periodo: 'manha', temperatura_ambiente: '', condicoes_climaticas: 'instavel' },
          { periodo: 'tarde', temperatura_ambiente: '', condicoes_climaticas: 'chuva' },
        ],
      };
      expect(validateChecklistTerraplanagemForm(data, 'finalizado')).toBeNull();
    });

    it('válido quando periodos_clima está vazio', () => {
      expect(validateChecklistTerraplanagemForm({ ...baseFormData, periodos_clima: [] }, 'finalizado')).toBeNull();
    });
  });

  describe('novos campos — origem e nome do material (opcionais)', () => {
    it('válido com origem_material e nome_material preenchidos', () => {
      const data = { ...baseFormData, origem_material: 'Jazida km 15', nome_material: 'Solo argiloso' };
      expect(validateChecklistTerraplanagemForm(data, 'finalizado')).toBeNull();
    });

    it('válido com origem_material e nome_material vazios', () => {
      expect(validateChecklistTerraplanagemForm({ ...baseFormData, origem_material: '', nome_material: '' }, 'finalizado')).toBeNull();
    });

    it('válido sem os campos (registros antigos)', () => {
      const { origem_material, nome_material, ...dataAntigo } = baseFormData;
      expect(validateChecklistTerraplanagemForm(dataAntigo, 'finalizado')).toBeNull();
    });
  });

  describe('ações corretivas', () => {
    it('inválido quando realizado=true mas descrição ausente', () => {
      const data = { ...baseFormData, acoes_corretivas_realizado: true, acoes_corretivas_descricao: '' };
      expect(validateChecklistTerraplanagemForm(data, 'finalizado')).toBeTruthy();
    });

    it('válido quando realizado=true e descrição preenchida', () => {
      const data = { ...baseFormData, acoes_corretivas_realizado: true, acoes_corretivas_descricao: 'Recompactação realizada.' };
      expect(validateChecklistTerraplanagemForm(data, 'finalizado')).toBeNull();
    });
  });
});