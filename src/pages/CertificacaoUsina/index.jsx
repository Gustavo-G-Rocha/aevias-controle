import { useState, useCallback, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useChecklistForm } from "@/hooks/useChecklistForm";
import { useCertificacaoUsinaForm } from "@/hooks/useCertificacaoUsinaForm";
import { validarCertificacao, VALIDADORES_PAGINA } from "@/utils/certificacaoUsinaUtils";
import { canGestorPreencherResultado, laboratoristaDeveOcultarResultado } from "@/utils/certificacaoUsinaAccess";
import { criarCertificacao, atualizarCertificacao } from "@/services/certificacaoUsinaService";
import { uploadMultipleFiles } from "@/utils/imageUpload";
import ChecklistFooter from "@/components/checklists/ChecklistFooter";
import StatusDraftBanner from "@/components/forms/StatusDraftBanner";
import RejectionBanner from "@/components/forms/RejectionBanner";
import CertificacaoUsinaHeader from "@/components/certificacao-usina/CertificacaoUsinaHeader";
import { Button } from "@/components/ui/button";

import SecaoDescricao from "@/components/certificacao-usina/SecaoDescricao";
import SecaoClasseTipo from "@/components/certificacao-usina/SecaoClasseTipo";
import SecaoAspectosLegais from "@/components/certificacao-usina/SecaoAspectosLegais";
import SecaoSaudeSeguranca from "@/components/certificacao-usina/SecaoSaudeSeguranca";
import SecaoMeioAmbiente from "@/components/certificacao-usina/SecaoMeioAmbiente";
import SecaoLaboratorio from "@/components/certificacao-usina/SecaoLaboratorio";
import SecaoAfeicao from "@/components/certificacao-usina/SecaoAfeicao";
import SecaoEstruturaUsina from "@/components/certificacao-usina/SecaoEstruturaUsina";
import SecaoResultado from "@/components/certificacao-usina/SecaoResultado";
import SecaoFotos from "@/components/certificacao-usina/SecaoFotos";

const DEFAULT_ASPECTOS_LEGAIS = {
  autorizacao_ambiental: "Sim",
  licenca_previa: "Sim",
  licenca_instalacao: "Sim",
  licenca_operacao: "Sim",
};

const DEFAULT_SAUDE_SEGURANCA = {
  treinamentos: { nr10_eletricistas: "Conforme", nr11_nr12_operadores: "Conforme", nr18_integracao: "Conforme", nr35_altura: "Conforme", fispq_quimicos: "Conforme" },
  epis: { aprovados_ministerio: "Conforme", compativeis_atividades: "Conforme", sendo_cautelados: "Conforme", extintores_npt021: "Conforme" },
  acessos: { dimensionados_seguros: "Conforme", material_resistente: "Conforme", travessao_superior: "Conforme", sem_superficie_plana: "Conforme", rodape_travessao_intermediario: "Conforme", largura_060m: "Conforme" },
  escadas_marinheiro: { gaiolas_protecao: "Conforme", corrimao_montantes: "Conforme", largura_040_060m: "Conforme", altura_max_10m: "Conforme", altura_max_6m_plataformas: "Conforme", espacamento_barras_025_030m: "Conforme", espacamento_piso_primeira_barra: "Conforme", distancia_estrutura_015m: "Conforme", diametro_barras: "Conforme", barras_antideslizamento: "Conforme" },
  gaiolas_protecao: { diametro_065_080m: "Conforme", barras_verticais_espacamento: "Conforme", vaos_arcos: "Conforme" },
  instalacoes_eletricas: { condutores_resistencia_mecanica: "Conforme", condutores_protecao_rompimento: "Conforme", condutores_localizacao: "Conforme", condutores_transito: "Conforme", condutores_sem_riscos: "Conforme", condutores_material_nao_propaga_fogo: "Conforme", quadros_porta_fechada: "Conforme", quadros_sinalizacao_choque: "Conforme", quadros_conservacao: "Conforme", quadros_identificacao_circuitos: "Conforme", quadros_protecao_sobretensao: "Conforme", dispositivos_sem_zona_perigosa: "Conforme", dispositivos_emergencia: "Conforme", dispositivos_sem_acionamento_involuntario: "Conforme", dispositivos_sem_burla: "Conforme", dispositivos_sem_funcionamento_automatico: "Conforme" },
  sistemas_seguranca: { protecoes_fixas_moveis: "Conforme", engrenagens_protegidas: "Conforme" },
  protecoes: { funcoes_vida_util: "Conforme", materiais_contencao: "Conforme", fixacao_estabilidade: "Conforme", sem_esmagamento: "Conforme", sem_arestas_cortantes: "Conforme", resistem_condicoes_ambientais: "Conforme", dificulta_burla: "Conforme", higiene_limpeza: "Conforme", impedem_acesso_perigo: "Conforme", intertravamento_protegidos: "Conforme" },
  nr35_trabalho_altura: { treinamento_nr35: "Conforme", aso_apto_altura: "Conforme", analise_risco: "Conforme", permissao_trabalho: "Conforme", cinto_talabarte: "Conforme" },
  nr10_eletricidade: { prontuarios_75kw: "Conforme", esquema_unifilar: "Conforme", dispositivo_dr_nbr5410: "Conforme", aterramento: "Conforme", treinamento_nr10: "Conforme" },
};

const DEFAULT_MEIO_AMBIENTE = {
  ruidos: { medicao_semestral_nbr10151: "Conforme", horarios_intensidade_municipio: "Conforme", manutencao_maquinas: "Conforme" },
  emissao_atmosferica: { medicao_poluentes_chamine: "Conforme", resolucao_sema_016_2014: "Conforme", monitoramento_fumaca_preta: "Conforme", filtro_material_particulado: "Conforme" },
  efluentes_liquidos: { fossa_septica_nbr7229: "Conforme", manutencao_fossas: "Conforme", oleo_lubrificante_tambores: "Conforme", oleo_recicladoras_licenciadas: "Conforme", efluentes_conama_357: "Conforme", armazenamento_combustiveis: "Conforme", sem_sinais_vazamentos: "Conforme" },
  residuos_solidos: { coleta_seletiva: "Conforme", transporte_licenciado: "Conforme", destinacao_licenciada: "Conforme", licencas_arquivadas: "Conforme", mtr_emitidas: "Conforme" },
  contaminacao_produtos_perigosos: { plano_atendimento_emergencias: "Conforme", fispqs_disponiveis: "Conforme", funcionarios_treinados_fispqs: "Conforme", kits_emergencia: "Conforme" },
  consideracoes_gerais: { autorizacao_supressao_vegetacao: "Conforme", vegetacao_remanescente: "Conforme", estruturas_contencao: "Conforme", outorga_captacao: "Conforme", ddsma: "Conforme", apr_aspectos_ambientais: "Conforme" },
};

const DEFAULT_LABORATORIO_EQUIPAMENTOS = {
  balanca_10kg: "Possui", balanca_4_1kg: "Possui", banho_maria: "Possui", cesto_adesividade: "Possui",
  kit_pesagem_hidrostatica: "Possui", compactador_marshall: "Possui", conjunto_peneiras: "Possui",
  conjunto_equiv_areia: "Possui", conjunto_rice: "Possui", estufa: "Possui", extensometro_fluometro: "Possui",
  extrator_cp_marshall: "Possui", molde_estabilidade: "Possui", molde_resistencia: "Possui",
  prensa_marshall: "Possui", refluxo_soxhlet: "Possui", rotarex: "Possui", soquete_marshall: "Possui",
  termometro_infravermelho: "Possui", termometro_bimetalico: "Possui", anel_bola: "Possui",
  ductilometro: "Possui", viscosimetro_brookfield: "Possui",
};

const DEFAULT_LABORATORIO_PROFISSIONAIS = {
  laboratorista_possui: true,
  auxiliar_laboratorio_possui: true,
  encarregado_laboratorio_possui: true,
};

const getInitialFormData = () => ({
  obra_id: "",
  razao_social: "",
  interessado: "",
  responsavel_tecnico: "",
  telefone: "",
  email: "",
  data_vistoria: new Date().toISOString().split("T")[0],
  avaliador: "",
  cnpj: "",
  validade: "",
  localizacao: "",
  marca_usina: "",
  numero_serie: "",
  fornecimento_agregado: "",
  mineralogia: "",
  classe_usina: "",
  tipo_dosagem: "",
  tipo_secagem: "",
  aspectos_legais: { ...DEFAULT_ASPECTOS_LEGAIS },
  saude_seguranca: DEFAULT_SAUDE_SEGURANCA,
  meio_ambiente: DEFAULT_MEIO_AMBIENTE,
  laboratorio: {
    equipamentos: { ...DEFAULT_LABORATORIO_EQUIPAMENTOS },
    profissionais: { ...DEFAULT_LABORATORIO_PROFISSIONAIS },
  },
  afeicao: {},
  estrutura_fisica: {},
  usina_asfalto: {},
  ensaios_validacao: {},
  resultado_classe: "",
  observacoes_resultado: "",
  observacoes_gerais: "",
  fotos: [],
  status: "rascunho",
  approved: null,
  rejection_reason: null,
});

// Cada página referencia sua seção (key) e o validador correspondente pelo índice-base.
const ALL_PAGES = [
  { key: "identificacao", num: "1-4", label: "Identificação e\nAspectos Legais", validatorIndex: 0 },
  { key: "saude",         num: "5",   label: "Saúde e\nSegurança",              validatorIndex: 1 },
  { key: "meio_ambiente", num: "6",   label: "Meio\nAmbiente",                   validatorIndex: 2 },
  { key: "laboratorio",   num: "7",   label: "Laboratório\ne Estrutura",         validatorIndex: 3 },
  { key: "resultado",     num: "8",   label: "Resultado",                        validatorIndex: 4 },
  { key: "fotos",         num: "📷",  label: "Relatório\nFotográfico",           validatorIndex: null },
];

export default function CertificacaoUsinaPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const topRef = useRef(null);

  const {
    obras, regionais, projects, faixas, user, editingChecklist,
    loading, formData, setFormData, regionalSelecionada,
    projetosDisponiveis, isApproved, isEditable, extraCanEdit, clearSavedData, navigate,
  } = useChecklistForm(
    getInitialFormData,
    "CertificacaoUsina",
    "certificacao_usina",
    canGestorPreencherResultado,
  );

  // Laboratorista não preenche a etapa de Resultado — ela pertence ao Gestor de Contrato.
  const ocultarResultado = laboratoristaDeveOcultarResultado(user);

  // Páginas visíveis conforme o perfil (laboratorista não vê a aba de Resultado).
  const PAGES = useMemo(
    () => ALL_PAGES.filter((p) => !(p.key === "resultado" && ocultarResultado)),
    [ocultarResultado],
  );

  const setFormDataAndClear = useCallback((updater) => {
    setCamposVazios([]);
    setFormData(updater);
  }, [setFormData]);

  const handlers = useCertificacaoUsinaForm({ setFormData: setFormDataAndClear, projects, faixas });

  const handleFileChange = useCallback(async (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith("image/"));
    if (!files.length) return;
    setLoadingUpload(true);
    setUploadProgress(files.map((file, i) => ({ id: i, fileName: file.name, status: "pending", error: null })));
    const { urls, errors } = await uploadMultipleFiles(files, (i, status, err) => {
      setUploadProgress(prev => prev.map(p => p.id === i ? { ...p, status, error: err || null } : p));
    });
    if (urls.length > 0) setFormData(prev => ({ ...prev, fotos: [...(prev.fotos || []), ...urls] }));
    if (errors.length > 0) alert(`${urls.length} de ${files.length} fotos enviadas.\n\nErros:\n` + errors.map(e => `• ${e.fileName}: ${e.error}`).join("\n"));
    setLoadingUpload(false);
    setUploadProgress([]);
    e.target.value = "";
  }, [setFormData]);

  const handleRemovePhoto = useCallback((index) => {
    setFormData(prev => ({ ...prev, fotos: (prev.fotos || []).filter((_, i) => i !== index) }));
  }, [setFormData]);

  const [camposVazios, setCamposVazios] = useState([]);

  const isPageComplete = (pageIndex) => {
    const validatorIndex = PAGES[pageIndex]?.validatorIndex;
    if (validatorIndex == null) return true;
    return VALIDADORES_PAGINA[validatorIndex]?.(formData) ?? true;
  };

  /** Retorna lista de labels dos campos obrigatórios vazios na página atual */
  const getCamposVaziosPagina0 = () => {
    const labels = {
      razao_social: "Razão Social",
      localizacao: "Localização",
      interessado: "Interessado",
      responsavel_tecnico: "Responsável Técnico",
      data_vistoria: "Data da Vistoria",
      avaliador: "Avaliador",
      cnpj: "CNPJ",
      classe_usina: "Classe de Usina",
      tipo_dosagem: "Tipo de Dosagem",
      tipo_secagem: "Tipo de Secagem",
    };
    const aspectoLabels = {
      autorizacao_ambiental: "Autorização Ambiental",
      licenca_previa: "Licença Prévia",
      licenca_instalacao: "Licença de Instalação",
      licenca_operacao: "Licença de Operação",
    };
    const al = formData.aspectos_legais || {};
    return [
      ...Object.entries(labels).filter(([k]) => !formData[k]).map(([, l]) => l),
      ...Object.entries(aspectoLabels).filter(([k]) => !al[k]).map(([, l]) => l),
    ];
  };

  const getCamposVaziosByPage = (page) => {
    const pageKey = PAGES[page]?.key;
    if (pageKey === "identificacao") return getCamposVaziosPagina0();
    // Demais páginas: checklist — indicar seção incompleta
    const nomes = {
      saude: "Saúde e Segurança",
      meio_ambiente: "Meio Ambiente",
      laboratorio: "Laboratório e Estrutura",
      resultado: "Resultado",
    };
    return [`Seção "${nomes[pageKey] || ""}" incompleta — preencha todos os campos`];
  };

  const goToPage = (page) => {
    // Ao avançar, mostrar campos vazios da página atual
    if (page > currentPage && !isPageComplete(currentPage)) {
      setCamposVazios(getCamposVaziosByPage(currentPage));
      return;
    }
    // Ao navegar por tab, só permite se as anteriores estiverem completas
    if (page > currentPage + 1) {
      for (let i = 0; i < page; i++) {
        if (!isPageComplete(i)) return;
      }
    }
    setCamposVazios([]);
    setCurrentPage(page);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleSubmit = useCallback(async (e, saveStatus = "finalizado") => {
    e.preventDefault();
    const validation = validarCertificacao(formData, saveStatus);
    if (!validation.valid) { alert(validation.message); return; }

    const dataToSave = { ...formData, status: saveStatus };

    const editing = editingChecklist?.id;
    if (editing) {
      const updateData = { ...dataToSave };
      let msg = saveStatus === "rascunho" ? "Progresso salvo!" : "Certificação atualizada com sucesso!";
      if ((editingChecklist.approved === false || editingChecklist.approved === null) && saveStatus === "finalizado" && editingChecklist.status === "finalizado") {
        updateData.approved = null;
        updateData.rejection_reason = null;
        updateData.approved_by = null;
        updateData.approved_date = null;
        updateData.was_rejected = true;
        msg = "Certificação atualizada! O registro voltará para análise.";
      }
      await atualizarCertificacao(editing, updateData);
      alert(msg);
    } else {
      await criarCertificacao({ ...dataToSave, laboratorista_name: user?.laboratorista_name || user?.full_name });
      alert(saveStatus === "rascunho" ? "Progresso salvo!" : "Certificação criada com sucesso!");
    }
    clearSavedData();
    navigate(createPageUrl("MeusEnsaios"));
  }, [formData, editingChecklist, user, clearSavedData, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  // Edição geral (todas as seções exceto Resultado). O gestor liberado via
  // extraCanEdit só pode mexer no Resultado, então para ele as demais ficam travadas.
  const disabled = !isEditable || isApproved || extraCanEdit;
  // Só o gestor liberado, ou admin/owner com edição habilitada, preenche o Resultado.
  const podeEditarResultado = !ocultarResultado && (isEditable || extraCanEdit) && !isApproved;
  const currentPageKey = PAGES[currentPage]?.key;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto" ref={topRef}>
        <Card>
          <CardHeader>
            <CardTitle>
              {editingChecklist?.id ? "Editar Certificação de Usina" : "Nova Certificação de Usina"}
            </CardTitle>
            <CardDescription>
              Check List - Padronização e Certificação de Usinas de Misturas Asfálticas
            </CardDescription>
            <StatusDraftBanner status={formData.status} />
            <RejectionBanner rejectionReason={editingChecklist?.rejection_reason} />

            {/* Navegação por seções */}
            <div className="pt-3">
              {/* Barra de progresso */}
              <div className="relative mb-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-[#00233B] rounded-full transition-all duration-300"
                  style={{ width: `${((currentPage + 1) / PAGES.length) * 100}%` }}
                />
              </div>
              {/* Tabs */}
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                {PAGES.map((p, i) => {
                  const complete = isPageComplete(i);
                  const prevComplete = i === 0 || Array.from({ length: i }, (_, j) => j).every(isPageComplete);
                  const locked = !prevComplete && i !== currentPage;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goToPage(i)}
                      disabled={locked}
                      title={locked ? "Complete as seções anteriores para avançar" : undefined}
                      className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg border-2 transition-all duration-200 min-w-[90px] ${
                        locked
                          ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
                          : currentPage === i
                          ? "bg-[#00233B] text-white border-[#00233B] shadow-md scale-105"
                          : complete && i < currentPage
                          ? "bg-[#BFCF99]/20 text-[#00233B] border-[#BFCF99] hover:bg-[#BFCF99]/40"
                          : "bg-white text-slate-500 border-slate-200 hover:border-[#00233B] hover:text-[#00233B]"
                      }`}
                    >
                      <span className={`text-base font-bold leading-none ${locked ? "text-slate-300" : currentPage === i ? "text-[#BFCF99]" : i < currentPage ? "text-[#00233B]" : "text-slate-400"}`}>
                        {locked ? "🔒" : p.num}
                      </span>
                      <span className="text-[10px] leading-tight text-center whitespace-pre-line">{p.label}</span>
                      {!locked && complete && i < currentPage && (
                        <span className="text-[10px] leading-none text-[#00233B] font-semibold">✓</span>
                      )}
                      {!locked && !complete && i === currentPage && (
                        <span className="text-[10px] leading-none text-orange-500 font-semibold">incompleta</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardHeader>

          <CardContent className="overflow-hidden">
            <form
              onSubmit={handleSubmit}
              onKeyDown={(e) => { if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && e.target.type !== "submit") e.preventDefault(); }}
              className="space-y-8"
            >
              {/* Obra — aparece em todas as páginas */}
              <CertificacaoUsinaHeader
                formData={formData}
                obras={obras}
                regionais={regionais}
                regionalSelecionada={regionalSelecionada}
                isEditable={isEditable}
                isApproved={isApproved}
                editingChecklist={editingChecklist}
                onObraChange={(v) => handlers.handleChange("obra_id", v)}
                onDataChange={(v) => handlers.handleChange("data_vistoria", v)}
              />

              {/* Tópicos 1–4 */}
              {currentPageKey === "identificacao" && (<>
                <SecaoDescricao formData={formData} onChange={handlers.handleChange} disabled={disabled} />
                <SecaoClasseTipo formData={formData} onChange={handlers.handleChange} disabled={disabled} />
                <SecaoAspectosLegais formData={formData} onNestedChange={handlers.handleNestedChange} disabled={disabled} />
              </>)}

              {/* Tópico 5 - Saúde e Segurança */}
              {currentPageKey === "saude" && (
                <SecaoSaudeSeguranca formData={formData} onNestedChange={handlers.handleNestedChange} disabled={disabled} />
              )}

              {/* Tópico 6 - Meio Ambiente */}
              {currentPageKey === "meio_ambiente" && (
                <SecaoMeioAmbiente formData={formData} onNestedChange={handlers.handleNestedChange} disabled={disabled} />
              )}

              {/* Tópico 7 - Laboratório, Aferição, Estrutura e Usina */}
              {currentPageKey === "laboratorio" && (<>
                <SecaoLaboratorio formData={formData} onNestedChange={handlers.handleNestedChange} disabled={disabled} />
                <SecaoAfeicao
                  formData={formData}
                  onNestedChange={handlers.handleNestedChange}
                  onEnsaioValidacaoChange={handlers.handleEnsaioValidacaoChange}
                  onGranulometriaChange={handlers.handleGranulometriaChange}
                  onPreencherProjeto={handlers.handlePreencherProjeto}
                  projetosDisponiveis={projetosDisponiveis}
                  projects={projects}
                  disabled={disabled}
                />
                <SecaoEstruturaUsina
                  formData={formData}
                  onNestedChange={handlers.handleNestedChange}
                  handleChange={handlers.handleChange}
                  disabled={disabled}
                />
              </>)}

              {/* Tópico 8 - Resultado (preenchido pelo Gestor de Contrato) */}
              {currentPageKey === "resultado" && (
                <SecaoResultado formData={formData} onChange={handlers.handleChange} disabled={!podeEditarResultado} />
              )}

              {/* Relatório Fotográfico */}
              {currentPageKey === "fotos" && (
                <SecaoFotos
                  fotos={formData.fotos || []}
                  onFileChange={handleFileChange}
                  onRemove={handleRemovePhoto}
                  loading={loadingUpload}
                  progress={uploadProgress}
                  isEditable={isEditable}
                  isApproved={isApproved}
                />
              )}

              {/* Campos obrigatórios vazios */}
              {camposVazios.length > 0 && (
                <div className="rounded-md border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-800">
                  <p className="font-semibold mb-1">Preencha os campos obrigatórios antes de avançar:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {camposVazios.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}

              {/* Navegação anterior/próximo + footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  disabled={currentPage === 0}
                  onClick={() => { setCamposVazios([]); goToPage(currentPage - 1); }}
                >
                  ← Anterior
                </Button>
                <span className="text-xs text-slate-500">
                  Página {currentPage + 1} de {PAGES.length}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  disabled={currentPage === PAGES.length - 1 || loadingUpload}
                  onClick={() => goToPage(currentPage + 1)}
                >
                  Próxima →
                </Button>
              </div>

              <ChecklistFooter
                isEditable={isEditable}
                isApproved={isApproved}
                loadingUpload={false}
                onCancel={() => { clearSavedData(); navigate(createPageUrl("MeusEnsaios")); }}
                onSaveProgress={async (e) => { e.preventDefault(); await handleSubmit(e, "rascunho"); }}
                onFinalize={async (e) => { e.preventDefault(); await handleSubmit(e, "finalizado"); }}
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}