import { FlaskConical, Gauge, ClipboardList, Book, FileText, MapPin, Building } from "lucide-react";
import { createPageUrl } from "@/utils";

// ─── Registro central: ÚNICA fonte de verdade por tipo de entidade ──────────
// Adicionar um novo tipo = adicionar uma entrada aqui. Nada mais.
// Campos opcionais (ncExtractor, localInfo, responsavel, hasEmpreiteira)
// ausentes significam: sem NC, localInfo default, sem responsável, sem empreiteira.

// ── Helpers compartilhados de localInfo ──────────────────────────────────────
const campoLocalInfo = (ensaio) => ({
  tipo: "Campo",
  detalhes: `${ensaio.rodovia || "Rodovia não informada"} - ${ensaio.trecho || ensaio.estaca || ensaio.local_coleta || "Trecho não informado"}`,
  icon: MapPin,
});

const defaultLocalInfo = (ensaio) => ({
  tipo: "Local",
  detalhes: ensaio.collection_point || ensaio.location || "Não informado",
  icon: MapPin,
});

const ENSAIO_CONFIG = {
  DiarioObra:                   { name: "Diário de Obra",               icon: Book,         dateField: "data",             reportPage: "RelatorioDiario",                  color: '#BFCF99', description: 'Novo diário de obra',
    localInfo: (ensaio) => ensaio.tipo_local === "usina"
      ? { tipo: "Usina", detalhes: ensaio.usina_selecionada || "Não informado", icon: Building }
      : campoLocalInfo(ensaio),
    hasEmpreiteira: true },
  EnsaioCAUQ:                   { name: "Ensaio de CAUQ", label: 'Ensaio CAUQ',              icon: FlaskConical, dateField: "data_ensaio",      reportPage: "RelatorioCAUQ",                     color: '#00233B', description: 'Novo ensaio de CAUQ' },
  EnsaioMRAF:                   { name: "Ensaio MRAF", label: 'Ensaio MRAF',             icon: FlaskConical, dateField: "data_ensaio",      reportPage: "RelatorioEnsaio?tipo=mraf",         color: '#4B5563', description: 'Novo ensaio MRAF' },
  EnsaioDensidade:              { name: "Densidade CP Extraído", label: 'Ensaio Densidade', icon: Gauge,        dateField: "extraction_date",  reportPage: "RelatorioEnsaio?tipo=densidade",    color: '#566E3D', description: 'Novo ensaio de densidade' },
  EnsaioDensidadeInSitu:        { name: "Densidade In Situ",            icon: Gauge,        dateField: "data_ensaio",      reportPage: "RelatorioDensidadeInSitu",          color: '#6B8E23', description: 'Novo ensaio de densidade in situ' },
  EnsaioTaxaPinturaImprimacao: { name: "Taxa de Pintura/Imprimação", label: 'Taxa Pintura/Imprimação', icon: FlaskConical, dateField: "data_ensaio",      reportPage: "RelatorioTaxaPinturaImprimacao",    color: '#4682B4', description: 'Novo ensaio de taxa de pintura',  localInfo: campoLocalInfo },
  ChecklistUsina:               { name: "Checklist de Usina", label: 'Checklist Usina',          icon: ClipboardList,dateField: "data",             reportPage: "RelatorioChecklist",                color: '#FBBF24', description: 'Novo checklist de usina',
    localInfo: (ensaio) => ({ tipo: "Usina", detalhes: ensaio.usina || "Não informado", icon: Building }),
    responsavel: (ensaio) => ensaio.usina || "Não informado",
    ncExtractor: (ensaio) => {
      const result = [];
      const controle = ensaio.controle_cauq || {};
      if (controle.granulometria?.conforme === false) result.push("Granulometria");
      if (controle.volume_vazios?.conforme === false) result.push("Volume de Vazios");
      if (controle.rbv?.conforme === false) result.push("RBV");
      if (controle.rtcd_25c?.conforme === false) result.push("RTCD a 25°C");
      if (controle.estabilidade?.conforme === false) result.push("Estabilidade");
      if (controle.fluencia?.conforme === false) result.push("Fluência");
      if (controle.extracao_ligante_rotarex?.conforme === false) result.push("Extração Ligante (Rotarex)");
      if (controle.extracao_ligante_soxhlet?.conforme === false) result.push("Extração Ligante (Soxhlet)");
      return result;
    } },
  ChecklistAplicacao:           { name: "Checklist de Aplicação", label: 'Checklist Aplicação', icon: ClipboardList,dateField: "data",             reportPage: "RelatorioChecklistAplicacao",       color: '#800020', description: 'Novo checklist de aplicação',     localInfo: campoLocalInfo, responsavel: (ensaio) => ensaio.usina || "Não informado", hasEmpreiteira: true,
    ncExtractor: (ensaio) => {
      const result = [];
      const pintura = ensaio.pintura_ligacao || {};
      if (pintura.taxa_pintura?.conforme === false) result.push("Taxa de Pintura");
      if (pintura.taxa_pintura_residual?.conforme === false) result.push("Taxa de Pintura Residual");
      return result;
    } },
  ChecklistMRAF:                { name: "Checklist de MRAF", label: 'Checklist MRAF',          icon: ClipboardList,dateField: "data",             reportPage: "RelatorioChecklistMRAF",            color: '#4A90E2', description: 'Novo checklist MRAF',            localInfo: campoLocalInfo, responsavel: (ensaio) => ensaio.usina || "Não informado", hasEmpreiteira: true,
    ncExtractor: (ensaio) => {
      const result = [];
      const acomp = ensaio.acompanhamento_aplicacao || {};
      if (acomp.taxa_aplicacao?.conforme === false) result.push("Taxa de Aplicação");
      if (acomp.residuo_emulsao?.conforme === false) result.push("Resíduo da Emulsão");
      if (acomp.espessura_camada?.conforme === false) result.push("Espessura da Camada");
      return result;
    } },
  ChecklistConcretagem:         { name: "Checklist de Concretagem", label: 'Checklist Concretagem', icon: ClipboardList,dateField: "data",             reportPage: "RelatorioChecklistConcretagem",     color: '#8B4513', description: 'Novo checklist de concretagem',   localInfo: campoLocalInfo, responsavel: (ensaio) => ensaio.concreteira || "Não informado", hasEmpreiteira: true,
    ncExtractor: (ensaio) => {
      const result = [];
      const cargas = ensaio.cargas_concreto || [];
      cargas.forEach((carga, idx) => {
        if (carga.slump_test?.conforme === false) result.push(`Slump Test (Carga ${carga.numero_carga || idx + 1})`);
        if (carga.espessura_camada?.conforme === false) result.push(`Espessura da Camada (Carga ${carga.numero_carga || idx + 1})`);
      });
      return result;
    } },
  ChecklistTerraplanagem:       { name: "Checklist de Terraplanagem", label: 'Checklist Terraplanagem', icon: ClipboardList,dateField: "data",             reportPage: "RelatorioChecklistTerraplanagem",   color: '#228B22', description: 'Novo checklist de terraplanagem', localInfo: campoLocalInfo, responsavel: (ensaio) => ensaio.empreiteira || "Não informado", hasEmpreiteira: true },
  ChecklistReciclagem:          { name: "Checklist de Reciclagem", label: 'Checklist Reciclagem',    icon: ClipboardList,dateField: "data",             reportPage: "RelatorioChecklistReciclagem",      color: '#854d0e', description: 'Novo checklist de reciclagem',  localInfo: campoLocalInfo, hasEmpreiteira: true },
  EnsaioSondagem:               { name: "Ensaio de Sondagem", label: 'Ensaio Sondagem',         icon: Gauge,        dateField: "data",             reportPage: "RelatorioSondagem",                 color: '#4682B4', description: 'Novo ensaio de sondagem',        localInfo: campoLocalInfo },
  EnsaioGranulometriaIndividual:{ name: "Granulometria Individual",     icon: FlaskConical, dateField: "data_ensaio",      reportPage: "RelatorioGranulometriaIndividual",  color: '#9B59B6', description: 'Novo ensaio de granulometria individual', localInfo: campoLocalInfo },
  AcompanhamentoUsinagem:       { name: "Acompanhamento de Usinagem", label: 'Acomp. Usinagem', icon: FlaskConical, dateField: "data",             reportPage: "RelatorioAcompanhamentoUsinagem",   color: '#1ABC9C', description: 'Novo acompanhamento de usinagem' },
  AcompanhamentoCarga:          { name: "Acompanhamento de Cargas", label: 'Acomp. Carga',   icon: FlaskConical, dateField: "data",             reportPage: "RelatorioAcompanhamentoCarga",      color: '#E67E22', description: 'Novo acompanhamento de carga' },
  EnsaioManchaPendulo:          { name: "Mancha + Pêndulo",             icon: Gauge,        dateField: "data_ensaio",      reportPage: "RelatorioManchaPendulo",            color: '#E74C3C', description: 'Novo ensaio mancha + pêndulo',   localInfo: campoLocalInfo,
    ncExtractor: (ensaio) => {
      const result = [];
      if (ensaio.condicao_conformidade === "NÃO CONFORME") result.push("Resultado não conforme");
      return result;
    } },
  EnsaioVigaBenkelman:          { name: "Viga Benkelman",               icon: Gauge,        dateField: "data_realizacao",  reportPage: "RelatorioVigaBenkelman",            color: '#3498DB', description: 'Novo ensaio viga Benkelman',     localInfo: campoLocalInfo,
    ncExtractor: (ensaio) => {
      const result = [];
      const def_admissivel = parseFloat(ensaio.def_admissivel) || 0;
      if (def_admissivel > 0) {
        const levantamentos = ensaio.levantamentos || [];
        const pontosNC = [];
        levantamentos.forEach((lev, _idx) => {
          if (lev.bordo_esquerdo?.deflexao > def_admissivel ||
              lev.eixo?.deflexao > def_admissivel ||
              lev.bordo_direito?.deflexao > def_admissivel) {
            if (lev.estaca_km) {
              pontosNC.push(`Estaca ${lev.estaca_km}`);
            }
          }
        });
        if (pontosNC.length > 0) {
          result.push(`Deflexão acima do limite em ${pontosNC.length} ponto(s)`);
        }
      }
      return result;
    } },
  EnsaioTaxaMRAF:               { name: "Taxa de MRAF", label: 'Ensaio Taxa MRAF',          icon: FlaskConical, dateField: "data_ensaio",      reportPage: "RelatorioTaxaMRAF",                 color: '#4682B4', description: 'Novo ensaio de taxa MRAF' },
  BoletimSondagem:              { name: "Boletim de Sondagem (PI)", label: 'Boletim Sondagem', icon: FileText,     dateField: "data",             reportPage: "RelatorioBoletimSondagem",          color: '#6A5ACD', description: 'Novo boletim de sondagem',
    localInfo: (ensaio) => ({ tipo: "Furo", detalhes: ensaio.furo || "Não informado", icon: MapPin }) },
  BoletimSondagemTrado:         { name: "Boletim de Sondagem a Trado", label: 'Boletim Sondagem Trado', icon: FileText,     dateField: "data",             reportPage: "RelatorioBoletimSondagemTrado",     color: '#708090', description: 'Novo boletim de sondagem a trado' },
  EnsaioProctor:                { name: "Ensaio Proctor", label: 'Ensaio Proctor',          icon: FlaskConical, dateField: "data_ensaio",      reportPage: "RelatorioProctor",                   color: '#DAA520', description: 'Novo ensaio Proctor' },
  EnsaioRompimentoConcreto:     { name: "Rompimento Concreto", label: 'Rompimento Concreto', icon: FlaskConical, dateField: "data_ensaio",      reportPage: "RelatorioRompimentoConcreto",       color: '#B22222', description: 'Novo ensaio de rompimento de concreto' },
  GranuMistura:                 { name: "Granulometria da Mistura", label: 'GranuMistura', icon: FlaskConical, dateField: "data_ensaio",      reportPage: "RelatorioGranuMistura",             color: '#9932CC', description: 'Novo ensaio de granulometria da mistura' },
  ControleExecucaoServicos:     { name: "Controle de Execução de Serviços", label: 'Controle Exec. Serviços', icon: ClipboardList, dateField: "data", reportPage: "RelatorioControleExecucaoServicos", color: '#2E8B57', description: 'Novo controle de execução de serviços', localInfo: campoLocalInfo },
  CertificacaoUsina:            { name: "Certificação de Usina",        icon: ClipboardList,dateField: "data_vistoria",     reportPage: "RelatorioCertificacaoUsina",        color: '#7C3AED', description: 'Nova certificação de usina' },
  Obra:                         { name: "Obra",                         icon: Building,     dateField: "created_date",      reportPage: null,                                color: '#00233B', description: 'Nova obra cadastrada',           localInfo: defaultLocalInfo },
  Project:                      { name: "Projeto",                      icon: FileText,     dateField: "created_date",      reportPage: null,                                color: '#566E3D', description: 'Novo projeto cadastrado',       localInfo: defaultLocalInfo },
};

const FALLBACK = { name: "Ensaio Desconhecido", icon: FileText, dateField: "created_date", reportPage: null, color: '#999999', description: 'Nova atividade', localInfo: defaultLocalInfo };

const getConfig = (ensaio) => ENSAIO_CONFIG[ensaio.entityType] ?? FALLBACK;

// ─── Exports públicos ─────────────────────────────────────────────────────────

export const getEnsaioTypeInfo = (ensaio) => {
  const { name, icon } = getConfig(ensaio);
  return { name, icon };
};

export const getReportLink = (ensaio) => {
  const { reportPage } = getConfig(ensaio);
  if (!reportPage) return "#";
  // reportPage pode conter query string embutida (e.g. "RelatorioEnsaio?tipo=mraf")
  const sep = reportPage.includes('?') ? '&' : '?';
  return createPageUrl(`${reportPage}${sep}id=${ensaio.id}`);
};

export const getDataEnsaio = (ensaio) => {
  const { dateField } = getConfig(ensaio);
  // EnsaioVigaBenkelman tem fallback para data_ensaio e created_date
  return ensaio[dateField] ?? ensaio.data_ensaio ?? ensaio.created_date ?? null;
};

export const getDataFormatted = (ensaio) => {
  const raw = getDataEnsaio(ensaio);
  if (!raw) return "Data não informada";
  return new Date(raw).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

export const typeOptions = [
  { value: 'all', label: 'Todos os tipos' },
  ...Object.entries(ENSAIO_CONFIG)
    .filter(([key]) => key !== 'Obra' && key !== 'Project')
    .map(([value, { name: label }]) => ({ value, label })),
];

// Exporta o registry para consumidores externos (entityConfig.js, utils.jsx)
export { ENSAIO_CONFIG };