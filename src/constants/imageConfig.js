/**
 * Configuração centralizada de processamento de imagens.
 *
 * MAX_UPLOAD_WIDTH — dimensão de referência (lado maior) usada na compressão
 * de imagens antes do upload ao banco de imagens. Mantida em 1920 para
 * preservar a qualidade do "master": o travamento na geração de relatórios
 * foi resolvido pelo carregamento sequencial das imagens, não pela redução
 * de resolução no upload.
 */
export const MAX_UPLOAD_WIDTH = 1920;

/** Qualidade JPEG padrão da compressão de upload (0–1). */
export const UPLOAD_QUALITY = 0.82;