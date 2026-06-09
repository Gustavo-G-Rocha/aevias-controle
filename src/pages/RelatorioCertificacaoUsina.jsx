import React, { useEffect, useState } from "react";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { obterCertificacaoById } from "@/services/certificacaoUsinaService";
import { base44 } from "@/api/base44Client";

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

// ── Estilos inline para garantir bordas mesmo em quebras de página ──────────
const td = { borderWidth: "1px", borderStyle: "solid", borderColor: "#cbd5e1", padding: "2px 8px", fontSize: "11px", lineHeight: "1.4" };
const tdLabel = { ...td, width: "72%", color: "#1e293b" };
const tdValue = { ...td, textAlign: "center", fontWeight: 600, width: "28%" };

// ── Primitivos ───────────────────────────────────────────────────────────────

const SecTitle = ({ children, breakBefore = false }) => (
  <div
    style={{
      backgroundColor: "#00233B", color: "#ffffff",
      fontWeight: 700, fontSize: "11px", padding: "5px 8px",
      borderLeft: "4px solid #BFCF99", marginBottom: "4px", marginTop: breakBefore ? "0" : "10px",
      breakBefore: breakBefore ? "page" : "auto",
      pageBreakBefore: breakBefore ? "always" : "auto",
      breakAfter: "avoid",
      pageBreakAfter: "avoid",
    }}
  >
    {children}
  </div>
);

const SubTitle = ({ children }) => (
  <div style={{ backgroundColor: "#BFCF99", color: "#00233B", fontWeight: 600, fontSize: "11px", padding: "3px 8px", marginTop: "4px", marginBottom: "2px", breakAfter: "avoid", pageBreakAfter: "avoid" }}>
    {children}
  </div>
);

const ConformeRow = ({ label, value }) => {
  const isC = value === "Conforme" || value === "Sim" || value === "Possui";
  const isNC = value === "Não conforme" || value === "Não" || value === "Não possui";
  const color = isC ? "#15803d" : isNC ? "#dc2626" : "#94a3b8";
  return (
    <tr style={{ breakInside: "avoid" }}>
      <td style={tdLabel}>{label}</td>
      <td style={{ ...tdValue, color }}>{val(value)}</td>
    </tr>
  );
};

const InfoRow = ({ label, value, label2, value2 }) => (
  <tr style={{ breakInside: "avoid" }}>
    <td style={{ ...td, width: "20%", color: "#475569" }}>{label}</td>
    <td style={{ ...td, width: label2 ? "30%" : "80%", fontWeight: 600, colSpan: label2 ? 1 : 3 }}>{val(value)}</td>
    {label2 && <td style={{ ...td, width: "20%", color: "#475569" }}>{label2}</td>}
    {label2 && <td style={{ ...td, width: "30%", fontWeight: 600 }}>{val(value2)}</td>}
  </tr>
);

const SectionTable = ({ children }) => (
  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "6px" }}>
    <tbody>{children}</tbody>
  </table>
);

const Titulo = () => (
  <div 
    style={{ 
      border: "2px solid #00233B", 
      borderRadius: "4px", 
      backgroundColor: "#fff",
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between", 
      padding: "8px 14px",
      marginBottom: "14px" 
    }}
  >
    <img
      src="https://media.base44.com/images/public/68a7599ee3fb9205cfb852ec/882a69c33_AE-LogoHorPrincipal_1.png"
      alt="Afirmaevias Engenharia Viária"
      style={{ height: "32px", width: "auto" }}
    />
    <div 
      style={{ 
        flex: 1, 
        textAlign: "center", 
        padding: "0 20px",
        fontSize: "10px", 
        fontWeight: 700, 
        textTransform: "uppercase", 
        letterSpacing: "0.5px", 
        color: "#00233B" 
      }}
    >
      Padronização e Certificação de Usinas de Misturas Asfálticas
    </div>
    <div style={{ textAlign: "right", minWidth: "120px" }}>
      <div style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#00233B" }}>
        Checklist
      </div>
      <div style={{ fontSize: "8px", textTransform: "uppercase", color: "#00233B", whiteSpace: "nowrap" }}>
        Certificação de Usinas
      </div>
    </div>
  </div>
);
// ─────────────────────────────────────────────────────────────────────────────

export default function RelatorioCertificacaoUsina() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) { setLoading(false); return; }
    const load = async () => {
      const record = await obterCertificacaoById(id);
      setData(record);
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

  const ssRow = (label, section, key) => <ConformeRow key={`${section}_${key}`} label={label} value={(ss[section] || {})[key]} />;
  const maRow = (label, section, key) => <ConformeRow key={`${section}_${key}`} label={label} value={(ma[section] || {})[key]} />;

  const renderEnsaioTable = (title, rows, hasPeneira = false) => {
    if (!rows?.length) return null;
    return (
      <div style={{ marginBottom: "10px" }}>
        <div style={{ fontSize: "10px", fontWeight: 600, color: "#00233B", borderBottom: "1px solid #BFCF99", paddingBottom: "2px", marginBottom: "4px" }}>{title}</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f1f5f9" }}>
              {hasPeneira && <th style={td}>Peneira</th>}
              <th style={td}>Projeto</th>
              <th style={td}>Obtido</th>
              <th style={td}>Erro</th>
              {!hasPeneira && <th style={td}>Desv. Pad.</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ breakInside: "avoid" }}>
                {hasPeneira && <td style={td}>{row.peneira}</td>}
                <td style={{ ...td, textAlign: "center" }}>{row.projeto ?? "-"}</td>
                <td style={{ ...td, textAlign: "center" }}>{row.obtido ?? "-"}</td>
                <td style={{ ...td, textAlign: "center" }}>{row.erro ?? "-"}</td>
                {!hasPeneira && <td style={{ ...td, textAlign: "center" }}>{row.desvio_padrao ?? "-"}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Wrapper único — fluxo contínuo, o navegador/PDF gerencia as quebras
  const pageStyle = {
    width: "100%",
    maxWidth: "210mm",
    margin: "0 auto",
    padding: "10mm 15mm",
    backgroundColor: "#fff",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
  };

  return (
    <div style={{ backgroundColor: "#e2e8f0", minHeight: "100vh", padding: "24px 0" }}>
      {/* Toolbar */}
      <div className="print:hidden flex justify-center mb-4">
        <Button onClick={() => window.print()} className="gap-2 bg-[#00233B] hover:bg-[#00304F] text-white">
          <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
        </Button>
      </div>

      <div style={pageStyle} data-print-container>
        <Titulo />

        {/* ── 1 - DESCRIÇÃO ───────────────────────────────────────────────── */}
        <SecTitle breakBefore={false}>1 - DESCRIÇÃO</SecTitle>
        <SectionTable>
          <InfoRow label="Razão Social" value={data.razao_social} label2="Localização" value2={data.localizacao} />
          <InfoRow label="Interessado" value={data.interessado} label2="Marca da Usina" value2={data.marca_usina} />
          <InfoRow label="Resp. Técnico" value={data.responsavel_tecnico} label2="Nº de Série" value2={data.numero_serie} />
          <InfoRow label="Telefone" value={data.telefone} label2="Forn. Agregado" value2={data.fornecimento_agregado} />
          <InfoRow label="E-Mail" value={data.email} label2="Mineralogia" value2={data.mineralogia} />
          <InfoRow label="Data Vistoria" value={fmtDate(data.data_vistoria)} label2="Avaliador" value2={data.avaliador} />
          <InfoRow label="CNPJ" value={data.cnpj} label2="Validade" value2={fmtDate(data.validade)} />
        </SectionTable>

        {/* ── 2 e 3 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "6px" }}>
          <div>
            <SecTitle breakBefore={false}>2 - CLASSE PRETENDIDA</SecTitle>
            <div style={{ padding: "6px 8px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: 700, color: "#00233B" }}>{val(data.classe_usina)}</div>
          </div>
          <div>
            <SecTitle breakBefore={false}>3 - TIPO DE USINA</SecTitle>
            <SectionTable>
              <InfoRow label="Dosagem" value={data.tipo_dosagem} />
              <InfoRow label="Secagem" value={data.tipo_secagem} />
            </SectionTable>
          </div>
        </div>

        {/* ── 4 - ASPECTOS LEGAIS ─────────────────────────────────────────── */}
        <SecTitle>4 - ASPECTOS LEGAIS DO EMPREENDIMENTO</SecTitle>
        <SectionTable>
          <ConformeRow label="Autorização Ambiental (AA)" value={al.autorizacao_ambiental} />
          <ConformeRow label="Licença Prévia (LP)" value={al.licenca_previa} />
          <ConformeRow label="Licença de Instalação (LI)" value={al.licenca_instalacao} />
          <ConformeRow label="Licença de Operação (LO)" value={al.licenca_operacao} />
        </SectionTable>

        {/* ── 5 - SST ─────────────────────────────────────────────────────── */}
        <SecTitle>5 - ASPECTOS DE SAÚDE E SEGURANÇA DO TRABALHO</SecTitle>

        <SubTitle>Treinamentos</SubTitle>
        <SectionTable>
          {ssRow("Os eletricistas possuem treinamento em NR-10", "treinamentos", "nr10_eletricistas")}
          {ssRow("Os operadores de máquinas e equipamentos possuem treinamento em NR-11 e NR-12", "treinamentos", "nr11_nr12_operadores")}
          {ssRow("Todos os funcionários possuem treinamento de integração (NR-18)", "treinamentos", "nr18_integracao")}
          {ssRow("Os funcionários que desenvolvem atividades acima de 2,0m de altura possuem treinamento em NR-35", "treinamentos", "nr35_altura")}
          {ssRow("Os funcionários que manipulam produtos químicos possuem treinamento das FISPQ's", "treinamentos", "fispq_quimicos")}
        </SectionTable>

        <SubTitle>Equipamentos de Proteção Individual e Coletiva</SubTitle>
        <SectionTable>
          {ssRow("Os EPI's entregues aos funcionários são aprovados pelo Ministério do Trabalho", "epis", "aprovados_ministerio")}
          {ssRow("Os EPI's entregues aos funcionários são compatíveis com as atividades desempenhadas", "epis", "compativeis_atividades")}
          {ssRow("Os EPI's entregues aos funcionários estão sendo cautelados", "epis", "sendo_cautelados")}
          {ssRow("Os extintores estão instalados conforme norma do Corpo de Bombeiros NPT-021", "epis", "extintores_npt021")}
        </SectionTable>

        <SubTitle>NR-12 – Acessos</SubTitle>
        <SectionTable>
          {ssRow("Os meios de acesso da usina são dimensionados, construídos e fixados de modo seguro e resistente", "acessos", "dimensionados_seguros")}
          {ssRow("Os meios de acesso são construídos de material resistente às intempéries e corrosão", "acessos", "material_resistente")}
          {ssRow("Os meios de acesso possuem travessão superior instalado de 1,10m a 1,20m de altura em relação ao piso por toda a extensão, em ambos os lados", "acessos", "travessao_superior")}
          {ssRow("Os meios de acesso não possuem travessão com superfície plana", "acessos", "sem_superficie_plana")}
          {ssRow("Os meios de acesso possuem rodapé de, no mínimo 0,20m de altura e travessão intermediário a 0,70m de altura em relação ao piso", "acessos", "rodape_travessao_intermediario")}
          {ssRow("As passarelas, plataformas e rampas têm largura de 0,60m", "acessos", "largura_060m")}
        </SectionTable>

        <SubTitle>Escadas do Tipo Marinheiro</SubTitle>
        <SectionTable>
          {ssRow("Possuem gaiolas de proteção, caso possuam altura superior a 3,50m instaladas a partir de 2,0m do piso", "escadas_marinheiro", "gaiolas_protecao")}
          {ssRow("Possuem corrimão ou continuação dos montantes da escada ultrapassando a plataforma em 1,10m a 1,20m", "escadas_marinheiro", "corrimao_montantes")}
          {ssRow("Possuem largura de 0,40m a 0,60m", "escadas_marinheiro", "largura_040_060m")}
          {ssRow("Possuem altura total máxima de 10m se for de um único lance", "escadas_marinheiro", "altura_max_10m")}
          {ssRow("Possuem altura máxima de 6m entre duas plataformas de descanso, se for de múltiplos lances", "escadas_marinheiro", "altura_max_6m_plataformas")}
          {ssRow("Possuem espaçamento entre barras horizontais de 0,25m a 0,30m", "escadas_marinheiro", "espacamento_barras_025_030m")}
          {ssRow("Possuem espaçamento entre o piso da máquina ou da edificação e a primeira barra não superior a 0,55m", "escadas_marinheiro", "espacamento_piso_primeira_barra")}
          {ssRow("Possuem distância em relação à estrutura em que é fixada de, no mínimo 0,15m", "escadas_marinheiro", "distancia_estrutura_015m")}
          {ssRow("Possuem barras horizontais de 0,025m a 0,038m de diâmetro ou espessura", "escadas_marinheiro", "diametro_barras")}
          {ssRow("Possuem barras horizontais com superfícies, formas ou ranhuras a fim de prevenir deslizamentos", "escadas_marinheiro", "barras_antideslizamento")}
        </SectionTable>

        <SubTitle>Gaiolas de Proteção</SubTitle>
        <SectionTable>
          {ssRow("Têm diâmetro de 0,65 a 0,80m", "gaiolas_protecao", "diametro_065_080m")}
          {ssRow("Possuem barras verticais com espaçamento máximo de 0,30m entre si e distância máxima de 1,50m entre arcos", "gaiolas_protecao", "barras_verticais_espacamento")}
          {ssRow("Possuem vãos entre arcos de, no máximo, 0,30m dotadas de barra vertical de sustentação dos arcos", "gaiolas_protecao", "vaos_arcos")}
        </SectionTable>

        <SubTitle>Instalações Elétricas – Condutores de Alimentação Elétrica</SubTitle>
        <SectionTable>
          {ssRow("Oferecem resistência mecânica", "instalacoes_eletricas", "condutores_resistencia_mecanica")}
          {ssRow("Possuem proteção contra rompimento mecânico, contatos abrasivos e contato com lubrificantes, combustíveis e calor", "instalacoes_eletricas", "condutores_protecao_rompimento")}
          {ssRow("Têm localização de forma que nenhum segmento fique em contato com partes móveis ou cantos vivos", "instalacoes_eletricas", "condutores_localizacao")}
          {ssRow("Não dificultam o trânsito de pessoas e materiais ou a operação das máquinas", "instalacoes_eletricas", "condutores_transito")}
          {ssRow("Não oferecem quaisquer outros tipos de riscos na sua localização", "instalacoes_eletricas", "condutores_sem_riscos")}
          {ssRow("São construídos de materiais que não propaguem fogo", "instalacoes_eletricas", "condutores_material_nao_propaga_fogo")}
        </SectionTable>

        <SubTitle>Quadros ou Painéis de Comando e Potência</SubTitle>
        <SectionTable>
          {ssRow("Possuem porta de acesso mantida permanentemente fechada, exceto em manutenções", "instalacoes_eletricas", "quadros_porta_fechada")}
          {ssRow("Possuem sinalização quanto ao perigo de choque elétrico e restrição de acesso por pessoas não autorizadas", "instalacoes_eletricas", "quadros_sinalizacao_choque")}
          {ssRow("São mantidos em bom estado de conservação, limpos e livres de objetos e ferramentas", "instalacoes_eletricas", "quadros_conservacao")}
          {ssRow("Possuem proteção e identificação dos circuitos", "instalacoes_eletricas", "quadros_identificacao_circuitos")}
          {ssRow("Possuem dispositivo protetor contra sobretensão quando a elevação da tensão puder ocasionar risco de acidentes", "instalacoes_eletricas", "quadros_protecao_sobretensao")}
        </SectionTable>

        <SubTitle>Dispositivos de Partida, Acionamento e Parada</SubTitle>
        <SectionTable>
          {ssRow("Não se localizam em zonas perigosas", "instalacoes_eletricas", "dispositivos_sem_zona_perigosa")}
          {ssRow("Podem ser acionados ou desligados em caso de emergência por outra pessoa que não seja o operador", "instalacoes_eletricas", "dispositivos_emergencia")}
          {ssRow("Impedem o acionamento ou desligamento involuntário pelo operador ou por qualquer outra forma acidental", "instalacoes_eletricas", "dispositivos_sem_acionamento_involuntario")}
          {ssRow("É dificultado a burla", "instalacoes_eletricas", "dispositivos_sem_burla")}
          {ssRow("Possuem dispositivos que impeçam seu funcionamento automático ao serem energizadas", "instalacoes_eletricas", "dispositivos_sem_funcionamento_automatico")}
        </SectionTable>

        <SubTitle>Sistemas de Segurança</SubTitle>
        <SectionTable>
          {ssRow("Possui proteções fixas, proteções móveis e dispositivos de segurança interligados, que protejam a saúde e a integridade física dos funcionários", "sistemas_seguranca", "protecoes_fixas_moveis")}
          {ssRow("Todas as engrenagens, polias, correntes, rodas dentadas e outras peças móveis estão protegidas", "sistemas_seguranca", "engrenagens_protegidas")}
        </SectionTable>
        <SubTitle>Proteções</SubTitle>
        <SectionTable>
          {ssRow("Cumprem suas funções durante a vida útil ou possibilitam a reposição de partes danificadas", "protecoes", "funcoes_vida_util")}
          {ssRow("São construídas de materiais resistentes e adequados à contenção de projeção de peças, materiais e partículas", "protecoes", "materiais_contencao")}
          {ssRow("Possuem fixação firme e garantia de estabilidade e resistência mecânica", "protecoes", "fixacao_estabilidade")}
          {ssRow("Não criam pontos de esmagamento ou agarramento com partes da máquina ou com outras proteções", "protecoes", "sem_esmagamento")}
          {ssRow("Não possuem extremidades e arestas cortantes ou outras saliências perigosas", "protecoes", "sem_arestas_cortantes")}
          {ssRow("Resistem às condições ambientais do local onde estão instaladas", "protecoes", "resistem_condicoes_ambientais")}
          {ssRow("Dificulta-se a burla", "protecoes", "dificulta_burla")}
          {ssRow("Proporcionam condições de higiene e limpeza", "protecoes", "higiene_limpeza")}
          {ssRow("Impedem o acesso à zona de perigo", "protecoes", "impedem_acesso_perigo")}
          {ssRow("Têm seus dispositivos de intertravamento protegidos adequadamente contra sujidade, poeiras e corrosão", "protecoes", "intertravamento_protegidos")}
        </SectionTable>

        <SubTitle>NR-35 – Trabalho em Altura</SubTitle>
        <SectionTable>
          {ssRow("Todos os funcionários autorizados a realizar trabalho em altura possuem treinamento em NR-35", "nr35_trabalho_altura", "treinamento_nr35")}
          {ssRow("Os ASO's dos funcionários que realizam trabalho em altura constam aptos para trabalho em altura", "nr35_trabalho_altura", "aso_apto_altura")}
          {ssRow("Antes do início das atividades foi feita a Análise de Risco", "nr35_trabalho_altura", "analise_risco")}
          {ssRow("As atividades não rotineiras são previamente autorizadas através de Permissão de Trabalho", "nr35_trabalho_altura", "permissao_trabalho")}
          {ssRow("Os funcionários estão fazendo o uso do cinto de segurança e talabarte compatível", "nr35_trabalho_altura", "cinto_talabarte")}
        </SectionTable>

        <SubTitle>NR-10 – Segurança em Instalações e Serviços em Eletricidade</SubTitle>
        <SectionTable>
          {ssRow("Para instalação elétrica superior a 75kW possui prontuários de instalações elétricas, incluindo o sistema de proteção contra descargas atmosféricas", "nr10_eletricidade", "prontuarios_75kw")}
          {ssRow("Os painéis elétricos devem possuir esquema unifilar elaborado por profissional legalmente habilitado", "nr10_eletricidade", "esquema_unifilar")}
          {ssRow("Nos painéis elétricos estão instalados dispositivo DR (disjuntor residual) conforme NBR 5410", "nr10_eletricidade", "dispositivo_dr_nbr5410")}
          {ssRow("As instalações e equipamentos estão aterrados", "nr10_eletricidade", "aterramento")}
          {ssRow("Os eletricistas receberão treinamento de NR-10", "nr10_eletricidade", "treinamento_nr10")}
        </SectionTable>

        {/* ── 6 - MEIO AMBIENTE ───────────────────────────────────────────── */}
        <SecTitle breakBefore>6 - MEIO AMBIENTE</SecTitle>

        <SubTitle>Ruídos</SubTitle>
        <SectionTable>
          {maRow("Estão sendo realizadas semestralmente a medição de ruídos conforme NBR 10.151/2019", "ruidos", "medicao_semestral_nbr10151")}
          {maRow("Estão sendo respeitados os horários e a intensidade de ruído conforme legislação municipal", "ruidos", "horarios_intensidade_municipio")}
          {maRow("Estão sendo feitas as manutenções periódicas das máquinas e equipamentos", "ruidos", "manutencao_maquinas")}
        </SectionTable>

        <SubTitle>Emissão Atmosférica</SubTitle>
        <SectionTable>
          {maRow("É realizada a medição de poluentes na chaminé da usina com periodicidade semestral", "emissao_atmosferica", "medicao_poluentes_chamine")}
          {maRow("Estão sendo atendidos os valores especificados na resolução SEMA nº016/2014", "emissao_atmosferica", "resolucao_sema_016_2014")}
          {maRow("É realizado o monitoramento do índice de fumaça preta dos equipamentos que utilizam diesel", "emissao_atmosferica", "monitoramento_fumaca_preta")}
          {maRow("A usina possui filtro para material particulado", "emissao_atmosferica", "filtro_material_particulado")}
        </SectionTable>

        <SubTitle>Efluentes Líquidos</SubTitle>
        <SectionTable>
          {maRow("Possui fossa séptica de acordo com a norma NBR 7229 em local onde não possui rede de esgoto", "efluentes_liquidos", "fossa_septica_nbr7229")}
          {maRow("É promovida a manutenção e limpeza por empresas licenciadas e especializadas das fossas sépticas", "efluentes_liquidos", "manutencao_fossas")}
          {maRow("O óleo lubrificante, já utilizado, é estocado em tambores, e acondicionados em local coberto, delimitado por bacias de contenção", "efluentes_liquidos", "oleo_lubrificante_tambores")}
          {maRow("O óleo usado é destinado única e exclusivamente a empresa recicladoras de óleo, devidamente licenciadas pelo órgão ambiental", "efluentes_liquidos", "oleo_recicladoras_licenciadas")}
          {maRow("Os efluentes lançados seguem as condições e padrões de lançamento de efluentes conforme Resolução CONAMA 357/05", "efluentes_liquidos", "efluentes_conama_357")}
          {maRow("A utilização e o armazenamento de substâncias combustíveis e oleosas são realizadas em locais adequados", "efluentes_liquidos", "armazenamento_combustiveis")}
          {maRow("Não existem sinais de vazamentos/transbordamentos das unidades de armazenamento e tratamento de efluentes", "efluentes_liquidos", "sem_sinais_vazamentos")}
        </SectionTable>

        <SubTitle>Resíduos Sólidos</SubTitle>
        <SectionTable>
          {maRow("São disponibilizados mecanismos de coleta seletiva", "residuos_solidos", "coleta_seletiva")}
          {maRow("O transporte de resíduos são realizados por empresas licenciadas", "residuos_solidos", "transporte_licenciado")}
          {maRow("A destinação final dos resíduos é realizada por empresa licenciada", "residuos_solidos", "destinacao_licenciada")}
          {maRow("As licenças do transporte e destinação dos resíduos são arquivadas", "residuos_solidos", "licencas_arquivadas")}
          {maRow("Estão sendo emitidas as MTR's dos resíduos transportados", "residuos_solidos", "mtr_emitidas")}
        </SectionTable>

        <SubTitle>Contaminação com Produtos Perigosos</SubTitle>
        <SectionTable>
          {maRow("É disponibilizado o Plano de Atendimento a Emergências - PAE", "contaminacao_produtos_perigosos", "plano_atendimento_emergencias")}
          {maRow("São disponibilizadas as FISPQ's dos produtos químicos", "contaminacao_produtos_perigosos", "fispqs_disponiveis")}
          {maRow("Os funcionários que manuseiam produtos químicos são treinados nas FISPQ's", "contaminacao_produtos_perigosos", "funcionarios_treinados_fispqs")}
          {maRow("São mantidos kit's de emergência caso ocorra acidente ambiental", "contaminacao_produtos_perigosos", "kits_emergencia")}
        </SectionTable>

        <SubTitle>Considerações Gerais</SubTitle>
        <SectionTable>
          {maRow("Foi solicitada a Autorização de Supressão de Vegetação junto ao órgão ambiental caso haja necessidade de desmatamento", "consideracoes_gerais", "autorizacao_supressao_vegetacao")}
          {maRow("A vegetação remanescente na usina e seu entorno é mantida sem interferência, sendo verificado se há interferência negativa com a fauna na usina e seu entorno.", "consideracoes_gerais", "vegetacao_remanescente")}
          {maRow("São frequentemente verificadas as estruturas de contenção (bacias de contenção, canaletas de drenagem, etc.) a fim de mantê-las desobstruídas.", "consideracoes_gerais", "estruturas_contencao")}
          {maRow("As captações superficiais possuem outorga de direito de uso de recursos hídricos, verificando o atendimento às condicionantes da outorga.", "consideracoes_gerais", "outorga_captacao")}
          {maRow("São realizados DDSMA (Diálogo Diário de Segurança e Meio Ambiente) a respeito de meio ambiente.", "consideracoes_gerais", "ddsma")}
          {maRow("Foram elaboradas as Análises Preliminares de Riscos abordando os aspectos e impactos ambientais da usina.", "consideracoes_gerais", "apr_aspectos_ambientais")}
        </SectionTable>

        {/* ── 7.1 LABORATÓRIO ─────────────────────────────────────────────── */}
        <SecTitle>7 - REQUISITOS TÉCNICOS E DE CONTROLE TECNOLÓGICO PARA OPERAÇÃO DA USINA DE ASFALTO</SecTitle>
        <SecTitle>7.1 LABORATÓRIO</SecTitle>
        <SectionTable>
          {Object.entries(EQUIPAMENTOS_LABELS).map(([key, label]) => (
            <ConformeRow key={key} label={label} value={equip[key]} />
          ))}
        </SectionTable>

        <SubTitle>Profissionais</SubTitle>
        <SectionTable>
          {[["laboratorista", "Laboratorista"], ["auxiliar_laboratorio", "Auxiliar de Laboratório"], ["encarregado_laboratorio", "Encarregado de Laboratório"]].map(([key, label]) => (
            <tr key={key} style={{ breakInside: "avoid" }}>
              <td style={{ ...td, width: "72%" }}>{label}</td>
              <td style={{ ...td, width: "28%", textAlign: "center", fontWeight: 600 }}>
                {prof[`${key}_possui`] ? `Possui — Qtde: ${prof[`${key}_quantidade`] || "-"}` : "Não possui"}
              </td>
            </tr>
          ))}
        </SectionTable>

        {/* ── 7.2 AFERIÇÃO ────────────────────────────────────────────────── */}
        <SecTitle>7.2 AFERIÇÃO, REPETIBILIDADE E REPRODUTIBILIDADE</SecTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
          <div style={{ border: "1px solid #cbd5e1", borderRadius: "4px", padding: "8px", fontSize: "11px" }}>
            <div style={{ fontWeight: 600, marginBottom: "4px", color: "#00233B" }}>Repetibilidade</div>
            <div>Desvio padrão: <strong>{val(afeicao.repetibilidade_desvio_padrao)}</strong></div>
            <div>Satisfatório: <strong>{val(afeicao.repetibilidade_satisfatorio)}</strong></div>
          </div>
          <div style={{ border: "1px solid #cbd5e1", borderRadius: "4px", padding: "8px", fontSize: "11px" }}>
            <div style={{ fontWeight: 600, marginBottom: "4px", color: "#00233B" }}>Reprodutibilidade</div>
            <div>Desvio padrão: <strong>{val(afeicao.reprodutibilidade_desvio_padrao)}</strong></div>
            <div>Satisfatório: <strong>{val(afeicao.reprodutibilidade_satisfatorio)}</strong></div>
          </div>
        </div>

        <SubTitle>Ensaios para Validação de Profissionais</SubTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
          {renderEnsaioTable("Granulometria", ev.granulometria, true)}
          {renderEnsaioTable("Teor de Ligante (Rotarex)", ev.teor_ligante_rotarex)}
          {renderEnsaioTable("Volume de Vazios", ev.volume_vazios)}
          {renderEnsaioTable("Densidade RICE", ev.densidade_rice)}
          {renderEnsaioTable("Densidade Aparente", ev.densidade_aparente)}
          {renderEnsaioTable("Relação Fíler/Betume", ev.relacao_filer_betume)}
        </div>

        {/* ── 7.3 ESTRUTURA FÍSICA ────────────────────────────────────────── */}
        <SecTitle>7.3 ESTRUTURA E ESPAÇO FÍSICO</SecTitle>
        <SectionTable>
          <ConformeRow label="Baias separadoras" value={ef.baias_separadoras} />
          <ConformeRow label="Identificação pilhas" value={ef.identificacao_pilhas} />
          <tr style={{ breakInside: "avoid" }}>
            <td style={{ ...td, width: "72%", color: "#475569" }}>Piso</td>
            <td style={{ ...td, width: "28%", fontWeight: 600, textAlign: "center" }}>{val(ef.piso_tipo)}{ef.piso_outro ? ` — ${ef.piso_outro}` : ""}</td>
          </tr>
          <tr style={{ breakInside: "avoid" }}>
            <td style={{ ...td, color: "#475569" }}>Cobertura do pó de pedra</td>
            <td style={{ ...td, fontWeight: 600, textAlign: "center" }}>{val(ef.cobertura_po_pedra)}</td>
          </tr>
          <tr style={{ breakInside: "avoid" }}>
            <td style={{ ...td, color: "#475569" }}>Quantidade de silos</td>
            <td style={{ ...td, fontWeight: 600, textAlign: "center" }}>{val(ef.quantidade_silos)}</td>
          </tr>
          <tr style={{ breakInside: "avoid" }}>
            <td style={{ ...td, color: "#475569" }}>Tamanho relação concha</td>
            <td style={{ ...td, fontWeight: 600, textAlign: "center" }}>{val(ef.tamanho_relacao_concha)}</td>
          </tr>
          <tr style={{ breakInside: "avoid" }}>
            <td style={{ ...td, color: "#475569" }}>Altura divisória baias</td>
            <td style={{ ...td, fontWeight: 600, textAlign: "center" }}>{val(ef.altura_divisoria_baias)}</td>
          </tr>
          <ConformeRow label="Sistema de vibração" value={ef.sistema_vibracao} />
          <tr style={{ breakInside: "avoid" }}>
            <td style={{ ...td, color: "#475569" }}>Tanque – controle de temperatura</td>
            <td style={{ ...td, fontWeight: 600, textAlign: "center" }}>{val(ef.tanque_controle_temperatura)}</td>
          </tr>
          <ConformeRow label="Termômetros internos" value={ef.termometros_internos} />
          <ConformeRow label="Bomba de engrenagem" value={ef.bomba_engrenagem} />
          <ConformeRow label="Agitadores" value={ef.agitadores} />
          <ConformeRow label="Bacia de contenção" value={ef.bacia_contencao} />
        </SectionTable>

        {/* ── 7.4 USINA DE ASFALTO ────────────────────────────────────────── */}
        <SecTitle>7.4 USINA DE ASFALTO</SecTitle>
        <SectionTable>
          <InfoRow label="Tipo" value={ua.tipo} label2="Modelo" value2={ua.modelo} />
          <InfoRow label="Ano" value={ua.ano_fabricacao} label2="Cap. nominal (t/h)" value2={ua.capacidade_nominal} />
          <InfoRow label="Prod. nominal (t/h)" value={ua.producao_nominal} label2="Prod. efetiva (t/h)" value2={ua.producao_efetiva} />
          <InfoRow label="Umidade (%)" value={ua.umidade_pct} label2="Altitude (m)" value2={ua.altitude_m} />
          <InfoRow label="Retido nº8 (%)" value={ua.material_retido_n8} label2="Temp. final massa (°C)" value2={ua.temperatura_final_massa} />
          <tr style={{ breakInside: "avoid" }}>
            <td style={{ ...td, color: "#475569", width: "20%" }}>Fonte elétrica</td>
            <td style={{ ...td, fontWeight: 600 }} colSpan={3}>{val(ua.fonte_eletrica)}{ua.observacoes_fonte ? ` — ${ua.observacoes_fonte}` : ""}</td>
          </tr>
          <tr style={{ breakInside: "avoid" }}>
            <td style={{ ...td, color: "#475569", width: "20%" }}>Combustível</td>
            <td style={{ ...td, fontWeight: 600 }} colSpan={3}>{val(ua.tipo_combustivel)}</td>
          </tr>
          <InfoRow label="Dosagem da mistura" value={ua.dosagem_mistura} label2="Operação" value2={ua.operacao} />
          <ConformeRow label="Secagem contra-fluxo" value={ua.secagem_contra_fluxo} />
          <ConformeRow label="Filtro de mangas – verificação executada" value={ua.filtro_verificacao_executado} />
          <ConformeRow label="Filtro de mangas – conforme" value={ua.filtro_conforme} />
          <ConformeRow label="Dosador de finos retornados" value={ua.dosador_finos_retornados} />
          <ConformeRow label="Dosador de fíler" value={ua.dosador_filler} />
          <ConformeRow label="Sistema destorroamento RAP" value={ua.sistema_destorroamento_rap} />
          <ConformeRow label="Classificação RAP em frações" value={ua.classificacao_rap_fracoes} />
          <ConformeRow label="Projeto WMA" value={ua.projeto_wma} />
        </SectionTable>

        {/* ── 8 - RESULTADO ───────────────────────────────────────────────── */}
        <SecTitle>8 - RESULTADO</SecTitle>

        {(data.observacoes_resultado || data.observacoes_gerais) && (
          <div style={{ fontSize: "11px", marginBottom: "10px", padding: "6px 8px", border: "1px solid #e2e8f0", borderRadius: "4px" }}>
            {data.observacoes_resultado && <p><span style={{ fontWeight: 600 }}>Observações resultado:</span> {data.observacoes_resultado}</p>}
            {data.observacoes_gerais && <p style={{ marginTop: "4px" }}><span style={{ fontWeight: 600 }}>Observações gerais:</span> {data.observacoes_gerais}</p>}
          </div>
        )}

        <div style={{ textAlign: "center", padding: "24px 16px", border: "2px solid #00233B", borderRadius: "6px", marginTop: "8px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Classe atendida:</div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#00233B" }}>{val(data.resultado_classe)}</div>
        </div>
      </div>
    </div>
  );
}