import { describe, it, expect } from 'vitest';
import { getEntityLabel, getEntityColor, getEntityDescription, ENTITY_CONFIG } from '@/utils/entityConfig';

describe('getEntityLabel', () => {
  it('retorna label para entidade conhecida', () => {
    expect(getEntityLabel('EnsaioCAUQ')).toBe('Ensaio CAUQ');
    expect(getEntityLabel('DiarioObra')).toBe('Diário de Obra');
  });

  it('retorna o próprio tipo para entidade desconhecida', () => {
    expect(getEntityLabel('EntidadeInexistente')).toBe('EntidadeInexistente');
  });
});

describe('getEntityColor', () => {
  it('retorna cor para entidade conhecida', () => {
    const color = getEntityColor('EnsaioCAUQ');
    expect(color).toBe('#00233B');
  });

  it('retorna cor padrão para entidade desconhecida', () => {
    expect(getEntityColor('EntidadeInexistente')).toBe('#999999');
  });
});

describe('getEntityDescription', () => {
  it('retorna descrição para entidade conhecida', () => {
    expect(getEntityDescription('EnsaioCAUQ')).toBe('Novo ensaio de CAUQ');
  });

  it('retorna descrição padrão para entidade desconhecida', () => {
    expect(getEntityDescription('EntidadeInexistente')).toBe('Nova atividade');
  });
});

describe('ENTITY_CONFIG', () => {
  it('todas as entidades têm label, color e description', () => {
    for (const [key, config] of Object.entries(ENTITY_CONFIG)) {
      expect(config.label, `${key} deve ter label`).toBeTruthy();
      expect(config.color, `${key} deve ter color`).toBeTruthy();
      expect(config.description, `${key} deve ter description`).toBeTruthy();
    }
  });
});