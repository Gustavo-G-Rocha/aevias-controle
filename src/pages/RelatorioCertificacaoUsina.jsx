import React, { useEffect, useState } from "react";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { obterCertificacaoById } from "@/services/certificacaoUsinaService";
import { base44 } from "@/api/base44Client";
import { PENEIRAS_GRANULOMETRIA } from "@/utils/certificacaoUsinaUtils";

const EQUIPAMENTOS_LABELS = {
  balanca_10kg: "Balança Digital 10 kg",
  balanca_4_1kg: "Balança Digital 4,1 kg",
  banho_maria: "Banho Maria com Temperatura regulável",
  cesto_adesividade: "Cesto adesividade",
  kit_pesagem_hidrostatica: "Kit Pesagem Hidrostática",
  compactador_marshall: "Compactador Marshall",
  conjunto_peneiras: "Conjunto de Peneiras",
  conjunto_equiv_areia: "Conjunto Equivalente de Areia",
  conjunto_rice: "Conjunto RICE",
  estufa: "Estufa",
  extensometro_fluometro: "Extensômetro/Fluômetro",
  extrator_cp_marshall: "Extrator de CP's Marshall",
  molde_estabilidade: "Molde para Estabilidade",
  molde_resistencia: "Molde para Resistência",
  prensa_marshall: "Prensa Marshall",
  refluxo_soxhlet: "Refluxo/Soxhlet",
  rotarex: "Rotarex",
  soquete_marshall: "Soquete Marshall",
  termometro_infravermelho: "Termômetro Infravermelho",
  termometro_bimetalico: "Termômetro Bi-metálico",
  anel_bola: "Anel e bola",
  ductilometro: "Ductilômetro",
  viscosimetro_brookfield: "Viscosímetro Brookfield",
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "-";
const val = (v) => v || "-";

// ── Primitivos de layout ────────────────────────────────────────────────────

const PageContainer = ({ children, pageBreak = false }) => (
  <div
    className="bg-white mx-auto print:shadow-none mb-4 print:mb-0"
    style={{ width: "210mm", padding: "14mm 14mm 12mm", breakAfter: pageBreak ? "page" : "auto", pageBreakAfter: pageBreak ? "always" : "auto", boxSizing: "border-box" }}
  >
    {children}
  </div>
);

const Titulo = () => (
  <div className="mb-5 border-2 border-[#00233B] rounded overflow-hidden">
    {/* Logo header */}
    <div className="flex items-center justify-between px-4 py-3 bg-white">
      <img
        src="https://media.base44.com/images/public/68a7599ee3fb9205cfb852ec/882a69c33_AE-LogoHorPrincipal_1.png"
        alt="Afirmaevias"
        style={{ height: '40px', width: 'auto' }}
      />
      <div className="text-right">
        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#00233B' }}>Check List</div>
        <div className="text-[9px] uppercase tracking-wide" style={{ color: '#BFCF99' }}>Certificação de Usinas</div>
      </div>
    </div>
    {/* Título principal */}
    <div className="text-center py-2 px-3 bg-white border-t border-slate-200">
      <div className="text-xs font-bold uppercase tracking-wide" style={{ color: '#00233B' }}>
        Padronização e Certificação de Usinas de Misturas Asfálticas
      </div>
    </div>
  </div>
);

const SecHeader = ({ children }) => (
  <tr>
    <td colSpan={4} className="font-bold text-xs py-1 px-2 border border-[#00233B]" style={{ backgroundColor: '#00233B', color: '#ffffff' }}>{children}</td>
  </tr>
);

const SubHeader = ({ children }) => (
  <tr>
    <td colSpan={4} className="font-semibold text-xs py-0.5 px-2 border border-[#BFCF99]" style={{ backgroundColor: '#BFCF99', color: '#00233B' }}>{children}</td>
  </tr>
);

const ItemRow = ({ label, value, colSpan = false }) => (
  <tr>
    <td className="text-xs py-0.5 px-2 border border-slate-300 leading-tight" colSpan={colSpan ? 3 : 1}>{label}</td>
    {!colSpan && <td className="text-xs py-0.5 px-2 border border-slate-300 font-medium text-right">{val(value)}</td>}
    {colSpan && null}
  </tr>
);

const ConformeRow = ({ label, value }) => {
  const isC = value === "Conforme" || value === "Sim" || value === "Possui";
  const isNC = value === "Não conforme" || value === "Não" || value === "Não possui";
  return (
    <tr>
      <td className="text-xs py-0.5 px-2 border border-slate-300 leading-tight" style={{ width: "70%" }}>{label}</td>
      <td className={`text-xs py-0.5 px-2 border border-slate-300 text-center font-medium ${isC ? "text-green-700" : isNC ? "text-red-700" : "text-slate-400"}`}>
        {val(value)}
      </td>
    </tr>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

export default function RelatorioCertificacaoUsina() {
  const [data, setData] = useState(null);
  const [obra, setObra] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) { setLoading(false); return; }

    const load = async () => {
      const record = await obterCertificacaoById(id);
      setData(record);
      if (record?.obra_id) {
        const obras = await base44.entities.Obra.filter({ id: record.obra_id });
        setObra(obras?.[0] || null);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!data) return <div className="p-8 text-center text-slate-500">Certificação não encontrada.</div>;

  const al = data.aspectos_legais || {};
  const ss = data.saude_seguranca || {};
  const ma = data.meio_ambiente || {};
  const lab = data.laboratorio || {};
  const equip = lab.equipamentos || {};
  const prof = lab.profissionais || {};
  const afeicao = data.afeicao || {};
  const ef = data.estrutura_fisica || {};
  const ua = data.usina_asfalto || {};
  const ev = data.ensaios_validacao || {};

  const ssRow = (label, section, key) => <ConformeRow key={key} label={label} value={(ss[section] || {})[key]} />;
  const maRow = (label, section, key) => <ConformeRow key={key} label={label} value={(ma[section] || {})[key]} />;

  const renderEnsaioTable = (title, rows, hasPeneira = false) => {
    if (!rows?.length) return null;
    return (
      <div className="mb-3">
        <div className="text-xs font-semibold px-1 py-0.5 mb-1" style={{ color: '#00233B', borderBottom: '1px solid #BFCF99' }}>{title}</div>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100">
              {hasPeneira && <th className="border border-slate-300 px-1 py-0.5">Peneira</th>}
              <th className="border border-slate-300 px-1 py-0.5">Projeto</th>
              <th className="border border-slate-300 px-1 py-0.5">Obtido</th>
              <th className="border border-slate-300 px-1 py-0.5">Erro</th>
              {!hasPeneira && <th className="border border-slate-300 px-1 py-0.5">Desv. Pad.</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {hasPeneira && <td className="border border-slate-300 px-1 py-0.5 font-medium">{row.peneira}</td>}
                <td className="border border-slate-300 px-1 py-0.5 text-center">{row.projeto ?? "-"}</td>
                <td className="border border-slate-300 px-1 py-0.5 text-center">{row.obtido ?? "-"}</td>
                <td className="border border-slate-300 px-1 py-0.5 text-center">{row.erro ?? "-"}</td>
                {!hasPeneira && <td className="border border-slate-300 px-1 py-0.5 text-center">{row.desvio_padrao ?? "-"}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-slate-100 min-h-screen py-6">
      {/* Toolbar */}
      <div className="print:hidden flex justify-center mb-4">
        <Button onClick={() => window.print()} className="gap-2 bg-[#00233B] hover:bg-[#00304F] text-white">
          <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
        </Button>
      </div>

      {/* Página 1: Descrição, Classe, Tipo, Aspectos Legais, SST parcial */}
      <PageContainer pageBreak>
        <Titulo />
        {/* 1 - Descrição */}
        <div className="mb-3">
          <div className="font-bold text-xs py-1.5 px-2 mb-1 border-l-4" style={{ backgroundColor: '#00233B', color: '#ffffff', borderLeftColor: '#BFCF99' }}>1 - DESCRIÇÃO</div>
          <table className="w-full border-collapse text-xs">
            <tbody>
              <tr>
                <td className="border border-slate-300 px-2 py-0.5 w-1/4">Razão Social</td>
                <td className="border border-slate-300 px-2 py-0.5 font-medium">{val(data.razao_social)}</td>
                <td className="border border-slate-300 px-2 py-0.5 w-1/4">Localização</td>
                <td className="border border-slate-300 px-2 py-0.5 font-medium">{val(data.localizacao)}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-2 py-0.5">Interessado</td>
                <td className="border border-slate-300 px-2 py-0.5 font-medium">{val(data.interessado)}</td>
                <td className="border border-slate-300 px-2 py-0.5">Marca da Usina</td>
                <td className="border border-slate-300 px-2 py-0.5 font-medium">{val(data.marca_usina)}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-2 py-0.5">Resp. Técnico</td>
                <td className="border border-slate-300 px-2 py-0.5 font-medium">{val(data.responsavel_tecnico)}</td>
                <td className="border border-slate-300 px-2 py-0.5">Nº de Série</td>
                <td className="border border-slate-300 px-2 py-0.5 font-medium">{val(data.numero_serie)}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-2 py-0.5">Telefone</td>
                <td className="border border-slate-300 px-2 py-0.5 font-medium">{val(data.telefone)}</td>
                <td className="border border-slate-300 px-2 py-0.5">Fornecimento Agregado</td>
                <td className="border border-slate-300 px-2 py-0.5 font-medium">{val(data.fornecimento_agregado)}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-2 py-0.5">E-Mail</td>
                <td className="border border-slate-300 px-2 py-0.5 font-medium">{val(data.email)}</td>
                <td className="border border-slate-300 px-2 py-0.5">Mineralogia</td>
                <td className="border border-slate-300 px-2 py-0.5 font-medium">{val(data.mineralogia)}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-2 py-0.5">Data da Vistoria</td>
                <td className="border border-slate-300 px-2 py-0.5 font-medium">{fmtDate(data.data_vistoria)}</td>
                <td className="border border-slate-300 px-2 py-0.5">Avaliador</td>
                <td className="border border-slate-300 px-2 py-0.5 font-medium">{val(data.avaliador)}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-2 py-0.5">CNPJ</td>
                <td className="border border-slate-300 px-2 py-0.5 font-medium">{val(data.cnpj)}</td>
                <td className="border border-slate-300 px-2 py-0.5">Validade</td>
                <td className="border border-slate-300 px-2 py-0.5 font-medium">{fmtDate(data.validade)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2 e 3 */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="font-bold text-xs py-1.5 px-2 mb-1 border-l-4" style={{ backgroundColor: '#00233B', color: '#ffffff', borderLeftColor: '#BFCF99' }}>2 - CLASSE PRETENDIDA</div>
            <p className="text-sm font-bold px-2">{val(data.classe_usina)}</p>
          </div>
          <div>
            <div className="font-bold text-xs py-1.5 px-2 mb-1 border-l-4" style={{ backgroundColor: '#00233B', color: '#ffffff', borderLeftColor: '#BFCF99' }}>3 - TIPO DE USINA</div>
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr>
                  <td className="border border-slate-300 px-2 py-0.5">Dosagem</td>
                  <td className="border border-slate-300 px-2 py-0.5 font-medium">{val(data.tipo_dosagem)}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-2 py-0.5">Secagem</td>
                  <td className="border border-slate-300 px-2 py-0.5 font-medium">{val(data.tipo_secagem)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 4 - Aspectos Legais */}
        <div className="mb-3">
          <div className="font-bold text-xs py-1.5 px-2 mb-1 border-l-4" style={{ backgroundColor: '#00233B', color: '#ffffff', borderLeftColor: '#BFCF99' }}>4 - ASPECTOS LEGAIS DO EMPREENDIMENTO</div>
          <table className="w-full border-collapse text-xs">
            <tbody>
              <ConformeRow label="Autorização Ambiental (AA)" value={al.autorizacao_ambiental} />
              <ConformeRow label="Licença Prévia (LP)" value={al.licenca_previa} />
              <ConformeRow label="Licença de Instalação (LI)" value={al.licenca_instalacao} />
              <ConformeRow label="Licença de Operação (LO)" value={al.licenca_operacao} />
            </tbody>
          </table>
        </div>
        </PageContainer>
        <PageContainer pageBreak>
        <Titulo />
        {/* 5 - SST */}
        <div>
          <div className="font-bold text-xs py-1.5 px-2 mb-1 border-l-4" style={{ backgroundColor: '#00233B', color: '#ffffff', borderLeftColor: '#BFCF99' }}>5 - ASPECTOS DE SAÚDE E SEGURANÇA DO TRABALHO</div>
          <table className="w-full border-collapse text-xs">
            <tbody>
              <SubHeader>Treinamentos</SubHeader>
              {ssRow("Eletricistas - NR-10", "treinamentos", "nr10_eletricistas")}
              {ssRow("Operadores - NR-11 e NR-12", "treinamentos", "nr11_nr12_operadores")}
              {ssRow("Integração (NR-18)", "treinamentos", "nr18_integracao")}
              {ssRow("Trabalho em altura (NR-35)", "treinamentos", "nr35_altura")}
              {ssRow("FISPQ's produtos químicos", "treinamentos", "fispq_quimicos")}
              <SubHeader>EPIs</SubHeader>
              {ssRow("Aprovados pelo Ministério do Trabalho", "epis", "aprovados_ministerio")}
              {ssRow("Compatíveis com atividades", "epis", "compativeis_atividades")}
              {ssRow("Sendo cautelados", "epis", "sendo_cautelados")}
              {ssRow("Extintores - NBR NPT-021", "epis", "extintores_npt021")}
              <SubHeader>NR-12 - Acessos</SubHeader>
            {ssRow("Dimensionados, construídos e fixados de modo seguro", "acessos", "dimensionados_seguros")}
            {ssRow("Material resistente às intempéries e corrosão", "acessos", "material_resistente")}
            {ssRow("Travessão superior 1,10m a 1,20m", "acessos", "travessao_superior")}
            {ssRow("Sem superfície plana no travessão", "acessos", "sem_superficie_plana")}
            {ssRow("Rodapé + travessão intermediário", "acessos", "rodape_travessao_intermediario")}
            {ssRow("Largura de 0,60m", "acessos", "largura_060m")}
            <SubHeader>Escadas tipo marinheiro</SubHeader>
            {ssRow("Gaiolas de proteção (h > 3,50m)", "escadas_marinheiro", "gaiolas_protecao")}
            {ssRow("Corrimão/montantes", "escadas_marinheiro", "corrimao_montantes")}
            {ssRow("Largura 0,40m a 0,60m", "escadas_marinheiro", "largura_040_060m")}
            {ssRow("Altura máx. 10m (único lance)", "escadas_marinheiro", "altura_max_10m")}
            {ssRow("Altura máx. 6m entre plataformas", "escadas_marinheiro", "altura_max_6m_plataformas")}
            {ssRow("Espaçamento barras 0,25m a 0,30m", "escadas_marinheiro", "espacamento_barras_025_030m")}
            {ssRow("Espaçamento piso/primeira barra ≤ 0,60m", "escadas_marinheiro", "espacamento_piso_primeira_barra")}
            {ssRow("Distância estrutura ≥ 0,15m", "escadas_marinheiro", "distancia_estrutura_015m")}
            {ssRow("Diâmetro das barras", "escadas_marinheiro", "diametro_barras")}
            {ssRow("Barras antideslizamento", "escadas_marinheiro", "barras_antideslizamento")}
            <SubHeader>Gaiolas de proteção</SubHeader>
            {ssRow("Diâmetro 0,65m a 0,80m", "gaiolas_protecao", "diametro_065_080m")}
            {ssRow("Barras verticais espaçamento", "gaiolas_protecao", "barras_verticais_espacamento")}
            {ssRow("Vãos entre arcos", "gaiolas_protecao", "vaos_arcos")}
            <SubHeader>Instalações elétricas / Quadros / Dispositivos</SubHeader>
            {ssRow("Condutores - resistência mecânica", "instalacoes_eletricas", "condutores_resistencia_mecanica")}
            {ssRow("Condutores - proteção rompimento", "instalacoes_eletricas", "condutores_protecao_rompimento")}
            {ssRow("Condutores - localização adequada", "instalacoes_eletricas", "condutores_localizacao")}
            {ssRow("Condutores - em trânsito protegidos", "instalacoes_eletricas", "condutores_transito")}
            {ssRow("Condutores - sem riscos", "instalacoes_eletricas", "condutores_sem_riscos")}
            {ssRow("Condutores - material não propaga fogo", "instalacoes_eletricas", "condutores_material_nao_propaga_fogo")}
            {ssRow("Quadros - porta fechada", "instalacoes_eletricas", "quadros_porta_fechada")}
            {ssRow("Quadros - sinalização choque elétrico", "instalacoes_eletricas", "quadros_sinalizacao_choque")}
            {ssRow("Quadros - conservação", "instalacoes_eletricas", "quadros_conservacao")}
            {ssRow("Quadros - identificação circuitos", "instalacoes_eletricas", "quadros_identificacao_circuitos")}
            {ssRow("Quadros - proteção sobretensão", "instalacoes_eletricas", "quadros_protecao_sobretensao")}
            {ssRow("Dispositivos - sem zona perigosa", "instalacoes_eletricas", "dispositivos_sem_zona_perigosa")}
            {ssRow("Dispositivos - emergência por terceiros", "instalacoes_eletricas", "dispositivos_emergencia")}
            {ssRow("Dispositivos - sem acionamento involuntário", "instalacoes_eletricas", "dispositivos_sem_acionamento_involuntario")}
            {ssRow("Dispositivos - sem burla", "instalacoes_eletricas", "dispositivos_sem_burla")}
            {ssRow("Dispositivos - sem funcionamento automático", "instalacoes_eletricas", "dispositivos_sem_funcionamento_automatico")}
            <SubHeader>Sistemas de segurança / Proteções</SubHeader>
            {ssRow("Proteções fixas e móveis interligadas", "sistemas_seguranca", "protecoes_fixas_moveis")}
            {ssRow("Engrenagens protegidas", "sistemas_seguranca", "engrenagens_protegidas")}
            {ssRow("Proteções - funções durante vida útil", "protecoes", "funcoes_vida_util")}
            {ssRow("Proteções - materiais de contenção", "protecoes", "materiais_contencao")}
            {ssRow("Proteções - fixação e estabilidade", "protecoes", "fixacao_estabilidade")}
            {ssRow("Proteções - sem esmagamento", "protecoes", "sem_esmagamento")}
            {ssRow("Proteções - sem arestas cortantes", "protecoes", "sem_arestas_cortantes")}
            {ssRow("Proteções - resistem condições ambientais", "protecoes", "resistem_condicoes_ambientais")}
            {ssRow("Proteções - dificultam burla", "protecoes", "dificulta_burla")}
            {ssRow("Proteções - higiene e limpeza", "protecoes", "higiene_limpeza")}
            {ssRow("Proteções - impedem acesso a perigo", "protecoes", "impedem_acesso_perigo")}
            {ssRow("Proteções - intertravamento protegidos", "protecoes", "intertravamento_protegidos")}
            <SubHeader>NR-35 / NR-10</SubHeader>
            {ssRow("Treinamento NR-35 trabalhadores em altura", "nr35_trabalho_altura", "treinamento_nr35")}
            {ssRow("ASO - apto para trabalho em altura", "nr35_trabalho_altura", "aso_apto_altura")}
            {ssRow("Análise de risco", "nr35_trabalho_altura", "analise_risco")}
            {ssRow("Permissão de trabalho", "nr35_trabalho_altura", "permissao_trabalho")}
            {ssRow("Cinto de segurança e talabarte", "nr35_trabalho_altura", "cinto_talabarte")}
            {ssRow("Prontuários instalações ≥ 75kW", "nr10_eletricidade", "prontuarios_75kw")}
            {ssRow("Esquema unifilar por profissional habilitado", "nr10_eletricidade", "esquema_unifilar")}
            {ssRow("Dispositivo DR - NBR 5410", "nr10_eletricidade", "dispositivo_dr_nbr5410")}
            {ssRow("Aterramento", "nr10_eletricidade", "aterramento")}
            {ssRow("Treinamento NR-10", "nr10_eletricidade", "treinamento_nr10")}
          </tbody>
          </table>
          </div>
      </PageContainer>

      {/* Página 3: Meio Ambiente */}
      <PageContainer pageBreak>
        <Titulo />
        <div className="font-bold text-xs py-1.5 px-2 mb-1 border-l-4" style={{ backgroundColor: '#00233B', color: '#ffffff', borderLeftColor: '#BFCF99' }}>6 - MEIO AMBIENTE</div>
        <table className="w-full border-collapse text-xs">
          <tbody>
            <SubHeader>Ruídos</SubHeader>
            {maRow("Medição semestral NBR 10.151/2019", "ruidos", "medicao_semestral_nbr10151")}
            {maRow("Horários e intensidade conforme legislação", "ruidos", "horarios_intensidade_municipio")}
            {maRow("Manutenções periódicas máquinas", "ruidos", "manutencao_maquinas")}
            <SubHeader>Emissão atmosférica</SubHeader>
            {maRow("Medição poluentes chaminé semestral", "emissao_atmosferica", "medicao_poluentes_chamine")}
            {maRow("Resolução SEMA nº016/2014", "emissao_atmosferica", "resolucao_sema_016_2014")}
            {maRow("Monitoramento fumaça preta diesel", "emissao_atmosferica", "monitoramento_fumaca_preta")}
            {maRow("Filtro material particulado", "emissao_atmosferica", "filtro_material_particulado")}
            <SubHeader>Efluentes líquidos</SubHeader>
            {maRow("Fossa séptica NBR 7229", "efluentes_liquidos", "fossa_septica_nbr7229")}
            {maRow("Manutenção de fossas", "efluentes_liquidos", "manutencao_fossas")}
            {maRow("Óleo lubrificante em tambores", "efluentes_liquidos", "oleo_lubrificante_tambores")}
            {maRow("Óleo destinado a recicladoras licenciadas", "efluentes_liquidos", "oleo_recicladoras_licenciadas")}
            {maRow("Efluentes CONAMA 357", "efluentes_liquidos", "efluentes_conama_357")}
            {maRow("Armazenamento de combustíveis", "efluentes_liquidos", "armazenamento_combustiveis")}
            {maRow("Sem sinais de vazamentos", "efluentes_liquidos", "sem_sinais_vazamentos")}
            <SubHeader>Resíduos sólidos</SubHeader>
            {maRow("Coleta seletiva", "residuos_solidos", "coleta_seletiva")}
            {maRow("Transporte licenciado", "residuos_solidos", "transporte_licenciado")}
            {maRow("Destinação licenciada", "residuos_solidos", "destinacao_licenciada")}
            {maRow("Licenças arquivadas", "residuos_solidos", "licencas_arquivadas")}
            {maRow("MTR's emitidas", "residuos_solidos", "mtr_emitidas")}
            <SubHeader>Contaminação / Produtos Perigosos</SubHeader>
            {maRow("PAE disponível", "contaminacao_produtos_perigosos", "plano_atendimento_emergencias")}
            {maRow("FISPQ's disponíveis", "contaminacao_produtos_perigosos", "fispqs_disponiveis")}
            {maRow("Funcionários treinados FISPQ's", "contaminacao_produtos_perigosos", "funcionarios_treinados_fispqs")}
            {maRow("Kits de emergência", "contaminacao_produtos_perigosos", "kits_emergencia")}
            <SubHeader>Considerações gerais</SubHeader>
            {maRow("Autorização supressão vegetação", "consideracoes_gerais", "autorizacao_supressao_vegetacao")}
            {maRow("Vegetação remanescente", "consideracoes_gerais", "vegetacao_remanescente")}
            {maRow("Estruturas de contenção", "consideracoes_gerais", "estruturas_contencao")}
            {maRow("Outorga de captação", "consideracoes_gerais", "outorga_captacao")}
            {maRow("DDSMA realizados", "consideracoes_gerais", "ddsma")}
            {maRow("APR com aspectos ambientais", "consideracoes_gerais", "apr_aspectos_ambientais")}
          </tbody>
        </table>
      </PageContainer>

      {/* Página 3: Laboratório + Estrutura + Usina */}
      <PageContainer pageBreak>
        <Titulo />
        <div className="font-bold text-xs py-1.5 px-2 mb-1 border-l-4" style={{ backgroundColor: '#00233B', color: '#ffffff', borderLeftColor: '#BFCF99' }}>7.1 LABORATÓRIO</div>
        <table className="w-full border-collapse text-xs mb-3">
          <tbody>
            {Object.entries(EQUIPAMENTOS_LABELS).map(([key, label]) => (
              <ConformeRow key={key} label={label} value={equip[key]} />
            ))}
          </tbody>
        </table>
        <div className="mb-3">
          <div className="text-xs font-semibold px-2 py-0.5 mb-1" style={{ backgroundColor: '#BFCF99', color: '#00233B' }}>Profissionais</div>
          {[["laboratorista", "Laboratorista"], ["auxiliar_laboratorio", "Auxiliar de Laboratório"], ["encarregado_laboratorio", "Encarregado de Laboratório"]].map(([key, label]) => (
            <div key={key} className="text-xs mb-0.5">
              <span className="font-medium">{label}:</span>{" "}
              {prof[`${key}_possui`] ? `Possui — Qtde: ${prof[`${key}_quantidade`] || "-"}` : "Não possui"}
            </div>
          ))}
        </div>

        <div className="font-bold text-xs py-1.5 px-2 mb-2 border-l-4" style={{ backgroundColor: '#00233B', color: '#ffffff', borderLeftColor: '#BFCF99' }}>7.3 ESTRUTURA E ESPAÇO FÍSICO</div>
        <table className="w-full border-collapse text-xs mb-3">
          <tbody>
            <ConformeRow label="Baias separadoras" value={ef.baias_separadoras} />
            <ConformeRow label="Identificação pilhas" value={ef.identificacao_pilhas} />
            <tr>
              <td className="border border-slate-300 px-2 py-0.5">Piso</td>
              <td className="border border-slate-300 px-2 py-0.5 font-medium">{val(ef.piso_tipo)}{ef.piso_outro ? ` — ${ef.piso_outro}` : ""}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-2 py-0.5">Cobertura do pó de pedra</td>
              <td className="border border-slate-300 px-2 py-0.5 font-medium">{val(ef.cobertura_po_pedra)}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-2 py-0.5">Quantidade de silos</td>
              <td className="border border-slate-300 px-2 py-0.5 font-medium">{val(ef.quantidade_silos)}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-2 py-0.5">Tamanho relação concha</td>
              <td className="border border-slate-300 px-2 py-0.5 font-medium">{val(ef.tamanho_relacao_concha)}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-2 py-0.5">Altura divisória baias</td>
              <td className="border border-slate-300 px-2 py-0.5 font-medium">{val(ef.altura_divisoria_baias)}</td>
            </tr>
            <ConformeRow label="Sistema de vibração" value={ef.sistema_vibracao} />
            <tr>
              <td className="border border-slate-300 px-2 py-0.5">Tanque - controle de temperatura</td>
              <td className="border border-slate-300 px-2 py-0.5 font-medium">{val(ef.tanque_controle_temperatura)}</td>
            </tr>
            <ConformeRow label="Termômetros internos" value={ef.termometros_internos} />
            <ConformeRow label="Bomba de engrenagem" value={ef.bomba_engrenagem} />
            <ConformeRow label="Agitadores" value={ef.agitadores} />
            <ConformeRow label="Bacia de contenção" value={ef.bacia_contencao} />
          </tbody>
        </table>

        <div className="font-bold text-xs py-1.5 px-2 mb-2 border-l-4" style={{ backgroundColor: '#00233B', color: '#ffffff', borderLeftColor: '#BFCF99' }}>7.4 USINA DE ASFALTO</div>
        <table className="w-full border-collapse text-xs mb-3">
          <tbody>
            <tr><td className="border border-slate-300 px-2 py-0.5">Tipo</td><td className="border border-slate-300 px-2 py-0.5 font-medium">{val(ua.tipo)}</td>
                <td className="border border-slate-300 px-2 py-0.5">Modelo</td><td className="border border-slate-300 px-2 py-0.5 font-medium">{val(ua.modelo)}</td></tr>
            <tr><td className="border border-slate-300 px-2 py-0.5">Ano</td><td className="border border-slate-300 px-2 py-0.5 font-medium">{val(ua.ano_fabricacao)}</td>
                <td className="border border-slate-300 px-2 py-0.5">Cap. nominal (t/h)</td><td className="border border-slate-300 px-2 py-0.5 font-medium">{val(ua.capacidade_nominal)}</td></tr>
            <tr><td className="border border-slate-300 px-2 py-0.5">Produção nominal (t/h)</td><td className="border border-slate-300 px-2 py-0.5 font-medium">{val(ua.producao_nominal)}</td>
                <td className="border border-slate-300 px-2 py-0.5">Produção efetiva (t/h)</td><td className="border border-slate-300 px-2 py-0.5 font-medium">{val(ua.producao_efetiva)}</td></tr>
            <tr><td className="border border-slate-300 px-2 py-0.5">Umidade (%)</td><td className="border border-slate-300 px-2 py-0.5 font-medium">{val(ua.umidade_pct)}</td>
                <td className="border border-slate-300 px-2 py-0.5">Altitude (m)</td><td className="border border-slate-300 px-2 py-0.5 font-medium">{val(ua.altitude_m)}</td></tr>
            <tr><td className="border border-slate-300 px-2 py-0.5">Material retido nº8 (%)</td><td className="border border-slate-300 px-2 py-0.5 font-medium">{val(ua.material_retido_n8)}</td>
                <td className="border border-slate-300 px-2 py-0.5">Temp. final massa (°C)</td><td className="border border-slate-300 px-2 py-0.5 font-medium">{val(ua.temperatura_final_massa)}</td></tr>
            <tr><td className="border border-slate-300 px-2 py-0.5">Fonte elétrica</td><td className="border border-slate-300 px-2 py-0.5 font-medium" colSpan={3}>{val(ua.fonte_eletrica)}{ua.observacoes_fonte ? ` — ${ua.observacoes_fonte}` : ""}</td></tr>
            <tr><td className="border border-slate-300 px-2 py-0.5">Tipo de combustível</td><td className="border border-slate-300 px-2 py-0.5 font-medium" colSpan={3}>{val(ua.tipo_combustivel)}</td></tr>
            <tr><td className="border border-slate-300 px-2 py-0.5">Dosagem da mistura</td><td className="border border-slate-300 px-2 py-0.5 font-medium">{val(ua.dosagem_mistura)}</td>
                <td className="border border-slate-300 px-2 py-0.5">Operação</td><td className="border border-slate-300 px-2 py-0.5 font-medium">{val(ua.operacao)}</td></tr>
            <ConformeRow label="Secagem contra-fluxo" value={ua.secagem_contra_fluxo} />
            <ConformeRow label="Filtro de mangas - verificação executada" value={ua.filtro_verificacao_executado} />
            <ConformeRow label="Filtro de mangas - conforme" value={ua.filtro_conforme} />
            <ConformeRow label="Dosador de finos retornados" value={ua.dosador_finos_retornados} />
            <ConformeRow label="Dosador de fíler" value={ua.dosador_filler} />
            <ConformeRow label="Sistema destorroamento RAP" value={ua.sistema_destorroamento_rap} />
            <ConformeRow label="Classificação RAP em frações" value={ua.classificacao_rap_fracoes} />
            <ConformeRow label="Projeto WMA" value={ua.projeto_wma} />
          </tbody>
        </table>
      </PageContainer>

      {/* Página 4: Aferição + Resultado */}
      <PageContainer>
        <Titulo />
        <div className="font-bold text-xs py-1.5 px-2 mb-2 border-l-4" style={{ backgroundColor: '#00233B', color: '#ffffff', borderLeftColor: '#BFCF99' }}>7.2 AFERIÇÃO, REPETIBILIDADE E REPRODUTIBILIDADE</div>
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div className="border border-slate-300 rounded p-2">
            <div className="font-semibold mb-1">Repetibilidade</div>
            <div>Desvio padrão: <strong>{val(afeicao.repetibilidade_desvio_padrao)}</strong></div>
            <div>Satisfatório: <strong>{val(afeicao.repetibilidade_satisfatorio)}</strong></div>
          </div>
          <div className="border border-slate-300 rounded p-2">
            <div className="font-semibold mb-1">Reprodutibilidade</div>
            <div>Desvio padrão: <strong>{val(afeicao.reprodutibilidade_desvio_padrao)}</strong></div>
            <div>Satisfatório: <strong>{val(afeicao.reprodutibilidade_satisfatorio)}</strong></div>
          </div>
        </div>

        <div className="text-xs font-semibold px-2 py-1 mb-2" style={{ backgroundColor: '#BFCF99', color: '#00233B' }}>Ensaios para Validação de Profissionais</div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {renderEnsaioTable("Granulometria", ev.granulometria, true)}
          {renderEnsaioTable("Teor de Ligante (Rotarex)", ev.teor_ligante_rotarex)}
          {renderEnsaioTable("Volume de Vazios", ev.volume_vazios)}
          {renderEnsaioTable("Densidade RICE", ev.densidade_rice)}
          {renderEnsaioTable("Densidade Aparente", ev.densidade_aparente)}
          {renderEnsaioTable("Relação Fíler/Betume", ev.relacao_filer_betume)}
        </div>

        {(data.observacoes_resultado || data.observacoes_gerais) && (
          <div className="text-xs mb-3">
            {data.observacoes_resultado && <p><span className="font-semibold">Observações resultado:</span> {data.observacoes_resultado}</p>}
            {data.observacoes_gerais && <p className="mt-1"><span className="font-semibold">Observações gerais:</span> {data.observacoes_gerais}</p>}
          </div>
        )}

        <div className="font-bold text-xs py-1.5 px-2 mb-2 border-l-4" style={{ backgroundColor: '#00233B', color: '#ffffff', borderLeftColor: '#BFCF99' }}>8 - RESULTADO</div>
        <div className="text-center py-4 border-2 border-slate-400 rounded">
          <div className="text-sm font-bold text-slate-700 mb-1">Classe atendida:</div>
          <div className="text-2xl font-bold text-[#00233B]">{val(data.resultado_classe)}</div>
        </div>
      </PageContainer>
    </div>
  );
}