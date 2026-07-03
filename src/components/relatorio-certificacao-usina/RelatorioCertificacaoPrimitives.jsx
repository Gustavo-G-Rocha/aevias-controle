import React from "react";

export const EQUIPAMENTOS_LABELS = {
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

export const fmtDate = (d) => d ? new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "-";
export const val = (v) => v || "-";

// ── Estilos inline para garantir bordas mesmo em quebras de página ──────────
const td = { borderWidth: "1px", borderStyle: "solid", borderColor: "#cbd5e1", padding: "2px 8px", fontSize: "11px", lineHeight: "1.4" };
const tdLabel = { ...td, width: "72%", color: "#1e293b" };
const tdValue = { ...td, textAlign: "center", fontWeight: 600, width: "28%" };

export { td };

// ── Primitivos ───────────────────────────────────────────────────────────────

export const SecTitle = ({ children, breakBefore = false }) => (
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

export const SubTitle = ({ children }) => (
  <div style={{ backgroundColor: "#BFCF99", color: "#00233B", fontWeight: 600, fontSize: "11px", padding: "3px 8px", marginTop: "4px", marginBottom: "2px", breakAfter: "avoid", pageBreakAfter: "avoid" }}>
    {children}
  </div>
);

export const ConformeRow = ({ label, value }) => {
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

export const InfoRow = ({ label, value, label2, value2 }) => (
  <tr style={{ breakInside: "avoid" }}>
    <td style={{ ...td, width: "20%", color: "#475569" }}>{label}</td>
    <td style={{ ...td, width: label2 ? "30%" : "80%", fontWeight: 600, colSpan: label2 ? 1 : 3 }}>{val(value)}</td>
    {label2 && <td style={{ ...td, width: "20%", color: "#475569" }}>{label2}</td>}
    {label2 && <td style={{ ...td, width: "30%", fontWeight: 600 }}>{val(value2)}</td>}
  </tr>
);

export const SectionTable = ({ children }) => (
  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "6px" }}>
    <tbody>{children}</tbody>
  </table>
);

export const Titulo = () => (
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