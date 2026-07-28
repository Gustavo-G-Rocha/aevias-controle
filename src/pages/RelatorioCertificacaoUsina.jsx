import React, { useEffect, useState } from "react";
import CertificacaoUsinaFotoPage from "@/components/certificacao-usina/CertificacaoUsinaFotoPage";
import { Printer } from "lucide-react";
import LoadingState from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { obterCertificacaoById } from "@/services/certificacaoUsinaService";
import {
  EQUIPAMENTOS_LABELS, fmtDate, val, td,
  SecTitle, SubTitle, ConformeRow, InfoRow, SectionTable, Titulo,
} from "@/components/relatorio-certificacao-usina/RelatorioCertificacaoPrimitives";
import SecaoSaudeSegurancaReport from "@/components/relatorio-certificacao-usina/SecaoSaudeSegurancaReport";
import SecaoMeioAmbienteReport from "@/components/relatorio-certificacao-usina/SecaoMeioAmbienteReport";
import { useReportPdfActions } from "@/hooks/useReportPdfActions";

export default function RelatorioCertificacaoUsina() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // No PC abre "Salvar como"; no celular baixa direto.
  const { handlePrint, downloading } = useReportPdfActions("certificacao-usina.pdf");

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

  if (loading) return <LoadingState />;
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

  const renderEnsaioTable = (title, rows, hasPeneira = false) => {
    if (!rows?.length) return null;
    return (
      <div style={{ marginBottom: "10px" }}>
        <div style={{ fontSize: "10px", fontWeight: 600, color: 'var(--color-primary)', borderBottom: '1px solid var(--color-secondary)', paddingBottom: "2px", marginBottom: "4px" }}>{title}</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-muted)' }}>
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
    backgroundColor: 'var(--color-surface)',
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
  };

  return (
    <div style={{ backgroundColor: 'var(--color-surface-muted)', minHeight: "100vh", padding: "24px 0" }}>
      {/* Toolbar */}
      <div className="print:hidden flex justify-center mb-4">
        <Button onClick={handlePrint} disabled={downloading} className="gap-2 text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
          <Printer className="w-4 h-4" /> {downloading ? 'Gerando...' : 'Gerar PDF'}
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
            <div style={{ padding: "6px 8px", border: '1px solid var(--color-border-strong)', fontSize: "13px", fontWeight: 700, color: 'var(--color-primary)' }}>{val(data.classe_usina)}</div>
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
        <SubTitle>Instalação da Usina</SubTitle>
        <SectionTable>
          <ConformeRow label="Usina está instalada dentro de uma pedreira?" value={al.usina_em_pedreira} />
          <ConformeRow label="Existe licenciamento da pedreira?" value={al.licenciamento_pedreira} />
        </SectionTable>

        <SecaoSaudeSegurancaReport ss={ss} />

        <SecaoMeioAmbienteReport ma={ma} />

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
        <SecTitle breakBefore>7.2 AFERIÇÃO, REPETIBILIDADE E REPRODUTIBILIDADE</SecTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
          <div style={{ border: '1px solid var(--color-border-strong)', borderRadius: "4px", padding: "8px", fontSize: "11px" }}>
            <div style={{ fontWeight: 600, marginBottom: "4px", color: 'var(--color-primary)' }}>Repetibilidade</div>
            <div>Desvio padrão: <strong>{val(afeicao.repetibilidade_desvio_padrao)}</strong></div>
            <div>Satisfatório: <strong>{val(afeicao.repetibilidade_satisfatorio)}</strong></div>
          </div>
          <div style={{ border: '1px solid var(--color-border-strong)', borderRadius: "4px", padding: "8px", fontSize: "11px" }}>
            <div style={{ fontWeight: 600, marginBottom: "4px", color: 'var(--color-primary)' }}>Reprodutibilidade</div>
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
        <SecTitle breakBefore>7.3 ESTRUTURA E ESPAÇO FÍSICO</SecTitle>
        <SectionTable>
          <ConformeRow label="Baias separadoras" value={ef.baias_separadoras} />
          <ConformeRow label="Identificação pilhas" value={ef.identificacao_pilhas} />
          <tr style={{ breakInside: "avoid" }}>
            <td style={{ ...td, width: "72%", color: 'var(--color-text-muted)' }}>Piso</td>
            <td style={{ ...td, width: "28%", fontWeight: 600, textAlign: "center" }}>{val(ef.piso_tipo)}{ef.piso_outro ? ` — ${ef.piso_outro}` : ""}</td>
          </tr>
          {Array.isArray(ef.coberturas_po_pedra) && ef.coberturas_po_pedra.length > 0
            ? ef.coberturas_po_pedra.map((cob, i) => (
                <tr key={i} style={{ breakInside: "avoid" }}>
                  <td style={{ ...td, color: 'var(--color-text-muted)' }}>Cobertura do pó de pedra – Silo {i + 1}</td>
                  <td style={{ ...td, fontWeight: 600, textAlign: "center" }}>{val(cob)}</td>
                </tr>
              ))
            : (
                <tr style={{ breakInside: "avoid" }}>
                  <td style={{ ...td, color: 'var(--color-text-muted)' }}>Cobertura do pó de pedra</td>
                  <td style={{ ...td, fontWeight: 600, textAlign: "center" }}>{val(ef.cobertura_po_pedra)}</td>
                </tr>
              )
          }
          <tr style={{ breakInside: "avoid" }}>
            <td style={{ ...td, color: 'var(--color-text-muted)' }}>Quantidade de silos</td>
            <td style={{ ...td, fontWeight: 600, textAlign: "center" }}>{val(ef.quantidade_silos)}</td>
          </tr>
          <tr style={{ breakInside: "avoid" }}>
            <td style={{ ...td, color: 'var(--color-text-muted)' }}>Tamanho relação concha</td>
            <td style={{ ...td, fontWeight: 600, textAlign: "center" }}>{val(ef.tamanho_relacao_concha)}</td>
          </tr>
          <tr style={{ breakInside: "avoid" }}>
            <td style={{ ...td, color: 'var(--color-text-muted)' }}>Altura divisória baias</td>
            <td style={{ ...td, fontWeight: 600, textAlign: "center" }}>{val(ef.altura_divisoria_baias)}</td>
          </tr>
          <ConformeRow label="Sistema de vibração" value={ef.sistema_vibracao} />
          <tr style={{ breakInside: "avoid" }}>
            <td style={{ ...td, color: 'var(--color-text-muted)' }}>Tanque – controle de temperatura</td>
            <td style={{ ...td, fontWeight: 600, textAlign: "center" }}>{val(ef.tanque_controle_temperatura)}</td>
          </tr>
          <ConformeRow label="Termômetros internos" value={ef.termometros_internos} />
          <ConformeRow label="Bomba de engrenagem" value={ef.bomba_engrenagem} />
          <ConformeRow label="Agitadores" value={ef.agitadores} />
          {ef.agitadores === "Sim" && (
            <tr style={{ breakInside: "avoid" }}>
              <td style={{ ...td, color: 'var(--color-text-muted)' }}>Tipo de agitador</td>
              <td style={{ ...td, fontWeight: 600, textAlign: "center" }}>{val(ef.agitadores_tipo)}</td>
            </tr>
          )}
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
    <td style={{ ...td, color: 'var(--color-text-muted)', width: "20%" }}>Fonte elétrica</td>
    <td style={{ ...td, fontWeight: 600 }} colSpan={3}>{val(ua.fonte_eletrica)}{ua.observacoes_fonte ? ` — ${ua.observacoes_fonte}` : ""}</td>
  </tr>
  <tr style={{ breakInside: "avoid" }}>
    <td style={{ ...td, color: 'var(--color-text-muted)', width: "20%" }}>Combustível</td>
    <td style={{ ...td, fontWeight: 600 }} colSpan={3}>{val(ua.tipo_combustivel)}</td>
  </tr>
  
  <InfoRow label="Dosagem da mistura" value={ua.dosagem_mistura} label2="Operação" value2={ua.operacao} />

  {/* Refatoração manual das linhas usando colSpan={3} */}
  {[
    { label: "Secagem contra-fluxo", val: ua.secagem_contra_fluxo },
    { label: "Filtro de mangas – verificação executada", val: ua.filtro_verificacao_executado },
    { label: "Filtro de mangas – conforme", val: ua.filtro_conforme },
    { label: "Dosador de finos retornados", val: ua.dosador_finos_retornados },
    { label: "Dosador de fíler", val: ua.dosador_filler },
    { label: "Sistema destorroamento RAP", val: ua.sistema_destorroamento_rap },
    { label: "Classificação RAP em frações", val: ua.classificacao_rap_fracoes },
    { label: "Projeto Morno", val: ua.projeto_wma },
    { label: "A mistura utiliza CAL?", val: ua.utiliza_cal },
    { label: "Usina utiliza RAP?", val: ua.utiliza_rap },
  ].map((item, idx) => (
    <tr key={idx} style={{ breakInside: "avoid" }}>
      <td style={{ ...td, color: 'var(--color-text-muted)', width: "50%"}}>{item.label}</td>
      <td style={{ ...td, fontWeight: 700, textAlign: "center" }} colSpan={3}>
        <span style={{ color: item.val === "Sim" || item.val === true ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {item.val === "Sim" || item.val === true ? "Sim" : "Não"}
        </span>
      </td>
    </tr>
  ))}
  {ua.utiliza_rap === "Sim" && (
    <>
      <tr style={{ breakInside: "avoid" }}>
        <td style={{ ...td, color: 'var(--color-text-muted)', width: "50%"}}>Possui silo específico para RAP?</td>
        <td style={{ ...td, fontWeight: 700, textAlign: "center" }} colSpan={3}>
          <span style={{ color: ua.silo_especifico_rap === "Sim" ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {ua.silo_especifico_rap || "Não"}
          </span>
        </td>
      </tr>
      <tr style={{ breakInside: "avoid" }}>
        <td style={{ ...td, color: 'var(--color-text-muted)', width: "50%"}}>Possui sistema automatizado de dosagem de RAP?</td>
        <td style={{ ...td, fontWeight: 700, textAlign: "center" }} colSpan={3}>
          <span style={{ color: ua.sistema_dosagem_rap === "Sim" ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {ua.sistema_dosagem_rap || "Não"}
          </span>
        </td>
      </tr>
      <tr style={{ breakInside: "avoid" }}>
        <td style={{ ...td, color: 'var(--color-text-muted)', width: "50%"}}>Qual % utilizado de RAP?</td>
        <td style={{ ...td, fontWeight: 700, textAlign: "center" }} colSpan={3}>
          {ua.percentual_rap ? `${ua.percentual_rap}%` : "-"}
        </td>
      </tr>
    </>
  )}
</SectionTable>

        {/* ── 8 - RESULTADO ───────────────────────────────────────────────── */}
        <SecTitle>8 - RESULTADO</SecTitle>

        {(data.observacoes_resultado || data.observacoes_gerais) && (
          <div style={{ fontSize: "11px", marginBottom: "10px", padding: "6px 8px", border: '1px solid var(--color-border)', borderRadius: "4px" }}>
            {data.observacoes_resultado && <p><span style={{ fontWeight: 600 }}>Observações resultado:</span> {data.observacoes_resultado}</p>}
            {data.observacoes_gerais && <p style={{ marginTop: "4px" }}><span style={{ fontWeight: 600 }}>Observações gerais:</span> {data.observacoes_gerais}</p>}
          </div>
        )}

        <div style={{ textAlign: "center", padding: "24px 16px", border: '2px solid var(--color-primary)', borderRadius: "6px", marginTop: "8px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: "6px" }}>Classe atendida:</div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: 'var(--color-primary)' }}>{val(data.resultado_classe)}</div>
        </div>
      </div>

      {/* ── RELATÓRIO FOTOGRÁFICO ─────────────────────────────────────────── */}
      {Array.isArray(data.fotos) && data.fotos.length > 0 && (() => {
        const FOTOS_POR_PAGINA = 6;
        const chunks = [];
        for (let i = 0; i < data.fotos.length; i += FOTOS_POR_PAGINA) {
          chunks.push(data.fotos.slice(i, i + FOTOS_POR_PAGINA));
        }
        return chunks.map((chunk, idx) => (
          <div key={idx} style={{ ...pageStyle, padding: "10mm" }}>
            <CertificacaoUsinaFotoPage
              chunk={chunk}
              pageIndex={idx}
              data={data}
            />
          </div>
        ));
      })()}
    </div>
  );
}