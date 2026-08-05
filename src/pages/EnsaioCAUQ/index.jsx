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
import { Loader2, CheckCircle } from "lucide-react";
import LoadingState from "@/components/LoadingState";
import SaveProgressButton from "@/components/forms/SaveProgressButton";
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
import { todayISO } from "@/utils/formInitialData";

const getInitialFormData = () => ({
  obra_id: "", project_id: "",
  data_ensaio: todayISO(),
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

  // Preenche todos os campos do formulário com valores de exemplo.
  // Acelera testes automatizados e serve como template para laboratoristas.
  const handleFillAllExample = () => {
    if (!isEditable || isApproved) return;

    // Valores de exemplo para condições ambientais e medições
    const pesoInicialExemplo = 1175;
    setFormData(prev => ({
      ...prev,
      horario: '09:00',
      local_coleta: 'KM 45 Rodovia BR-163',
      pedreira: 'Pedreira Norte',
      faixa_especificada: 'Faixa C',
      tipo_ligante: 'CAP 50/70',
      temperatura_cap: 160,
      extracao_ligante: {
        ...prev.extracao_ligante,
        amostra_com_ligante: 1250,
        amostra_sem_ligante: pesoInicialExemplo,
      },
    }));

    // Preenche peneiras se houver projeto selecionado com faixa
    if (peneirasDoProjecto.length > 0) {
      const total = peneirasDoProjecto.length;
      const newSieves = {};
      peneirasDoProjecto.forEach((peneira, index) => {
        const baseValue = (total - index) * (pesoInicialExemplo / (total * 3));
        newSieves[peneira.key] = baseValue.toFixed(2);
      });
      setFormData(prev => ({
        ...prev,
        granulometria: { peso_retido_peneiras: newSieves },
      }));
    }
  };

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
    return <LoadingState />;
  }

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{editingEnsaio?.id ? "Editar Ensaio de CAUQ" : "Novo Ensaio de CAUQ"}</CardTitle>
            <CardDescription>
              {editingEnsaio?.id
                ? `Editando ensaio de ${new Date(editingEnsaio.data_ensaio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`
                : "Extração, Granulometria e Marshall"}
            </CardDescription>
            <StatusDraftBanner status={formData.status} variant="green" />
            <RejectionBanner rejectionReason={editingEnsaio?.rejection_reason} />
            {editingEnsaio?.id && formData.status === 'rascunho' && (
              <div data-testid="draft-saved-indicator"
                   role="status" aria-live="polite"
                   className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                   style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                <CheckCircle className="h-4 w-4" />
                Rascunho salvo
              </div>
            )}
            {isEditable && !isApproved && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleFillAllExample}
                data-testid="fill-all-example"
                className="w-fit"
              >
                Preencher Tudo (Exemplo)
              </Button>
            )}
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handlers.handleSubmit}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') e.preventDefault(); }}
              className="space-y-6 pb-24"
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

              {/* Rodapé de ações — fixed para sempre visível (acessibilidade/testes) */}
              <div className="fixed bottom-16 lg:bottom-0 left-0 lg:left-64 right-0 z-40
                              flex justify-end gap-4 py-3 px-6
                              bg-background/95 backdrop-blur border-t border-border">
                <Button type="button" variant="outline"
                  onClick={() => { clearSavedData(); navigate(createPageUrl('MeusEnsaios')); }}
                  disabled={saving}>
                  Cancelar
                </Button>

                {isEditable && !isApproved && (
                  <>
                    <SaveProgressButton
                      onClick={handlers.handleSaveProgress}
                      saving={saving}
                      disabled={!formData.obra_id}
                      testId="save-progress-btn"
                      className="border border-input bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground"
                    />
                    <Button type="submit" data-testid="finalize-btn" disabled={saving}>
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
  );
}