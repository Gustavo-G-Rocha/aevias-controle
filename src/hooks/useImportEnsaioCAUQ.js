/**
 * useImportEnsaioCAUQ
 * Gerencia o fluxo de importação de planilha XLSX para EnsaioCAUQ.
 */
import { useState } from 'react';
import { importarEnsaioCAUQ } from '@/functions/importarEnsaioCAUQ';

export function useImportEnsaioCAUQ({ obraId, projectId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const importar = async (file) => {
    setLoading(true);
    setError(null);
    setResult(null);

    // Lê o arquivo como base64
    const fileBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // e.target.result = "data:application/...;base64,XXXXXX"
        const base64 = e.target.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await importarEnsaioCAUQ({ fileBase64, obraId, projectId });

    if (response?.data?.success) {
      setResult(response.data);
      onSuccess?.(response.data);
    } else {
      setError(response?.data?.error || 'Erro ao importar planilha');
    }

    setLoading(false);
  };

  return { importar, loading, error, result };
}