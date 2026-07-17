/**
 * tests/services/offlinePhotoService.test.js
 * Cobre o fluxo de fotos offline (modelo WhatsApp):
 * - placeholders "local-photo:<id>" e helpers de referência
 * - salvamento comprimido em base64 no armazenamento local
 * - upload com fallback (validação server-side → multipart direto)
 * - resolução recursiva de placeholders no payload antes do sync
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

const { photoStore } = vi.hoisted(() => ({ photoStore: new Map() }));

vi.mock('@/services/offlineStorageService', () => ({
  addOfflinePhoto: vi.fn(async (photo) => { photoStore.set(photo.photoId, photo); }),
  getOfflinePhoto: vi.fn(async (id) => photoStore.get(id) || null),
  updateOfflinePhoto: vi.fn(async (id, updates) => {
    const p = photoStore.get(id);
    if (p) photoStore.set(id, { ...p, ...updates });
  }),
}));

vi.mock('@/utils/imageUpload', () => ({
  compressImage: vi.fn(async (file) => ({
    type: 'image/jpeg',
    arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
    name: file.name,
  })),
}));

vi.mock('@/utils/offlineSimulation', () => ({
  isEffectivelyOffline: vi.fn(() => true),
}));

vi.mock('@/functions/validarUploadArquivo', () => ({
  validarUploadArquivo: vi.fn(),
}));

const { uploadFileMock } = vi.hoisted(() => ({ uploadFileMock: vi.fn() }));
vi.mock('@/api/base44Client', () => ({
  base44: { integrations: { Core: { UploadFile: uploadFileMock } } },
}));

import { validarUploadArquivo } from '@/functions/validarUploadArquivo';
import { addOfflinePhoto, updateOfflinePhoto } from '@/services/offlineStorageService';
import {
  isLocalPhotoRef,
  getPhotoIdFromRef,
  salvarFotoOffline,
  uploadFotoPendente,
  resolverFotosOffline,
} from '@/services/offlinePhotoService';

beforeEach(() => {
  vi.clearAllMocks();
  photoStore.clear();
  // Shims para ambiente Node sem File/btoa completos
  if (typeof globalThis.File === 'undefined') {
    globalThis.File = class File {
      constructor(parts, name, opts = {}) { this.parts = parts; this.name = name; this.type = opts.type; }
    };
  }
});

function seedPhoto(id, extra = {}) {
  photoStore.set(id, {
    photoId: id,
    base64: btoa('abc'),
    fileName: 'foto.jpg',
    mimeType: 'image/jpeg',
    status: 'pending',
    ...extra,
  });
}

describe('helpers de referência local', () => {
  it('isLocalPhotoRef reconhece apenas placeholders', () => {
    expect(isLocalPhotoRef('local-photo:abc')).toBe(true);
    expect(isLocalPhotoRef('https://cdn.x.com/foto.jpg')).toBe(false);
    expect(isLocalPhotoRef(null)).toBe(false);
    expect(isLocalPhotoRef(42)).toBe(false);
  });

  it('getPhotoIdFromRef extrai o id do placeholder', () => {
    expect(getPhotoIdFromRef('local-photo:abc-123')).toBe('abc-123');
    expect(getPhotoIdFromRef(null)).toBeNull();
  });
});

describe('salvarFotoOffline', () => {
  it('comprime, salva em base64 e retorna placeholder compatível com o fluxo online', async () => {
    const result = await salvarFotoOffline({ name: 'obra.jpg', type: 'image/png' });

    expect(result.file_url).toMatch(/^local-photo:photo-/);
    expect(addOfflinePhoto).toHaveBeenCalledWith(expect.objectContaining({
      fileName: 'obra.jpg',
      mimeType: 'image/jpeg', // tipo do arquivo comprimido prevalece
      status: 'pending',
      base64: expect.any(String),
    }));
  });
});

describe('uploadFotoPendente', () => {
  it('usa a validação server-side quando disponível e marca como uploaded', async () => {
    seedPhoto('p1');
    validarUploadArquivo.mockResolvedValue({ data: { file_url: 'https://cdn.x.com/p1.jpg' } });

    const url = await uploadFotoPendente('p1');

    expect(url).toBe('https://cdn.x.com/p1.jpg');
    expect(uploadFileMock).not.toHaveBeenCalled();
    expect(updateOfflinePhoto).toHaveBeenCalledWith('p1', {
      status: 'uploaded',
      uploadedUrl: 'https://cdn.x.com/p1.jpg',
    });
  });

  it('faz fallback para upload multipart direto quando a validação falha', async () => {
    seedPhoto('p2');
    validarUploadArquivo.mockRejectedValue(new Error('payload too large'));
    uploadFileMock.mockResolvedValue({ file_url: 'https://cdn.x.com/p2.jpg' });

    const url = await uploadFotoPendente('p2');

    expect(url).toBe('https://cdn.x.com/p2.jpg');
    expect(uploadFileMock).toHaveBeenCalledTimes(1);
  });

  it('lança erro quando a foto não existe no armazenamento local', async () => {
    await expect(uploadFotoPendente('inexistente')).rejects.toThrow('Foto não encontrada');
  });

  it('lança erro quando nenhum caminho retorna URL', async () => {
    seedPhoto('p3');
    validarUploadArquivo.mockResolvedValue({ data: {} });
    uploadFileMock.mockResolvedValue({});

    await expect(uploadFotoPendente('p3')).rejects.toThrow('sem URL');
  });
});

describe('resolverFotosOffline', () => {
  it('substitui placeholders aninhados (arrays e objetos) por URLs reais', async () => {
    seedPhoto('a');
    seedPhoto('b');
    validarUploadArquivo
      .mockResolvedValueOnce({ data: { file_url: 'https://cdn.x.com/a.jpg' } })
      .mockResolvedValueOnce({ data: { file_url: 'https://cdn.x.com/b.jpg' } });

    const payload = {
      fotos: ['local-photo:a', 'https://cdn.x.com/existente.jpg'],
      checklist: { anexo: 'local-photo:b' },
      observacoes: 'texto normal',
    };

    const resolved = await resolverFotosOffline(payload);

    expect(resolved.fotos).toEqual(['https://cdn.x.com/a.jpg', 'https://cdn.x.com/existente.jpg']);
    expect(resolved.checklist.anexo).toBe('https://cdn.x.com/b.jpg');
    expect(resolved.observacoes).toBe('texto normal');
    // payload original não é mutado
    expect(payload.fotos[0]).toBe('local-photo:a');
  });

  it('reutiliza a URL de fotos já enviadas sem novo upload', async () => {
    seedPhoto('ja-subiu', { status: 'uploaded', uploadedUrl: 'https://cdn.x.com/ok.jpg' });

    const resolved = await resolverFotosOffline({ fotos: ['local-photo:ja-subiu'] });

    expect(resolved.fotos).toEqual(['https://cdn.x.com/ok.jpg']);
    expect(validarUploadArquivo).not.toHaveBeenCalled();
    expect(uploadFileMock).not.toHaveBeenCalled();
  });

  it('retorna o payload intocado quando não há placeholders', async () => {
    const payload = { fotos: ['https://cdn.x.com/x.jpg'], valor: 1 };
    const resolved = await resolverFotosOffline(payload);
    expect(resolved).toBe(payload);
  });

  it('propaga falha de upload com o nome do arquivo para a barra de status', async () => {
    seedPhoto('quebrada', { fileName: 'panorama.jpg' });
    validarUploadArquivo.mockRejectedValue(new Error('x'));
    uploadFileMock.mockRejectedValue({ response: { data: { error: 'Tipo de arquivo não permitido' } } });

    await expect(resolverFotosOffline({ fotos: ['local-photo:quebrada'] }))
      .rejects.toThrow('Falha ao enviar a foto "panorama.jpg": Tipo de arquivo não permitido');
  });

  it('lança erro claro quando o placeholder aponta para foto inexistente', async () => {
    await expect(resolverFotosOffline({ fotos: ['local-photo:sumida'] }))
      .rejects.toThrow('Foto offline não encontrada: sumida');
  });
});