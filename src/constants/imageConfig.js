/**
 * Configuração centralizada de processamento de imagens.
 *
 * MAX_UPLOAD_WIDTH — dimensão de referência (lado maior) usada na compressão
 * de imagens antes do upload ao banco de imagens. Reduzido de 1920 → 1280
 * para diminuir o peso de armazenamento e o consumo de memória ao gerar
 * relatórios com muitas imagens, sem alterar o algoritmo de resize (que
 * preserva a proporção/aspect ratio original).
 */
export const MAX_UPLOAD_WIDTH = 1280;

/** Qualidade JPEG padrão da compressão de upload (0–1). */
export const UPLOAD_QUALITY = 0.82;