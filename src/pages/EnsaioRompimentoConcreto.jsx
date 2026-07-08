import React from 'react';
import LoadingState from '@/components/LoadingState';

import { useEnsaioRompimentoConcretoData }    from '@/hooks/useEnsaioRompimentoConcretoData';
import { useEnsaioRompimentoConcretoForm }    from '@/hooks/useEnsaioRompimentoConcretoForm';
import { useEnsaioRompimentoConcretoActions } from '@/hooks/useEnsaioRompimentoConcretoActions';

import EnsaioRompimentoConcretoHeader     from '@/components/ensaio-rompimento-concreto/EnsaioRompimentoConcretoHeader';
import EnsaioRompimentoConcretoDadosGerais from '@/components/ensaio-rompimento-concreto/EnsaioRompimentoConcretoDadosGerais';
import EnsaioRompimentoConcretoResultados  from '@/components/ensaio-rompimento-concreto/EnsaioRompimentoConcretoResultados';
import EnsaioRompimentoConcretoActions    from '@/components/ensaio-rompimento-concreto/EnsaioRompimentoConcretoActions';

export default function EnsaioRompimentoConcretoPage() {
  const {
    editId, loading,
    obras, projects,
    formData, setFormData,
    series, setSeries,
    seriesFlexao, setSeriesFlexao,
  } = useEnsaioRompimentoConcretoData();

  const {
    handleInputChange, handleObraChange,
    addSerie, removeSerie, updateSerie, updateSerieCP,
    addSerieFlexao, removeSerieFlexao, updateSerieFlexao, updateSerieFlexaoCP,
  } = useEnsaioRompimentoConcretoForm({ formData, setFormData, series, setSeries, seriesFlexao, setSeriesFlexao });

  const { saving, handleSave } = useEnsaioRompimentoConcretoActions(formData, editId);

  // ── Derived state ──
  const obraAtual         = obras.find(o => o.id === formData.obra_id);
  const rodoviasDaObra    = obraAtual?.rodovias || [];
  const empreiteirasObra  = obraAtual?.empreiteiras || [];
  const isSupervisao      = obraAtual?.tipo_obra === 'supervisao';
  const projectsDaObra    = obraAtual
    ? projects.filter(p => p.regional_id === obraAtual.regional_id)
    : [];

  if (loading) return <LoadingState />;

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        <EnsaioRompimentoConcretoHeader editId={editId} />

        <div className="space-y-6">
          <EnsaioRompimentoConcretoDadosGerais
            formData={formData}
            obras={obras}
            projects={projects}
            isSupervisao={isSupervisao}
            rodoviasDaObra={rodoviasDaObra}
            empreiteirasObra={empreiteirasObra}
            projectsDaObra={projectsDaObra}
            onFieldChange={handleInputChange}
            onObraChange={(id) => handleObraChange(id, obras)}
          />

          <EnsaioRompimentoConcretoResultados
            series={series}
            seriesFlexao={seriesFlexao}
            formData={formData}
            onAddSerie={addSerie}
            onRemoveSerie={removeSerie}
            onUpdateSerie={updateSerie}
            onUpdateSerieCP={updateSerieCP}
            onAddSerieFlexao={addSerieFlexao}
            onRemoveSerieFlexao={removeSerieFlexao}
            onUpdateSerieFlexao={updateSerieFlexao}
            onUpdateSerieFlexaoCP={updateSerieFlexaoCP}
            onFieldChange={handleInputChange}
          />

          <EnsaioRompimentoConcretoActions saving={saving} onSave={handleSave} />
        </div>
      </div>
    </div>
  );
}