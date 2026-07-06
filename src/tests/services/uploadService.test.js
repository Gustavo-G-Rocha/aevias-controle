/**
 * tests/services/uploadService.test.js
 *
 * Testes comportamentais do uploadService — validação de tipo e tamanho
 * de arquivo, upload de imagem única e múltipla, upload de arquivo genérico.
 * Mocka @/api/base44Client.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

const { UploadFile } = vi.hoisted(() => ({
  UploadFile: vi.fn(),
}));

vi.mock('@/api/base44Client', () => ({
  base44: { integrations: { Core: { UploadFile } } },
}));

import {
  uploadImagem,
  uploadMultiplasImagens,
  uploadArquivo,
} from '@/services/uploadService';

const validImage = (name = 'test.jpg', size = 1024) =>
  new File([new Uint8Array(size)], name, { type: 'image/jpeg' });

beforeEach(() => {
  vi.clearAllMocks();
  UploadFile.mockResolvedValue({ file_url: 'https://cdn.test/file.jpg' });
});

describe('uploadService — uploadImagem', () => {
  it('rejeita tipo de arquivo inválido', async () => {
    const file = new File([new Uint8Array(1024)], 'doc.pdf', { type: 'application/pdf' });
    await expect(uploadImagem(file)).rejects.toThrow('Tipo de arquivo inválido');
    expect(UploadFile).not.toHaveBeenCalled();
  });

  it('rejeita arquivo maior que 10MB', async () => {
    const file = new File([new Uint8Array(11 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
    await expect(uploadImagem(file)).rejects.toThrow('tamanho máximo');
    expect(UploadFile).not.toHaveBeenCalled();
  });

  it('aceita JPEG e delega para UploadFile', async () => {
    const file = validImage('photo.jpg');
    const result = await uploadImagem(file);
    expect(result).toEqual({ file_url: 'https://cdn.test/file.jpg' });
    expect(UploadFile).toHaveBeenCalledWith({ file });
  });

  it('aceita PNG', async () => {
    const file = new File([new Uint8Array(1024)], 'photo.png', { type: 'image/png' });
    await uploadImagem(file);
    expect(UploadFile).toHaveBeenCalled();
  });

  it('aceita WebP', async () => {
    const file = new File([new Uint8Array(1024)], 'photo.webp', { type: 'image/webp' });
    await uploadImagem(file);
    expect(UploadFile).toHaveBeenCalled();
  });

  it('aceita GIF', async () => {
    const file = new File([new Uint8Array(1024)], 'photo.gif', { type: 'image/gif' });
    await uploadImagem(file);
    expect(UploadFile).toHaveBeenCalled();
  });
});

describe('uploadService — uploadMultiplasImagens', () => {
  it('rejeita quando nenhum arquivo é válido', async () => {
    const files = [
      new File([new Uint8Array(1024)], 'doc.pdf', { type: 'application/pdf' }),
    ];
    await expect(uploadMultiplasImagens(files)).rejects.toThrow('Nenhum arquivo válido');
    expect(UploadFile).not.toHaveBeenCalled();
  });

  it('filtra arquivos inválidos e faz upload dos válidos', async () => {
    const files = [
      validImage('a.jpg'),
      new File([new Uint8Array(1024)], 'doc.pdf', { type: 'application/pdf' }),
      validImage('b.png'),
    ];
    const results = await uploadMultiplasImagens(files);
    expect(results).toHaveLength(2);
    expect(results[0].status).toBe('fulfilled');
    expect(results[0].url).toBe('https://cdn.test/file.jpg');
    expect(results[1].status).toBe('fulfilled');
    expect(UploadFile).toHaveBeenCalledTimes(2);
  });

  it('aceita array vazio sem chamar UploadFile', async () => {
    await expect(uploadMultiplasImagens([])).rejects.toThrow('Nenhum arquivo válido');
    expect(UploadFile).not.toHaveBeenCalled();
  });

  it('aceita null/undefined sem chamar UploadFile', async () => {
    await expect(uploadMultiplasImagens(null)).rejects.toThrow('Nenhum arquivo válido');
    expect(UploadFile).not.toHaveBeenCalled();
  });

  it('registra erro quando um upload individual falha', async () => {
    UploadFile
      .mockResolvedValueOnce({ file_url: 'https://cdn.test/ok.jpg' })
      .mockRejectedValueOnce(new Error('network'));
    const files = [validImage('ok.jpg'), validImage('fail.jpg')];
    const results = await uploadMultiplasImagens(files);
    expect(results).toHaveLength(2);
    expect(results[0].status).toBe('fulfilled');
    expect(results[1].status).toBe('rejected');
    expect(results[1].url).toBeNull();
    expect(results[1].error).toBe('network');
  });
});

describe('uploadService — uploadArquivo', () => {
  it('rejeita arquivo maior que 50MB', async () => {
    const file = new File([new Uint8Array(51 * 1024 * 1024)], 'big.pdf', { type: 'application/pdf' });
    await expect(uploadArquivo(file)).rejects.toThrow('tamanho máximo');
    expect(UploadFile).not.toHaveBeenCalled();
  });

  it('delega para UploadFile quando dentro do limite', async () => {
    const file = new File([new Uint8Array(1024)], 'doc.pdf', { type: 'application/pdf' });
    const result = await uploadArquivo(file);
    expect(result).toEqual({ file_url: 'https://cdn.test/file.jpg' });
    expect(UploadFile).toHaveBeenCalledWith({ file });
  });

  it('aceita qualquer tipo de arquivo', async () => {
    const file = new File([new Uint8Array(1024)], 'data.csv', { type: 'text/csv' });
    await uploadArquivo(file);
    expect(UploadFile).toHaveBeenCalled();
  });
});