import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getPageTitle } from "@/lib/pageTitles";
import { TAB_ZONES, getTabZone } from "@/lib/layoutConstants";

// Rotas raiz (tabs do BottomNav) — não mostram botão voltar
const ROOT_PATHS = ["/", "/Regionais", "/Projects", "/MeusEnsaios"];

export default function MobileBackHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  const isRoot = ROOT_PATHS.includes(location.pathname);
  const title = getPageTitle(location.pathname);

  // Telas raiz (tabs): sem botão voltar — exibe o logo do app
  if (isRoot) {
    return (
      <div
        className="lg:hidden sticky top-0 z-30 flex items-center justify-center px-2 py-1.5"
        style={{
          backgroundColor: "var(--color-sidebar-bg)",
          borderBottom: "1px solid var(--color-sidebar-border)",
          paddingTop: "calc(env(safe-area-inset-top) + 0.375rem)",
        }}
      >
        <img
          src="https://media.base44.com/images/public/68a7599ee3fb9205cfb852ec/2754f7c59_AE_-_Logo_Hor_Negativo.png"
          alt="Afirmaevias"
          className="h-8 w-auto brightness-200 contrast-110"
          loading="lazy"
        />
      </div>
    );
  }

  const handleBack = () => {
    // location.key === "default" indica a primeira entrada do histórico do app
    // (ex.: deep link / recarregamento): voltar sairia do app. Nesse caso,
    // vai para a raiz da zona de navegação atual (tab), preservando a pilha.
    if (location.key && location.key !== "default") {
      navigate(-1);
      return;
    }
    const zone = getTabZone(location.pathname);
    navigate(zone ? TAB_ZONES[zone][0] : "/", { replace: true });
  };

  return (
    <div
      className="lg:hidden sticky top-0 z-30 flex items-center gap-2 px-2 py-1.5"
      style={{
        backgroundColor: "var(--color-sidebar-bg)",
        borderBottom: "1px solid var(--color-sidebar-border)",
        paddingTop: "calc(env(safe-area-inset-top) + 0.375rem)",
      }}
    >
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium select-none"
        style={{ color: "var(--color-sidebar-text)" }}
        aria-label="Voltar"
      >
        <ArrowLeft className="w-5 h-5" style={{ color: "var(--color-sidebar-icon)" }} />
        Voltar
      </button>
      {title && (
        <span
          className="flex-1 truncate pr-2 text-sm font-semibold text-right"
          style={{ color: "var(--color-sidebar-text)" }}
        >
          {title}
        </span>
      )}
    </div>
  );
}