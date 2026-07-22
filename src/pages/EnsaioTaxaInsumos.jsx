import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

import { useEnsaioTaxaInsumosData } from '@/hooks/useEnsaioTaxaInsumosData';
import { useEnsaioTaxaInsumosForm } from '@/hooks/useEnsaioTaxaInsumosForm';
import { useEnsaioTaxaInsumosActions } from '@/hooks/useEnsaioTaxaInsumosActions';

import EnsaioTaxaInsumosHeader from '@/components/ensaio-taxa-insumos/EnsaioTaxaInsumosHeader';
import EnsaioTaxaInsumosForm from '@/components/ensaio-taxa-insumos/EnsaioTaxaInsumosForm';
import EnsaioTaxaInsumosActions from '@/components/ensaio-taxa-insumos/EnsaioTaxaInsumosActions';

export default function EnsaioTaxaInsumosPage() {
  const { formData, setFormData, obras, user, loading, editingEnsaio } = useEnsaioTaxaInsumosData();

  const {
    handleDimensoesChange,
    handleEnsaioChange,
    adicionarEnsaio,
    removerEnsaio,
    handleObraChange,
  } = useEnsaioTaxaInsumosForm(setFormData);

  const { saving, handleSubmit } = useEnsaioTaxaInsumosActions(formData, editingEnsaio, user);

  const isApproved = editingEnsaio?.approved === true;
  const isEditable = !isApproved;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-transparent">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-card border border-border text-card-foreground">
          <EnsaioTaxaInsumosHeader editingEnsaio={editingEnsaio} />
          <CardContent>
            <form
              onSubmit={handleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') {
                  e.preventDefault();
                }
              }}
              className="space-y-6"
            >
              <EnsaioTaxaInsumosForm
                formData={formData}
                obras={obras}
                isEditable={isEditable}
                onFieldChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
                onObraChange={handleObraChange}
                onDimensoesChange={handleDimensoesChange}
                onEnsaioChange={handleEnsaioChange}
                onAdicionarEnsaio={adicionarEnsaio}
                onRemoverEnsaio={removerEnsaio}
              />
              <EnsaioTaxaInsumosActions saving={saving} isEditable={isEditable} onSubmit={handleSubmit} />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}