import React from 'react';
import { useEnsaioVigaBenkelmanData }    from '@/hooks/useEnsaioVigaBenkelmanData';
import { useEnsaioVigaBenkelmanForm }    from '@/hooks/useEnsaioVigaBenkelmanForm';
import { useEnsaioVigaBenkelmanActions } from '@/hooks/useEnsaioVigaBenkelmanActions';

import EnsaioVigaBenkelmanHeader    from '@/components/ensaio-viga-benkelman/EnsaioVigaBenkelmanHeader';
import EnsaioVigaBenkelmanDadosGerais from '@/components/ensaio-viga-benkelman/EnsaioVigaBenkelmanDadosGerais';
import EnsaioVigaBenkelmanResultados  from '@/components/ensaio-viga-benkelman/EnsaioVigaBenkelmanResultados';
import EnsaioVigaBenkelmanActions    from '@/components/ensaio-viga-benkelman/EnsaioVigaBenkelmanActions';

export default function EnsaioVigaBenkelman() {
  const { loading, obras, formData, setFormData, editId } = useEnsaioVigaBenkelmanData();

  const {
    activeFaixaTab,
    setActiveFaixaTab,
    handleInputChange,
    handleCteVigaChange,
    handleObraChange,
    handleLeituraInicialChange,
    addFaixa,
    removeFaixa,
    updateFaixaNome,
    updateLevantamento,
  } = useEnsaioVigaBenkelmanForm(setFormData);

  const { saving, handleSave } = useEnsaioVigaBenkelmanActions(formData, editId);

  if (loading) return <div className="p-6 text-center">Carregando...</div>;

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <EnsaioVigaBenkelmanHeader editId={editId} />

        <EnsaioVigaBenkelmanDadosGerais
          formData={formData}
          obras={obras}
          onObraChange={(id) => handleObraChange(id, obras)}
          onInputChange={handleInputChange}
          onCteVigaChange={handleCteVigaChange}
          onLeituraInicialChange={handleLeituraInicialChange}
        />

        <EnsaioVigaBenkelmanResultados
          formData={formData}
          activeFaixaTab={activeFaixaTab}
          setActiveFaixaTab={setActiveFaixaTab}
          onAddFaixa={addFaixa}
          onRemoveFaixa={removeFaixa}
          onUpdateFaixaNome={updateFaixaNome}
          onUpdateLevantamento={updateLevantamento}
          onInputChange={handleInputChange}
        />

        <EnsaioVigaBenkelmanActions saving={saving} onSave={handleSave} />
      </div>
    </div>
  );
}