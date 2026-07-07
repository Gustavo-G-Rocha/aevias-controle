/**
 * Testes unitários para validateForm e buildDataToSave do ChecklistTerraplanagem
 */
import { describe, it, expect } from 'vitest';
import { validateForm, buildDataToSave } from '../../pages/ChecklistTerraplanagem/utils/checklistTerrapalagemMapper';

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

describe('validateForm — ChecklistTerraplanagem', () => {
  describe('rascunho', () => {
    it('retorna null quando obra_id está preenchido', () => {
      expect(validateForm({ obra_id: 'obra-1' }, 'rascunho')).toBeNull();
    });

    it('retorna erro quando obra_id está ausente', () => {
      expect(validateForm({}, 'rascunho')).toBeTruthy();
    });
  });

  describe('finalizado — campos obrigatórios', () => {
    it('válido com todos os campos preenchidos', () => {
      expect(validateForm(baseFormData, 'finalizado')).toBeNull();
    });

    it('inválido sem rodovia', () => {
      expect(validateForm({ ...baseFormData, rodovia: '' }, 'finalizado')).toBeTruthy();
    });

    it('inválido sem empreiteira', () => {
      expect(validateForm({ ...baseFormData, empreiteira: '' }, 'finalizado')).toBeTruthy();
    });

    it('inválido sem estaca', () => {
      expect(validateForm({ ...baseFormData, estaca: '' }, 'finalizado')).toBeTruthy();
    });

    it('inválido sem camada', () => {
      expect(validateForm({ ...baseFormData, camada: '' }, 'finalizado')).toBeTruthy();
    });

    it('inválido sem material', () => {
      expect(validateForm({ ...baseFormData, material: '' }, 'finalizado')).toBeTruthy();
    });

    it('inválido sem horario_inicio', () => {
      expect(validateForm({ ...baseFormData, jornada: { horario_inicio: '', horario_fim: '17:00' } }, 'finalizado')).toBeTruthy();
    });

    it('inválido sem horario_fim', () => {
      expect(validateForm({ ...baseFormData, jornada: { horario_inicio: '08:00', horario_fim: '' } }, 'finalizado')).toBeTruthy();
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
      expect(validateForm(data, 'finalizado')).toBeNull();
    });

    it('válido com temperatura_ambiente string vazia em todos os períodos', () => {
      const data = {
        ...baseFormData,
        periodos_clima: [
          { periodo: 'manha', temperatura_ambiente: '', condicoes_climaticas: 'instavel' },
          { periodo: 'tarde', temperatura_ambiente: '', condicoes_climaticas: 'chuva' },
        ],
      };
      expect(validateForm(data, 'finalizado')).toBeNull();
    });

    it('válido quando periodos_clima está vazio', () => {
      expect(validateForm({ ...baseFormData, periodos_clima: [] }, 'finalizado')).toBeNull();
    });
  });

  describe('novos campos — origem e nome do material (opcionais)', () => {
    it('válido com origem_material e nome_material preenchidos', () => {
      const data = { ...baseFormData, origem_material: 'Jazida km 15', nome_material: 'Solo argiloso' };
      expect(validateForm(data, 'finalizado')).toBeNull();
    });

    it('válido com origem_material e nome_material vazios', () => {
      expect(validateForm({ ...baseFormData, origem_material: '', nome_material: '' }, 'finalizado')).toBeNull();
    });

    it('válido sem os campos (registros antigos)', () => {
      const { origem_material, nome_material, ...dataAntigo } = baseFormData;
      expect(validateForm(dataAntigo, 'finalizado')).toBeNull();
    });

    it('válido com apenas origem_material preenchido', () => {
      expect(validateForm({ ...baseFormData, origem_material: 'Bota-fora A', nome_material: '' }, 'finalizado')).toBeNull();
    });

    it('válido com apenas nome_material preenchido', () => {
      expect(validateForm({ ...baseFormData, origem_material: '', nome_material: 'Brita 0' }, 'finalizado')).toBeNull();
    });
  });

  describe('ações corretivas', () => {
    it('inválido quando realizado=true mas descrição ausente', () => {
      const data = { ...baseFormData, acoes_corretivas_realizado: true, acoes_corretivas_descricao: '' };
      expect(validateForm(data, 'finalizado')).toBeTruthy();
    });

    it('válido quando realizado=true e descrição preenchida', () => {
      const data = { ...baseFormData, acoes_corretivas_realizado: true, acoes_corretivas_descricao: 'Recompactação realizada.' };
      expect(validateForm(data, 'finalizado')).toBeNull();
    });
  });

  describe('buildDataToSave — preservação de legendas das fotos', () => {
    it('preserva legendas personalizadas ao salvar', () => {
      const data = {
        ...baseFormData,
        fotos: [
          { url: 'https://exemplo.com/foto1.jpg', legenda: 'Vista frontal do trecho' },
          { url: 'https://exemplo.com/foto2.jpg', legenda: 'Detalhe da compactação' },
        ],
      };
      const result = buildDataToSave(data, 'finalizado');
      expect(result.fotos).toEqual([
        { url: 'https://exemplo.com/foto1.jpg', legenda: 'Vista frontal do trecho' },
        { url: 'https://exemplo.com/foto2.jpg', legenda: 'Detalhe da compactação' },
      ]);
    });

    it('normaliza fotos string (URLs sem legenda) para {url, legenda}', () => {
      const data = {
        ...baseFormData,
        fotos: ['https://exemplo.com/foto1.jpg', 'https://exemplo.com/foto2.jpg'],
      };
      const result = buildDataToSave(data, 'finalizado');
      expect(result.fotos).toEqual([
        { url: 'https://exemplo.com/foto1.jpg', legenda: '' },
        { url: 'https://exemplo.com/foto2.jpg', legenda: '' },
      ]);
    });

    it('mistura fotos string e objeto, preservando legendas existentes', () => {
      const data = {
        ...baseFormData,
        fotos: [
          'https://exemplo.com/foto1.jpg',
          { url: 'https://exemplo.com/foto2.jpg', legenda: 'Legenda customizada' },
        ],
      };
      const result = buildDataToSave(data, 'finalizado');
      expect(result.fotos).toEqual([
        { url: 'https://exemplo.com/foto1.jpg', legenda: '' },
        { url: 'https://exemplo.com/foto2.jpg', legenda: 'Legenda customizada' },
      ]);
    });

    it('filtra fotos sem URL', () => {
      const data = {
        ...baseFormData,
        fotos: [
          { url: 'https://exemplo.com/foto1.jpg', legenda: 'Boa' },
          { url: '', legenda: 'Sem URL' },
          null,
        ],
      };
      const result = buildDataToSave(data, 'finalizado');
      expect(result.fotos).toEqual([
        { url: 'https://exemplo.com/foto1.jpg', legenda: 'Boa' },
      ]);
    });
  });
});