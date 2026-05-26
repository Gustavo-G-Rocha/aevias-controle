import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

import { useEnsaioTaxaPinturaImprimacaoData }    from '@/hooks/useEnsaioTaxaPinturaImprimacaoData';
import { useEnsaioTaxaPinturaImprimacaoForm }    from '@/hooks/useEnsaioTaxaPinturaImprimacaoForm';
import { useEnsaioTaxaPinturaImprimacaoActions } from '@/hooks/useEnsaioTaxaPinturaImprimacaoActions';

import EnsaioTaxaPinturaImprimacaoHeader    from '@/components/ensaio-taxa-pintura-imprimacao/EnsaioTaxaPinturaImprimacaoHeader';
import EnsaioTaxaPinturaImprimacaoDadosGerais from '@/components/ensaio-taxa-pintura-imprimacao/EnsaioTaxaPinturaImprimacaoDadosGerais';
import EnsaioTaxaPinturaImprimacaoResultados  from '@/components/ensaio-taxa-pintura-imprimacao/EnsaioTaxaPinturaImprimacaoResultados';
import EnsaioTaxaPinturaImprimacaoActions    from '@/components/ensaio-taxa-pintura-imprimacao/EnsaioTaxaPinturaImprimacaoActions';

export default function EnsaioTaxaPinturaImprimacaoPage() {
  const { formData, setFormData, obras, regionais, user, loading, editingEnsaio } =
    useEnsaioTaxaPinturaImprimacaoData();

  const {
    handleDimensoesChange,
    handleEnsaioChange,
    adicionarEnsaio,
    removerEnsaio,
    handleObraChange,
  } = useEnsaioTaxaPinturaImprimacaoForm(setFormData);

  const { saving, handleSubmit } = useEnsaioTaxaPinturaImprimacaoActions(formData, editingEnsaio, user);

  const isApproved = editingEnsaio?.approved === true;
  const isEditable = !isApproved;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-transparent">
        <Loader2 className="w-8 h-8 animate-spin text-[#00233B]/50" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white/20 backdrop-blur-lg border border-white/20 text-[#00233B]">
          <EnsaioTaxaPinturaImprimacaoHeader editingEnsaio={editingEnsaio} />
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
              <EnsaioTaxaPinturaImprimacaoDadosGerais
                formData={formData}
                obras={obras}
                isEditable={isEditable}
                onFieldChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
                onObraChange={(id) => handleObraChange(id, obras, regionais)}
                onDimensoesChange={handleDimensoesChange}
              />

              <EnsaioTaxaPinturaImprimacaoResultados
                formData={formData}
                isEditable={isEditable}
                onEnsaioChange={handleEnsaioChange}
                onAdicionarEnsaio={adicionarEnsaio}
                onRemoverEnsaio={removerEnsaio}
                onFieldChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
              />

              <EnsaioTaxaPinturaImprimacaoActions
                saving={saving}
                isEditable={isEditable}
                onSubmit={handleSubmit}
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}