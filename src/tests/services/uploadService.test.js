/**
 * tests/services/uploadService.test.js
 *
 * Testes comportamentais do uploadService — validação de tipo e tamanho
 * de arquivo, upload de imagem única e múltipla, upload de arquivo genérico.
 *
 * uploadImagem agora envia o arquivo para a função backend validarUploadArquivo,
 * que valida magic bytes (conteúdo real) e tamanho no server-side.
 * uploadArquivo mantém validação client-side apenas (qualquer tipo aceito).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

const { UploadFile } = vi.hoisted(() => ({
  UploadFile: vi.fn(),
}));

vi.mock('@/api/base44Client', () => ({
  base44: { integrations: { Core: { UploadFile } } },
}));

const { validarUploadArquivo } = vi.hoisted(() => ({
  validarUploadArquivo: vi.fn(),
}));

vi.mock('@/functions/validarUploadArquivo', () => ({ validarUploadArquivo }));

// compressImage usa APIs de DOM (Image/canvas) indisponíveis no ambiente node —
// passthrough devolve o arquivo original sem compressão.
vi.mock('@/utils/imageUpload', () => ({
  compressImage: vi.fn(async (file) => file),
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
  validarUploadArquivo.mockResolvedValue({ data: { success: true, file_url: 'https://cdn.test/file.jpg' } });
});

describe('uploadService — uploadImagem', () => {
  it('rejeita tipo de arquivo inválido (client-side)', async () => {
    const file = new File([new Uint8Array(1024)], 'doc.pdf', { type: 'application/pdf' });
    await expect(uploadImagem(file)).rejects.toThrow('Tipo de arquivo inválido');
    expect(validarUploadArquivo).not.toHaveBeenCalled();
  });

  it('rejeita arquivo maior que 10MB (client-side)', async () => {
    const file = new File([new Uint8Array(11 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
    await expect(uploadImagem(file)).rejects.toThrow('tamanho máximo');
    expect(validarUploadArquivo).not.toHaveBeenCalled();
  });

  it('aceita JPEG e envia para validação server-side', async () => {
    const file = validImage('photo.jpg');
    const result = await uploadImagem(file);
    expect(result).toEqual({ file_url: 'https://cdn.test/file.jpg' });
    expect(validarUploadArquivo).toHaveBeenCalledWith({
      fileBase64: expect.any(String),
      fileName: 'photo.jpg',
      uploadType: 'imagem',
    });
  });

  it('aceita PNG', async () => {
    const file = new File([new Uint8Array(1024)], 'photo.png', { type: 'image/png' });
    await uploadImagem(file);
    expect(validarUploadArquivo).toHaveBeenCalled();
  });

  it('aceita WebP', async () => {
    const file = new File([new Uint8Array(1024)], 'photo.webp', { type: 'image/webp' });
    await uploadImagem(file);
    expect(validarUploadArquivo).toHaveBeenCalled();
  });

  it('aceita GIF', async () => {
    const file = new File([new Uint8Array(1024)], 'photo.gif', { type: 'image/gif' });
    await uploadImagem(file);
    expect(validarUploadArquivo).toHaveBeenCalled();
  });

  it('propaga erro de validação server-side', async () => {
    validarUploadArquivo.mockRejectedValueOnce({
      response: { data: { error: 'Tipo de arquivo inválido. Aceitos: JPEG, PNG, GIF, WebP' } },
    });
    const file = validImage('spoofed.jpg');
    await expect(uploadImagem(file)).rejects.toThrow('Tipo de arquivo inválido');
  });

  it('usa mensagem de fallback quando server-side falha sem detalhe', async () => {
    // Erro genérico (não de rede) — erros de rede caem no fallback offline.
    validarUploadArquivo.mockRejectedValueOnce(new Error('boom'));
    const file = validImage('photo.jpg');
    await expect(uploadImagem(file)).rejects.toThrow('Falha ao enviar imagem');
  });
});

describe('uploadService — uploadMultiplasImagens', () => {
  it('rejeita quando nenhum arquivo é válido', async () => {
    const files = [
      new File([new Uint8Array(1024)], 'doc.pdf', { type: 'application/pdf' }),
    ];
    await expect(uploadMultiplasImagens(files)).rejects.toThrow('Nenhum arquivo válido');
    expect(validarUploadArquivo).not.toHaveBeenCalled();
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
    expect(validarUploadArquivo).toHaveBeenCalledTimes(2);
  });

  it('aceita array vazio sem chamar validação', async () => {
    await expect(uploadMultiplasImagens([])).rejects.toThrow('Nenhum arquivo válido');
    expect(validarUploadArquivo).not.toHaveBeenCalled();
  });

  it('aceita null/undefined sem chamar validação', async () => {
    await expect(uploadMultiplasImagens(null)).rejects.toThrow('Nenhum arquivo válido');
    expect(validarUploadArquivo).not.toHaveBeenCalled();
  });

  it('registra erro quando um upload individual falha', async () => {
    validarUploadArquivo
      .mockResolvedValueOnce({ data: { success: true, file_url: 'https://cdn.test/ok.jpg' } })
      .mockRejectedValueOnce(new Error('boom'));
    const files = [validImage('ok.jpg'), validImage('fail.jpg')];
    const results = await uploadMultiplasImagens(files);
    expect(results).toHaveLength(2);
    expect(results[0].status).toBe('fulfilled');
    expect(results[1].status).toBe('rejected');
    expect(results[1].url).toBeNull();
    // Erro sem detalhe do servidor usa a mensagem de fallback do serviço
    expect(results[1].error).toBe('Falha ao enviar imagem');
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