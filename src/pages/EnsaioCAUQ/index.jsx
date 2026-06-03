/**
 * EnsaioCAUQ/index.jsx
 *
 * Orquestrador da página de Ensaio de CAUQ.
 * Responsabilidade: compor seções, passar props, nada mais.
 *
 * Estrutura interna:
 *   hooks/useEnsaioCAUQForm.js   — lógica, cálculos, submit
 *   components/DadosObraSection     — seleção de obra/projeto e campos gerais
 *   components/ExtracaoLiganteSection — extração Rotarex + campos calculados
 *   components/GranulometriaSection   — tabela de peneiras com % passante
 *   components/DensidadeRiceSection   — Rice DMT (condicional ao Marshall)
 *   components/MarshallSection        — CPs Marshall com RTCD / Estab. e Fluência
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save, CheckCircle, FileSpreadsheet } from "lucide-react";
import ImportEnsaioCAUQDialog from "@/components/forms/ImportEnsaioCAUQDialog";
import { createPageUrl } from "@/utils";
import { useEnsaioForm } from "@/hooks/useEnsaioForm";
import { PENEIRAS_CONFIG, filtrarPeneirasPorFaixa } from "@/constants/sieves";
import StatusDraftBanner from "@/components/forms/StatusDraftBanner";
import RejectionBanner from "@/components/forms/RejectionBanner";

import { useEnsaioCAUQForm } from "./hooks/useEnsaioCAUQForm";
import DadosObraSection from "./components/DadosObraSection";
import ExtracaoLiganteSection from "./components/ExtracaoLiganteSection";
import GranulometriaSection from "./components/GranulometriaSection";
import DensidadeRiceSection from "./components/DensidadeRiceSection";
import MarshallSection from "./components/MarshallSection";

const getInitialFormData = () => ({
  obra_id: "", project_id: "",
  data_ensaio: new Date().toISOString().split('T')[0],
  horario: "", placa_caminhao: "", local_coleta: "",
  usina_fornecedora: "", pedreira: "", rodovia: "", trecho: "",
  tipo_ligante: "", temperatura_cap: null,
  faixa_especificada: "", ensaio_realizado_por: "Afirma Evias",
  realizar_ensaio_umidade: false,
  extracao_ligante: {
    amostra_umida: null, amostra_seca: null, umidade: null,
    amostra_com_ligante: null, amostra_sem_ligante: null,
    fator_correcao: 1.0, peso_ligante: null,
    teor_ligante: null, filler_betume: null, teor_ligante_real: null,
  },
  granulometria: { peso_retido_peneiras: {} },
  realizar_densidade_rice: false,
  densidade_rice: {
    frasco_agua: null, amostra: null, frasco_agua_amostra: null,
    temperatura_agua: null, densidade_agua: 0.9971, densidade_rice: null,
  },
  realizar_marshall: false,
  corpos_prova_marshall: [],
  observacoes: "",
  status: "rascunho",
  approved: null,
  rejection_reason: null,
});

export default function EnsaioCAUQPage() {
  const {
    obras, regionais, projects, faixas, user,
    editingEnsaio, setEditingEnsaio,
    loading, formData, setFormData,
    obraSelecionada, regionalSelecionada, projetosDisponiveis,
    isApproved, isEditable, clearSavedData, navigate,
  } = useEnsaioForm(getInitialFormData, 'EnsaioCAUQ', 'ensaio_cauq');

  const [saving, setSaving] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const selectedProject = useMemo(() =>
    projects.find(p => p.id === formData.project_id),
    [projects, formData.project_id]
  );

  const selectedFaixa = useMemo(() =>
    selectedProject?.faixa_granulometrica_id
      ? faixas.find(f => f.id === selectedProject.faixa_granulometrica_id)
      : null,
    [selectedProject, faixas]
  );

  const peneirasDoProjecto = useMemo(() =>
    filtrarPeneirasPorFaixa(selectedFaixa, PENEIRAS_CONFIG),
    [selectedFaixa]
  );

  const projetosCAUQ = useMemo(() =>
    projetosDisponiveis.filter(p => p.tipo_projeto === 'CAUQ'),
    [projetosDisponiveis]
  );

  const handlers = useEnsaioCAUQForm({
    formData, setFormData, projects, faixas,
    editingEnsaio, setEditingEnsaio,
    user, setSaving, clearSavedData, navigate,
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <>
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle>{editingEnsaio?.id ? "Editar Ensaio de CAUQ" : "Novo Ensaio de CAUQ"}</CardTitle>
                <CardDescription>
                  {editingEnsaio?.id
                    ? `Editando ensaio de ${new Date(editingEnsaio.data_ensaio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`
                    : "Extração, Granulometria e Marshall"}
                </CardDescription>
              </div>
              {!editingEnsaio?.id && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-green-600 text-green-700 hover:bg-green-50"
                  onClick={() => setImportOpen(true)}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1.5" />
                  Importar Excel
                </Button>
              )}
            </div>
            <StatusDraftBanner status={formData.status} variant="green" />
            <RejectionBanner rejectionReason={editingEnsaio?.rejection_reason} />
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handlers.handleSubmit}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') e.preventDefault(); }}
              className="space-y-6"
            >
              <DadosObraSection
                formData={formData}
                obras={obras}
                regionais={regionais}
                projetosCAUQ={projetosCAUQ}
                obraSelecionada={obraSelecionada}
                regionalSelecionada={regionalSelecionada}
                selectedProject={selectedProject}
                isEditable={isEditable}
                isApproved={isApproved}
                editingEnsaio={editingEnsaio}
                onObra={(v) => handlers.handleChange('obra_id', v)}
                onProject={handlers.handleProjectChange}
                onChange={handlers.handleChange}
              />

              <ExtracaoLiganteSection
                formData={formData}
                isEditable={isEditable}
                isApproved={isApproved}
                onNestedChange={handlers.handleNestedChange}
                onChange={handlers.handleChange}
              />

              <GranulometriaSection
                formData={formData}
                peneirasDoProjecto={peneirasDoProjecto}
                selectedProject={selectedProject}
                isEditable={isEditable}
                isApproved={isApproved}
                onNestedChange={handlers.handleNestedChange}
              />

              {formData.realizar_marshall && (
                <DensidadeRiceSection
                  formData={formData}
                  isEditable={isEditable}
                  isApproved={isApproved}
                  onNestedChange={handlers.handleNestedChange}
                  onChange={handlers.handleChange}
                />
              )}

              <MarshallSection
                formData={formData}
                isEditable={isEditable}
                isApproved={isApproved}
                onChange={handlers.handleChange}
                onCorpoProvaChange={handlers.handleCorpoProvaChange}
                onAdicionarCP={handlers.adicionarCorpoProva}
                onRemoverCP={handlers.removerCorpoProva}
              />

              {/* Observações */}
              <div>
                <Label htmlFor="observacoes">Observações Gerais</Label>
                <Textarea id="observacoes" value={formData.observacoes}
                  onChange={(e) => handlers.handleChange('observacoes', e.target.value)}
                  disabled={!isEditable || isApproved} rows={3} maxLength="500" />
              </div>

              {/* Rodapé de ações */}
              <div className="flex justify-end gap-4 mt-6">
                <Button type="button" variant="outline"
                  onClick={() => { clearSavedData(); navigate(createPageUrl('MeusEnsaios')); }}
                  disabled={saving}>
                  Cancelar
                </Button>

                {isEditable && !isApproved && (
                  <>
                    <Button type="button" variant="outline"
                      onClick={handlers.handleSaveProgress}
                      disabled={saving || !formData.obra_id}
                      className="border-[#BFCF99] text-[#00233B] hover:bg-[#BFCF99]/10">
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Salvar Progresso
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                      Finalizar Registro
                    </Button>
                  </>
                )}

                {isApproved && (
                  <Badge className="bg-green-500 hover:bg-green-500 px-4 py-2 text-md">
                    <CheckCircle className="mr-2 h-4 w-4" /> Aprovado
                  </Badge>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>

    <ImportEnsaioCAUQDialog
      open={importOpen}
      onOpenChange={setImportOpen}
      obras={obras}
      onSuccess={(data) => {
        setImportOpen(false);
        navigate(`/EnsaioCAUQ?id=${data.id}`);
      }}
    />
    </>
  );
}