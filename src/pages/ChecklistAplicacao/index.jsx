/**
 * ChecklistAplicacao/index.jsx
 *
 * Orquestrador da página de Checklist de Aplicação.
 * Responsabilidade: compor seções e passar props. Sem lógica de negócio.
 *
 * Estrutura interna:
 *   hooks/useChecklistAplicacaoForm.js — handlers, upload e submit
 *   components/DadosObraSection        — obra, projeto, data, jornada e campos gerais
 *   components/ClimaSection            — condições climáticas por período
 *   components/FresagemSection         — fresagem e preparação da superfície
 *   components/PinturaLigacaoSection   — tabela de pintura de ligação
 *   components/ControleAplicacaoSection — km/estaca, quantidades e tabela de ensaios
 *   components/ObservacoesSection      — observações gerais, NCs, fotos, medições
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useChecklistForm } from "@/hooks/useChecklistForm";
import StatusDraftBanner from "@/components/forms/StatusDraftBanner";
import RejectionBanner from "@/components/forms/RejectionBanner";
import ChecklistFooter from "@/components/checklists/ChecklistFooter";

import { useChecklistAplicacaoForm } from "./hooks/useChecklistAplicacaoForm";
import DadosObraSection from "./components/DadosObraSection";
import ClimaSection from "./components/ClimaSection";
import FresagemSection from "./components/FresagemSection";
import PinturaLigacaoSection from "./components/PinturaLigacaoSection";
import ControleAplicacaoSection from "./components/ControleAplicacaoSection";
import ObservacoesSection from "./components/ObservacoesSection";

function getInitialFormData() {
  const today = new Date().toISOString().split('T')[0];
  return {
    obra_id: "", project_id: "", data: today,
    jornada: { horario_inicio: "", horario_fim: "" },
    rodovia: "", trecho: "", empreiteira: "", usina: "",
    projeto_utilizado: "", faixa_especificada: "",
    ligante: "", pedreira: "", inspetor_campo: "",
    ensaio_realizado_por: "Afirma Evias",
    periodos_clima: [
      { periodo: "manha", temperatura_ambiente: null, condicoes_climaticas: "bom" },
      { periodo: "tarde", temperatura_ambiente: null, condicoes_climaticas: "bom" },
      { periodo: "noite", temperatura_ambiente: null, condicoes_climaticas: "bom" },
    ],
    fresagem_preparacao: {
      superficie_limpa: false, destinacao_material_fresado: false,
      material_solto_removido: false, pavimento_pronto_pintura: false, observacoes: "",
    },
    pintura_ligacao: {
      pintura_barra_espargidora: { realizado: false, resultado: "" },
      tempo_rompimento_cura: { realizado: false, resultado: "" },
      taxa_pintura: { realizado: false, resultado: null, conforme: null },
      residuo_emulsao: { realizado: false, resultado: null },
      taxa_pintura_residual: { realizado: false, resultado: null, conforme: null },
      observacoes: "",
    },
    controle_aplicacao: {
      km_estaca_inicial: "", lado_inicial: "direito",
      km_estaca_final: "", lado_final: "direito",
      quantidade_aplicada_cargas: null, quantidade_aplicada_toneladas: null,
      temp_aplicacao_cargas: { realizado: false, quantidade: 0, conforme: null },
      espessura_camada: { realizado: false, quantidade: 0, conforme: null },
      observacoes: "",
    },
    observacoes_gerais: "",
    acoes_corretivas_realizado: null, acoes_corretivas_descricao: "",
    nao_conformidades: [], fotos: [],
    medicoes_geometricas: { subtrecho: "", servico: "", medicoes: [] },
    status: "rascunho",
  };
}

export default function ChecklistAplicacaoPage() {
  const {
    obras, projects, faixas, user, editingChecklist,
    loading, formData, setFormData, obraSelecionada,
    projetosDisponiveis, isApproved, isEditable, clearSavedData, navigate,
  } = useChecklistForm(getInitialFormData, 'ChecklistAplicacao', 'checklist_aplicacao');

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const selectedProject = useMemo(() =>
    projects.find(p => p.id === formData.project_id),
    [projects, formData.project_id]
  );

  const handlers = useChecklistAplicacaoForm({
    formData, setFormData, projects, faixas,
    editingChecklist, user,
    setSaving, setUploadingPhoto,
    clearSavedData, navigate,
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-transparent">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-2">Carregando checklist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-card border border-border text-card-foreground">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">
                  {editingChecklist ? 'Editar Checklist de Aplicação' : 'Novo Checklist de Aplicação'}
                </CardTitle>
                <CardDescription>
                  {editingChecklist
                    ? `Editando checklist de ${new Date(editingChecklist.data).toLocaleDateString('pt-BR')}`
                    : "Preencha as informações do controle tecnológico de aplicação"}
                </CardDescription>
              </div>
              {editingChecklist && (
                <Link to={createPageUrl(`RelatorioChecklistAplicacao?id=${editingChecklist.id}`)} target="_blank">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" /> Ver PDF
                  </Button>
                </Link>
              )}
            </div>
            <StatusDraftBanner status={formData.status} />
            <RejectionBanner rejectionReason={editingChecklist?.rejection_reason} variant="transparent" />
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handlers.handleSubmit}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') e.preventDefault(); }}
              className="space-y-8"
            >
              <DadosObraSection
                formData={formData}
                obras={obras}
                projetosDisponiveis={projetosDisponiveis}
                obraSelecionada={obraSelecionada}
                selectedProject={selectedProject}
                isEditable={isEditable}
                onChange={handlers.handleInputChange}
                onNestedChange={handlers.handleNestedChange}
              />

              <Separator />

              <ClimaSection
                periodos={formData.periodos_clima}
                isEditable={isEditable}
                onChange={(v) => handlers.handleInputChange('periodos_clima', v)}
              />

              <Separator />

              <FresagemSection
                fresagem={formData.fresagem_preparacao}
                isEditable={isEditable}
                onNestedChange={handlers.handleNestedChange}
              />

              <Separator />

              <PinturaLigacaoSection
                pintura={formData.pintura_ligacao}
                isEditable={isEditable}
                onDeepChange={handlers.handleDeepChange}
                onNestedChange={handlers.handleNestedChange}
              />

              <Separator />

              <ControleAplicacaoSection
                controle={formData.controle_aplicacao}
                isEditable={isEditable}
                onNestedChange={handlers.handleNestedChange}
                onDeepChange={handlers.handleDeepChange}
              />

              <Separator />

              <ObservacoesSection
                formData={formData}
                isEditable={isEditable}
                uploadingPhoto={uploadingPhoto}
                onChange={handlers.handleInputChange}
                onPhotoUpload={handlers.handlePhotoUpload}
                onRemovePhoto={handlers.handleRemovePhoto}
              />

              <ChecklistFooter
                isEditable={isEditable}
                isApproved={isApproved}
                loadingUpload={saving || uploadingPhoto}
                onCancel={() => { clearSavedData(); navigate(createPageUrl('MeusEnsaios')); }}
                onSaveProgress={async (e) => { e.preventDefault(); await handlers.handleSubmit(e, 'rascunho'); }}
                onFinalize={async (e) => { e.preventDefault(); await handlers.handleSubmit(e, 'finalizado'); }}
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}