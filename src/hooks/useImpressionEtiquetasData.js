import { useState } from 'react';
import { processarArquivoColeta, processarArquivoUmidade } from '@/utils/impressionEtiquetasUtils';
import { logger } from '@/utils/logger';

export function useImpressionEtiquetasData() {
  const [etiquetas, setEtiquetas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleFileUpload = async (file, tipoEtiqueta) => {
    if (!file) return;

    setLoading(true);
    setErro('');

    try {
      const xlsxModule = await import('xlsx');
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const workbook = xlsxModule.read(event.target?.result, { type: 'binary' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const data = xlsxModule.utils.sheet_to_json(worksheet);

          const processadas = tipoEtiqueta === 'umidade'
            ? processarArquivoUmidade(data)
            : processarArquivoColeta(data);

          setEtiquetas(processadas);
          setErro('');
        } catch (err) {
          setErro('Erro ao processar arquivo. Verifique o formato.');
          logger.error(err);
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setErro('Erro ao ler o arquivo.');
        setLoading(false);
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      setErro('Erro ao processar arquivo. Verifique o formato.');
      logger.error(error);
      setLoading(false);
    }
  };

  const limpar = () => {
    setEtiquetas([]);
    setErro('');
    setLoading(false);
  };

  return { etiquetas, loading, erro, handleFileUpload, limpar };
}