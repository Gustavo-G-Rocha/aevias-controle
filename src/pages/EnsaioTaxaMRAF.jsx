import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

import EnsaioTaxaMRAFHeader from "@/components/ensaio-taxa-mraf/EnsaioTaxaMRAFHeader";
import EnsaioTaxaMRAFDadosGerais from "@/components/ensaio-taxa-mraf/EnsaioTaxaMRAFDadosGerais";
import EnsaioTaxaMRAFDimensoes from "@/components/ensaio-taxa-mraf/EnsaioTaxaMRAFDimensoes";
import EnsaioTaxaMRAFEnsaios from "@/components/ensaio-taxa-mraf/EnsaioTaxaMRAFEnsaios";
import EnsaioTaxaMRAFResumo from "@/components/ensaio-taxa-mraf/EnsaioTaxaMRAFResumo";
import EnsaioTaxaMRAFActions from "@/components/ensaio-taxa-mraf/EnsaioTaxaMRAFActions";

import { useEnsaioTaxaMRAFData } from "@/hooks/useEnsaioTaxaMRAFData";
import { useEnsaioTaxaMRAFForm } from "@/hooks/useEnsaioTaxaMRAFForm";
import { useEnsaioTaxaMRAFActions } from "@/hooks/useEnsaioTaxaMRAFActions";

export default function EnsaioTaxaMRAFPage() {
  // Hooks de dados
  const { user, obras, editingEnsaio, loading, loadInitialData } = useEnsaioTaxaMRAFData();
  
  // Hook de formulário
  const {
    formData,
    updateFormField,
    handleDimensoesChange,
    handleEnsaioChange,
    adicionarEnsaio,
    removerEnsaio
  } = useEnsaioTaxaMRAFForm(editingEnsaio);

  // Hook de ações
  const { saving, handleSubmit, handleCancel } = useEnsaioTaxaMRAFActions();

  // Carregar dados ao montar
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Estado de editabilidade
  const isApproved = editingEnsaio?.approved === true;
  const isEditable = !isApproved;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#00233B]/50" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white/20 backdrop-blur-lg border border-white/20 text-[#00233B]">
          <EnsaioTaxaMRAFHeader editingEnsaio={editingEnsaio} />
          <CardContent className="space-y-6">
            <EnsaioTaxaMRAFDadosGerais
              formData={formData}
              obras={obras}
              isEditable={isEditable}
              onFieldChange={updateFormField}
            />

            <EnsaioTaxaMRAFDimensoes
              dimensoes={formData.dimensoes_bandeja}
              isEditable={isEditable}
              onDimensoesChange={handleDimensoesChange}
            />

            <EnsaioTaxaMRAFEnsaios
              ensaios={formData.ensaios}
              isEditable={isEditable}
              taxaMinima={formData.taxa_minima_projeto}
              onEnsaioChange={handleEnsaioChange}
              onAdicionarEnsaio={adicionarEnsaio}
              onRemoverEnsaio={removerEnsaio}
            />

            <EnsaioTaxaMRAFResumo formData={formData} />

            <div>
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={e => updateFormField('observacoes', e.target.value)}
                disabled={!isEditable}
                rows={3}
              />
            </div>

            <EnsaioTaxaMRAFActions
              isEditable={isEditable}
              saving={saving}
              onSaveDraft={() => handleSubmit(formData, user, editingEnsaio, false)}
              onFinalize={() => handleSubmit(formData, user, editingEnsaio, true)}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}