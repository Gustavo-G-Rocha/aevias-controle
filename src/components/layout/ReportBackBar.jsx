import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { TAB_ZONES, getTabZone } from "@/lib/layoutConstants";

// Rotas raiz (tabs do BottomNav) — não mostram botão voltar
const ROOT_PATHS = ["/", "/Regionais", "/Projects", "/MeusEnsaios"];

/**
 * Barra de navegação para páginas de relatório (report-scope).
 * O report-scope stripa sidebar/bottom-nav para impressão limpa,
 * mas sem navegação o usuário fica preso na página.
 * Esta barra é print:hidden para não aparecer na impressão.
 */
export default function ReportBackBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isRoot = ROOT_PATHS.includes(location.pathname);

  const handleBack = () => {
    if (location.key && location.key !== "default") {
      navigate(-1);
      return;
    }
    const zone = getTabZone(location.pathname);
    navigate(zone ? TAB_ZONES[zone][0] : "/", { replace: true });
  };

  if (isRoot) return null;

  return (
    <div
      className="print:hidden sticky top-0 z-30 flex items-center gap-2 px-3 py-2"
      style={{
        backgroundColor: "var(--color-sidebar-bg)",
        borderBottom: "1px solid var(--color-sidebar-border)",
      }}
    >
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-white/10 transition-colors"
        style={{ color: "var(--color-sidebar-text)" }}
        aria-label="Voltar"
      >
        <ArrowLeft className="w-4 h-4" style={{ color: "var(--color-sidebar-icon)" }} />
        Voltar
      </button>
    </div>
  );
}