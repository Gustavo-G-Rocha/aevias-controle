import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';

// Hooks
import { useEnsaioManchaPenduloData } from '@/hooks/useEnsaioManchaPenduloData';
import { useEnsaioManchaPenduloForm } from '@/hooks/useEnsaioManchaPenduloForm';
import { useEnsaioManchaPenduloActions } from '@/hooks/useEnsaioManchaPenduloActions';

// Components
import DadosClienteSection from '@/components/ensaio-mancha-pendulo/DadosClienteSection';
import ManchaSection from '@/components/ensaio-mancha-pendulo/ManchaSection';
import PenduloSection from '@/components/ensaio-mancha-pendulo/PenduloSection';
import ResultadosSection from '@/components/ensaio-mancha-pendulo/ResultadosSection';

export default function EnsaioManchaPendulo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId') || searchParams.get('id');
  const isEditMode = !!editId;

  // Data hook
  const {
    loading,
    formData,
    setFormData,
    obrasDisponiveis,
    rodoviasDaObra
  } = useEnsaioManchaPenduloData(editId, isEditMode);

  // Form hooks
  const {
    handleInputChange,
    handleObraChange,
    handleManchaChange,
    handlePenduloChange
  } = useEnsaioManchaPenduloForm(formData, setFormData);

  // Actions hook
  const {
    saving,
    handleSave
  } = useEnsaioManchaPenduloActions(isEditMode, editId, formData);

  if (loading) {
    return <div className="p-8 text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-transparent min-h-screen">
      {/* Header — oculto no mobile: título e voltar ficam no MobileBackHeader */}
      <div className="hidden lg:flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(createPageUrl('MeusEnsaios'))}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          {isEditMode ? 'Editar' : 'Novo'} Ensaio de Macrotextura e Microtextura
        </h1>
      </div>

      {/* Dados Cliente */}
      <DadosClienteSection
        formData={formData}
        onInputChange={handleInputChange}
        onObraChange={handleObraChange}
        obrasDisponiveis={obrasDisponiveis}
        rodoviasDaObra={rodoviasDaObra}
      />

      {/* Mancha */}
      <ManchaSection
        formData={formData}
        onManchaChange={handleManchaChange}
      />

      {/* Pêndulo */}
      <PenduloSection
        formData={formData}
        onPenduloChange={handlePenduloChange}
      />

      {/* Resultados */}
      <ResultadosSection
        formData={formData}
        onInputChange={handleInputChange}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(createPageUrl('MeusEnsaios'))} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={() => handleSave(false)} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          Salvar Progresso
        </Button>
        <Button onClick={() => handleSave(true)} disabled={saving}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Finalizar Ensaio
        </Button>
      </div>
    </div>
  );
}