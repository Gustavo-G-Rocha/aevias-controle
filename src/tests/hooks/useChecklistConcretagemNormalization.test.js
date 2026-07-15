import { describe, expect, it } from 'vitest';
import {
  getInitialFormData,
  normalizeConcretagemData,
} from '@/hooks/useChecklistConcretagem';

const normalize = (savedData) => normalizeConcretagemData(getInitialFormData(), savedData);

describe('useChecklistConcretagem — normalização de edição', () => {
  it('normaliza o registro reprovado que não possui objetos aninhados na carga', () => {
    const rejectedRecord = {
      id: 'checklist-reprovado-1',
      status: 'finalizado',
      approved: false,
      rejection_reason: 'Corrigir dados da carga',
      data: '2026-07-14',
      cargas_concreto: [{ numero_carga: 1, nota_fiscal: 'NF-123' }],
    };

    expect(() => normalize(rejectedRecord)).not.toThrow();
    const result = normalize(rejectedRecord);

    expect(result.status).toBe('finalizado');
    expect(result.approved).toBe(false);
    expect(result.rejection_reason).toBe('Corrigir dados da carga');
    expect(result.cargas_concreto[0]).toEqual({
      numero_carga: 1,
      nota_fiscal: 'NF-123',
      placa_betoneira: '',
      slump_test: { realizado: false, resultado: null, limite: '', conforme: null },
      flow_test: { realizado: false, resultado: null, limite: '', conforme: null },
      espessura_camada: { realizado: false, resultado: null, limite: '', conforme: null },
      equipamento_lancamento: '',
      superficie_tratada_limpa: null,
      adensamento_realizado: null,
      observacoes_lancamento: '',
      moldado_fiscalizacao: false,
      corpos_prova: [],
    });
  });

  it('preserva valores existentes e completa objetos parcialmente preenchidos', () => {
    const result = normalize({
      data: '2026-07-14',
      cargas_concreto: [{
        numero_carga: 2,
        slump_test: { realizado: true, resultado: 12 },
        flow_test: null,
        espessura_camada: { realizado: true, conforme: true },
        corpos_prova: [{ dias_ruptura: 28, tipo_ruptura: 'compressao_axial' }],
      }],
    });

    expect(result.cargas_concreto[0].slump_test).toEqual({
      realizado: true,
      resultado: 12,
      limite: '',
      conforme: null,
    });
    expect(result.cargas_concreto[0].flow_test).toEqual({
      realizado: false,
      resultado: null,
      limite: '',
      conforme: null,
    });
    expect(result.cargas_concreto[0].espessura_camada).toEqual({
      realizado: true,
      resultado: null,
      limite: '',
      conforme: true,
    });
    expect(result.cargas_concreto[0].corpos_prova).toHaveLength(1);
  });

  it('usa os arrays padrão quando os dados salvos estão ausentes ou inválidos', () => {
    const result = normalize({
      data: '2026-07-14',
      cargas_concreto: null,
      periodos_clima: null,
      nao_conformidades: 'inválido',
      fotos: null,
    });

    expect(result.cargas_concreto).toHaveLength(1);
    expect(result.periodos_clima).toHaveLength(3);
    expect(result.nao_conformidades).toEqual([]);
    expect(result.fotos).toEqual([]);
  });
});