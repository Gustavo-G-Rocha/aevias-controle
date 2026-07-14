/**
 * offlinePhotoService.js
 * Gerencia fotos tiradas offline (modelo WhatsApp).
 *
 * - Quando offline: a foto comprimida é armazenada como base64 no IndexedDB.
 *   Retorna um placeholder "local-photo:<id>" para o formulário exibir via data URL.
 * - Quando online (no sync): o syncService faz upload das fotos pendentes
 *   ANTES de enviar o registro, substituindo os placeholders pelas URLs reais.
 */

import { addOfflinePhoto, getOfflinePhoto, getPendingPhotos, updateOfflinePhoto } from '@/services/offlineStorageService';
import { compressImage } from '@/utils/imageUpload';
import { logger } from '@/utils/logger';

const PREFIX = 'local-photo:';

export function isLocalPhotoRef(url) {
  return typeof url === 'string' && url.startsWith(PREFIX);
}

export function getPhotoIdFromRef(url) {
  return url ? url.replace(PREFIX, '') : null;
}

/**
 * Verifica se o dispositivo está offline.
 */
function isOffline() {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

/**
 * Converte um File para string base64.
 */
async function fileToBase64(file) {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

/**
 * Gera um ID único para a foto.
 */
function generatePhotoId() {
  return `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Salva uma foto offline e retorna a referência para usar no formulário.
 * Retorna { file_url } compatível com o fluxo online.
 *
 * @param {File} file
 * @returns {Promise<{file_url: string}>}
 */
export async function salvarFotoOffline(file) {
  const compressed = await compressImage(file);
  const base64 = await fileToBase64(compressed);
  const photoId = generatePhotoId();

  await addOfflinePhoto({
    photoId,
    base64,
    fileName: file.name,
    status: 'pending',
  });

  logger.log(`[offlinePhoto] Foto salva offline: ${photoId}`);
  return { file_url: `${PREFIX}${photoId}` };
}

/**
 * Faz upload de uma única foto pendente e retorna a URL real.
 * Usa a validação server-side (validarUploadArquivo).
 *
 * @param {string} photoId
 * @returns {Promise<string|null>} URL real ou null se falhar
 */
export async function uploadFotoPendente(photoId) {
  const photo = await getOfflinePhoto(photoId);
  if (!photo) return null;

  // Import dinâmico para evitar dependência circular
  const { validarUploadArquivo } = await import('@/functions/validarUploadArquivo');
  try {
    const response = await validarUploadArquivo({
      fileBase64: photo.base64,
      fileName: photo.fileName,
      uploadType: 'imagem',
    });
    const realUrl = response.data.file_url;
    await updateOfflinePhoto(photoId, { status: 'uploaded', uploadedUrl: realUrl });
    logger.log(`[offlinePhoto] Foto enviada: ${photoId} → ${realUrl}`);
    return realUrl;
  } catch (error) {
    logger.error(`[offlinePhoto] Falha ao enviar foto ${photoId}:`, error?.message);
    return null;
  }
}

/**
 * Substitui todos os placeholders "local-photo:" em um objeto de dados
 * pelas URLs reais (fazendo upload das fotos pendentes se necessário).
 *
 * @param {object} data - payload do registro
 * @returns {Promise<object>} payload com URLs reais
 */
export async function resolverFotosOffline(data) {
  const pending = await getPendingPhotos();
  if (pending.length === 0) return data;

  // Mapear photoId → URL real (fazer upload das pendentes)
  const urlMap = new Map();
  for (const photo of pending) {
    if (photo.status === 'uploaded' && photo.uploadedUrl) {
      urlMap.set(photo.photoId, photo.uploadedUrl);
    } else if (photo.status === 'pending') {
      const realUrl = await uploadFotoPendente(photo.photoId);
      if (realUrl) urlMap.set(photo.photoId, realUrl);
    }
  }

  return substituirReferencias(data, urlMap);
}

/**
 * Percorre o objeto substituindo strings "local-photo:<id>" por URLs reais.
 */
function substituirReferencias(obj, urlMap) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    if (isLocalPhotoRef(obj)) {
      const photoId = getPhotoIdFromRef(obj);
      return urlMap.get(photoId) || obj; // mantém placeholder se upload falhou
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => substituirReferencias(item, urlMap));
  }
  if (typeof obj === 'object') {
    const result = {};
    for (const key of Object.keys(obj)) {
      result[key] = substituirReferencias(obj[key], urlMap);
    }
    return result;
  }
  return obj;
}

export { isOffline };