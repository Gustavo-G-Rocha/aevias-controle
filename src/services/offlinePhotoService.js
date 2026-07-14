/**
 * offlinePhotoService.js
 * Gerencia fotos tiradas offline (modelo WhatsApp).
 *
 * - Quando offline: a foto comprimida é armazenada como base64 no IndexedDB.
 *   Retorna um placeholder "local-photo:<id>" para o formulário exibir via data URL.
 * - Quando online (no sync): o syncService faz upload das fotos pendentes
 *   ANTES de enviar o registro, substituindo os placeholders pelas URLs reais.
 */

import { addOfflinePhoto, getOfflinePhoto, updateOfflinePhoto } from '@/services/offlineStorageService';
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
 * Converte base64 de volta para File (para upload multipart direto).
 */
function base64ToFile(base64, fileName, mimeType) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], fileName || 'foto.jpg', { type: mimeType || 'image/jpeg' });
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
    mimeType: compressed.type || file.type,
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
 * @returns {Promise<string>} URL real (lança erro com o motivo se falhar)
 */
export async function uploadFotoPendente(photoId) {
  const photo = await getOfflinePhoto(photoId);
  if (!photo) throw new Error('Foto não encontrada no armazenamento local');

  let realUrl = null;

  // 1ª tentativa: função de validação server-side (base64 via JSON).
  // Pode falhar para fotos grandes (limite de tamanho do corpo da requisição).
  try {
    const { validarUploadArquivo } = await import('@/functions/validarUploadArquivo');
    const response = await validarUploadArquivo({
      fileBase64: photo.base64,
      fileName: photo.fileName,
      uploadType: 'imagem',
    });
    realUrl = response?.data?.file_url || null;
  } catch (error) {
    logger.warn(`[offlinePhoto] Validação server-side falhou para ${photoId}, tentando upload direto:`, error?.response?.data?.error || error?.message);
  }

  // 2ª tentativa (fallback): upload multipart direto — mesmo caminho do modo
  // online para arquivos, sem limite de JSON/base64.
  if (!realUrl) {
    const { base44 } = await import('@/api/base44Client');
    const file = base64ToFile(photo.base64, photo.fileName, photo.mimeType);
    const result = await base44.integrations.Core.UploadFile({ file });
    realUrl = result?.file_url || null;
  }

  if (!realUrl) throw new Error('Upload concluído sem URL da imagem');

  await updateOfflinePhoto(photoId, { status: 'uploaded', uploadedUrl: realUrl });
  logger.log(`[offlinePhoto] Foto enviada: ${photoId} → ${realUrl}`);
  return realUrl;
}

/**
 * Substitui todos os placeholders "local-photo:" em um objeto de dados
 * pelas URLs reais (fazendo upload das fotos pendentes se necessário).
 *
 * @param {object} data - payload do registro
 * @returns {Promise<object>} payload com URLs reais
 */
export async function resolverFotosOffline(data) {
  const photoIds = new Set();
  coletarReferencias(data, photoIds);
  if (photoIds.size === 0) return data;

  const urlMap = new Map();
  for (const photoId of photoIds) {
    const photo = await getOfflinePhoto(photoId);
    if (!photo) throw new Error(`Foto offline não encontrada: ${photoId}`);

    let realUrl;
    if (photo.status === 'uploaded' && photo.uploadedUrl) {
      realUrl = photo.uploadedUrl;
    } else {
      try {
        realUrl = await uploadFotoPendente(photoId);
      } catch (error) {
        // Propaga o motivo real da falha para aparecer na barra de status
        const detail = error?.response?.data?.error || error?.message || 'erro desconhecido';
        throw new Error(`Falha ao enviar a foto "${photo.fileName || photoId}": ${detail}`);
      }
    }

    urlMap.set(photoId, realUrl);
  }

  return substituirReferencias(data, urlMap);
}

function coletarReferencias(obj, photoIds) {
  if (typeof obj === 'string' && isLocalPhotoRef(obj)) {
    photoIds.add(getPhotoIdFromRef(obj));
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item) => coletarReferencias(item, photoIds));
    return;
  }
  if (obj && typeof obj === 'object') {
    Object.values(obj).forEach((value) => coletarReferencias(value, photoIds));
  }
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