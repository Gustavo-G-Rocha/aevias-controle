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
        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#00233B' }}>Checklist</div>
        <div className="text-[9px] uppercase tracking-wide" style={{ color: '#00233B' }}>Certificação de Usinas</div>
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
        {/* 5 - SST começa na página 1 */}
        <div className="mt-3">
          <div className="font-bold text-xs py-1.5 px-2 mb-1 border-l-4" style={{ backgroundColor: '#00233B', color: '#ffffff', borderLeftColor: '#BFCF99' }}>5 - ASPECTOS DE SAÚDE E SEGURANÇA DO TRABALHO</div>
          <table className="w-full border-collapse text-xs">
            <tbody>
              <SubHeader>Treinamentos</SubHeader>
              {ssRow("Os eletricistas possuem treinamento em NR-10", "treinamentos", "nr10_eletricistas")}
              {ssRow("Os operadores de máquinas e equipamentos possuem treinamento em NR-11 e NR-12", "treinamentos", "nr11_nr12_operadores")}
              {ssRow("Todos os funcionários possuem treinamento de integração (NR-18)", "treinamentos", "nr18_integracao")}
              {ssRow("Os funcionários que desenvolvem atividades acima de 2,0m de altura possuem treinamento em NR-35", "treinamentos", "nr35_altura")}
              {ssRow("Os funcionários que manipulam produtos químicos possuem treinamento das FISPQ's", "treinamentos", "fispq_quimicos")}
              <SubHeader>Equipamentos de proteção individual e coletiva</SubHeader>
              {ssRow("Os EPI's entregues aos funcionários são aprovados pelo Ministério do Trabalho", "epis", "aprovados_ministerio")}
              {ssRow("Os EPI's entregues aos funcionários são compatíveis com as atividades desempenhadas", "epis", "compativeis_atividades")}
              {ssRow("Os EPI's entregues aos funcionários estão sendo cautelados", "epis", "sendo_cautelados")}
              {ssRow("Os extintores estão instalados conforme norma do Corpo de Bombeiros NPT-021", "epis", "extintores_npt021")}
              <SubHeader>NR-12 - Acessos</SubHeader>
              {ssRow("Os meios de acesso da usina são dimensionados, construídos e fixados de modo seguro e resistente", "acessos", "dimensionados_seguros")}
              {ssRow("Os meios de acesso são construídos de material resistente às intempéries e corrosão", "acessos", "material_resistente")}
              {ssRow("Os meios de acesso possuem travessão superior instalado de 1,10m a 1,20m de altura em relação ao piso por toda a extensão, em ambos os lados", "acessos", "travessao_superior")}
              {ssRow("Os meios de acesso não possuem travessão com superfície plana", "acessos", "sem_superficie_plana")}
              {ssRow("Os meios de acesso possuem rodapé de, no mínimo 0,20m de altura e travessão intermediário a 0,70m de altura em relação ao piso", "acessos", "rodape_travessao_intermediario")}
              {ssRow("As passarelas, plataformas e rampas têm largura de 0,60m", "acessos", "largura_060m")}
        </tbody>
          </table>
        </div>
        </PageContainer>
        <PageContainer pageBreak>
        <Titulo />
        <div>
          <div className="font-bold text-xs py-1.5 px-2 mb-1 border-l-4" style={{ backgroundColor: '#00233B', color: '#ffffff', borderLeftColor: '#BFCF99' }}>5 - ASPECTOS DE SAÚDE E SEGURANÇA DO TRABALHO (continuação)</div>
          <table className="w-full border-collapse text-xs">
            <tbody>
              <SubHeader>Escadas do tipo marinheiro</SubHeader>
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
            <SubHeader>Gaiolas de proteção</SubHeader>
            {ssRow("Têm diâmetro de 0,65 a 0,80m", "gaiolas_protecao", "diametro_065_080m")}
            {ssRow("Possuem barras verticais com espaçamento máximo de 0,30m entre si e distância máxima de 1,50m entre arcos", "gaiolas_protecao", "barras_verticais_espacamento")}
            {ssRow("Possuem vãos entre arcos de, no máximo, 0,30m dotadas de barra vertical de sustentação dos arcos", "gaiolas_protecao", "vaos_arcos")}
            <SubHeader>Instalações e dispositivos elétricos - Condutores de alimentação elétrica</SubHeader>
            {ssRow("Oferecem resistência mecânica", "instalacoes_eletricas", "condutores_resistencia_mecanica")}
            {ssRow("Possuem proteção contra a possibilidade de rompimento mecânico, de contatos abrasivos e de contato com lubrificantes, combustíveis e calor", "instalacoes_eletricas", "condutores_protecao_rompimento")}
            {ssRow("Têm localização de forma que nenhum segmento fique em contato com as partes móveis ou cantos vivos", "instalacoes_eletricas", "condutores_localizacao")}
            {ssRow("Não dificultam o trânsito de pessoas e materiais ou a operação das máquinas", "instalacoes_eletricas", "condutores_transito")}
            {ssRow("Não oferecem quaisquer outros tipos de riscos na sua localização", "instalacoes_eletricas", "condutores_sem_riscos")}
            {ssRow("São construídos de materiais que não propaguem fogo", "instalacoes_eletricas", "condutores_material_nao_propaga_fogo")}
            <SubHeader>Quadros ou Painéis de comando e potência</SubHeader>
            {ssRow("Possuem porta de acesso mantida permanentemente fechada, exceto em manutenções", "instalacoes_eletricas", "quadros_porta_fechada")}
            {ssRow("Possuem sinalização quanto ao perigo de choque elétrico e restrição de acesso por pessoas não autorizadas", "instalacoes_eletricas", "quadros_sinalizacao_choque")}
            {ssRow("São mantidos em bom estado de conservação, limpos e livres de objetos e ferramentas", "instalacoes_eletricas", "quadros_conservacao")}
            {ssRow("Possuem proteção e identificação dos circuitos", "instalacoes_eletricas", "quadros_identificacao_circuitos")}
            {ssRow("Possuem dispositivo protetor contra sobretensão quando a elevação da tensão puder ocasionar risco de acidentes", "instalacoes_eletricas", "quadros_protecao_sobretensao")}
            <SubHeader>Dispositivos de partida, acionamento e parada</SubHeader>
            {ssRow("Não se localizam em zonas perigosas", "instalacoes_eletricas", "dispositivos_sem_zona_perigosa")}
            {ssRow("Podem ser acionados ou desligados em caso de emergência por outra pessoa que não seja o operador", "instalacoes_eletricas", "dispositivos_emergencia")}
            {ssRow("Impedem o acionamento ou desligamento involuntário pelo operador ou por qualquer outra forma acidental", "instalacoes_eletricas", "dispositivos_sem_acionamento_involuntario")}
            {ssRow("É dificultado a burla", "instalacoes_eletricas", "dispositivos_sem_burla")}
            {ssRow("Possuem dispositivos que impeçam seu funcionamento automático ao serem energizadas", "instalacoes_eletricas", "dispositivos_sem_funcionamento_automatico")}
            <SubHeader>Sistemas de segurança</SubHeader>
            {ssRow("Possui proteções fixas, proteções móveis e dispositivos de segurança interligados, que protejam a saúde e a integridade física dos funcionários", "sistemas_seguranca", "protecoes_fixas_moveis")}
            {ssRow("Todas as engrenagens, polias, correntes, rodas dentadas e outras peças móveis estão protegidas", "sistemas_seguranca", "engrenagens_protegidas")}
            <SubHeader>Proteções</SubHeader>
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
            <SubHeader>NR-35 – Trabalho em altura</SubHeader>
            {ssRow("Todos os funcionários autorizados a realizar trabalho em altura possuem treinamento em NR-35", "nr35_trabalho_altura", "treinamento_nr35")}
            {ssRow("Os ASO's dos funcionários que realizam trabalho em altura constam aptos para trabalho em altura", "nr35_trabalho_altura", "aso_apto_altura")}
            {ssRow("Antes do início das atividades foi feita a Análise de Risco", "nr35_trabalho_altura", "analise_risco")}
            {ssRow("As atividades não rotineiras são previamente autorizadas através de Permissão de Trabalho", "nr35_trabalho_altura", "permissao_trabalho")}
            {ssRow("Os funcionários estão fazendo o uso do cinto de segurança e talabarte compatível", "nr35_trabalho_altura", "cinto_talabarte")}
            <SubHeader>NR-10 – Segurança em instalações e serviços em eletricidade</SubHeader>
            {ssRow("Para instalação elétrica superior a 75kW possui prontuários de instalações elétricas, incluindo o sistema de proteção contra descargas atmosféricas", "nr10_eletricidade", "prontuarios_75kw")}
            {ssRow("Os painéis elétricos devem possuir esquema unifilar elaborado por profissional legalmente habilitado", "nr10_eletricidade", "esquema_unifilar")}
            {ssRow("Nos painéis elétricos estão instalados dispositivo DR (disjuntor residual) conforme NBR 5410", "nr10_eletricidade", "dispositivo_dr_nbr5410")}
            {ssRow("As instalações e equipamentos estão aterrados", "nr10_eletricidade", "aterramento")}
            {ssRow("Os eletricistas receberão treinamento de NR-10", "nr10_eletricidade", "treinamento_nr10")}
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
            {maRow("Estão sendo realizadas semestralmente a medição de ruídos conforme NBR 10.151/2019", "ruidos", "medicao_semestral_nbr10151")}
            {maRow("Estão sendo respeitados os horários e a intensidade de ruído conforme legislação municipal", "ruidos", "horarios_intensidade_municipio")}
            {maRow("Estão sendo feitas as manutenções periódicas das máquinas e equipamentos", "ruidos", "manutencao_maquinas")}
            <SubHeader>Emissão atmosférica</SubHeader>
            {maRow("É realizada a medição de poluentes na chaminé da usina com periodicidade semestral", "emissao_atmosferica", "medicao_poluentes_chamine")}
            {maRow("Estão sendo atendidos os valores especificados na resolução SEMA nº016/2014", "emissao_atmosferica", "resolucao_sema_016_2014")}
            {maRow("É realizado o monitoramento do índice de fumaça preta dos equipamentos que utilizam diesel", "emissao_atmosferica", "monitoramento_fumaca_preta")}
            {maRow("A usina possui filtro para material particulado", "emissao_atmosferica", "filtro_material_particulado")}
            <SubHeader>Efluentes Líquidos</SubHeader>
            {maRow("Possui fossa séptica de acordo com a norma NBR 7229 em local onde não possui rede de esgoto", "efluentes_liquidos", "fossa_septica_nbr7229")}
            {maRow("É promovida a manutenção e limpeza por empresas licenciadas e especializadas das fossas sépticas", "efluentes_liquidos", "manutencao_fossas")}
            {maRow("O óleo lubrificante, já utilizado, é estocado em tambores, e acondicionados em local coberto, delimitado por bacias de contenção", "efluentes_liquidos", "oleo_lubrificante_tambores")}
            {maRow("O óleo usado é destinado única e exclusivamente a empresa recicladoras de óleo, devidamente licenciadas pelo órgão ambiental", "efluentes_liquidos", "oleo_recicladoras_licenciadas")}
            {maRow("Os efluentes lançados seguem as condições e padrões de lançamento de efluentes conforme Resolução CONAMA 357/05", "efluentes_liquidos", "efluentes_conama_357")}
            {maRow("A utilização e o armazenamento de substâncias combustíveis e oleosas são realizadas em locais adequados", "efluentes_liquidos", "armazenamento_combustiveis")}
            {maRow("Não existem sinais de vazamentos/transbordamentos das unidades de armazenamento e tratamento de efluentes", "efluentes_liquidos", "sem_sinais_vazamentos")}
            <SubHeader>Resíduos Sólidos</SubHeader>
            {maRow("São disponibilizados mecanismos de coleta seletiva", "residuos_solidos", "coleta_seletiva")}
            {maRow("O transporte de resíduos são realizados por empresas licenciadas", "residuos_solidos", "transporte_licenciado")}
            {maRow("A destinação final dos resíduos é realizada por empresa licenciada", "residuos_solidos", "destinacao_licenciada")}
            {maRow("As licenças do transporte e destinação dos resíduos são arquivadas", "residuos_solidos", "licencas_arquivadas")}
            {maRow("Estão sendo emitidas as MTR's dos resíduos transportados", "residuos_solidos", "mtr_emitidas")}
            <SubHeader>Contaminação com produtos perigosos</SubHeader>
            {maRow("É disponibilizado o Plano de Atendimento a Emergências - PAE", "contaminacao_produtos_perigosos", "plano_atendimento_emergencias")}
            {maRow("São disponibilizadas as FISPQ's dos produtos químicos", "contaminacao_produtos_perigosos", "fispqs_disponiveis")}
            {maRow("Os funcionários que manuseiam produtos químicos são treinados nas FISPQ's", "contaminacao_produtos_perigosos", "funcionarios_treinados_fispqs")}
            {maRow("São mantidos kit's de emergência caso ocorra acidente ambiental", "contaminacao_produtos_perigosos", "kits_emergencia")}
            <SubHeader>Considerações gerais</SubHeader>
            {maRow("Foi solicitada a Autorização de Supressão de Vegetação junto ao órgão ambiental caso haja necessidade de desmatamento", "consideracoes_gerais", "autorizacao_supressao_vegetacao")}
            {maRow("A vegetação remanescente na usina e seu entorno é mantida sem interferência, sendo verificado se há interferência negativa com a fauna na usina e seu entorno.", "consideracoes_gerais", "vegetacao_remanescente")}
            {maRow("São frequentemente verificadas as estruturas de contenção (bacias de contenção, canaletas de drenagem, etc.) a fim de mantê-las desobstruídas.", "consideracoes_gerais", "estruturas_contencao")}
            {maRow("As captações superficiais possuem outorga de direito de uso de recursos hídricos, verificando o atendimento às condicionantes da outorga.", "consideracoes_gerais", "outorga_captacao")}
            {maRow("São realizados DDSMA (Diálogo Diário de Segurança e Meio Ambiente) a respeito de meio ambiente.", "consideracoes_gerais", "ddsma")}
            {maRow("Foram elaboradas as Análises Preliminares de Riscos abordando os aspectos e impactos ambientais da usina.", "consideracoes_gerais", "apr_aspectos_ambientais")}
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