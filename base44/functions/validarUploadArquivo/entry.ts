import { createClientFromRequest } from 'npm:@base44/sdk@0.8.35';

/**
 * Backend function: validarUploadArquivo
 *
 * Valida tipo (via magic bytes) e tamanho de arquivo no server-side antes de
 * aceitar o upload definitivo. Impede bypass de validação via spoofing de
 * file.type no client.
 *
 * Payload JSON: { fileBase64, fileName, uploadType: 'imagem' }
 * Retorna: { success: true, file_url } | { error }
 */
const IMAGE_SIGNATURES = {
  jpeg: [0xFF, 0xD8, 0xFF],
  png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  gif: [0x47, 0x49, 0x46, 0x38],
  riff: [0x52, 0x49, 0x46, 0x46],
};

const WEBP_TAG = [0x57, 0x45, 0x42, 0x50];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

function matchesSignature(bytes, signature) {
  if (bytes.length < signature.length) return false;
  for (let i = 0; i < signature.length; i++) {
    if (bytes[i] !== signature[i]) return false;
  }
  return true;
}

function detectImageType(bytes) {
  if (matchesSignature(bytes, IMAGE_SIGNATURES.jpeg)) return 'image/jpeg';
  if (matchesSignature(bytes, IMAGE_SIGNATURES.png)) return 'image/png';
  if (matchesSignature(bytes, IMAGE_SIGNATURES.gif)) return 'image/gif';
  if (matchesSignature(bytes, IMAGE_SIGNATURES.riff) &&
      bytes.length >= 12 &&
      matchesSignature(bytes.slice(8, 12), WEBP_TAG)) {
    return 'image/webp';
  }
  return null;
}

function base64ToBytes(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { fileBase64, fileName, uploadType } = body;

    if (!fileBase64) {
      return Response.json({ error: 'Arquivo não fornecido' }, { status: 400 });
    }

    const bytes = base64ToBytes(fileBase64);
    const fileSize = bytes.length;

    if (uploadType === 'imagem') {
      if (fileSize > MAX_IMAGE_SIZE) {
        return Response.json(
          { error: 'Arquivo excede o tamanho máximo de 10MB' },
          { status: 400 }
        );
      }

      const imageType = detectImageType(bytes);
      if (!imageType) {
        return Response.json(
          { error: 'Tipo de arquivo inválido. Aceitos: JPEG, PNG, GIF, WebP' },
          { status: 400 }
        );
      }

      const blob = new Blob([bytes], { type: imageType });
      const file = new File([blob], fileName || 'upload', { type: imageType });
      const result = await base44.asServiceRole.integrations.Core.UploadFile({ file });

      return Response.json({ success: true, file_url: result.file_url });
    }

    return Response.json({ error: 'Tipo de upload não suportado' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});