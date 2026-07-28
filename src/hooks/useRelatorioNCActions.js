/**
 * Hook de ações para RelatorioNC.
 * Gerencia compressão de imagens e impressão.
 */
import { useState } from 'react';
import { useReportPdfActions } from '@/hooks/useReportPdfActions';

/**
 * Comprime uma imagem via canvas e retorna data URL.
 * @param {string} url - URL da imagem
 * @param {number} maxWidth - Largura máxima (padrão: 1200)
 * @param {number} quality - Qualidade JPEG (padrão: 0.7)
 * @returns {Promise<string>} Data URL comprimida ou URL original
 */
const compressImage = (url, maxWidth = 1200, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas
        .getContext('2d')
        .drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(url); // fallback original
    img.src = url;
  });
};

export const useRelatorioNCActions = (fotos = []) => {
  const [compressedFotos, setCompressedFotos] = useState([]);
  const [compressingFotos, setCompressingFotos] = useState(false);

  const comprimirFotos = async () => {
    if (fotos.length === 0) return;
    setCompressingFotos(true);
    try {
      const compressed = await Promise.all(
        fotos.map((url) => compressImage(url)),
      );
      setCompressedFotos(compressed);
    } finally {
      setCompressingFotos(false);
    }
  };

  // PDF: no PC abre "Salvar como"; no celular baixa direto.
  const { handlePrint, downloading } = useReportPdfActions('relatorio-nc.pdf');

  return {
    compressedFotos,
    compressingFotos,
    comprimirFotos,
    imprimirPDF: handlePrint,
    downloading,
  };
};