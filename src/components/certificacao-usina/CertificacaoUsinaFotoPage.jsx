const DEFAULT_LOGO = "https://media.base44.com/images/public/68a7599ee3fb9205cfb852ec/882a69c33_AE-LogoHorPrincipal_1.png";

/**
 * Página fotográfica para o relatório de Certificação de Usina.
 * Exibe até 6 fotos por página em grid 2 colunas × 3 linhas.
 * O padding de página é gerenciado pelo wrapper externo (pageStyle).
 */
export default function CertificacaoUsinaFotoPage({ chunk, pageIndex, data }) {
  const dataVistoria = data.data_vistoria
    ? new Date(data.data_vistoria).toLocaleDateString("pt-BR", { timeZone: "UTC" })
    : "-";

  return (
    <div
      style={{
        breakBefore: "page",
        pageBreakBefore: "always",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#fff",
      }}
    >
      {/* Cabeçalho */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          alignItems: "center",
          borderBottom: "2px solid #00233B",
          paddingBottom: "10px",
          marginBottom: "14px",
        }}
      >
        <div>
          <img src={DEFAULT_LOGO} alt="Afirmaevias" style={{ height: "28px", width: "auto" }} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#00233B" }}>Relatório Fotográfico</div>
          <div style={{ fontSize: "10px", color: "#475569", marginTop: "2px" }}>
            Certificação de Usina — {data.razao_social || ""}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              display: "inline-block",
              border: "1px solid #cbd5e1",
              borderRadius: "4px",
              padding: "3px 8px",
              fontSize: "10px",
              fontWeight: 600,
              color: "#00233B",
            }}
          >
            {dataVistoria}
          </div>
        </div>
      </div>

      {/* Grid: 2 colunas × 3 linhas = 6 fotos por página */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "repeat(3, 1fr)",
          gap: "6px",
          minHeight: "200mm",
        }}
      >
        {chunk.map((fotoUrl, fotoIndex) => (
          <div
            key={fotoIndex}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              padding: "4px",
              breakInside: "avoid",
              pageBreakInside: "avoid",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "4px",
                overflow: "hidden",
                width: "100%",
                flex: 1,
                minHeight: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={fotoUrl}
                alt={`Foto ${pageIndex * 6 + fotoIndex + 1}`}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }}
              />
            </div>
            <p
              style={{
                textAlign: "center",
                fontSize: "10px",
                margin: "2px 0 0 0",
                fontWeight: 500,
                color: "#475569",
              }}
            >
              Foto {pageIndex * 6 + fotoIndex + 1}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}