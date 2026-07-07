import { base44 } from '@/api/base44Client';
import { withServiceCall } from '@/utils/serviceErrorHandler';
import { validarUploadArquivo } from '@/functions/validarUploadArquivo';

/**
 * Service centralizado para upload de arquivos e imagens
 */
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Converte um File para string base64 para envio via JSON payload.
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

export async function uploadImagem(file) {
  // Validação client-side — feedback rápido ao usuário
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`Tipo de arquivo inválido. Aceitos: JPEG, PNG, GIF, WebP`);
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Arquivo excede o tamanho máximo de 10MB');
  }

  // Validação server-side — verifica magic bytes (conteúdo real) e tamanho
  // antes de aceitar o upload definitivo. Impede spoofing de file.type.
  const fileBase64 = await fileToBase64(file);
  try {
    const response = await validarUploadArquivo({
      fileBase64,
      fileName: file.name,
      uploadType: 'imagem',
    });
    return { file_url: response.data.file_url };
  } catch (error) {
    const serverMessage = error?.response?.data?.error;
    throw new Error(serverMessage || 'Falha ao enviar imagem');
  }
}

export async function uploadMultiplasImagens(files) {
  const validFiles = Array.from(files || []).filter(f => VALID_IMAGE_TYPES.includes(f.type));

  if (validFiles.length === 0) {
    throw new Error('Nenhum arquivo válido foi selecionado');
  }

  const uploads = validFiles.map(async (file, index) => ({
    id: `${Date.now()}_${index}`,
    fileName: file.name,
    file,
  }));

  const promises = validFiles.map(file => uploadImagem(file));
  const results = await Promise.allSettled(promises);

  return results.map((result, index) => ({
    fileName: validFiles[index].name,
    status: result.status,
    url: result.status === 'fulfilled' ? result.value.file_url : null,
    error: result.status === 'rejected' ? result.reason.message : null,
  }));
}

export async function uploadArquivo(file) {
  if (file.size > 50 * 1024 * 1024) {
    throw new Error('Arquivo excede o tamanho máximo de 50MB');
  }

  return withServiceCall(
    () => base44.integrations.Core.UploadFile({ file }),
    'Falha ao enviar arquivo'
  );
}