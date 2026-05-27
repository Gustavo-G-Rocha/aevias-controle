import React, { useState } from 'react';
import { useImpressionEtiquetasData } from '@/hooks/useImpressionEtiquetasData';
import { useImpressionEtiquetasActions } from '@/hooks/useImpressionEtiquetasActions';

import UploadSection from '@/components/impression-etiquetas/UploadSection';
import EtiquetasColeta from '@/components/impression-etiquetas/EtiquetasColeta';
import EtiquetasUmidade from '@/components/impression-etiquetas/EtiquetasUmidade';

export default function ImpressionEtiquetas() {
  const [tipoEtiqueta, setTipoEtiqueta] = useState('coleta');
  const [showRender, setShowRender] = useState(false);
  
  const { etiquetas, loading, erro, handleFileUpload, limpar } = useImpressionEtiquetasData();
  const { handlePrint } = useImpressionEtiquetasActions();

  const handleTipoChange = (novoTipo) => {
    setTipoEtiqueta(novoTipo);
    limpar();
    setShowRender(false);
  };

  const handleVoltar = () => {
    setShowRender(false);
    limpar();
  };

  // Upload screen
  if (!showRender) {
    return (
      <UploadSection
        tipoEtiqueta={tipoEtiqueta}
        loading={loading}
        erro={erro}
        etiquetas={etiquetas}
        onTipoChange={handleTipoChange}
        onFileUpload={handleFileUpload}
        onShowRender={() => setShowRender(true)}
      />
    );
  }

  // Render etiquetas
  if (tipoEtiqueta === 'umidade') {
    return <EtiquetasUmidade etiquetas={etiquetas} onPrint={handlePrint} onVoltar={handleVoltar} />;
  }

  return <EtiquetasColeta etiquetas={etiquetas} onPrint={handlePrint} onVoltar={handleVoltar} />;
}